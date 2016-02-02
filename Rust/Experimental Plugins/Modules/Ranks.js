function RanksSystem(title, author, version, args) {
	this.Title = title;
	this.Author = author;
	this.Version = version;
	this.moduleData = args[0];
	this.moduleConfig = args[1];
	this.moduleConfig.Modules["Ranks"].Version = this.Version;
	this.moduleConfig.Permissions.Ranks = this.moduleConfig.Permissions.Ranks || {

	};
	this.moduleConfig.Ranks = this.moduleConfig.Ranks || {
		Main: {
			Survivor: {
				color: "#FFFFFF",
				rank: 0,
				killsNeeded: 0
			},
			Youngling: {
				color: "red",
				rank: 1,
				killsNeeded: 5
			}
		},
		Messages: {
			test: "Test Message",
			slain: "<color=lime>{slayer}</color> the <color={slayerColor}>{title}</color> has slain <color=lime>{slain}</color> the <color={slainColor}>{stitle}</color>!"
		},
		Settings: {
			AntiSleeperOn: false,
			deathMsgs: true
		},
		Permissions: {

		}
	};
	command.AddChatCommand("r", this.Plugin, "rankCmd");
}

RanksSystem.prototype = {

	OnPlayerInit: function(player) {
		var steamID = rust.UserIDFromPlayer(player);
		this.buildData(steamID);
	},

	buildData: function(steamID) {
		this.moduleData.PlayerData[steamID] = this.moduleData.PlayerData[steamID] || {};
		this.moduleData.PlayerData[steamID].Name = this.moduleData.PlayerData[steamID].Name || "";
		this.moduleData.PlayerData[steamID].Title = this.moduleData.PlayerData[steamID].Title || "";
		this.moduleData.PlayerData[steamID].Rank = this.moduleData.PlayerData[steamID].Rank || 0;
		this.moduleData.PlayerData[steamID].Kills = this.moduleData.PlayerData[steamID].Kills || 0;
		this.moduleData.PlayerData[steamID].Deaths = this.moduleData.PlayerData[steamID].Deaths || 0;
		this.moduleData.PlayerData[steamID].KDR = this.moduleData.PlayerData[steamID].KDR || 0;
		this.setRank(steamID);
		API.saveData();
	},

	OnEntityDeath: function(entity, hitinfo) {
		var dh = API.deathHandler({
			victim: entity,
			killer: hitinfo.Initiator
		});
		if (dh) this.handleStats(dh.killer, dh.victim);
		return false;
	},

	handleStats: function(killer, victim) {
		var killerID = rust.UserIDFromPlayer(killer);
		var victimID = rust.UserIDFromPlayer(victim);
		if (this.moduleConfig.Ranks.Settings.AntiAbuseOn && API.antiAbuse(victim, killer)) {
			return false;
		}

		if (this.moduleConfig.Ranks.Settings.antiSleeper && victim.IsSleeping() && !this.moduleData.PlayerData[victimID]) return false;

		if (killer.displayName !== victim.displayName) {

			this.moduleData.PlayerData[killerID].Kills += 1;
			this.moduleData.PlayerData[victimID].Deaths += 1;
			if (this.moduleConfig.Ranks.Settings.deathMsgs) this.buildDeathMsg([killer.displayName, victim.displayName], [killerID, victimID]);

		} else if (victim.displayName === killer.displayName) {
			this.moduleData.PlayerData[victimID].Deaths += 1;
		}

		var ids = [victimID, killerID];
		for (var i = 0, len = ids.length; i < len; i++) {
			k2d = this.moduleData.PlayerData[ids[i]].Kills / this.moduleData.PlayerData[ids[i]].Deaths;
			k2d = Math.ceil(k2d * 100) / 100;
			if (k2d !== "Infinity") {
				this.moduleData.PlayerData[ids[i]].KDR = k2d;
			} else {
				this.moduleData.PlayerData[ids[i]].KDR = this.moduleData.PlayerData[ids[i]].Kills;
			}
		}
		API.saveData();
		this.setRank(killerID);
	},

	buildDeathMsg: function(users, ids) {
		var slayerTitle = this.moduleData.PlayerData[ids[0]].Title;
		var slainTitle = this.moduleData.PlayerData[ids[1]].Title;
		rust.BroadcastChat("RANKS", API.buildString(msgs.slain, [users[0], this.moduleConfig.Ranks.Main[slayerTitle].color, slayerTitle, users[1], this.moduleConfig.Ranks.Main[slainTitle].color, slainTitle]));
	},

	setRank: function(steamID) {
		for (var key in this.moduleConfig.Main) {
			if (this.moduleData.PlayerData[steamID].Kills === this.moduleConfig.Main[key].killsNeeded) {
				this.moduleData.PlayerData[steamID].Title = key;
				this.moduleData.PlayerData[steamID].Rank = this.moduleConfig.Main[key].rank;
			}
		}
		API.saveData();
	},

	OnPlayerChat: function(arg) {
		var chatObj = {
			config: this.moduleconfig.Ranks,
			player: arg.connection.player,
			steamID: rust.UserIDFromPlayer(player),
			titleColor: "",
			useTitle: this.moduleData.PlayerData[steamID].Title || "",
			msg: arg.GetString(0, "text")
		};
		var cHandle = new chatHandler(chatObj);
		if (API.modules.PrefixHandler) return null;
		global.ConsoleSystem.Broadcast("chat.add", chatObj.steamID, cHandle);
		print(chatObj.player.displayName + ": " + chatObj.msg);
		return false;
	}
};
