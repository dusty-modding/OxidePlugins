var PlayerPrefix = {
	Title: "Player Prefix",
	Author: "Killparadise",
	Version: V(1, 0, 0),
	Description : "Handles Prefixes, works best with rankings",

	OnServerInitialized: function() {
		command.AddChatCommand("prefix", this.Plugin, "cmdSetPrefix");
		command.AddChatCommand("chprefix", this.Plugin, "cmdCheckPrefix");
		permission.RegisterPermission("playerprefix.cansetprefix", this.Plugin);
		print("PlayerPrefix: Locating ParaAPI...");
		if(!ParaAPI) {
			print("PlayerPrefix: CRITICAL ERROR: ParaAPI NOT FOUND, now exiting...");
			Unload();
			return false;
		} else {
			print("PlayerPrefix: ParaAPI located, Installing.");
			if(ParaAPI) {
				print("PlayerPrefix: Successfully Installed ParaAPI Instance.");
				print("New Perms for PlayerPrefix: playerprefix.cansetprefix");
			}
		}
		this.setupPlugin();
	},

	OnPlayerInit: function(player) {
			var steamID = rust.UserIDFromPlayer(player);
			APIData.PlayerData[steamID].Prefix = APIData.PlayerData[steamID].Prefix || this.Config.StarterPrefix;
		},

	LoadDefaultConfig: function() {
		this.Config.RankingsVersion = "1.0.0";
		this.Config.Prefix = "PlayerPrefix";
		this.Config.Settings = this.Config.Settings || {};
		this.Config.StarterPrefix = "Newbie";
		this.Config.Prefixes = ["Knight", "Bishop"];
		this.Config.Messages = this.Config.Messages || {
			"noPerm": "You do not have Permission to use that command.",
			"badSyn": "Incorrect Syntax used, please try again",
			"setPrefix": " has set your prefix to ",
			"cmdSet": "<color=orange>Set new prefix successfully</color>",
			"cmdCheck": "Your current prefix is: "
		};
	},

	setupPlugin: function() {
		for(var key in APIData.PlayerData) {
			APIData.PlayerData[key].Prefix = APIData.PlayerData[key].Prefix || this.Config.StarterPrefix;
		}
	},

	cmdSetPrefix: function(player, cmd, arg) {
		var steamID = rust.UserIDFromPlayer(player);
		if (!permission.UserHasPermission(steamID, "playerprefix.cansetprefix")) return rust.SendChatMessage(player, this.Config.Prefix, this.Config.Messages.noPerm, "0");
		var foundPlayer = ParaAPI.findPlayerByName(arg[0]), i = 0, len = this.Config.Prefixes.length;

		for (i; i < len; i++) {
			if (arg[1].toLowerCase() === this.Config.Prefixes[i].toLowerCase()) {
				APIData.PlayerData[foundPlayer.id].Prefix = this.Config.Prefixes[i];
				rust.SendChatMessage(foundPlayer.player, this.Config.Prefix, this.Config.Messages.setPrefix + this.Config.Prefixes[i], "0");
				rust.SendChatMessage(player, this.Config.Prefix, this.Config.Messages.cmdSet, "0");
				break;
			}
		}
		return ParaAPI.saveData();
	},

	cmdCheckPrefix: function(player, cmd, arg) {
			var steamID = rust.UserIDFromPlayer(player);
			rust.SendChatMessage(player, this.Config.Prefix, this.Config.Messages.cmdCheck + "<color=orange>" + APIData.PlayerData[steamID].Prefix + "</color>", "0");
	},

	/////////////////////
	///Plug into Ranks//
	///////////////////
	updatePrefix: function(rank, playerID) {
		var newRank = {}, i = 0, len = this.Config.Prefixes.length;
			for (i; i < len; i++) {
			if (rank.toLowerCase() === this.Config.Prefixes[i].toLowerCase()) {
				APIData.PlayerData[playerID].Prefix = this.Config.Prefixes[i];
				break;
			}
		}
		return ParaAPI.saveData();
	}
};
