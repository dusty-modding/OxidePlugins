var RanksAndTitles = {
  Title: "RanksAndTitles",
  Author: "Killparadise",
  Version: V(1, 6, 4),
  ResourceId: 830,
  Init: function() {
    global = importNamespace("");
    this.LoadDefaultConfig();
    this.updateConfig();
    this.getData();
    this.registerPermissions();
    msgs = this.Config.Messages;
    prefix = this.Config.Prefix;
    karmaOn = this.Config.Settings.useKarma;
    noAdmin = this.Config.Settings.noAdmin;
    command.AddChatCommand("rt", this.Plugin, "switchCmd");
  },

  OnServerInitialized: function() {
    clansOn = plugins.Find('Clans');
    chatHandler = plugins.Find('chathandler');
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
   ------------------------------------------------------------------*/
  updateConfig: function(player, cmd, args) {
    var counter = 0;

    if (this.Config.Version !== "1.6.5") {
      print("WARNING: Config is not 1.6.5 the plugin needs to rebuild the config or else you will have issues.");
      print("Please backup your current config, and then delete it and reload RanksAndTitles");
    } else {
      print("Config already at latest version: v" + this.Config.Version);
      return false;
    }
    this.SaveConfig();
  },

  LoadDefaultConfig: function() {
    this.Config.Version = this.Config.Version || "1.6.5";
    this.Config.Settings = this.Config.Settings || {
      "useKarma": true,
      "colorSupport": true,
      "noAdmin": false,
      "showPrefix": true,
      "hideRank": false,
      "antiSleeper": false,
      "antiAbuseOn": true,
      "useDeathMsgs": true,
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
      "create": "canCreate",
      "delete": "canDelete",
      "staff": "isStaff"
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
      "<color=orange>/rt remove playername</color> - removes a given players custom title, and sets them back into the ranks tree",
      "<color=orange>/rt showprefix</color> - switch prefixes on and off",
      "<color=orange>/rt noadmin</color> - Removes admins (auth 2 or higher) from ranks system no kills, or ranks will be given.",
      "<color=orange>/rt k set karma playername</color> - set a selected players karma level",
      "<color=orange>/rt k add karma playername</color> - adds the entered amount of karma to the selected player",
      "<color=orange>/rt k rem karma playername</color> - removes the entered amount of karma from the selected player",
      "<color=orange>/rt create rankname rank karmaneeded killsneeded karmagiven color permissions</color> - create a new rank",
      "<color=orange>/rt create prefixname color permission</color> - create a new prefix",
      "<color=orange>/rt delete rankname/prefix</color> - delete a rank or prefix"
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
    this.handleStats([steamID], [player]);
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
  },

  /*-----------------------------------------------------------------
          saveData
          -- Handles building initial player data
          -- and setting proper values on login
   ------------------------------------------------------------------*/
  saveData: function() {
    data.SaveData('RanksandTitles');
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
        print("Found: " + displayName);
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
        player.ChatMessage(this.buildString(msgs.stats, [TitlesData.PlayerData[steamID].Kills, TitlesData.PlayerData[steamID].Deaths,
          TitlesData.PlayerData[steamID].KDR, TitlesData.PlayerData[steamID].Rank, TitlesData.PlayerData[steamID].Karma
        ]));
        break;
      case "wipe":
        if (allowed) this.wipePlayer(player, cmd, args);
        break;
      case "set":
        if (allowed && args.length === 3) {
          this.givePrefix(player, cmd, args);
        } else {
          rust.SendChatMessage(player, prefix, msgs.badSyntaxRt, "0");
          return false;
        }
        break;
      case "showprefix":
        if (allowed) {
          if (!this.Config.Settings.showPrefix) {
            this.Config.Settings.showPrefix = true;
          } else {
            this.Config.Settings.showPrefix = false;
          }
        }
        this.SaveConfig();
        break;
      case "k":
        if (args.length >= 1 && allowed) {
          this.karmaHandling(player, cmd, args);
        } else if (args.length < 1) {
          player.ChatMessage(msgs.bdSyntax.replace("{syntax}", "/rt k cmd amt playername Or /rt k playername to check a users karma."));
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
        if (allowed) {
          delete TitlesData.PlayerData;
          rust.SendChatMessage(player, prefix, msgs.clearData, "0");
          TitlesData.PlayerData = TitlesData.PlayerData || {};
          this.saveData();
          this.getData();
        }
        break;
      case "refresh":
        if (!TitlesData.PlayerData[steamID]) {
          print("No Data found, Attempting to build Data");
          rust.SendChatMessage(player, prefix, msgs.noData, "0");
        } else {
          rust.SendChatMessage(player, prefix, msgs.dataRfrsh, "0");
        }
        TitlesData.PlayerData[steamID].Title = "";
        this.checkPlayerData(player, steamID);
        break;
      case "noadmin":
        if (allowed) {
          if (noAdmin) {
            this.Config.Settings.noAdmin = false;
            rust.SendChatMessage(player, prefix, msgs.adminsOn, "0");
          } else {
            this.Config.Settings.noAdmin = true;
            rust.SendChatMessage(player, prefix, msgs.adminsOff, "0");
          }
          this.SaveConfig();
        }
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
        if (!TitlesData.PlayerData[steamID]) {
          rust.SendChatMessage(player, prefix, msgs.noData, "0");
          this.checkPlayerData(player, steamID);
        }
        rust.SendChatMessage(player, prefix, "Current Rank: " + TitlesData.PlayerData[steamID].Rank.toString() + " (" + TitlesData.PlayerData[steamID].Title + ")", "0");
        rust.SendChatMessage(player, prefix, msgs.userprefix + TitlesData.PlayerData[steamID].Prefix, "0");
        break;
    }
  },

  /*-----------------------------------------------------------------
          karmaHandling
          -- Handles karma command handling for karma commands
          - @player - object - Base Player Object
          - @cmd - Triggered Command
          - @args - array - Cmd arguments
   ------------------------------------------------------------------*/
  karmaHandling: function(player, cmd, args) {
    var perms = this.Config.Permissions;
    var thisPerm = args[1];
    if (args.length > 1) {
      var getPlayer = this.findPlayerByName(args[3]);
      var karmaAmt = Number(args[2]);
    }
    switch (args[1]) {
      case "add":
        TitlesData.PlayerData[getPlayer[1]].Karma += karmaAmt;
        rust.SendChatMessage(player, prefix, msgs.addKarma, "0");
        break;
      case "set":
        TitlesData.PlayerData[getPlayer[1]].Karma = karmaAmt;
        rust.SendChatMessage(player, prefix, msgs.setKarma, "0");
        break;
      case "remove":
        TitlesData.PlayerData[getPlayer[1]].Karma -= karmaAmt;
        rust.SendChatMessage(player, prefix, msgs.removeKarma, "0");
        break;
      default:
        getPlayer = this.findPlayerByName(args[1]);
        rust.SendChatMessage(player, prefix, getPlayer[0].displayName + msgs.plyrKarma + TitlesData.PlayerData[getPlayer[1]].Karma, "0");
        break;
    }
    this.saveData();
    this.checkPlayerData(getPlayer[0], getPlayer[1]);
  },

  /*-----------------------------------------------------------------
          getClosest
          -- Locates closes rank to current players karma
          - @arr - Array - empty array to gather data
          - @closestTo - the current karma of the player
   ------------------------------------------------------------------*/
  getClosest: function(closestTo) {
    var arr = this.getRanksArray();
    if (arr.length > 0) {

      for (var i = 0; i < arr.length; i++) {
        if (closestTo >= 0) {
          if (arr[i] <= closestTo && arr[i] >= 0) closest = arr[i];
        } else if (closestTo <= 0) {
          if (arr[i] >= closestTo && arr[i] <= 0) closest = arr[i];
        }
      }
    } else {
      print("ERROR: Ranks Array is NULL or Empty.");
      return false;
    }
    return closest;
  },

  /*-----------------------------------------------------------------
          getRanksArray
          -- Builds an array of karma values to compare
          -- against the players current karma
   ------------------------------------------------------------------*/
  getRanksArray: function() {
    var temp = [];

    for (var i = 0; i < this.Config.main.length; i++) {
      if (karmaOn) {
        temp.push(this.Config.main[i].karma);
      } else {
        if (this.Config.main[i].killsNeeded !== "disabled") {
          temp.push(this.Config.main[i].killsNeeded);
        }
      }
    }
    return temp;
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
          handleStats
          -- Handles all stat adjustments and Rank changes updating
          -- based on kills or karma
          - @playerID - Array[] - Users Steam ID
          - @player - Array[] - Base player Object
   ------------------------------------------------------------------*/
  handleStats: function(playerID, player) {
    if (this.Config.Settings.antiAbuseOn && this.antiAbuse(player[1], player[0])) return false;
    if ((TitlesData.PlayerData[playerID].isAdmin && noAdmin) || playerID.length === 0) {
      return false;
    } else {
      var i = 0,
        j = this.Config.main.length,
        q = 0,
        t = 0,
        prefixLen = this.Config.prefixTitles.length,
        k2d = 0,
        len = playerID.length;
      /***************** Kills & Deaths Handling **********************/
      if (player[0].displayName !== player[1].displayName) {
        TitlesData.PlayerData[playerID[0]].Kills += 1;
        TitlesData.PlayerData[playerID[1]].Deaths += 1;
        if (this.Config.Settings.useDeathMsgs) this.buildDeathMsg([player[0].displayName, player[0].displayName], playerID);
      } else {
        TitlesData.PlayerData[playerID[0]].Deaths += 1;
      }
      /***************** /Kills & Deaths Handling **********************/
      /***************** Karma Handling **********************/
      if (karmaOn) {
        var kGet = this.getKarma(playerID[1]);
        if (TitlesData.PlayerData[playerID[1]].Karma >= 0) {
          TitlesData.PlayerData[playerID[0]].Karma -= kGet;
          rust.SendChatMessage(player[0], prefix.ranks, msgs.loseKarma + " (" + kGet + ")", "0");
        } else if (TitlesData.PlayerData[playerID[1]].Karma < 0) {
          TitlesData.PlayerData[playerID[0]].Karma += kGet;
          rust.SendChatMessage(player[0], prefix.ranks, msgs.gainKarma + " (" + kGet + ")", "0");
        }
      }
      /***************** /Karma Handling **********************/
      for (i; i < len; i++) {
        var oldRank = TitlesData.PlayerData[playerID[i]].Rank;
        var closestKarma = this.getClosest(TitlesData.PlayerData[playerID[i]].Karma),
          closestKills = this.getClosest(TitlesData.PlayerData[playerID[i]].Kills);
        /***************** KDR Handling **********************/
        k2d = TitlesData.PlayerData[playerID[i]].Kills / TitlesData.PlayerData[playerID[i]].Deaths;
        k2d = Math.ceil(k2d * 100) / 100;
        if (k2d !== "Infinity") {
          TitlesData.PlayerData[playerID[i]].KDR = k2d;
        } else {
          TitlesData.PlayerData[playerID[i]].KDR = TitlesData.PlayerData[playerID[i]].Kills;
        }
        /***************** /KDR Handling **********************/
        /***************** Ranks Handling **********************/
        for (q; q < j; q++) {
          if (karmaOn) {
            if (closestKarma === this.Config.main[q].karma) {
              q = Number.MAX_VALUE;
              TitlesData.PlayerData[playerID[i]].Title = this.Config.main[q].title;
              TitlesData.PlayerData[playerID[i]].Rank = this.Config.main[q].rank;
            }
          } else {
            if (closestKills === this.Config.main[q].killsNeeded) {
              q = Number.MAX_VALUE;
              TitlesData.PlayerData[playerID[i]].Title = this.Config.main[q].title;
              TitlesData.PlayerData[playerID[i]].Rank = this.Config.main[q].rank;
            }
          }
        }
        /***************** /Ranks Handling **********************/
        /***************** Prefix Handling **********************/
        for (t; t < prefixLen; t++) {
          if (TitlesData.PlayerData[playerID[i]].Prefix === "" && this.Config.prefixTitles[t].default) {
            t = Number.MAX_VALUE;
            TitlesData.PlayerData[playerID[i]].Prefix = this.Config.prefixTitles[t].title;
          }
        }
        /***************** /Prefix Handling **********************/
        /***************** Promo Handling **********************/
        if (TitlesData.PlayerData[playerID[i]].Rank > oldRank) {
          player.ChatMessage("<color=green>" + msgs.Promoted + "</color> " + TitlesData.PlayerData[playerID[i]].Title);
        } else if (TitlesData.PlayerData[playerID[i]].Rank < oldRank) {
          player.ChatMessage("<color=red>" + msgs.Demoted.replace("{rank}", TitlesData.PlayerData[playerID[i]].Title) + "</color>");
        }
        /***************** /Promo Handling **********************/
      }
    }
    this.saveData();
  },

  /*-----------------------------------------------------------------
          antiAbuse
          -- Handles friends, and clan mate killings
          -- karma system
          - @victimID - Victims Steam ID
          - @attackerID - Attacker Steam ID
   ------------------------------------------------------------------*/
  antiAbuse: function(victim, attacker) {
    if (clansOn) {
      attackerClan = clansOn.GetClanOf(attacker);
      victimClan = clansOn.GetClanOf(victim);
      if (attackerClan === victimClan) {
        return this.clanCheck(attackerClan, attackerID, victimID);
      } else {
        return false;
      }
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
    if (attacker === null || victim === null || !attacker.ToPlayer() || !victim.ToPlayer()) return false;
    if (this.Config.Settings.antiSleeper && !victim.IsConnected() && !TitlesData.PlayerData[victimID]) return false;

    var killer = attacker.ToPlayer();
    killerID = rust.UserIDFromPlayer(killer);
    victimID = rust.UserIDFromPlayer(victim);
    if (!TitlesData.PlayerData[killerID]) {
      this.checkPlayerData(killer, killerID);
    }
    if (!TitlesData.PlayerData[victimID]) {
      this.checkPlayerData(victim, victimID);
    }
    this.handleStats([killerID, victimID], [killer, victim]);
    return;
  },

  /*-----------------------------------------------------------------
          buildDeathMsg
          -- Builds Broadcasted message on deaths
          - @users - array of player names
          - @ids - array of ids to be sent to the function
   ------------------------------------------------------------------*/
  buildDeathMsg: function(users, ids) {
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
    return false;
  },

  /*-----------------------------------------------------------------
                     Command Handling
  ------------------------------------------------------------------*/
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
        if (karmaOn) TitlesData.PlayerData[target[1]].Karma = 0;
        rust.SendChatMessage(player, prefix, msgs.plyrWiped, "0");
        this.handleStats([target[1]], [target[0]]);
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
        if (karmaOn) TitlesData.PlayerData[target].Karma = 0;
        this.handleStats([rust.UserIDFromPlayer(target)], [target]);
      }
    }
    this.saveData();
    return;
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
    return;
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
    var getPlayer = this.findPlayerByName(args[1]);
    for (var i = 0; i < this.Config.prefixTitles.length; i++) {
      if (this.Config.prefixTitles[i] === TitlesData.PlayerData[getPlayer[1]].Prefix) {
        TitlesData.PlayerData[getPlayer[1]].Prefix = "";
        permission.RemoveUserGroup(getPlayer[1], this.Config.prefixTitles[i].permission);
      }
    }
    this.saveData();
    this.handleStats([getPlayer[1]], [getPlayer[0]]);
    rust.SendChatMessage(player, prefix, msgs.reset + " " + getPlayer[0].displayName, "0");
  },

  givePrefix: function(player, cmd, args) {

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

  rtHelp: function(player, cmd, args) {
    rust.SendChatMessage(player, null, "--------------RanksAndTitles Commands------------", "0");
    var authLvl = player.net.connection.authLevel;
    for (var i = 0; i < this.Config.Help.length; i++) {
      player.ChatMessage(this.Config.Help[i]);
    }
    if (this.hasPermission(player, "isStaff")) {
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

    if (!TitlesData.PlayerData[steamID]) {
      this.checkPlayerData(player, steamID);
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

    if (this.Config.Settings.showPrefix && TitlesData.PlayerData[steamID].Prefix !== "") {
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
