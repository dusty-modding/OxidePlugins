var Rankings = {
	Title: "Rankings",
	Author: "Killparadise",
	Version: V(1, 0, 0),
	Description : "Handles ranking players and kill stats",

	OnServerInitialized: function() {
		command.AddChatCommand("ranks", this.Plugin, "handleCmds");
		permission.RegisterPermission("rankings.canResetRank", this.Plugin);
		permission.RegisterPermission("rankings.canSetRank", this.Plugin);
		print("Rankings: Locating ParaAPI...");
		if(!ParaAPI) {
			print("Rankings: CRITICAL ERROR: ParaAPI NOT FOUND, now exiting...");
			return false;
		} else {
			print("Rankings: ParaAPI located, Installing.");
			if(ParaAPI) {
				print("Rankings: Successfully Installed ParaAPI Instance.");
				print("New Perms for Rankings: rankings.canResetRank, rankings.canSetRank");
			}
		}
		this.setupPlugin();
	},

	OnPlayerInit: function(player) {
		var steamID = rust.UserIDFromPlayer(player);
		APIData.PlayerData[steamID].Rankings = APIData.PlayerData[steamID].Rankings || this.Config.StarterRank;
		if (this.Config.Settings.useGUI) ParaUIHandler.buildUI(player, this.Config.GUI, APIData.PlayerData[steamID].Rankings);
	},

	setupPlugin: function() {
		for(var key in APIData.PlayerData) {
			APIData.PlayerData[key].Rankings = APIData.PlayerData[key].Rankings || this.Config.StarterRank;
		}
	},

	LoadDefaultConfig: function() {
		this.Config.RankingsVersion = "1.0.0";
		this.Config.Prefix = "Rankings";
		this.Config.Settings = this.Config.Settings || {
			"useGUI": true
		};
		this.Config.StarterRank = this.Config.StarterRank || {
			"name": "Newbie", //I Recommend only chaning the name of the starter rank
			"rank": 0,
			"kills": 0,
			"deaths": 0,
			"suicides": 0
		}; //The Rank all new players will use
		this.Config.Ranks = this.Config.Ranks || [
			{
				name: "Movin Up",
				rank: 1,
				kills: 1
			}
		];
		this.Config.GUI = {
			"color": "0.1 0.1 0.1 0.75",
			"anchorMin": "0.024 0.04",
			"anchorMax": "0.175 0.08",
			"label": "Rankings",
			"data": ["kills, deaths, rank, name"],
			"labelFontSize": 12,
			"labelColor": "1.0 1.0 1.0 1.0",
			"dataFontSize": 12,
			"dataColor": "1.0 1.0 1.0 1.0"
		};
		this.Config.Messages = this.Config.Messages || {
			"promo": "You\'ve been promoted to <color=green>",
			"kill": "You\'ve Slain <color=red>",
			"stats": ["<color=orange>Kills:</color> {kills}", "<color=orange>Deaths:</color> {deaths}", "<color=orange>Suicides:</color> {suicides}", "<color=orange>Rank:</color> {rank}", "<color=orange>Title:</color> {name}"],
			"noPerm": "You do not have Permission to use that command.",
			"badSyn": "Incorrect Syntax used, please try again",
			"setRank": " has set your rank to ",
			"resetRank": "Your rank has been reset!",
			"cmdSet": "<color=orange>Set new rank successfully</color>",
			"cmdReset": "<color=orange>Reset players rank successfully</color>"
		};
	},

	handleCmds: function(player, cmd, arg) {
		var steamID = rust.UserIDFromPlayer(player);
		switch(arg[0]) {
			case "stats":
				player.ChatMessage(ParaAPI.buildString(this.Config.Messages.stats, [APIData.PlayerData[steamID].Rankings.kills, APIData.PlayerData[steamID].Rankings.deaths,
          APIData.PlayerData[steamID].Rankings.suicides, APIData.PlayerData[steamID].Rankings.rank, APIData.PlayerData[steamID].Rankings.name
        ]));
				break;
			case "set":
				if(permission.UserHasPermission(steamID, "rankings.canSetRank")) {
					this.cmdSetRank(player, arg);
				} else {
					rust.SendChatMessage(player, this.Config.Prefix, this.Config.Messages.noPerm, "0");
				}
				break;
			case "reset":
				if(permission.UserHasPermission(steamID, "rankings.canResetRank")) {
					this.cmdResetRank(player, arg);
				} else {
					rust.SendChatMessage(player, this.Config.Prefix, this.Config.Messages.noPerm, "0");
				}
				break;
			default:
				rust.SendChatMessage(player, this.Config.Prefix, this.Config.Messages.badSyn, "0");
				break;
		}
		return false;
	},

	cmdSetRank: function(p, arg) {
		if (!arg[1]) {
			rust.SendChatMessage(p, this.Config.Prefix, this.Config.Messages.badSyn, "0");
			return false;
		}

		var foundPlayer = ParaAPI.findPlayerByName(arg[1]),
			newRank = {};

		for(var i = 0; i < this.Config.Ranks.length; i++) {
			if(Number(arg[2]) === this.Config.Ranks[i].rank || arg[2] === this.Config.Ranks[i].name) {
				APIData.PlayerData[foundPlayer.id].Rankings.rank = this.Config.Ranks[i].rank;
				APIData.PlayerData[foundPlayer.id].Rankings.name = this.Config.Ranks[i].name;
				rust.SendChatMessage(foundPlayer.player, this.Config.Prefix, p.displayName + this.Config.Messages.setRank + this.Config.Ranks[i].name, "0");
				rust.SendChatMessage(p, this.Config.Prefix, this.Config.Messages.cmdSet, "0");
				break;
			}
		}
		ParaAPI.saveData();
		return false;
	},

	cmdResetRank: function(p, arg) {
		var foundPlayer = {}, newRank = {};
		if (!arg[0]) {
			rust.SendChatMessage(p, this.Config.Prefix, this.Config.Messages.badSyn, "0");
			return false;
		}
		if (!arg[1]) {
			foundPlayer = {
				player: p,
				id: rust.UserIDFromPlayer(p)
			};
		} else {
			foundPlayer = ParaAPI.findPlayerByName(arg[1]);
		}
		APIData.PlayerData[foundPlayer.id].Rankings = this.Config.StarterRank;
		rust.SendChatMessage(foundPlayer.player, this.Config.Prefix, this.Config.Messages.resetRank, "0");
		rust.SendChatMessage(p, this.Config.Prefix, this.Config.Messages.cmdReset, "0");
		ParaAPI.saveData();
		return false;
	},

	OnEntityDeath: function(entity, info) {
		if(!info || !entity) return false;
		var deathObj = {
			killer: info.Initiator,
			victim: entity
		};
		var death = ParaAPI.deathHandler(deathObj, false);
		if(death) this.registerKill(death);
		return;
	},

	registerKill: function(d) {
		var suicide = (d.killer.displayName === d.victim.displayName);
		if(!suicide) {
			APIData.PlayerData[d.killerID].Rankings.kills += 1;
			APIData.PlayerData[d.victimID].Rankings.deaths += 1;
		} else {
			APIData.PlayerData[d.killerID].Rankings.suicides += 1;
		}
		ParaAPI.saveData();
		if(ParaUIHandler) ParaUIHandler.updateUI(APIData.PlayerData[d.victimID].Rankings, d.victim, 'Rankings');
		return this.checkRank(d);
	},

	checkRank: function(p) {
		var i = 0,
			len = this.Config.Ranks.length;
		if(ParaUIHandler) ParaUIHandler.updateUI(APIData.PlayerData[p.killerID].Rankings, p.killer, 'Rankings');
		for(i; i < len; i++) {
			if(APIData.PlayerData[p.killerID].Rankings.kills === this.Config.Ranks[i].kills &&
				APIData.PlayerData[p.killerID].Rankings.name !== this.Config.Ranks[i].name) {

				rust.SendChatMessage(p.killer, this.Config.Prefix, this.Config.Messages.kill + p.victim.displayName + '</color>', "0");
				rust.SendChatMessage(p.killer, this.Config.Prefix, this.Config.Messages.promo + this.Config.Ranks[i].name + '</color>', "0");
				APIData.PlayerData[p.killerID].Rankings.name = this.Config.Ranks[i].name;
				APIData.PlayerData[p.killerID].Rankings.rank = this.Config.Ranks[i].rank;
				if (PlayerPrefix) PlayerPrefix.updatePrefix(this.Config.Ranks[i].name, p.killerID);
				break;
			} else {
				return false;
			}
		}
		ParaAPI.saveData();
	}
};
