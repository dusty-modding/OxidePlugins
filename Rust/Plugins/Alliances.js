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
      "cost": 1000,
      "supply": "wood",
      "maxCharacters": 8,
      "useEconomy": true,
      "version": configVers,
      "useRanksAndTitles": false
    };

    this.Config.Permissions = {
      "create": "canCreate",
      "invite": "canInvite",
      "kick": "canKick",
      "promote": "canPromote",
      "demote": "canDemote",
      "updBoard": "canUpdateBoard",
      "chgName": "canChangeName",
      "chgTag": "canChangeTag",
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
      "policy": "This Alliance does not have an Open Join Policy set."
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
  //          Command Catcher
  //----------------------------------------
  cmdSwitch: function(player, cmd, args) {
    try {
      var steamID = rust.UserIDFromPlayer(player);
      var perms = this.Config.Permissions;
      print(perms.create);
      switch (args[0]) {
        case "create":
          if (this.hasPermission(player, perms.create)) {
            this.createAlliance(player, args);
          }
          break;
        case "delete":
          if (this.hasPermission(player, perms.delete)) {
            this.deleteAlliance(player, args);
          }
          break;
        default:
          break;
      }
    } catch (e) {
      print(e.message.toString());
    }
  },

  setTag: function(player) {
    var steamID = rust.UserIDFromPlayer(player);
    var alliance = this.findAlliance(player) || null;
    if (alliance === null || alliance === undefined) return false;
    if (AllianceData.PlayerData[steamID].originalName === "" || AllianceData.PlayerData[steamID].originalName === undefined) AllianceData.PlayerData[steamID].originalName = player.displayName;
    player.displayName = "[" + AllianceData.Alliances[alliance].tag + "]" + player.displayName;
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
      AllianceData.Alliances[args[1]].policy = "closed";
      AllianceData.Alliances[args[1]].invited = [];
      AllianceData.Alliances[args[1]].owner = steamID.toString();
      AllianceData.Alliances[args[1]].tag = args[2].toString();
      AllianceData.Alliances[args[1]].Ranks = this.Config.Ranks;
      AllianceData.Alliances[args[1]].members = [];
      AllianceData.Alliances[args[1]].Rank1 = [];
      AllianceData.Alliances[args[1]].Rank2 = [];
      AllianceData.Alliances[args[1]].Rank3 = [];
      AllianceData.Alliances[args[1]].Rank4 = [];
      AllianceData.Alliances[args[1]].Rank5 = AllianceData.Alliances[args[1]].owner;
      player.ChatMessage(this.buildString(this.msgs.created, [args[1].toString()]));
    } else {
      player.ChatMessage(this.buildString(this.msgs.createFail, ["Alliance already exists"]));
    }
    this.saveData();
    this.setTag(player);
  },

  deleteAlliance: function(player, args) {
    var steamID = rust.UserIDFromPlayer(player);

    if (!player.isMember(steamID)) {
      player.ChatMessage(this.buildString(this.msgs.deleteFail, ["You don't belong to this alliance"]));
      return false;
    }

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

  },

  invitePlayer: function(player, args) {

  },

  playerLeave: function(player, args) {
    var steamID = rust.UserIDFromPlayer(player);
    var alliance = this.findAlliance(player);
    if (AllianceData.Alliances[alliance].owner !== steamID) {
      for (var x in AllianceData.Alliances[alliance]) {
        var index = AllianceData.Alliances[alliance][x].indexOf(steamID);
        if (AllianceData.Alliances[alliance][x].indexOf(steamID) > -1) {
          AllianceData.Alliances[alliance][x].splice(index, 1);
        }
      }
      player.displayName = AllianceData.PlayerData[steamID].originalName;
    } else {
      for (var i = 0; i < AllianceData.Alliances[alliance].members.length; i++) {
        var member = this.findPlayerByName(AllianceData.Alliances[alliance].members[i]);
        member[0].displayName = AllianceData.PlayerData[member[1]].originalName;
      }
      delete AllianceData.Alliances[alliance];
    }
    this.saveData();
  },

  playerJoin: function(player, args) {
    var steamID = rust.UserIDFromPlayer(player);
    if (args[0].length === 3 || args[0].length === 8) {
      for (var x in AllianceData.Alliances) {
        if (args[0] === AllianceData.Alliances[x].tag && AllianceData.Alliances[x].policy === "open") {

        } else if (args[0] === AllianceData.Alliances[x].tag && AllianceData.Alliances[x].policy === "closed") {
          player.ChatMessage(this.msgs.policy);
        }
      }
    }
  },

  //----------------------------------------
  //          Position Checks
  //----------------------------------------

  getRank: function(player) {
    var steamID = rust.UserIDFromPlayer(player);
  },


};
