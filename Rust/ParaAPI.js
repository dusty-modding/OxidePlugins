	function ParaAPI(title, author, version) {
		this.Title = title;
		this.Author = author;
		this.Version = version;
		this.Description = 'Handles All communication between my plugins, handles death, economy, and global statics logic, also comes stacked with logic methods/helpers';
	}
	//@TODO: Try to make this system more open by removing rust based objects. Find out if there is a more dynamic approach to this.
	//@FIXME: USER ID uses rust, is there a better approach than to use rust? Try to make this
	//work accross all platforms. @IDEA: Perhaps have these items rake in Steam IDs instead of finding them.
	ParaAPI.prototype = {
		Init: function() {
			global = importNamespace("");
		},

		OnServerInitialized: function() {
			print('Welcome to ParaAPI!');
			print('Prepping all Paradise systems for launch!');
			this.getData();
			var opts = this.Config.Settings;
			if (opts.useParaAPIEconomy) this.economyHandler();
			if (opts.useParaAPIGlobalStats) this.globalStatsHandler();

		},

		LoadDefaultConfig: function() {
			this.Config.APIVersion = '1.0.0';
			this.Config.Settings = this.Config.Settings || {
				useParaAPIEconomy: true, //Required if you want to use in game currency
				useParaAPIGlobalStats: true //Keeps track of your servers global stats like kills, deaths, suicides, etc.
			};
			this.Config.Plugins = this.Config.Plugins || {};
		},

		/*-----------------------------------------------------------------
		OnPlayerInit
		-- Handles player login and initializes data
		- @player - Base Player Object
		------------------------------------------------------------------*/
		OnPlayerInit: function(player) {
			var steamID = rust.UserIDFromPlayer(player);
			this.buildPlayerData(player, steamID);
		},

		/*-----------------------------------------------------------------
		getData
		-- Handles building initial data system
		------------------------------------------------------------------*/
		getData: function() {
			APIData = data.GetData("ParaAPI");
			APIData = APIData || {};
			APIData.PlayerData = APIData.PlayerData || {};
		},

		/*-----------------------------------------------------------------
		buildPlayerData
		-- Handles building initial player data
		-- and setting proper values on login
		- @player - Base Player Object
		- @steamID - User steam ID
		------------------------------------------------------------------*/
		buildPlayerData: function(player, steamID) {
			APIData.PlayerData[steamID] = APIData.PlayerData[steamID] || {};
			APIData.PlayerData[steamID].Name = APIData.PlayerData[steamID].Name || player.displayName;
			if(Rankings) APIData.PlayerData[steamID].Rankings = APIData.PlayerData[steamID].Rankings || Rankings.Config.StarterRank;
		},

		savePlayerData: function(steamID, key, data) {
			APIData.PlayerData[steamID][key] = data;
		},

		buildAPIData: function() {
			APIData.Economy = APIData.Economy || {};
		},

		wipeData: function(key) {
			APIData[key] = {};
		},

		clearPlayerData: function(steamID, key) {
			APIData.PlayerData[steamID][key] = {};
		},

		/*-----------------------------------------------------------------
		grabPlayerData
		-- Can be called to certain player data
		- @steamID - Users Steam ID
		- @key - Object key to search for and value to return
		- @useJSON - Boolean - if you want a JSON flattened object back
		- @return - returns an object, if useJSON is set to true will return a json object. (Cross-Language)
		------------------------------------------------------------------*/
		grabPlayerData: function(steamID, key, useJSON) {
			return(useJSON) ? JSON.stringify(APIData.PlayerData[steamID][key]) : APIData.PlayerData[steamID][key];
		},

		/*-----------------------------------------------------------------
		saveData
		-- Handles building initial player data
		-- and setting proper values on login
		------------------------------------------------------------------*/
		saveData: function() {
			data.SaveData('ParaAPI');
		},


		/*-----------------------------------------------------------------
		refreshData
		-- Handles refreshing player data
		-- sends them through ranking process again
		- @steamID - String - SteamID of the triggering player
		- @data -
		------------------------------------------------------------------*/
		refreshData: function(steamID, data, value) {
			if(data.PlayerData[steamID] === undefined) {
				print("No Data found, Attempting to build Data");
			}
			data[steamID][value] = "";
			//this.checkPlayerData(player, steamID);
			//Will need to write a function to handle reloading a players data
		},

		combineObj: function(a, b, useJSON) {
			for(var key in b)
				if(b.hasOwnProperty(key))
					a[key] = b[key];
			return(useJSON) ? JSON.stringify(a) : a;
		},

		/*-----------------------------------------------------------------
		getDataSet
		-- Builds an array of karma values to compare
		-- against the players current karma
		- @data - object - object to build the data set from
		- @value - String/Number - value to build the data set off of
		- @useJSON - Boolean - if you want a JSON flattened object back
		------------------------------------------------------------------*/
		getDataSet: function(data, value, useJSON) {
			var temp = {set: []};
			for(var i = 0, len = data.length; i < len; i++) {
				temp.set.push(data[i][value]);
			}
			return(useJSON) ? JSON.stringify(temp) : temp.set;
		},

		/*-----------------------------------------------------------------
		getClosest
		-- Locates closes rank to current players karma
		- @closestTo - the current karma of the player
		- @data - object - an object to search
		- @value - Number/String - value to search through the object for
		- @returns a number value
		------------------------------------------------------------------*/
		getClosest: function(closestTo, data, value) {
			var arr = this.getDataSet(data, value);
			if(arr.length > 0) {

				for(var i = 0; i < arr.length; i++) {
					if(closestTo >= 0) {
						if(arr[i] <= closestTo && arr[i] >= 0) closest = arr[i];
					} else if(closestTo <= 0) {
						if(arr[i] >= closestTo && arr[i] <= 0) closest = arr[i];
					}
				}
			}
			return closest;
		},

		/*-----------------------------------------------------------------
		String Builder
		-- Builds and returns a string based off array of values
		- @string - Sent string (Or array)
		- @values - array of values in order they appear in string
		------------------------------------------------------------------*/
		buildString: function(string, values) {
			var temp = [],
				tempColor = [],
				i = 0,
				sb = "",
				regObj = {};
			var re = "";

			if(values.length === 0) {
				return string;
			}
			if(string.constructor === Array) {
				for(var ii = 0, len = string.length; ii < len; ii++) {
					temp.push(string[ii].match(/{([A-Z]+)}/g));
					newString = string[ii].replace(temp[ii], values[ii]);
					sb += newString + "\n";
				}
			} else {
				temp.push(string.match(/{([A-Z]+)}/g));
				temp = temp.toString().split(",");
				for(i; i < temp.length; i++) {
					regObj[temp[i]] = values[i];
					re += temp[i] + "|";
				}
				re = re.substring("|", re.length - 1);
				var expression = new RegExp(re, "g");
				sb = string.replace(expression, function(match) {
					return regObj[match];
				});
			}
			return sb;
		},

		/*-----------------------------------------------------------------
		findPlayerByName
		-- Locates Base Player object using the users name
		- @playerName - String - of base player name
		- @useJSON - Boolean - if you want a JSON flattened object back
		- @returns a javascript object, pass true for useJSON to get a json object back
		------------------------------------------------------------------*/
		findPlayerByName: function(playerName, useJSON) {
			var found = {},
				foundID;
			playerName = playerName.toLowerCase();
			var itPlayerList = global.BasePlayer.activePlayerList.GetEnumerator();
			while(itPlayerList.MoveNext()) {

				var displayName = itPlayerList.Current.displayName.toLowerCase();

				if(displayName.search(playerName) > -1) {
					print("found match " + displayName);
					found.push(itPlayerList.Current);
				}

				if(playerName.length === 17) {
					if(rust.UserIDFromPlayer(displayName).search(playerName)) {
						found.player = itPlayerList.Current;
					}
				}
			}

			if(found.length) {
				foundID = rust.UserIDFromPlayer(found.player);
				found.id = foundID;
				return(useJSON) ? JSON.stringify(found) : found;
			} else {
				return false;
			}
		},

		///////////////////
		//Global Stats	//
		//////////////////

		globalStatsHandler: function(useJSON) {

		},

		///////////////////
		//Economics			//
		//////////////////

		economyHandler: function(data, useJSON) {

		},

		///////////////////
		//Death Handling//
		/////////////////

		/*-----------------------------------------------------------------
		deathHandler
		-- Triggers a new death instance and builds a new object with given data
		- @data - Object - A data object containing chat data
		------------------------------------------------------------------*/
		deathHandler: function(data, useJSON) {
			if(data.killer === null || data.victim === null || !data.killer.ToPlayer() || !data.victim.ToPlayer()) return false;
			var cbObj = {
				killer: data.killer,
				victim: data.victim,
				killerID: rust.UserIDFromPlayer(data.killer),
				victimID: rust.UserIDFromPlayer(data.victim)
			};
			return(useJSON) ? JSON.stringify(cbObj) : cbObj;
		}

	};

	var ParaAPI = new ParaAPI("ParaAPI", "KillParadise", V(1, 0, 0));
