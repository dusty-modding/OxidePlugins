var NameTool = {
	Title: "NameTool",
    Author: "Killparadise",
    Version: V(1, 0, 0),
    HasConfig: false,
    Init: function() {
   		command.AddChatCommand("fix", this.Plugin, "fixName");
    },

    getRanksData: function() {
    	try {
    	TitlesData = data.GetData("RanksandTitles");
    	TitlesData = TitlesData;
    	TitlesData.PlayerData = TitlesData.PlayerData;
    } catch(e) {
    	print(e.message.toString());
    }
    },

    fixName: function(player, cmd, args) {
    	try {
    	this.getRanksData();
    	var steamID = rust.UserIDFromPlayer(player);
    	var getPlayer = this.findPlayerByName(player, args);
    	if (TitlesData.PlayerData[steamID].RealName) {
    		player.displayName = TitlesData.PlayerData[steamID].RealName;
    		//rust.SendChatMessage(player, "NameTool", "Ran Fix", "0");
    		//print("Reset Players Name Too: " + player.displayName)
    	}
    } catch(e) {
    	print(e.message.toString());
    }
    },

    findPlayerByName: function(player, args) {
		try {
			var global = importNamespace("");
			var found = [],
				foundID;
			var playerName = args[0].toLowerCase();
			var itPlayerList = global.BasePlayer.activePlayerList.GetEnumerator();
			while (itPlayerList.MoveNext()) {

				var displayName = itPlayerList.Current.displayName.toLowerCase();

				if (displayName.search(playerName) > -1) {
					print("found match " + displayName);
					found.push(itPlayerList.Current);
				}

				if (playerName.length === 17) {
					if (rust.UserIDFromPlayer(displayName).search(playerName)) {
						found.push(itPlayerList.Current);
					}
				}
			}

			if (found.length) {
				foundID = rust.UserIDFromPlayer(found[0]);
				found.push(foundID);
				return found;
			} else {
				rust.SendChatMessage(player, "NameTool", "Name Not Found", "0");
				return false;
			}
		} catch (e) {
			print(e.message.toString());
		}
	}
}