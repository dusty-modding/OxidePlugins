var RanksAndTitles = {
  Title: "RanksAndTitles",
  Author: "Killparadise",
  Version: V(1, 6, 0),
  ResourceId: 830,
  Init: function() {
    global = importNamespace("");
    this.LoadDefaultConfig();
    this.updateConfig();
    this.getData();
    this.registerPermissions();
    command.AddChatCommand("rt", this.Plugin, "switchCmd");
  },

  OnServerInitialized: function() {
    msgs = this.Config.Messages;
    prefix = this.Config.Prefix;
    karmaOn = this.Config.Settings.karma;
    useBoth = this.Config.Settings.useBoth;
    noAdmin = this.Config.Settings.noAdmin;
    clansOn = plugins.Find('Clans');
    chatHandler = plugins.Find('chathandler') ? true : false;
  },

  /*-----------------------------------------------------
                      API
    -----------------------------------------------------*/
  /*-----------------------------------------------------------------
          grabPlayerData
          -- Can be called to certain player data
          - @steamID - Users Steam ID
          - @key - Object key to search for and value to return
   ------------------------------------------------------------------*/
  grabPlayerData: function(steamID, key) {
    return TitlesData.PlayerData[steamID][key];
  },

  /*-----------------------------------------------------------------
          grabPlayerPrefix
          -- Returns the sent players prefix as a string
          - @steamID - Users Steam ID
   ------------------------------------------------------------------*/
  grabPlayerPrefix: function(steamID) {
    return TitlesData.PlayerData[steamID].Prefix;
  },
  /*-----------------------------------------------------
                    END API
    -----------------------------------------------------*/

  /*-----------------------------------------------------------------
          updateConfig
          -- Smart update for config built each time
          -- by hand by me.
   ------------------------------------------------------------------*/
  updateConfig: function(player, cmd, args) {
    var counter = 0;

    if (this.Config.Version !== "1.6.4") {
      print("Updating Config to v1.6.4");
      this.Config.Version = "1.6.4";
      print("Updating Settings...");
      print("-----------------------------");
      this.Config.Settings.antiSleeper = false;
      counter++;
      print("Adding AntiSleeper...");
      if (this.Config.Settings.chatColor === undefined) {
        this.Config.Settings.chatColor = "#FFFFFF";
        counter++;
        print("Adding Chat Color...");
      }
      this.Config.Messages.offline = "<color=red>Karma given by sleepers is currently off</color>";
      counter++;
      this.Config.Messages.bdSyntax = "Incorrect Syntax please use {syntax}";
      counter++;
      this.Config.Messages.stats = ["<color=orange>Your Kill count is:</color> {kills}", "<color=orange>Your Death count is:</color> {deaths}", "<color=orange>Your KDR is currently:</color> {kdr}", "<color=orange>Your current Rank is: {rank}", "<color=orange>Your current Karma is:</color> {karma}"];
      counter++;
      this.Config.Messages.noPrefix = "You need to enter a prefix!";
      counter++;
      this.Config.Settings.deathMsgs = true;
      counter++;
      this.Config.Settings.broadcastPromotions = true;
      counter++;
      this.Config.Messages.suicide = "{slain} Managed to kill themselves... Nice one.";
      counter++;
      this.Config.Messages.slain = "<color=lime>{slayer}</color> the <color={slayerColor}>{title}</color> has slain <color=lime>{slain}</color> the <color={slainColor}>{stitle}</color>!";
      counter++;
      this.Config.Messages.broadcastpromo = "<color=lime>{player} has promoted to:</color> {rank}";
      counter++;
      this.Config.Messages.braodcastdemote = "<color=lime>{player} has demoted to:</color> {rank}";
      counter++;
      this.Config.Messages.Demoted = "You've been demoted to: <color=lime>{rank}</color>";
      print("Adding new Messages...");
      this.Config.Messages.reset = "Player prefix reset!";
      counter++;
      print("Updating Existing Messages...");
      delete this.Config.Punishment;
      counter++;
      print("Removing Punishment Object...");
      delete this.Config.Messages.kills;
      counter++;
      delete this.Config.Messages.deaths;
      counter++;
      delete this.Config.Messages.kdr;
      counter++;
      delete this.Config.Messages.karma;
      counter++;
      delete this.Config.Messages.rank;
      counter++;
      delete this.Config.Messages.configFin;
      counter++;
      delete this.Config.Messages.upToDate;
      counter++;
      delete this.Config.Messages.switchRanks;
      counter++;
      delete this.Config.Messages.switchTitles;
      counter++;
      delete this.Config.Messages.broadcast;
      counter++;
      delete this.Config.Messages.titlesSet;
      counter++;
      delete this.Config.Messages.cleardata;
      counter++;
      delete this.Config.Messages.customFnd;
      counter++;
      delete this.Config.Messages.infoRanks;
      counter++;
      delete this.Config.Messages.infoTitles;
      counter++;
      delete this.Config.Messages.convert;
      counter++;
      delete this.Config.Messages.debugDis;
      counter++;
      delete this.Config.Messages.debugRan;
      counter++;
      delete this.Config.Messages.finished;
      counter++;
      delete this.Config.Messages.punishMsg;
      counter++;
      print("Deleting outdated Messages...");
      delete this.Config.Settings.usePunishSystem;
      counter++;
      delete this.Config.Settings.useRanksPerms;
      counter++;
      print("Removed usePunishSystem...");
      print("Removed useRanksPerms...");
      delete this.Config.Prefix.ranks;
      counter++;
      delete this.Config.Prefix.titles;
      counter++;
      delete this.Config.Prefix.ranksandtitles;
      print("Deleting Old Prefixes...");

      this.Config.Prefix = "RanksAndTitles";
      counter++;
      print("Added Updated Prefix...");

      print("Config Successfully Updated to v1.6.4");
      this.SaveConfig();
      print("Number of changes: " + counter);
    } else {
      print("Config already at latest version: v" + this.Config.Version);
      return false;
    }
    this.SaveConfig();
  },

  LoadDefaultConfig: function() {
    this.Config.authLevel = 2;
    this.Config.Version = this.Config.Version || "1.6.4";
    this.Config.Settings = this.Config.Settings || {
      "karma": true,
      "colorSupport": true,
      "noAdmin": false,
      "useBoth": true,
      "dropRank": false,
      "antiSleeper": false,
      "clanKillLimit": 10,
      "useKDR": false,
      "deathMsgs": true,
      "broadcastPromotions": true,
      "chatNameColor": "#1bd228",
      "staffchatNameColor": "#1bd228",
      "chatColor": "#FFFFFF"
    };
    this.Config.prefixTitles = this.Config.prefixTitles || [{
      "title": "Player",
      "Color": "#FFFFFF",
      "permission": "player",
      "default": true
    }, {
      "title": "Donor",
      "Color": "#ffa500ff",
      "permission": "donor",
      "default": false
    }, {
      "title": "Owner",
      "Color": "#505886",
      "permission": "owner",
      "default": false
    }];
    this.Config.main = this.Config.main || [{
      "rank": 0,
      "title": "Civilian",
      "karma": 0,
      "killsNeeded": 0,
      "Color": "#FFFFFF",
      "karmaModifier": 1,
      "permission": "player"
    }, {
      "rank": 0.5,
      "title": "Small Timer",
      "karma": -1.0,
      "killsNeeded": 1.0,
      "Color": "#ff0000ff",
      "karmaModifier": 1.0,
      "permission": "player"
    }, {
      "rank": 0.5,
      "title": "Wannabe",
      "karma": 1.0,
      "killsNeeded": 1.0,
      "Color": "#0000a0ff",
      "karmaModifier": 1.0,
      "permission": "player"
    }];
    this.Config.Permissions = this.Config.Permissions || {
      "wipe": "canWipe",
      "set": "canSet",
      "remove": "canRemove",
      "noadmin": "canHide",
      "switch": "canSwitch",
      "kset": "canSetKarma",
      "kcheck": "canCheckKarma",
      "krem": "canRemKarma",
      "kadd": "canAddKarma",
      "clear": "canClear",
      "hide": "canHideSelf",
      "create": "canCreate",
      "delete": "canDelete",
      "staff": "isStaff",
    };
    this.Config.Prefix = this.Config.Prefix || "RanksAndTitles";
    this.Config.Messages = this.Config.Messages || {
      "Promoted": "You've been Promoted to: ",
      "NoPlyrs": "No Players Found...",
      "plyrWiped": "Player Wiped!",
      "dataRfrsh": "Data Refreshed!",
      "noPerms": "You do not have permission to use this command.",
      "setSuccs": "Player Prefix Set Successfully!",
      "needTitle": "You need to enter a title for the player!",
      "stats": ["<color=orange>Your Kill count is:</color> {kills}", "<color=orange>Your Death count is:</color> {deaths}", "<color=orange>Your KDR is currently:</color> {kdr}", "<color=orange>Your current Rank is:</color> {rank}", "<color=orange>Your current Karma is:</color> {karma}"],
      "userprefix": "Your Prefix is: ",
      "badSyntaxRt": "The command syntax was incorrect, please use /rt set playername title",
      "errors": "Incorrect command structure, please try again.",
      "loseKarma": "<color=red>You've lost Karma!</color>",
      "gainKarma": "<color=green>You've gained Karma!</color>",
      "reset": "Player prefix reset!",
      "adminsOn": "Admins ranks turned on.",
      "adminsOff": "Admins rankings turned off.",
      "badSyntaxRemove": "Incorrect Syntax please use /rt remove playername",
      "help": "/rt help - Get RanksAndTitles Command Help",
      "badSyntaxKarma": "Invalid syntax please use /rt karma",
      "clearData": "Server Data Wiped...",
      "noData": "No Player Data Found... Attempting to Build.",
      "Demoted": "You've been demoted to: <color=lime>{rank}</color>",
      "setKarma": "Karma successfully set!",
      "setKarma0": "You can only use numbers to set a players karma.",
      "plyrKarma": " Karma level is: ",
      "checkFailed": "Check failed..",
      "addKarma": "Karma added to player successfully",
      "removeKarma": "Karma removed from player successfully",
      "rankCreated": "<color=green>New Rank {rank} Created!</color>",
      "rankDel": "<color=green>{rank} has been deleted!</color>",
      "crtPrefix": "<color=green>{prefix} has been created!</color>",
      "offline": "<color=red>Karma given by sleepers is currently off</color>",
      "bdSyntax": "Incorrect Syntax please use {syntax}",
      "noPrefix": "You need to enter a prefix!",
      "slain": "<color=lime>{slayer}</color> the <color={slayerColor}>{title}</color> has slain <color=lime>{slain}</color> the <color={slainColor}>{stitle}</color>!",
      "suicide": "{slain} Managed to kill themselves... Nice one.",
      "broadcastpromo": "<color=lime>{player} has promoted to:</color> {rank}",
      "broadcastdemote": "<color=lime>{player} has demoted to:</color> {rank}"
    };
    this.Config.Help = this.Config.Help || [

      "/rt - display your rank or title",
      "/rt stats - get your current stats if in ranks mode",
      "/rt refresh - refreshes your data file, recommended only used after system switch"
    ];
    this.Config.AdminHelp = this.Config.AdminHelp || [

      "<color=orange>/rt wipe playername</color> - Wipes the sleceted players Kills, Deaths, KDR, and Karma",
      "<color=orange>/rt set playername title</color> - Sets a custom title to the selected player, this must be a title in config (NOT RANK)",
      "<color=orange>/rt remove playername</color> - removes a given players custom title, and sets them back into the ransk tree",
      "<color=orange>/rt useboth</color> - switch prefixes on and off",
      "<color=orange>/rt noadmin</color> - Removes admins (auth 2 or higher) from ranks system no kills, or ranks will be given.",
      "<color=orange>/rt kset playername karma</color> - set a selected players karma level",
      "<color=orange>/rt kcheck playername</color> - check the selected players karma",
      "<color=orange>/rt kadd playername karma</color> - adds the entered amount of karma to the selected player",
      "<color=orange>/rt krem playername karma</color> - removes the entered amount of karma from the selected player",
      "<color=orange>/rt create rankname rank karmaneeded killsneeded karmagiven color permissions</color> - create a new rank",
      "<color=orange>/rt create prefixname color permission</color> - create a new prefix",
      "<color=orange>/rt delete rankname</color> - delete a rank"
    ];

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

    if (values.length === 0) {
      return string;
    }
    if (string.constructor === Array) {
      for (var ii = 0, len = string.length; ii < len; ii++) {
        temp.push(string[ii].match(/\{([^{]+)\}/g));
        newString = string[ii].replace(temp[ii], values[ii]);
        sb += newString + "\n";
      }
    } else {
      temp.push(string.match(/\{([^{]+)\}/g));
      temp = temp.toString().split(",");
      for (i; i < temp.length; i++) {
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
          OnPlayerInit
          -- Handles player login and initializes data
          - @player - Base Player Object
   ------------------------------------------------------------------*/
  OnPlayerInit: function(player) {
    var steamID = rust.UserIDFromPlayer(player);
    this.checkPlayerData(player, steamID);
  },

  /*-----------------------------------------------------------------
          registerPermissions
          -- Handles registering and building permissions
   ------------------------------------------------------------------*/
  registerPermissions: function() {
    var i = 0,
      j = this.Config.prefixTitles.length;
    //prefix permissions
    for (i; i < j; i++) {
      if (!permission.GroupExists(this.Config.prefixTitles[i].permission)) {
        permission.CreateGroup(this.Config.prefixTitles[i].permission, this.Config.prefixTitles[i].permission, i);
      }
    }
    //single permissions
    for (var perm in this.Config.Permissions) {
      if (!permission.PermissionExists(this.Config.Permissions[perm])) {
        permission.RegisterPermission(this.Config.Permissions[perm], this.Plugin);
      }
    }
  },

  /*-----------------------------------------------------------------
          hasPermission
          -- Handles checking permissions of a user
          - @player - Base Player Object
          - @perm - given permission to look up
   ------------------------------------------------------------------*/

  hasPermission: function(player, perm) {
    var steamID = rust.UserIDFromPlayer(player);
    if (player.net.connection.authLevel === 2) {
      return true;
    }

    if (permission.UserHasPermission(steamID, perm)) {
      return true;
    }
    rust.SendChatMessage(player, prefix, msgs.noPerms, "0");
    return false;
  },

  /*-----------------------------------------------------------------
          getData
          -- Handles building initial data system
   ------------------------------------------------------------------*/
  getData: function() {
    TitlesData = data.GetData('RanksandTitles');
    TitlesData = TitlesData || {};
    TitlesData.PlayerData = TitlesData.PlayerData || {};
    TitlesData.AntiAbuse = TitlesData.AntiAbuse || {};
  },

  /*-----------------------------------------------------------------
          checkPlayerData
          -- Handles building initial player data
          -- and setting proper values on login
          - @player - Base Player Object
          - @steamID - User steam ID
   ------------------------------------------------------------------*/
  checkPlayerData: function(player, steamID) {
      var authLvl = player.net.connection.authLevel;
      TitlesData.PlayerData[steamID] = TitlesData.PlayerData[steamID] || {};
      TitlesData.PlayerData[steamID].PlayerID = TitlesData.PlayerData[steamID].PlayerID || steamID;
      TitlesData.PlayerData[steamID].RealName = TitlesData.PlayerData[steamID].RealName || player.displayName;
      TitlesData.PlayerData[steamID].Title = TitlesData.PlayerData[steamID].Title || "";
      TitlesData.PlayerData[steamID].Prefix = TitlesData.PlayerData[steamID].Prefix || "";
      TitlesData.PlayerData[steamID].Rank = TitlesData.PlayerData[steamID].Rank || 0;
      TitlesData.PlayerData[steamID].Kills = TitlesData.PlayerData[steamID].Kills || 0;
      TitlesData.PlayerData[steamID].KDR = TitlesData.PlayerData[steamID].KDR || 0;
      TitlesData.PlayerData[steamID].Deaths = TitlesData.PlayerData[steamID].Deaths || 0;
      TitlesData.PlayerData[steamID].Karma = TitlesData.PlayerData[steamID].Karma || 0;
      TitlesData.PlayerData[steamID].isAdmin = TitlesData.PlayerData[steamID].isAdmin || (authLvl >= 2) || this.hasPermission(player, this.Config.Permissions.staff) || false;
      TitlesData.PlayerData[steamID].hidden = TitlesData.PlayerData[steamID].hidden || false;
      this.setRankTitle(steamID, player);
  },

  /*-----------------------------------------------------------------
          saveData
          -- Handles building initial player data
          -- and setting proper values on login
   ------------------------------------------------------------------*/
  saveData: function() {
    //Save our data to our titles data file
    data.SaveData('RanksandTitles');
  },

  /*-----------------------------------------------------------------
          clearData
          -- Wipes The entire data file and then rebuilds it
          -- WARNING: CANNOT be undone
          - @player - object - Base Player Object
          - @cmd - Triggered Command
          - @args - array - Cmd arguments
   ------------------------------------------------------------------*/
  clearData: function(player, cmd, args) {
      delete TitlesData.PlayerData;
      rust.SendChatMessage(player, prefix, msgs.clearData, "0");
      TitlesData.PlayerData = TitlesData.PlayerData || {};
      this.saveData();
      this.getData();
  },

  /*-----------------------------------------------------------------
          refreshData
          -- Handles refreshing player data
          -- sends them through ranking process again
          - @player - object - Base Player Object
          - @cmd - Triggered Command
          - @args - array - Cmd arguments
   ------------------------------------------------------------------*/
  refreshData: function(player, cmd, args) {
    var steamID = rust.UserIDFromPlayer(player);
    if (TitlesData.PlayerData[steamID] === undefined) {
      print("No Data found, Attempting to build Data");
      rust.SendChatMessage(player, prefix, msgs.noData, "0");
    } else {
      rust.SendChatMessage(player, prefix, msgs.dataRfrsh, "0");
    }
    TitlesData.PlayerData[steamID].Title = "";
    this.checkPlayerData(player, steamID);
  },

  /*-----------------------------------------------------------------
          findPlayerByName
          -- Locates Base Player object using the users name
          - @playerName - String - of base player name
   ------------------------------------------------------------------*/
  findPlayerByName: function(playerName) {
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
  },

  /*--------------------Switch Command Handling----------------------------*/

  //This is our switch case statement this is called by /rt it then grabs the second word in the text and compares it to one below
  //if a match is found, it will launch that function accordingly.
  switchCmd: function(player, cmd, args) {
      var steamID = rust.UserIDFromPlayer(player),
        authLvl = player.net.connection.authLevel,
        perms = this.Config.Permissions;
      thisPerm = args[0];
      if (args.length > 1 && args[0] !== undefined) allowed = this.hasPermission(player, perms[thisPerm]);
      switch (args[0]) {
        case "stats":
          this.checkStats(player, cmd, args);
          break;
        case "hide":
          if (allowed) this.hideCmd(player, cmd, args);
          break;
        case "wipe":
          if (allowed) this.wipePlayer(player, cmd, args);
          break;
        case "set":
          if (allowed && args.length === 3) {
            this.giveTitle(player, cmd, args);
          } else {
            rust.SendChatMessage(player, prefix, msgs.badSyntaxRt, "0");
            return false;
          }
          break;
        case "useboth":
          if (allowed) {
            if (!this.Config.Settings.useBoth) {
              this.Config.Settings.useBoth = true;
            } else {
              this.Config.Settings.useBoth = false;
            }
          }
          this.SaveConfig();
          break;
        case "kset":
          if (args.length >= 1 && allowed) {
            this.setKarma(player, cmd, args);
          } else {
            player.ChatMessage(msgs.bdSyntax.replace("{syntax}", "/rt kset playername amt"));
            return false;
          }
          break;
        case "kcheck":
          if (args.length >= 1 && allowed) {
            this.checkKarma(player, cmd, args);
          } else {
            player.ChatMessage(msgs.bdSyntax.replace("{syntax}", "/rt kcheck playername"));
            return false;
          }
          break;
        case "kadd":
          if (args.length >= 1 && allowed) {
            this.addKarma(player, cmd, args);
          } else {
            player.ChatMessage(msgs.bdSyntax.replace("{syntax}", "/rt kadd playername amt"));
            return false;
          }
          break;
        case "krem":
          if (args.length >= 1 && allowed) {
            this.removeKarma(player, cmd, args);
          } else {
            player.ChatMessage(msgs.bdSyntax.replace("{syntax}", "/rt krem playername amt"));
            return false;
          }
          break;
        case "remove":
          if (allowed && args.length >= 1) {
            this.removeTitle(player, cmd, args);
          } else {
            rust.SendChatMessage(player, prefix, msgs.badSyntaxRemove, "0");
            return false;
          }
          break;
        case "clear":
          if (allowed) this.clearData(player, cmd, args);
          break;
        case "refresh":
          this.refreshData(player, cmd, args);
          break;
        case "noadmin":
          if (allowed) this.noAdmin(player, cmd, args);
          break;
        case "help":
          this.rtHelp(player, cmd, args);
          break;
        case "create":
          if (allowed) this.createRank(player, cmd, args);
          break;
        case "delete":
          if (allowed) this.deleteRank(player, cmd, args);
          break;
        default:
          if (TitlesData.PlayerData[steamID] !== undefined) {
            rust.SendChatMessage(player, prefix, "Current Rank: " + TitlesData.PlayerData[steamID].Rank.toString() + " (" + TitlesData.PlayerData[steamID].Title + ")", "0");
            rust.SendChatMessage(player, prefix, msgs.userprefix + TitlesData.PlayerData[steamID].Prefix, "0");
          } else {
            rust.SendChatMessage(player, prefix, msgs.noData, "0");
            this.checkPlayerData(player, steamID);
          }
          break;
      }
  },

  /*-----------------------------------------------------------------
          getClosest
          -- Locates closes rank to current players karma
          - @arr - Array - empty array to gather data
          - @closestTo - the current karma of the player
   ------------------------------------------------------------------*/
  getClosest: function(arr, closestTo) {
      arr = this.getRanksArray();
      if (arr.length > 0) {

        for (var i = 0; i < arr.length; i++) {
          if (closestTo >= 0) {
            if (arr[i] <= closestTo && arr[i] >= 0) closest = arr[i];
          } else if (closestTo <= 0) {
            if (arr[i] >= closestTo && arr[i] <= 0) closest = arr[i];
          }
        }
      }
      return closest;
  },

  /*-----------------------------------------------------------------
          getRanksArray
          -- Builds an array of karma values to compare
          -- against the players current karma
   ------------------------------------------------------------------*/
  getRanksArray: function() {
    try {
      var temp = [];

      for (var i = 0; i < this.Config.main.length; i++) {
        if (this.Config.Settings.karma) {
          temp.push(this.Config.main[i].karma);
        } else {
          if (this.Config.main[i].killsNeeded !== "disabled") {
            temp.push(this.Config.main[i].killsNeeded);
          }
        }
      }
      return temp;
    } catch (e) {
      print(e.message.toString());
    }
  },

  /*-----------------------------------------------------------------
          setRankTitle
          -- Finds and sets a players rank
          -- based on kills or karma
          - @playerID - Users Steam ID
          - @player - Base player Object
   ------------------------------------------------------------------*/
  setRankTitle: function(playerID, player) {
    if (TitlesData.PlayerData[playerID].isAdmin && noAdmin) {
      print("Admins turned off for rankings. Skipping Admin.");
      return false;
    } else {
      var i = 0,
        j = this.Config.main.length,
        kills = TitlesData.PlayerData[playerID].Kills,
        karma = TitlesData.PlayerData[playerID].Karma,
        oldRank = TitlesData.PlayerData[playerID].Rank;

      for (i; i < j; i++) {
        if (karmaOn && this.getClosest([], karma) === this.Config.main[i].karma) {
          TitlesData.PlayerData[playerID].Title = this.Config.main[i].title;
          TitlesData.PlayerData[playerID].Rank = this.Config.main[i].rank;
        } else if (!karmaOn && this.getClosest([], kills) === this.Config.main[i].killsNeeded) {
          TitlesData.PlayerData[playerID].Title = this.Config.main[i].title;
          TitlesData.PlayerData[playerID].Rank = this.Config.main[i].rank;
        }
      }

      if (useBoth) {
        for (var t = 0; t < this.Config.prefixTitles.length; t++) {
          if (TitlesData.PlayerData[playerID].Prefix === "" && this.Config.prefixTitles[t].default) {
            TitlesData.PlayerData[playerID].Prefix = this.Config.prefixTitles[t].title;
          }

        }
      }

      if (TitlesData.PlayerData[playerID].Rank > oldRank) {
        player.ChatMessage("<color=green>" + msgs.Promoted + "</color> " + TitlesData.PlayerData[playerID].Title);
        if (this.Config.Settings.broadcastPromotions) rust.BroadcastChat(this.buildString(msgs.broadcastpromo, [player.displayName, TitlesData.PlayerData[playerID].Title]));
      } else if (TitlesData.PlayerData[playerID].Rank < oldRank) {
        player.ChatMessage("<color=red>" + msgs.Demoted.replace("{rank}", TitlesData.PlayerData[playerID].Title) + "</color>");
        if (this.Config.Settings.broadcastPromotions) rust.BroadcastChat(this.buildString(msgs.broadcastdemote, [player.displayName, TitlesData.PlayerData[playerID].Title]));
      }
    }
    this.saveData();
  },

  /*-----------------------------------------------------------------
          getKarma
          -- Grabs the victims title and locates the karmaModifier
          - @victimID - Victims Steam ID
   ------------------------------------------------------------------*/
  getKarma: function(victimID) {
    var i = 0,
      title,
      j = this.Config.main.length;
    for (i; i < j; i++) {
      if (this.Config.main[i].title === TitlesData.PlayerData[victimID].Title) {
        title = this.Config.main[i].karmaModifier;
        break;
      } else {
        title = 1;
      }
    }
    return title;
  },

  /*-----------------------------------------------------------------
                    Anti-Abuse System
  ------------------------------------------------------------------*/

  /*-----------------------------------------------------------------
          antiFriend
          -- Handles friends, and clan mate killings
          -- karma system
          - @victimID - Victims Steam ID
          - @attackerID - Attacker Steam ID
   ------------------------------------------------------------------*/
  antiFriend: function(victimID, attackerID) {
    try {
      if (clansOn && !clansOn.Call("HasFriend", attackerID, victimID)) {
        attackerClan = clansOn.Call("FindClanByUser", attackerID);
        victimClan = clansOn.Call("FindClanByUser", victimID);
        if (attackerClan === victimClan) {
          return this.clanCheck(attackerClan, attackerID, victimID);
        } else {
          return false;
        }
      } else {
        return true;
      }
      return false;
    } catch (e) {
      print(e.message.toString());
    }
  },

  /*-----------------------------------------------------------------
          clanCheck
          -- Check AntiAbuse data to get clan
          -- team kill counts or record them.
          - @clan - string name of the users clan
   ------------------------------------------------------------------*/
  clanCheck: function(clan) {
    if (TitlesData.AntiAbuse[clan] === undefined) {
      TitlesData.AntiAbuse[clan] = {};
      TitlesData.AntiAbuse[clan].count = 0;
    }

    if (TitlesData.AntiAbuse[clan] !== undefined && TitlesData.AntiAbuse[clan].count < this.Config.Settings.clanKillLimit) {
      TitlesData.AntiAbuse[clan].count += 1;
    } else {
      return true;
    }
    return false;
  },

  /*-----------------------------------------------------------------
          OnEntityDeath
          -- Called when a player is killed handles how
          -- data is distributed correctly
          - @entity - Killed entity object
          - @hitinfo - Data of the last hit that caused death
   ------------------------------------------------------------------*/
  OnEntityDeath: function(entity, hitinfo) {
    var victim = entity,
      attacker = hitinfo.Initiator,
      victimID,
      killerID;
    if ((attacker === null || !attacker.ToPlayer()) || !victim.ToPlayer()) return false;
    if (this.Config.Settings.antiSleeper && victim.IsSleeping()) return false;
    if (attacker.displayName !== victim.displayName) {
      var killer = attacker.ToPlayer();
      killerID = rust.UserIDFromPlayer(killer);
      victimID = rust.UserIDFromPlayer(victim);

      if (!TitlesData.PlayerData[killerID]) {
        print("Killer does not have registered Data in Data File.");
        print("Attempting to create killer Data file...");
        this.checkPlayerData(killer, killerID);
      } else if (!TitlesData.PlayerData[victimID] && victim.IsConnected()) {
        print("Victim does not have registered Data in Data File");
        print("Attempting to create Victim Data File...");
        this.checkPlayerData(victim, victimID);
      }

      var karmaOn = this.Config.Settings.karma;
      if (karmaOn && TitlesData.PlayerData[victimID].Karma >= 0) {
        TitlesData.PlayerData[killerID].Karma -= this.getKarma(victimID);
        rust.SendChatMessage(killer, prefix.ranks, msgs.loseKarma + " (" + this.getKarma(victimID) + ")", "0");
      } else if (karmaOn && TitlesData.PlayerData[victimID].Karma < 0) {
        TitlesData.PlayerData[killerID].Karma += this.getKarma(victimID);
        rust.SendChatMessage(killer, prefix.ranks, msgs.gainKarma + " (" + this.getKarma(victimID) + ")", "0");
      }
      TitlesData.PlayerData[killerID].Kills += 1;
      TitlesData.PlayerData[victimID].Deaths += 1;
      if (this.Config.Settings.deathMsgs) this.buildDeathMsg([killer.displayName, victim.displayName], [killerID, victimID]);
      this.setRankTitle(killerID, killer);
      this.updateKDR([killerID, victimID]);
    } else if (victim.displayName === attacker.displayName) {
      victimID = rust.UserIDFromPlayer(victim);
      TitlesData.PlayerData[victimID].Deaths += 1;
      //rust.BroadcastChat(msgs.suicide.replace("{slain}", victim.displayName));
      this.updateKDR([victimID]);
    } else {
      return false;
    }
  },

  /*-----------------------------------------------------------------
          buildDeathMsg
          -- Builds Broadcasted message on deaths
          - @users - array of player names
          - @ids - array of ids to be sent to the function
   ------------------------------------------------------------------*/
  buildDeathMsg: function(users, ids) {
    if (this.Config.Settings.deathMsgs) {
      //var slayerColor = "lime";
      var slayerTitle = TitlesData.PlayerData[ids[0]].Title;
      var slainTitle = TitlesData.PlayerData[ids[1]].Title;
      for (var i = 0; i < this.Config.main.length; i++) {
        if (this.Config.main[i].title === slayerTitle) {
          slayerColor = this.Config.main[i].Color;
        }
        if (this.Config.main[i].title === slainTitle) {
          slainColor = this.Config.main[i].Color;
        }
      }
      rust.BroadcastChat(prefix, this.buildString(msgs.slain, [users[0], slayerColor, slayerTitle, users[1], slainColor, slainTitle]));
    }
    return false;
  },

  /*-----------------------------------------------------------------
          updateKDR
          -- Handles KDR changes as a player progresses
          - @ids - array of ids to be sent to the function
   ------------------------------------------------------------------*/
  updateKDR: function(ids) {
    var len = ids.length,
      k2d;
    if (len === 0) return false;
    for (var i = 0; i < len; i++) {
      k2d = TitlesData.PlayerData[ids[i]].Kills / TitlesData.PlayerData[ids[i]].Deaths;
      k2d = Math.ceil(k2d * 100) / 100;
      if (k2d !== "Infinity") {
        TitlesData.PlayerData[ids[i]].KDR = k2d;
      } else {
        TitlesData.PlayerData[ids[i]].KDR = TitlesData.PlayerData[ids[i]].Kills;
      }
    }
    this.saveData();
  },

  /*-----------------------------------------------------------------
                     Command Handling
  ------------------------------------------------------------------*/

  setKarma: function(player, cmd, args) {
    var getPlayer = this.findPlayerByName(args[1]);
    var karmaAmt = Number(args[2]);
    if (getPlayer && typeof(karmaAmt) === "number") {
      TitlesData.PlayerData[getPlayer[1]].Karma = karmaAmt;
      this.saveData();
      rust.SendChatMessage(player, prefix, msgs.setKarma, "0");
    } else {
      rust.SendChatMessage(player, prefix, msgs.setKarma0, "0");
      return false;
    }
    this.checkPlayerData(getPlayer[0], getPlayer[1]);
  },

  checkKarma: function(player, cmd, args) {
    var getPlayer = this.findPlayerByName(args[1]);
    if (getPlayer) {
      rust.SendChatMessage(player, prefix, getPlayer[0].displayName + msgs.plyrKarma + TitlesData.PlayerData[getPlayer[1]].Karma, "0");
    } else {
      rust.SendChatMessage(player, prefix, msgs.checkFailed, "0");
    }
  },

  addKarma: function(player, cmd, args) {
    var getPlayer = this.findPlayerByName(args[1]);
    var karmaAmt = Number(args[2]);
    if (typeof(karmaAmt) === "number") {
      TitlesData.PlayerData[getPlayer[1]].Karma += karmaAmt;
      this.saveData();
      rust.SendChatMessage(player, prefix, msgs.addKarma, "0");
    }
    this.checkPlayerData(getPlayer[0], getPlayer[1]);
  },

  removeKarma: function(player, cmd, args) {
    var getPlayer = this.findPlayerByName(args[1]);
    var karmaAmt = Number(args[2]);
    if (typeof(karmaAmt) === "number") {
      TitlesData.PlayerData[getPlayer[1]].Karma -= karmaAmt;
      this.saveData();
      rust.SendChatMessage(player, prefix, msgs.removeKarma, "0");
    }
    this.checkPlayerData(getPlayer[0], getPlayer[1]);
  },

  /*-----------------------------------------------------------------
          checkStats
          -- Handles stat calls sends stats to build strings
          - @player - object - Base Player Object
          - @cmd - Triggered Command
          - @args - array - Cmd arguments
   ------------------------------------------------------------------*/
  checkStats: function(player, cmd, args) {
    var steamID = rust.UserIDFromPlayer(player);

    player.ChatMessage(this.buildString(msgs.stats, [TitlesData.PlayerData[steamID].Kills, TitlesData.PlayerData[steamID].Deaths,
      TitlesData.PlayerData[steamID].KDR, TitlesData.PlayerData[steamID].Rank, TitlesData.PlayerData[steamID].Karma
    ]));
  },

  /*-----------------------------------------------------------------
          wipePlayer
          -- Handles wipe of player or all
          -- players in the data file
          - @player - object - Base Player Object
          - @cmd - Triggered Command
          - @args - array - Cmd arguments
   ------------------------------------------------------------------*/
  wipePlayer: function(player, cmd, args) {
    var target;
    if (args[1] !== "all") {
      target = this.findPlayerByName(args[1]);
      if (target[1].length) {
        TitlesData.PlayerData[target[1]].Kills = 0;
        TitlesData.PlayerData[target[1]].Deaths = 0;
        TitlesData.PlayerData[target[1]].KDR = 0;
        if (this.Config.Settings.karma) TitlesData.PlayerData[target[1]].Karma = 0;
        rust.SendChatMessage(player, prefix, msgs.plyrWiped, "0");
        this.setRankTitle(target[1], target[0]);
      } else if (!target[1].length) {
        rust.SendChatMessage(player, prefix, msgs.NoPlyrs, "0");
        return false;
      } else {
        rust.SendChatMessage(player, prefix, msgs.NoPlyrs, "0");
        return false;
      }
    } else if (args[1] === "all") {
      for (target in TitlesData.PlayerData) {
        TitlesData.PlayerData[target].Kills = 0;
        TitlesData.PlayerData[target].Deaths = 0;
        TitlesData.PlayerData[target].KDR = 0;
        if (this.Config.Settings.karma) TitlesData.PlayerData[target].Karma = 0;
        this.setRankTitle(target, rust.UserIDFromPlayer(target));
      }
    }
    this.saveData();
  },

  //Function to create new ranks or prefixes in game with a heavy command
  createRank: function(player, cmd, args) {
    var temp = {};

    if (args.length === 4) {
      temp = {
        "title": args[1].toString() || "default",
        "Color": args[2].toString() || "#FFFFFF",
        "permission": args[3].toString() || "player"
      };
      this.Config.prefixTitles.push(temp);
      rust.SendChatMessage(player, prefix, msgs.crtPrefix.replace("{prefix}", temp.title), "0");
    } else if (args.length >= 6) {
      temp = {
        "rank": Number(args[2]) || 1,
        "title": args[1].toString() || "default",
        "karma": Number(args[3]) || 1,
        "killsNeeded": Number(args[4]) || 0,
        "Color": args[6].toString() || "#FFFFFF",
        "karmaModifier": Number(args[4]) || 1,
        "permission": args[7].toString() || "player"
      };
      this.Config.main.push(temp);
      rust.SendChatMessage(player, prefix, msgs.rankCreated.replace("{rank}", temp.title), "0");
    }
    this.SaveConfig();
  },

  //Deletes exsisting ranks by splicing them out of the config
  deleteRank: function(player, cmd, args) {
    var i = 0,
      j = this.Config.main.length,
      rank = args[1].toString();
    for (i; i < j; i++) {
      if (rank === this.Config.main[i].title) {
        name = this.Config.main[i].title;
        this.Config.main.splice(i, 1);
        rust.SendChatMessage(player, prefix, msgs.rankDel.replace("{rank}", name), "0");
      }
    }
    return false;
  },

  //This function is used by the remove command, when called it will find the target player
  //grab his file, and then set his title to nothing. It will then run him through the hub function
  //to set his new ranks title instead. This is so if a player with a custom title wishes to
  //go back to the ranks system, he can do so upon asking an admin.
  removeTitle: function(player, cmd, args) {
    try {
      var getPlayer = this.findPlayerByName(args[1]);
      for (var i = 0; i < this.Config.prefixTitles.length; i++) {
        if (this.Config.prefixTitles[i] === TitlesData.PlayerData[getPlayer[1]].Prefix) {
          TitlesData.PlayerData[getPlayer[1]].Prefix = "";
          permission.RemoveUserGroup(getPlayer[1], this.Config.prefixTitles[i].permission);
        }
      }
      this.saveData();
      this.setRankTitle(getPlayer[1], getPlayer[0]);
      rust.SendChatMessage(player, prefix, msgs.reset + " " + getPlayer[0].displayName, "0");
    } catch (e) {
      print(e.message.toString());
    }
  },

  //These are our series of commands that are useable and called on by our Switch above. Each one
  //speaks for itself and should be easy to tell what it does.

  hideCmd: function(player, cmd, args) {
    var steamID = rust.UserIDFromPlayer(player);
    if (!TitlesData.PlayerData[steamID].hidden) {
      TitlesData.PlayerData[steamID].hidden = true;
      rust.SendChatMessage(player, prefix, "Your tag is now hidden!", "0");
    } else {
      TitlesData.PlayerData[steamID].hidden = false;
      rust.SendChatMessage(player, prefix, "Your tag is no longer hidden!", "0");
    }
    this.saveData();
  },

  giveTitle: function(player, cmd, args) {

    var getPlayer = this.findPlayerByName(args[1]);
    var getPlayerData = TitlesData.PlayerData,
      j = this.Config.prefixTitles.length,
      i = 0;
    if (!getPlayer) {
      player.ChatMessage(msgs.NoPlyrs);
      return false;
    }
    if (args[2].length) {
      for (i; i < j; i++) {
        if (args[2].toLowerCase() === this.Config.prefixTitles[i].title.toLowerCase()) {
          print(getPlayer[1]);
          TitlesData.PlayerData[getPlayer[1]].Prefix = this.Config.prefixTitles[i].title;
          permission.AddUserGroup(getPlayer[1], this.Config.prefixTitles[i].permission);
          rust.SendChatMessage(player, prefix, msgs.setSuccs, "0");
        }
      }
    } else {
      rust.SendChatMessage(player, prefix, msgs.needPrefix, "0");
      return false;
    }
    this.saveData();
  },

  noAdmin: function(player, cmd, args) {
    var noAdmin = this.Config.Settings.noAdmin;
    if (noAdmin) {
      this.Config.Settings.noAdmin = false;
      rust.SendChatMessage(player, prefix, msgs.adminsOn, "0");
    } else {
      this.Config.Settings.noAdmin = true;
      rust.SendChatMessage(player, prefix, msgs.adminsOff, "0");
    }
    this.SaveConfig();
  },

  rtHelp: function(player, cmd, args) {
    rust.SendChatMessage(player, null, "--------------RanksAndTitles Commands------------", "0");
    var authLvl = player.net.connection.authLevel;
    for (var i = 0; i < this.Config.Help.length; i++) {
      player.ChatMessage(this.Config.Help[i]);
    }
    if (authLvl >= 2) {
      rust.SendChatMessage(player, null, "<color=orange>--------------Admin Commands------------</color>", "0");
      for (var j = 0; j < this.Config.AdminHelp.length; j++) {
        player.ChatMessage(this.Config.AdminHelp[j]);
      }
    }
  },

  SendHelpText: function(player) {
    rust.SendChatMessage(player, prefix, msgs.help, "0");
  },

  /*-----------------------------------------------------------------
                        Chat Handling
  ------------------------------------------------------------------*/

  /*-----------------------------------------------------------------
          getColor
          -- Handles finding, and grabbing the
          -- current color of the player
          - @steamID - Current User id to grab the color for.
   ------------------------------------------------------------------*/
  getColor: function(steamID) {
    var i = 0,
      titleColor,
      colorArr = [],
      j = 0;
    if (!this.Config.Settings.useBoth) {
      for (i; i < this.Config.main.length; i++) {
        if (TitlesData.PlayerData[steamID].Title === this.Config.main[i].title) {
          titleColor = this.Config.main[i].Color;
          colorArr.push(titleColor);
        }
      }
    } else {
      for (i; i < this.Config.main.length; i++) {
        if (TitlesData.PlayerData[steamID].Title === this.Config.main[i].title) {
          titleColor = this.Config.main[i].Color;
          if (chatHandler) break;
          colorArr.push(titleColor);
        }
      }
      for (j; j < this.Config.prefixTitles.length; j++) {
        if (TitlesData.PlayerData[steamID].Prefix === this.Config.prefixTitles[j].title) {
          var prefixColor = this.Config.prefixTitles[j].Color;
          colorArr.push(prefixColor);
        }
      }
    }
    if (!chatHandler) {
      return colorArr;
    } else {
      return titleColor;
    }
  },

  /*-----------------------------------------------------------------
          OnPlayerChat
          -- Handles building chat string before
          -- sending it to the rust box will not build
          -- a string if chathandler is present
          - @arg - Paramater Array of arguments
   ------------------------------------------------------------------*/
  OnPlayerChat: function(arg) {
    if (chatHandler) return null;
    var player = arg.connection.player,
      steamID = rust.UserIDFromPlayer(player);

    if (TitlesData.PlayerData[steamID] === undefined) {
      this.checkPlayerData(player, steamID);
      print("Building Player Data");
    }
    var titleColor = "",
        usePrefix = "",
        prefixColor = "",
        useTitle = "",
        chatColor = "<color=" + this.Config.Settings.chatColor + ">",
        useColor = "<color=" + this.Config.Settings.chatNameColor + ">",
        colorOn = this.Config.Settings.colorSupport,
        color = this.getColor(steamID),
        msg = arg.GetString(0, "text");
    if (msg.substring(1, 1) === "/" || msg === "") return null;

    if (colorOn && permission.UserHasPermission(steamID, "isStaff")) {
      useColor = "<color=" + this.Config.Settings.staffchatNameColor + ">";
    }

    if (colorOn && !this.Config.Settings.dropRank) {
      titleColor = "<color=" + color[0] + ">[";
    }

    if (this.Config.Settings.useBoth && TitlesData.PlayerData[steamID].Prefix !== "") {
      usePrefix = TitlesData.PlayerData[steamID].Prefix + "]</color> ";
      prefixColor = "<color=" + color[1] + ">[";
    }

    if (!TitlesData.PlayerData[steamID].hidden && !this.Config.Settings.dropRank) useTitle = TitlesData.PlayerData[steamID].Title + "]</color>: ";

    formattedMsg = prefixColor + usePrefix + useColor + player.displayName + "</color> " + titleColor + useTitle + chatColor + msg + "</color>";
    global.ConsoleSystem.Broadcast("chat.add", steamID, formattedMsg);
    print(player.displayName + ": " + msg);
    return false;
  }
};
