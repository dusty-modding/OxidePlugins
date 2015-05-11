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
    command.AddChatCommand("ac", this.Plugin, "allianceChat");
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
      "delete": "canDelete",
      "transfer": "canTransfer",
      "staff": "isStaff"
    };

    this.Config.Ranks = ["Rank I", "Rank II", "Rank III", "Rank IV", "Rank V"];

    this.Config.RanksPerms = {
      "Rank I": [],
      "Rank II": ["canInvite"],
      "Rank III": ["canInvite", "canPromote", "canDemote"],
      "Rank IV": ["canInvite", "canPromote", "canDemote", "canMute", "canUnMute", "canKick", "canChangePolicy", "canUpdateBoard"],
      "Rank V": ["canInvite", "canPromote", "canDemote", "canMute", "canUnMute", "canKick", "canChangePolicy", "canUpdateBoard", "canChangeTag", "canChangeName",
        "canTransfer"
      ]
    };

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
      "youreMuted": "<color=red>You're currently muted in Alliance Chat!</color>",
      "noAlliance": "You're not a part of an alliance",
      "promoted": "Successfully promoted {player}, to {rank}",
      "beenPromoted": "You've been promoted too {rank}",
      "demoted": "Successfully demoted {player}, to {rank}",
      "beenDemoted": "You've been demoted too {rank}",
      "tooLong": "The entered name is longer than the {limit} character limit.",
      "badCmd": "Incorrect Command structure. Please do: {cmd}",
      "cantPromote": "You cannot promote someone to the same rank as you.",
      "cantDemote": "You cannot demote someone of the same rank as you.",
      "defaultMsg": "<size=18>Alliances</size>\n {details}",
      "wipe": "Successfully Wiped Alliances Data.",
      "difAlliance": "The target player is not in your alliance.",
      "tranSucc": "Successfully transfered alliance to {player}",
      "switch": "<color=lime>The alliance leader has transfered ownership too {player}.</color>"
    };

    this.Config.Prefix = "Alliances";

    this.Config.Help = {
      "default": [
        "/ally - default command gives basic alliance info or plugin info",
        "/ally create name tag - creates an alliance",
        "/ally help - show these messages"
      ],
      "Admin": [
        "/ally delete alliance - deletes the given alliance",
        "/ally wipe - wipes the entire alliances data file"
      ],
      "Rank1": [],
      "Rank2": [
        "<size=14>Rank 2</size>",
        "/ally invite player - invite desired player to alliance"
      ],
      "Rank3": [
        "<size=14>Rank 3</size>",
        "/ally promote player - promote the desired player",
        "/ally demote player - demote the desired player"
      ],
      "Rank4": [
        "<size=14>Rank 4</size>",
        "/ally updboard 'message' - updates the alliance board with a new message",
        "/ally chgpolicy - toggles the alliance join policy between open & closed",
        "/ally kick player - kicks desired player from the alliance",
        "/ally mute player - mutes the desired player from alliance chat",
        "/ally unmute player - unmutes the desired player in alliance chat"
      ],
      "Rank5": [
        "<size=14>Rank 5</size>",
        "<color=red>If you LEAVE, your entire alliance will be deleted.</color>",
        "/ally transfer playername - transfer ownership of alliance to desired player",
        "/ally chgtag tag - changes the tag of your alliance",
        "/ally chgname name - changes the name of your alliance"
      ]
    };
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
    //Ranks Groups creation
    for (var key in this.Config.Ranks) {
      if (!permission.GroupExists(key)) {
        print("Built Rank Groups: " + key);
        permission.CreateGroup(key, key, i++);
      }
    }

    //single permissions
    for (var perm in this.Config.Permissions) {
      if (!permission.PermissionExists(this.Config.Permissions[perm])) {
        permission.RegisterPermission(this.Config.Permissions[perm], this.Plugin);
      }
    }
  },

  //Set permissions for group types
  /*"Rank I": [],
  "Rank II": ["canInvite"],
  "Rank III": ["canInvite", "canPromote", "canDemote"],
  "Rank IV": ["canInvite", "canPromote", "canDemote", "canMute", "canUnMute", "canKick", "canChangePolicy", "canUpdateBoard"],
  "Rank V": ["canInvite", "canPromote", "canDemote", "canMute", "canUnMute", "canKick", "canChangePolicy", "canUpdateBoard", "canChangeTag", "canChangeName",
    "canTransfer"
  ]*/
  setRankPerms: function() {
    for (var key in this.Config.RanksPerms) {
      for (var i = 0; i < this.Config.RanksPerms[key].length; i++) {
        if (!permission.GroupHasPermission(key, this.Config.RanksPerms[key][i])) {
          permission.GrantGroupPermission(key, this.Config.RanksPerms[key][i], this.Plugin);
        }
      }
    }
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
        case "mute":
          if (allowed) this.mutePlayer(player, args);
          break;
        case "unmute":
          if (allowed) this.unmutePlayer(player, args);
          break;
        case "promote":
          if (allowed) this.promotePlayer(player, args);
          break;
        case "demote":
          if (allowed) this.demotePlayer(player, args);
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
        case "help":
          this.allyHelp(player, perms);
          break;
        case "wipe":
          if (allowed) this.wipeData(player, args);
          break;
        case "transfer":
          if (allowed) this.transferAlliance(player, args);
          break;
          //These commands down need functions written as they do not exist yet.
        case "give":
          if (allowed) this.givePerm(player, args);
          break;
        case "remove":
          if (allowed) this.removePerm(player, args);
          break;
        default:
          var alliance = this.findAlliance(player);
          if (alliance !== null) {
            player.ChatMessage(this.msgs.defaultMsg.replace("{details}", "Name: " + AllianceData.Alliances[alliance] + "\nTag: " +
              AllianceData.Alliances[alliance].policy + tag + "\nPolicy: " + AllianceData.Alliances[alliance].policy + "\nNumber of Members: " +
              AllianceData.Alliances[alliance].members.length));
          } else {
            player.ChatMessage(this.msgs.defaultMsg.replace("{details}", "No Alliance found\nuse /ally create or /ally join to join an alliance\nor /ally help for help."));
          }
          break;
      }
    } catch (e) {
      print(e.message.toString());
    }
  },

  allyHelp: function(player, perms) {
    var alliance = this.findAlliance(player);
    for (var key in this.Config.Help) {
      for (var i = 0; i < this.Config.Help[key].length; i++) {
        if (alliance === null && key === "default") {
          player.ChatMessage(this.Config.Help[key][i]);
          if (this.hasPermission(player, this.Config.Permissions.staff && key === "Admin")) {
            player.ChatMessage(this.Config.Help[key][i]);
          }
        } else {
          player.ChatMessage(this.Config.Help[key][i]);
          if (this.hasPermission(player, this.Config.Permissions.staff && key === "Admin")) {
            player.ChatMessage(this.Config.Help[key][i]);
          }
        }
      }
    }
  },

  wipeData: function(player, args) {
    delete AllianceData.Alliances;
    delete AllianceData.PlayerData;
    AllianceData = {};
    AllianceData.Alliances = {};
    AllianceData.PlayerData = {};
    this.saveData();
    player.chatMessage(this.msgs.wipe);
  },

  //----------------------------------------
  //          Command Handling
  //----------------------------------------
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

  transferAlliance: function(player, args) {
    var getPlayer = this.findPlayerByName(args[1]);
    var alliance = this.findAlliance(player);
    var targetAlliance = this.findAlliance(getPlayer[0]);
    if (alliance !== targetAlliance) {
      player.ChatMessage(this.msgs.difAlliance);
      return false;
    } else {
      AllianceData.Alliances[alliance].owner = getPlayer[1];
      player.ChatMessage(this.msgs.tranSucc.replace("{player}", getPlayer[0].displayName));
      alliance.Broadcast(this.msgs.switch.replace("{player}", getPlayer[0].displayName));
      this.saveData();
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

  changeTag: function(player, args) {
    var newTag = args[1].toString();
    var alliance = this.findAlliance(player);
    if (alliance === null) player.ChatMessage(this.msgs.noAlliance);
    AllianceData.Allinaces[alliance].tag = newTag;
    this.saveData();
    for (var i = 0; i < Alliancedata.Alliances[alliance].members.length; i++) {
      var member = this.findPlayerByName(Alliancedata.Alliances[alliance].members[i]);
      this.setTag(member[0]);
    }
  },

  changeName: function(player, args) {
    var newName = args[1].toString();
    var alliance = this.findAlliance(player);
    if (alliance === null) player.ChatMessage(this.msgs.noAlliance);
    if (newName > this.Config.Settings.maxCharacters) {
      player.ChatMessage(this.msgs.tooLong);
      return false;
    }
    AllianceData.Alliances[newName] = AllianceData.Alliances[alliance];
    delete AllianceData.Alliances[alliance];
    this.saveData();
  },

  updateBoard: function(player, args) {
    if (args[1] === "") {
      player.ChatMessage(this.msgs.badCmd.replace("{cmd}", "/ally updboard 'message'"));
      return false;
    }
    var alliance = this.findAlliance(player);
    if (alliance === null) player.ChatMessage(this.msgs.noAlliance);
    AllianceData.Alliances[alliance].board = args[1].toString();
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
    var alliance = this.findAlliance(player);
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
    var getPlayer = this.findPlayerByName(args[1]);
    var newRank = null;
    var rank = this.getRank(getPlayer[0]);
    var playerRank = this.getRank(player);
    var nextRank = this.Config.Ranks.indexOf(rank);
    nextRank = nextRank + 1;
    if (playerRank === nextRank || playerRank === args[2].toString()) {
      player.ChatMessage(this.msgs.cantPromote);
      return false;
    }
    if (args.length === 2) {
      newRank = this.Config.Ranks[nextRank];
      permission.RemoveUserGroup(getPlayer[1], rank);
      permission.AddUserGroup(getPlayer[1], newRank);
      player.ChatMessage(this.buildString(this.msgs.promoted, [getPlayer[0].displayName, newRank]));
      getPlayer[0].ChatMessage(this.msgs.beenPromoted.replace("{rank}", newRank));
    } else if (args.length === 3) {
      newRank = this.Config.Ranks[args[2].toString()];
      permission.RemoveUserGroup(getPlayer[1], rank);
      permission.AddUserGroup(getPlayer[1], newRank);
      player.ChatMessage(this.buildString(this.msgs.promoted, [getPlayer[0].displayName, newRank]));
      getPlayer[0].ChatMessage(this.msgs.beenPromoted.replace("{rank}", newRank));
    } else {
      player.chatMessage(this.msgs.notFound);
      return false;
    }
  },

  demotePlayer: function(player, args) {
    var getPlayer = this.findPlayerByName(args[1]);
    var newRank = null;
    var rank = this.getRank(getPlayer[0]);
    var playerRank = this.getRank(player);
    var nextRank = this.Config.Ranks.indexOf(rank);
    nextRank = nextRank - 1;
    if (playerRank === rank || playerRank === args[2].toString()) {
      player.ChatMessage(this.msgs.cantDemote);
      return false;
    }
    if (args.length === 2) {
      newRank = this.Config.Ranks[nextRank];
      permission.RemoveUserGroup(getPlayer[1], rank);
      permission.AddUserGroup(getPlayer[1], newRank);
      player.ChatMessage(this.buildString(this.msgs.demoted, [getPlayer[0].displayName, newRank]));
      getPlayer[0].ChatMessage(this.msgs.beenDemoted.replace("{rank}", newRank));
    } else if (args.length === 3) {
      newRank = this.Config.Ranks[args[2].toString()];
      permission.RemoveUserGroup(getPlayer[1], rank);
      permission.AddUserGroup(getPlayer[1], newRank);
      player.ChatMessage(this.buildString(this.msgs.demoted, [getPlayer[0].displayName, newRank]));
      getPlayer[0].ChatMessage(this.msgs.beenDemoted.replace("{rank}", newRank));
    } else {
      player.chatMessage(this.msgs.notFound);
      return false;
    }
  },

  hideTag: function(name, alliance) {
    if (alliance === null) return name;
    var tag = name.match(/@"\[" + alliance + @"\]\s"/g);
    name = name.replace(tag, "");
    return name;
  },

  //----------------------------------------
  //          Position Checks
  //----------------------------------------
  getRank: function(player) {
    var steamID = rust.UserIDFromPlayer(player);
    var userGroups = permission.GetUserGroups(steamID);
    for (var i = 0; i < this.Config.Ranks.length; i++) {
      for (var ii = 0; ii < userGroups.length; ii++) {
        if (this.Config.Ranks[i] === userGroups[ii]) {
          var rank = this.Config.Ranks[i];
          return rank;
        }
      }
    }
    return null;
  },

  allianceChat: function(player, args) {
    var alliance = this.findAlliance(player);
    var steamID = rust.UserIDFromPlayer(player);
    var msg = string.Join(" ", args);

    if (msg === null || msg === "") {
      return;
    }

    if (AllianceData.PlayerData[steamID].isMuted) {
      player.ChatMessage(this.msgs.youreMuted);
      return false;
    } else if (alliance === undefined || alliance === null || alliance === "") {
      player.ChatMessage(this.msgs.noAlliance);
      return false;
    } else {
      alliance.Broadcast(hideTag(player.displayName, alliance) + ": " + msg);
    }
  }
};
