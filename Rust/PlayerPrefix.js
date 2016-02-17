var PlayerPrefix = {
	Title: 'Player Prefix',
	Author: 'Killparadise',
	Version: V(1, 0, 0),
	Description : "Handles Prefixes, works best with rankings",

	init: function() {
		command.AddChatCommand('pr', this.Plugin, 'cmdSetPrefix');
		permission.RegisterPermission('playerprefix.cansetprefix', this.Plugin);
	},

	OnServerInitialized: function() {
		print('PlayerPrefix: Locating ParaAPI...');
		if(!ParaAPI) {
			print('PlayerPrefix: CRITICAL ERROR: ParaAPI NOT FOUND, now exiting...');
			Unload();
			return false;
		} else {
			print('PlayerPrefix: ParaAPI located, Installing.');
			if(ParaAPI) {
				print('PlayerPrefix: Successfully Installed ParaAPI Instance.');
				print('New Perms for PlayerPrefix: playerprefix.canSetPrefix');
			}
		}
		this.setupPlugin();
	},

	OnPlayerInit: function(player) {
			var steamID = rust.UserIDFromPlayer(player);
			APIData.PlayerData[steamID].Prefix = APIData.PlayerData[steamID].Prefix || this.Config.StarterPrefix;
		},

	LoadDefaultConfig: function() {
		this.Config.RankingsVersion = '1.0.0';
		this.Config.Prefix = 'PlayerPrefix';
		this.Config.Settings = this.Config.Settings || {};
		this.Config.StarterPrefix = 'Newbie';
		this.config.Prefixes = [];
		this.Config.Messages = this.Config.Messages || {
			noPerm: 'You do not have Permission to use that command.',
			badSyn: 'Incorrect Syntax used, please try again',
			setPrefix: ' has set your prefix to ',
			cmdSet: '<color=orange>Set new prefix successfully</color>'
		};
	},

	setupPlugin: function() {
		for(var key in APIData.PlayerData) {
			APIData.PlayerData[key].Prefix = APIData.PlayerData[key].Prefix || this.Config.StarterPrefix;
		}
	},

	cmdSetPrefix: function(player, cmd, arg) {
		if (!permission.UserHasPermission(steamID, 'rankings.canSetRank')) return rust.SendChatMessage(player, this.Config.Prefix, this.Config.Messages.noPerm, '0');
		var foundPlayer = ParaAPI.findPlayerByName(arg[1]),
			newRank = {}, i = 0, len = this.Config.Prefixes.length;

		for (i; i < len; i++) {
			if (arg[2].toLowerCase() === this.Config.Prefixes[i].toLowerCase()) {
				APIData.PlayerData[foundPlayer.id].Prefix = this.Config.Prefixes[i];
				rust.SendChatMessage(foundPlayer.player, this.Config.Prefix, this.Config.Messages.setPrefix, '0');
				rust.SendChatMessage(player, this.Config.Prefix, this.Config.Messages.cmdSet, '0');
				break;
			}
		}
		return ParaAPI.saveData();
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
