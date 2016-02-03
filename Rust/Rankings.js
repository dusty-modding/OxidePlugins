var Rankings = {
	Title: 'Rankings',
	Author: 'Killparadise',
	Version: V(1, 0, 0),
	Description : "Handles ranking players and kill stats",

	init: function() {
		command.AddChatCommand('pr', this.Plugin, 'handleCmds');
		permission.RegisterPermission('rankings.canResetRank', this.Plugin);
		permission.RegisterPermission('rankings.canSetRank', this.Plugin);
	},

	OnServerInitialized: function() {
		print('Rankings: Locating ParaAPI...');
		if(!ParaAPI) {
			print('Rankings: CRITICAL ERROR: ParaAPI NOT FOUND, now exiting...');
			Unload();
			return false;
		} else {
			print('Rankings: ParaAPI located, Installing.');
			if(ParaAPI) {
				print('Rankings: Successfully Installed into ParaAPI Instance.');
				print('New Perms for Rankings: canResetRank, canSetRank');
				this.setupPlugin();
			}
		}
	},

	LoadDefaultConfig: function() {
		this.Config.RankingsVersion = '1.0.0';
		this.Config.Prefix = 'Rankings';
		this.Config.Settings = this.Config.Settings || {};
		this.Config.StarterRank = this.Config.StarterRank || {
			name: 'Newbie', //I Recommend only chaning the name of the starter rank
			rank: 0,
			kills: 0,
			deaths: 0,
			suicides: 0
		}; //The Rank all new players will use
		this.Config.Ranks = this.Config.Ranks || [
			{
				name: 'Movin Up',
				rank: 1,
				kills: 1
			}
		];
		this.Config.Messages = this.Config.Messages || {
			promo: 'You\'ve been promoted to ',
			kill: 'You\'ve Slain ',
			stats: ['<color=orange>Kills:</color> {kills}', '<color=orange>Deaths:</color> {deaths}', '<color=orange>suicides:</color> {suicides}', '<color=orange>Rank:</color> {rank}', '<color=orange>Title:</color> {name}'],
			noPerm: 'You do not have Permission to use that command.',
			badSyn: 'Incorrect Syntax used, please try again',
			setRank: ' has set your rank to ',
			resetRank: 'Your rank has been reset!',
			cmdSet: '<color=orange>Set new rank successfully</color>',
			cmdReset: '<color=orange>Reset players rank successfully</color>'
		};
	},

	setupPlugin: function() {
		for(var key in APIData.PlayerData) {
			APIData.PlayerData.Rankings = APIData.PlayerData.Rankings || this.Config.StarterRank;
		}
	},

	handleCmds: function(player, cmd, arg) {
		var steamID = rust.UserIDFromPlayer(player);
		switch(arg[0]) {
			case 'stats':
				player.ChatMessage(ParaAPI.buildString(this.Config.Messages.stats, [APIData.PlayerData[steamID].Rankings.kills, APIData.PlayerData[steamID].Rankings.deaths,
          APIData.PlayerData[steamID].Rankings.suicides, APIData.PlayerData[steamID].Rankings.rank, APIData.PlayerData[steamID].Rankings.name
        ]));
				break;
			case 'set':
				if(permission.UserHasPermission(steamID, 'rankings.canSetRank')) {
					this.cmdSetRank(player, arg);
				} else {
					rust.SendChatMessage(player, this.Config.Prefix, this.Config.Messages.noPerm, '0');
				}
				break;
			case 'reset':
				if(permission.UserHasPermission(steamID, 'rankings.canResetRank')) {
					this.cmdResetRank(player, arg);
				} else {
					rust.SendChatMessage(player, this.Config.Prefix, this.Config.Messages.noPerm, '0');
				}
				break;
			default:
				rust.SendChatMessage(player, this.Config.Prefix, this.Config.Messages.badSyn, '0');
				break;
		}
		return false;
	},

	cmdSetRank: function(p, arg) {
		var foundPlayer = ParaAPI.findPlayerByName(arg[1]),
			newRank = {};

		for(var i = 0; i < this.Config.Ranks.length; i++) {
			if(Number(arg[2]) === this.Config.Ranks[i].rank || arg[2] === this.Config.Ranks[i].name) {
				APIData.PlayerData[foundPlayer.id].Rankings = ParaAPI.combineObj(APIData.PlayerData[foundPlayer.id].Rankings, this.Config.Ranks[i]);
				rust.SendChatMessage(foundPlayer.player, this.Config.Prefix, p.displayName + this.Config.Messages.setRank + arg[2], '0');
				rust.SendChatMessage(p, this.Config.Prefix, this.Config.Messages.cmdSet, '0');
				break;
			}
		}
		ParaAPI.saveData();
		return false;
	},

	cmdResetRank: function(p, arg) {
		var foundPlayer = ParaAPI.findPlayerByName(arg[1]),
			newRank = {};
		APIData.PlayerData[foundPlayer.id].Rankings = this.Config.StarterRank;
		rust.SendChatMessage(foundPlayer.player, this.Config.Prefix, this.Config.Messages.resetRank, '0');
		rust.SendChatMessage(p, this.Config.Prefix, this.Config.Messages.cmdSet, '0');
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
			APIData.PlayerData[d.killerID].Rankings.Kills += 1;
			APIData.PlayerData[d.victimID].Rankings.Deaths += 1;
		} else {
			APIData.PlayerData[d.killerID].Rankings.suicides += 1;
		}
		ParaAPI.saveData();
		return this.checkRank(d);
	},

	checkRank: function(p) {
		var i = 0,
			len = this.Config.Ranks.length;
		for(i; i < len; i++) {
			if(APIData.PlayerData[p.killerID].Rankings.kills === this.Config.Ranks[i].kills &&
				APIData.PlayerData[p.killerID].Rankings.name !== this.Config.Ranks[i].name) {

				print(this.Config.Prefix + ' ' + this.Config.Messages.kill);
				rust.SendChatMessage(p.killer, this.Config.Prefix, this.Config.Messages.kill + p.victim.displayName, '0');
				rust.SendChatMessage(p.killer, this.Config.Prefix, this.Config.Messages.promo + this.Config.Ranks[i].name, '0');
				APIData.PlayerData[p.killerID].Rankings.name = this.Config.Ranks[i].name;
			} else {
				return false;
			}
		}
		ParaAPI.saveData();
	}

};
