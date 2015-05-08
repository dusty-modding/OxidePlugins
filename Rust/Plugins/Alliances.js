var Alliances = {
  Title: "Alliances",
  Author: "Killparadise",
  Version: V(1, 0, 0),
  Init: function() {
    configVers = "v1.0";
    this.runUpdate();
    this.registerPermissions();
    this.getData();
    global = importNamespace("");
  },

  OnPlayerInit: function(player) {
    var steamID = rust.UserIDFromPlayer(player);
    this.handleData(player, steamID);
  },

  OnServerInitialized: function() {
    this.msgs = this.Config.Messages;
    this.prefix = this.Config.Prefix;
    if (this.Config.Settings.useEconomy) EconAPI = plugins.Find("00-Economics");
    //if (this.Config.Settings.useShops) aShopsAPI = plugins.Find("AllianceShops"); //For future add ons
    //if (this.Config.Settings.useDiplomacy) aDiploAPI = plugins.Find("AllianceDiplomacy"); //For future add ons
    command.AddChatCommand("ally", this.Plugin, "cmdSwitch");
  },

  runUpdate: function() {
    if (this.Config.Settings.version !== configVers) {
      this.LoadDefaultConfig();
      print("Updating config with basic updater...");
    }
  },

  LoadDefaultConfig: function() {
    this.Config.Settings = {
      "cost": 5000,
      "supply": "wood",
      "maxCharacters": 8,
      "useEconomy": true,
      "version": configVers,
      "useRanksAndTitles": false,
      "inviteTimer": 60,
      "nameChangeCost": 2500,
      "tagChangeCost": 1000
    };

    this.Config.Permissions = {
      "create": "canCreate",
      "invite": "canInvite",
      "kick": "canKick",
      "promote": "canPromote",
      "demote": "canDemote",
      "updboard": "canUpdateBoard",
      "chgname": "canChangeName",
      "chgtag": "canChangeTag",
      "chgpolicy": "canChangePolicy",
      "mute": "canMute",
      "unmute": "canUnMute",
      "give": "canGivePerm",
      "remove": "canRemovePerm",
      "delete": "canDelete"
    };

    this.Config.Ranks = ["Rank I", "Rank II", "Rank III", "Rank IV", "Rank V"];

    this.Config.Messages = {
      "noPermission": "<color=red>You do not have permission to use this command</color>",
      "created": "<color=lime>Alliance {alliance} successfully created!</color>",
      "createFail": "<color=red>Unable to create Alliance because {reason}.</color>",
      "deleteFail": "<color=red>Unable to Delete Alliance because {reason}.</color>",
      "deletePassed": "<color=lime>Successfully deleted the Alliance.</color>",
      "maxChars": "The Max character Limit is {charLimit} you cannot go above!",
      "policy": "This Alliance does not have an Open Join Policy set.",
      "policyChg": "<color=green>Policy Successfully changed to {policy}</color>",
      "hasAlliance": "<color=red>That player already belongs to {alliance} and cannot be invited.</color>",
      "invited": "Invited {player} to join your alliance.",
      "wasInvited": "<color=lime>You've been invited to join {alliance} type /ally join to accept the invite!</color>",
      "kick": "<color=lime>Successfully kicked {player}.</color>",
      "kicked": "<color=red>You've been kicked from {alliance}!</color>",
      "notFound": "Player not Found",
      "kickSelf": "You can't kick youself! Use /ally leave",
      "alreadyMuted": "This player is already muted.",
      "muted": "<color=lime>Successfully muted {player}.</color>",
      "unmuted": "<color=lime>Successfully unmuted {player}.</color>",
      "notMuted": "This player is currently not muted.",
      "youreMuted": "<color=red>You're currently muted in Alliance Chat!</color>"
    };

    this.Config.Prefix = "Alliances";
  },

  //----------------------------------------
  //          Data Handling
  //----------------------------------------
  handleData: function(player, steamID) {
    var tag = this.findAlliance(player);

  },

  getData: function() {
    AllianceData = data.GetData("Alliances");
    AllianceData = AllianceData || {};
    AllianceData.Alliances = AllianceData.Alliances || {};
    AllianceData.PlayerData = AllianceData.PlayerData || {};
  },

  saveData: function() {
    data.SaveData("Alliances");
  },

  //----------------------------------------
  //         API Functions
  //		Callable functions for API use
  //----------------------------------------
  findAlliance: function(player) {
    var name = player.displayName;
    var steamID = rust.UserIDFromPlayer(player);
    for (var alliance in AllianceData.Alliances) {
      if (AllianceData.Alliances.hasOwnProperty(alliance)) {
        for (var i = 0; i < AllianceData.Alliances[alliance].members.length; i++) {
          if (AllianceData.Alliances[alliance].members[i] === steamID) {
            return alliance;
          }
        }
      }
    }
    return false;
  },

  findTag: function(steamID) {
    for (var x in AllianceData.Alliances) {
      if (AllianceData.Alliances.hasOwnProperty(x)) {
        for (var i = 0; i < AllianceData.Alliances[x].members.length; i++) {
          if (AllianceData.Alliances[x].members[i] === steamID) {
            return AllianceData.Alliances[x].tag;
          }
        }
      }
    }
    return false;
  },

  //----------------------------------------
  //         String Builder
  //		Builds our strings with replace
  //----------------------------------------
  buildString: function(string, values) {
    var temp = [],
      i = 0,
      sb = "";

    if (values.length === 0) {
      return string;
    }
    temp.push(string.match(/\{([^{]+)\}/g));
    temp = temp.toString().split(",");
    for (i; i < temp.length; i++) {
      sb = string.replace(temp[i], values[i]);
      print(temp[i] + " values: " + values[i]);
    }
    return sb;
  },

  //----------------------------------------
  //         Find Player
  //		Finds a player based off
  //		 their name or SteamID
  //----------------------------------------
  findPlayerByName: function(playerName) {
    try {
      var found = [],
        foundID;
      playerName = playerName.toLowerCase();
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
        return false;
      }
    } catch (e) {
      print(e.message.toString());
    }
  },

  //----------------------------------------
  //     Permission Handling
  //    Handle Rank and User Permissions
  //----------------------------------------
  hasPermission: function(player, perm) {
    var steamID = rust.UserIDFromPlayer(player);
    // if (player.net.connection.authLevel === 2) {
    //   return true;
    // }

    if (permission.UserHasPermission(steamID, perm)) {
      return true;
    }
    rust.SendChatMessage(player, this.prefix, this.msgs.noPermission, "0");
    return false;
  },

  registerPermissions: function() {
    var i = 0,
      ii = 0,
      p = this.Config.Permissions.length,
      j = this.Config.Ranks.length;
    //prefix permissions
    for (i; i < j; i++) {
      if (!permission.GroupExists(this.Config.Ranks[i])) {
        permission.CreateGroup(this.Config.Ranks[i], this.Config.Ranks[i], i);
        print("Built Rank Groups");
      }
    }
    //single permissions
    for (var perm in this.Config.Permissions) {
      if (!permission.PermissionExists(this.Config.Permissions[perm])) {
        permission.RegisterPermission(this.Config.Permissions[perm], this.Plugin);
      }
    }
  },

  setOwnerPerms: function(player) {

  },

  setRankPerms: function() {

  },

  //----------------------------------------
  //          Main Functions
  //----------------------------------------
  setTag: function(player) {
    var steamID = rust.UserIDFromPlayer(player);
    var alliance = this.findAlliance(player) || null;
    if (alliance === null || alliance === undefined) return false;
    if (AllianceData.PlayerData[steamID].originalName === "" || AllianceData.PlayerData[steamID].originalName === undefined) AllianceData.PlayerData[steamID].originalName = player.displayName;
    player.displayName = "[" + AllianceData.Alliances[alliance].tag + "]" + player.displayName;
  },


  //----------------------------------------
  //          Command Catcher
  //----------------------------------------
  cmdSwitch: function(player, cmd, args) {
    try {
      var steamID = rust.UserIDFromPlayer(player);
      var perms = this.Config.Permissions;
      var allowed = this.hasPermission(player, perms.args[0]);
      switch (args[0]) {
        case "create":
          this.createAlliance(player, args);
          break;
        case "delete":
          if (allowed) this.deleteAlliance(player, args);
          break;
        case "chgpolicy":
          if (allowed) this.changePolicy(player, args);
          break;
        case "invite":
          if (allowed) this.invitePlayer(player, args);
          break;
        case "join":
          this.playerJoin(player, args);
          break;
        case "leave":
          this.playerLeave(player, args);
          break;
        case "kick":
          if (allowed) this.kickPlayer(player, args);
          break;
          //These commands down need functions written as they do not exist yet.
        case "mute":
          if (allowed) this.mutePlayer(player, args);
          break;
        case "unmute":
          if (allowed) this.unmutePlayer(player, args);
          break;
        case "chgtag":
          if (allowed) this.changeTag(player, args);
          break;
        case "chgname":
          if (allowed) this.changeName(player, args);
          break;
        case "updboard":
          if (allowed) this.updateBoard(player, args);
          break;
        case "promote":
          if (allowed) this.promotePlayer(player, args);
          break;
        case "demote":
          if (allowed) this.demotePlayer(player, args);
          break;
        case "give":
          if (allowed) this.givePerm(player, args);
          break;
        case "remove":
          if (allowed) this.removePerm(player, args);
          break;
        default:
          print("hit default, something will go here eventually...");
          break;
      }
    } catch (e) {
      print(e.message.toString());
    }
  },

  //----------------------------------------
  //          Command Handling
  //----------------------------------------
  // /ally create alliancename tag
  createAlliance: function(player, args) {
    if (args.length !== 3) {
      player.ChatMessage(this.buildString(this.msgs.createFail, ["there's not enough arguments"]));
      return false;
    }

    if (args[2].length !== 3) {
      player.ChatMessage(this.buildString(this.msgs.createFail, ["tag length incorrect."]));
    }
    var steamID = rust.UserIDFromPlayer(player);

    if (this.Config.useEconomy) {
      var userEcon = EconAPI.Call("GetUserData", steamID);
      userEcon.Call("Withdraw", this.Config.Settings.cost);
    }

    if (AllianceData.Alliances[args[1]] === undefined || AllianceData.Alliances[args[1]] === null) {
      AllianceData.Alliances[args[1]] = AllianceData.Alliances[args[1]] || {};
      AllianceData.Alliances[args[1]].power = 0;
      AllianceData.Alliances[args[1]].board = "";
      AllianceData.Alliances[args[1]].policy = "Closed";
      AllianceData.Alliances[args[1]].owner = steamID.toString();
      AllianceData.Alliances[args[1]].tag = args[2].toString();
      AllianceData.Alliances[args[1]].Ranks = this.Config.Ranks;
      AllianceData.Alliances[args[1]].members = [];
      player.ChatMessage(this.buildString(this.msgs.created, [args[1].toString()]));
    } else {
      player.ChatMessage(this.buildString(this.msgs.createFail, ["Alliance already exists"]));
    }
    this.saveData();
    this.setTag(player);
  },

  deleteAlliance: function(player, args) {
    var steamID = rust.UserIDFromPlayer(player);
    if (steamID !== AllianceData.Alliances[args[1]].owner) {
      player.ChatMessage(this.buildString(this.msgs.deleteFail, ["You're not the owner"]));
      return false;
    }

    var alliance = args[1].toString();
    if (alliance.toLowerCase() === AllianceData.Alliances[args[1]].toLowerCase()) {
      delete AllianceData.Alliances[args[1]];
      this.saveData();
      player.ChatMessage(this.msgs.deletePassed);
    }
  },

  changePolicy: function(player, args) {
    var alliance = this.findAlliance(player);
    if (AllianceData.Alliances[alliance].policy === "Open") {
      AllianceData.Alliances[alliance].policy = "Closed";
      player.ChatMessage(this.msgs.policyChg.replace("{policy}", "Closed"));
    } else {
      AllianceData.Alliances[alliance].policy = "Open";
      player.ChatMessage(this.msgs.policyChg.replace("{policy}", "Open"));
    }
    this.saveData();
  },

  //----------------------------------------
  //        Player Based Commands
  //----------------------------------------
  invitePlayer: function(player, args) {
    var steamID = rust.UserIDFromPlayer(player);
    var alliance = this.findAlliance(player);
    var target = this.findPlayerByName(args[1].toString());
    var hasAlliance = this.findAlliance(target[0]);

    if (hasAlliance) {
      player.ChatMessage(this.msgs.hasAlliance.replace("{alliance}", alliance));
      return false;
    } else {
      player.ChatMessage(this.msgs.invited.replace("{player}", target[0].displayName));
      target[0].ChatMessage(this.msgs.wasInvited.replace("{alliance}", target[0].displayName));
      AllianceData.PlayerData[steamID].invitedTo = alliance;
      timer.Once(this.Config.Settings.inviteTimer, function() {
        AllianceData.PlayerData[steamID].invitedTo = "";
        timer.Destroy();
      });
    }

  },

  playerLeave: function(player, args) {
    var steamID = rust.UserIDFromPlayer(player),
      i, ii, len, rank;
    var alliance = this.findAlliance(pWlayer);
    if (AllianceData.Alliances[alliance].owner !== steamID.toString()) {
      for (i = 0, len = AllianceData.Alliances[alliance].members.length; i < len; i++) {
        if (len[i] === steamID.toString()) {
          AllianceData.Alliances[alliance].members.splice(len[i], 1);
          rank = permission.GetUserGroups(steamID);
          for (ii = 0, len = rank.length; ii < len; ii++) {
            if (AllianceData.Alliances[alliance].Ranks.indexOf(len[ii]) > -1) {
              permission.RemoveUserGroup(steamID, len[ii]);
            }
          }
          break;
        }
      }

    } else {
      for (i = 0; i < AllianceData.Alliances[alliance].members.length; i++) {
        var member = this.findPlayerByName(AllianceData.Alliances[alliance].members[i]);
        member[0].displayName = AllianceData.PlayerData[member[1]].originalName;
        rank = permission.GetUserGroups(member[1]);
        for (ii = 0, len = rank.length; ii < len; ii++) {
          if (AllianceData.Alliances[alliance].Ranks.indexOf(len[ii]) > -1) {
            permission.RemoveUserGroup(member[1], len[ii]);
          }
        }
      }
      delete AllianceData.Alliances[alliance];
    }

    this.saveData();
    player.displayName = AllianceData.PlayerData[steamID].originalName;
  },

  playerJoin: function(player, args) {
    var steamID = rust.UserIDFromPlayer(player);

    if (args.length === 1 && AllianceData.PlayerData[steamID].invitedTo !== "") {
      AllianceData.Alliances[AllianceData.PlayerData[steamID].invitedTo].members.push(steamID);
    }

    if (args[1].length === 3 || args[1].length === 8) {
      for (var x in AllianceData.Alliances) {
        if (args[1] === AllianceData.Alliances[x].tag && AllianceData.Alliances[x].policy === "open") {
          AllianceData.Alliances[AllianceData.PlayerData[steamID].invitedTo].members.push(steamID);
          permission.AddUserGroup(steamID, AllianceData.Alliances[x].Ranks[0]);
        } else if (args[1] === AllianceData.Alliances[x].tag && AllianceData.Alliances[x].policy === "closed") {
          player.ChatMessage(this.msgs.policy);
          return false;
        }
      }
    }
    this.saveData();
  },

  kickPlayer: function(player, args) {

    var steamID = rust.UserIDFromPlayer(player);
    var alliance = this.findAlliance(player);
    var target = this.findPlayerByName(args[1].toString());

    if (player.displayName === target[0].displayName) {
      player.chatMessage(this.msgs.kickSelf);
      return false;
    }

    if (alliance === this.findAlliance(target[0])) {
      this.playerLeave(target[0]);
      player.ChatMessage(this.msgs.kick.replace("{player}", target[0].displayName));
      target[0].ChatMessage(this.msgs.kicked.replace("{alliance}", alliance));
    } else {
      player.ChatMessage(this.msgs.notFound);
    }
    return false;
  },

  mutePlayer: function(player, args) {
    var target = this.findPlayerByName(args[1].toString());
    AllianceData.PlayerData[target[1]].isMuted = AllianceData.PlayerData[target[1]].isMuted || false;
    if (AllianceData.PlayerData[target[1]].isMuted) {
      player.ChatMessage(this.msgs.alreadyMuted);
      return false;
    } else {
      AllianceData.PlayerData[target[1]].isMuted = true;
      player.ChatMessage(this.msgs.muted.replace("{player}", target[0].displayName));
    }
  },

  unmutePlayer: function(player, args) {
    var target = this.findPlayerByName(args[1].toString());
    if (AllianceData.PlayerData[target[1]].isMuted) {
      player.ChatMessage(this.msgs.unmuted.replace("{player}", target[0].displayName));
      AllianceData.PlayerData[target[1]].isMuted = false;
    } else {
      player.ChatMessage(this.msgs.notMuted);
      return false;
    }
  },

  promotePlayer: function(player, args) {

  },

  demotePlayer: function(player, args) {

  },

  //----------------------------------------
  //          Position Checks
  //----------------------------------------
  getRank: function(player) {
    var steamID = rust.UserIDFromPlayer(player);
  },

  OnPlayerChat: function(args) {
    var msg = arg.GetString(0, "text");
    var player = arg.connection.player,
      steamID = rust.UserIDFromPlayer(player);
    if (msg.substring(1, 1) === "/ac") {
      this.allianceChat(player, steamID, msg);
      return false;
    }
  },

  allianceChat: function(player, steamID, msg) {
    if (AllianceData.PlayerData[steamID].isMuted) {
      player.ChatMessage(this.msgs.youreMuted);
      return false;
    } else {
      //Function to send alliance only chat.
    }
  }
};
