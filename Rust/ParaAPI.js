	/*
	ParaAPI is a Cross-language based api system, each method used by this API can return a JSON based object
	which can then be used by lua, C#, and Python. Each method can also return a JavaScript object if you are using JS as well.
	since ParaAPI uses the prototype system, it technically will act as a class and is able to be called anywhere simply with "ParaAPI".
	However if you're using another language you may need to do a find on the plugin to import it into your script. To then be used properly.

	Please skim through the plugin below each method explains what it does, and how to use each parameter properly.
	 */

	function ParaAPI(title, author, version) {
		this.Title = title;
		this.Author = author;
		this.Version = version;
		this.Description = 'Handles All communication between my plugins, handles death, economy, and global statics logic, also comes stacked with logic methods/helpers';
	}

	ParaAPI.prototype = {

		/////////////////////
		//START OXIDE HOOKS//
		///////////////////
		Init: function() {
			global = importNamespace("");
			print(this.Plugin);
			permission.RegisterPermission('paraapi.canSeeGlobalStats', this.Plugin);
			command.AddChatCommand('globals', this.Plugin, 'showGlobals');
		},

		OnServerInitialized: function() {
			print('Welcome to ParaAPI!');
			print('Prepping all Paradise systems for launch!');
			this.getData();
			if(this.Config.Settings.useParaAPIEconomy) this.economyHandler(); print('ParaAPI Economy Handler Enabled.');
			if(this.Config.Settings.useParaAPIGlobalStats) this.globalStatsHandler(); print('ParaAPI Global Stats Handler Enabled.');

		},

		LoadDefaultConfig: function() {
			this.Config.APIVersion = '1.0.0';
			this.Config.Settings = this.Config.Settings || {
				useParaAPIEconomy: true, //Required if you want to use in game currency
				useParaAPIGlobalStats: true //Keeps track of your servers global stats like kills, deaths, suicides, etc.
			};
			this.Config.Messages = this.Config.Messages || {
				globalstats: [
					'<color=orange>Total Connections:</color> {connections}',
					'<color=orange>Total Server Kills:</color> {kills}',
					'<color=orange>Total Server Deaths:</color> {deaths}',
					'<color=orange>Total Server Loot:</color> {loot}',
					'<color=orange>Total Server Items Crafted:</color> {crafted}',
					'<color=orange>Total Server Research Completed:</color> {research}',
					'<color=orange>Total Server Airdrops:</color> {airdrops}'],
				noPerm: 'You do not have permission to use this command'
			};
			this.Config.Plugins = this.Config.Plugins || {};
		},

		/*-----------------------------------------------------------------
		Oxide Hooks
		-- Handles player login and initializes data
		- @player - Base Player Object
		------------------------------------------------------------------*/
		OnPlayerInit: function(player) {
			var steamID = rust.UserIDFromPlayer(player);
			this.buildPlayerData(player, steamID);
		},

		OnPlayerConnected: function(packet) {
			APIData.GlobalStats.connections += 1;
			this.saveData();
		},

		OnPlayerRespawned: function(player) {
			APIData.GlobalStats.kills += 1;
			APIData.GlobalStats.deaths += 1;
			this.saveData();
		},

		OnPlayerLoot: function(inventory, target) {
			APIData.GlobalStats.loot += 1;
			this.saveData();
		},

		OnAirdrop: function(plane, location) {
			APIData.GlobalStats.airdrops += 1;
			this.saveData();
		},

		OnItemCraftFinished: function(task, item) {
			APIData.GlobalStats.crafts += 1;
			this.saveData();
		},

		OnItemResearchEnd: function(table, chance) {
			APIData.GlobalStats.research += 1;
			this.saveData();
		},

		/////////////////////
		//END OXIDE HOOKS //
		///////////////////

		////////////////////////
		//START API METHODS //
		////////////////////////


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
			APIData.GlobalStats = APIData.GlobalStats || {
				connections: 0,
				kills: 0,
				deaths: 0,
				loot: 0,
				crafts: 0,
				research: 0,
				airdrops: 0
			};
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

		/**
		 * Combines objects much like the jquery extend if you do merge this will use the data object values to overwrite the original object.
		 * @method   combine
		 * @memberOf ParaAPI
		 * @param    {boolean}         useJSON determines if the return should be a json or javascript object
		 * @param    {object}         origObj the original object to be copied over
		 * @param    {object}         data    new object of data to copy into the original
		 * @param    {boolean|object}         [merge]   pass an empty object or true if you want the objects to be merged instead of replaced
		 * @return   {object}                 returns either a json object or regular javascript object
		 */
		combine: function(useJSON, origObj, data, merge) {
			if (!merge && typeof data === 'object') {
				for (var n in data) {
					origObj[n] = data[n];
				}
				return (useJSON) ? JSON.stringify(origObj) : origObj;
			} else {
				merge = {};
				for (var o in origObj) {
					merge[o] = origObj[o];
				}
				for (var i in data) {
					merge[i] = data[i];
				}
				return (useJSON) ? JSON.stringify(merge) : merge;
			}
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

		/*-----------------------------------------------------------------
		getDataSet
		-- Builds an array of karma values to compare
		-- against the players current karma
		- @data - object - object to build the data set from
		- @value - String/Number - value to build the data set off of
		- @useJSON - Boolean - if you want a JSON flattened object back
		------------------------------------------------------------------*/
		getDataSet: function(data, value, useJSON) {
			var temp = {
				set: []
			};
			for(var i = 0, len = data.length; i < len; i++) {
				temp.set.push(data[i][value]);
			}
			return(useJSON) ? JSON.stringify(temp) : temp.set;
		},

		/*-----------------------------------------------------------------
		getClosest
		-- Locates closes rank to current players karma
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
			var found = {};
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
				found.id = rust.UserIDFromPlayer(found.player);
				return(useJSON) ? JSON.stringify(found) : found;
			} else {
				return false;
			}
		},

		///////////////////
		//Global Stats	//
		//////////////////

		showGlobals: function(player, cmd, arg) {
			var steamID = rust.UserIDFromPlayer(player);
			if(permission.UserHasPermission(steamID, 'paraapi.canSeeGlobalStats')) {
				rust.SendChatMessage(player, this.Config.Prefix, this.buildString(this.Config.Messages.globalstats, [APIData.GlobalStats.connections, APIData.GlobalStats.kills, APIData.GlobalStats.deaths,
          APIData.GlobalStats.loot, APIData.GlobalStats.crafts, APIData.GlobalStats.research, APIData.GlobalStats.airdrops]), '0');
			} else {
				rust.SendChatMessage(player, this.Config.Prefix, this.Config.Messages.noPerm, '0');
				return false;
			}
		},

		///////////////////
		//Economics		//
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

		////////////////////////
		//END API METHODS //
		////////////////////////

	};

	var ParaAPI = new ParaAPI("ParaAPI", "KillParadise", V(1, 0, 0));
