//Added AntiSleeper checks
//Added AntiAbuse System - Supports Clans only atm
//Updated config
//Removed code for punishment system
//Converted to easier & faster findplayer
//Removed outdated & depricated Code
//Built wipe all functionality for the /rt wipe command
//removed punish and rankperms from permissions
//updated docs


var RanksAndTitles = {
  Title: "RanksAndTitles",
  Author: "Killparadise",
  Version: V(1, 6, 0),
  ResourceId: 830,
  Url: "http://oxidemod.org/resources/ranks-and-titles.830/",
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
      this.Config.Settings.clanKillLimit = 10;
      counter++;
      print("Adding Clan Team Kill limit...");
      if (this.Config.Settings.chatColor === undefined) {
        this.Config.Settings.chatColor = "#FFFFFF";
        counter++;
        print("Adding Chat Color...");
      }
      this.Config.Messages.offline = "<color=red>Karma given by sleepers is currently off</color>";
      counter++;
      print("Adding new Messages...");
      delete this.Config.Punishment;
      counter++;
      print("Removing Punishment Object...");
      delete this.Config.Settings.usePunishSystem;
      counter++;
      delete this.Config.Settings.useRanksPerms;
      counter++;
      print("Removed usePunishSystem...");
      print("Removed useRanksPerms...");

      print("Config Successfully Updated to v1.6.4");
      print("Number of changes: " + counter);
    } else {
      print("Config already at latest version: v" + this.Config.Version);
      return false;
    }
    this.SaveConfig();
  },

  LoadDefaultConfig: function() {
    this.Config.authLevel = 2;
    this.Config.Version = "1.6.4";
    this.Config.Settings = this.Config.Settings || {
      "karma": true,
      "colorSupport": true,
      "noAdmin": false,
      "useBoth": true,
      "dropRank": false,
      "antiSleeper": false,
      "clanKillLimit": 10,
      "useKDR": false,
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
      "hide": "canHide",
      "switch": "canSwitch",
      "kset": "canSetKarma",
      "kcheck": "canCheckKarma",
      "krem": "canRemKarma",
      "kadd": "canAddKarma",
      "clear": "canClear",
      "hideself": "canHideSelf",
      "create": "canCreate",
      "delete": "canDelete",
      "staff": "isStaff",
    };
    this.Config.Prefix = this.Config.Prefix || {
      "ranks": "Ranks",
      "titles": "Titles",
      "ranksandtitles": "RanksAndTitles"
    };
    this.Config.Messages = this.Config.Messages || {
      "Promoted": "You've been Promoted to: ",
      "NoPlyrs": "No Players Found...",
      "plyrWiped": "Player Wiped!",
      "dataRfrsh": "Data Refreshed!",
      "noPerms": "You do not have permission to use this command.",
      "setSuccs": "Player Prefix Set Successfully!",
      "needTitle": "You need to enter a title for the player!",
      "kills": "Your Kill count is: ",
      "deaths": "Your Death count is: ",
      "kdr": "Your KDR is currently: ",
      "karma": "Your current Karma is: ",
      "rank": "Your current Rank is: ",
      "userprefix": "Your Prefix is: ",
      "badSyntaxRt": "The command syntax was incorrect, please use /rt set playername title",
      "infoRanks": "Ranks for players this is an automated system based on kills & karma; this also supports a Bandit Vs Hero Karma System.",
      "infoTitles": "Titles is a system for a community or calm server, allowing owners to set and create custom user titles.",
      "convert": "The Server Admin has switched to Ranks, please use /rtrefresh to reload your player ranks and titles data.",
      "finished": "Great! The plugin will now build the correct data and configurations.",
      "errors": "Incorrect command structure, please try again.",
      "customFnd": "Using Custom Title... Skipping Change...",
      "loseKarma": "You've lost Karma!",
      "gainKarma": "You've gained Karma!",
      "reset": "Player Reset back to Ranks Tree!",
      "cleardata": "Data has been fully cleared!",
      "titlesSet": "The Server is currently using Titles only. No stats avaliable!",
      "switchRanks": "Successfully turned titles only Off!",
      "switchTitles": "Successfully turned titles only On!",
      "broadcast": "The Admin has switched the Titles system, please use /rt refresh to reload player data!",
      "adminsOn": "Admins ranks turned on.",
      "adminsOff": "Admins rankings turned off.",
      "badSyntaxRemove": "Incorrect Syntax please use /rt remove playername",
      "help": "/rt help - Get RanksAndTitles Command Help",
      "badSyntaxKarma": "Invalid syntax please use /rt karma",
      "clearData": "Server Data Wiped...",
      "noData": "No Player Data Found... Attempting to Build.",
      "debugDis": "Debug is currently disabled.",
      "debugRan": "Ran Debug! Thanks!",
      "Demoted": "You've been demoted!",
      "setKarma": "Karma successfully set!",
      "setKarma0": "You can only use numbers to set a players karma.",
      "plyrKarma": " Karma level is: ",
      "checkFailed": "Check failed..",
      "addKarma": "Karma added to player successfully",
      "removeKarma": "Karma removed from player successfully",
      "punishMsg": "You've killed a rankName you've lost an extra karmaAmt Karma!",
      "upToDate": "The config is already up to date!",
      "configFin": "Config finished update! Updated: {count} objects!",
      "rankCreated": "<color=green>New Rank {rank} Created!</color>",
      "rankDel": "<color=green>{rank} has been deleted!</color>",
      "crtPrefix": "<color=green>{prefix} has been created!</color>",
      "offline": "<color=red>Karma given by sleepers is currently off</color>"
    };
    this.Config.Help = this.Config.Help || [

      "/rt - display your rank or title",
      "/rt stats - get your current stats if in ranks mode",
      "/rt refresh - refreshes your data file, recommended only used after system switch"
    ];
    this.Config.AdminHelp = this.Config.AdminHelp || [

      "/rt wipe playername - Wipes the sleceted players Kills, Deaths, KDR, and Karma",
      "/rt set playername title - Sets a custom title to the selected player, this must be a title in config (NOT RANK)",
      "/rt remove playername - removes a given players custom title, and sets them back into the ransk tree",
      "/rt useboth - switch prefixes on and off",
      "/rt noadmin - Removes admins (auth 2 or higher) from ranks system no kills, or ranks will be given.",
      "/rt kset playername karma - set a selected players karma level",
      "/rt kcheck playername - check the selected players karma",
      "/rt kadd playername karma - adds the entered amount of karma to the selected player",
      "/rt krem playername karma - removes the entered amount of karma from the selected player",
      "/rt create rankname rank karmaneeded killsneeded karmagiven color permissions - create a new rank",
      "/rt create prefixname color permission",
      "/rt delete rankname - delete a rank",
    ];

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
    try {
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
      this.saveData();
      this.setRankTitle(steamID, player);
    } catch (e) {
      print(e.message.toString());
    }
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
    try {
      delete TitlesData.PlayerData;
      rust.SendChatMessage(player, prefix.ranksandtitles, msgs.clearData, "0");
      TitlesData.PlayerData = TitlesData.PlayerData || {};
      this.saveData();
      this.getData();
    } catch (e) {
      print(e.message.toString());
    }
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
      rust.SendChatMessage(player, prefix.ranksandtitles, msgs.noData, "0");
    } else {
      rust.SendChatMessage(player, prefix.ranksandtitles, msgs.dataRfrsh, "0");
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

  /*--------------------Switch Command Handling----------------------------*/

  //This is our switch case statement this is called by /rt it then grabs the second word in the text and compares it to one below
  //if a match is found, it will launch that function accordingly.
  switchCmd: function(player, cmd, args) {
    try {
      var steamID = rust.UserIDFromPlayer(player),
        authLvl = player.net.connection.authLevel,
        useTitles = this.Config.Settings.useTitles,
        perms = this.Config.Permissions;
      switch (args[0]) {
        case "stats":
          this.checkStats(player, cmd, args);
          break;
        case "hide":
          if (this.hasPermission(player, perms.hideself)) {
            this.hideCmd(player, cmd, args);
          } else {
            rust.SendChatMessage(player, prefix.ranksandtitles, msgs.noPerms, "0");
            return false;
          }
          break;
        case "wipe":
          if (this.hasPermission(player, perms.wipe)) {
            this.wipePlayer(player, cmd, args);
          } else {
            rust.SendChatMessage(player, prefix.ranksandtitles, msgs.noPerms, "0");
            return false;
          }
          break;
        case "set":
          if (this.hasPermission(player, perms.set) && args.length >= 2) {
            this.giveTitle(player, cmd, args);
          } else if (!this.hasPermission(player, perms.set)) {
            rust.SendChatMessage(player, prefix.ranksandtitles, msgs.noPerms, "0");
            return false;
          } else {
            rust.SendChatMessage(player, prefix.ranksandtitles, msgs.badSyntaxRt, "0");
            return false;
          }
          break;
        case "useboth":
          if (this.hasPermission(player, perms.switch)) {
            if (!this.Config.Settings.useBoth) {
              this.Config.Settings.useBoth = true;
            } else {
              this.Config.Settings.useBoth = false;
            }
          } else {
            rust.SendChatMessage(player, prefix.ranksandtitles, msgs.noPerms, "0");
          }
          this.SaveConfig();
          break;
        case "kset":
          if (args.length >= 1 && this.hasPermission(player, perms.kset)) {
            this.setKarma(player, cmd, args);
          } else {
            rust.SendChatMessage(player, prefix.ranksandtitles, msgs.noPerms, "0");
          }
          break;
        case "kcheck":
          if (args.length >= 1 && this.hasPermission(player, perms.kcheck)) {
            this.checkKarma(player, cmd, args);
          } else {
            rust.SendChatMessage(player, prefix.ranksandtitles, msgs.noPerms, "0");
          }
          break;
        case "kadd":
          if (args.length >= 1 && this.hasPermission(player, perms.kadd)) {
            this.addKarma(player, cmd, args);
          } else {
            rust.SendChatMessage(player, prefix.ranksandtitles, msgs.noPerms, "0");
          }
          break;
        case "krem":
          if (args.length >= 1 && this.hasPermission(player, perms.krem)) {
            this.removeKarma(player, cmd, args);
          } else {
            rust.SendChatMessage(player, prefix.ranksandtitles, msgs.noPerms, "0");
          }
          break;
        case "remove":
          if (this.hasPermission(player, perms.remove) && args.length >= 1) {
            this.removeTitle(player, cmd, args);
          } else if (!this.hasPermission(player, perms.remove)) {
            rust.SendChatMessage(player, prefix.ranksandtitles, msgs.noPerms, "0");
            return false;
          } else {
            rust.SendChatMessage(player, prefix.ranksandtitles, msgs.badSyntaxRemove, "0");
            return false;
          }
          break;
        case "clear":
          if (this.hasPermission(player, perms.clear)) {
            this.clearData(player, cmd, args);
          } else {
            rust.SendChatMessage(player, prefix.ranksandtitles, msgs.noPerms, "0");
            return false;
          }
          break;
        case "refresh":
          this.refreshData(player, cmd, args);
          break;
        case "noadmin":
          if (this.hasPermission(player, perms.hide)) {
            this.noAdmin(player, cmd, args);
          } else {
            rust.SendChatMessage(player, prefix.ranksandtitles, msgs.noPerms, "0");
          }
          break;
        case "help":
          this.rtHelp(player, cmd, args);
          break;
        case "create":
          if (this.hasPermission(player, perms.create)) {
            this.createRank(player, cmd, args);
          } else {
            rust.SendChatMessage(player, prefix.ranksandtitles, msgs.noPerms, "0");
          }
          break;
        case "delete":
          if (this.hasPermission(player, perms.delete)) {
            this.deleteRank(player, cmd, args);
          } else {
            rust.SendChatMessage(player, prefix.ranksandtitles, msgs.noPerms, "0");
          }
          break;
        default:
          if (TitlesData.PlayerData[steamID] !== undefined) {
            rust.SendChatMessage(player, prefix.ranks, msgs.rank + TitlesData.PlayerData[steamID].Rank + " (" + TitlesData.PlayerData[steamID].Title + ")", "0");
            rust.SendChatMessage(player, prefix.ranks, msgs.userprefix + TitlesData.PlayerData[steamID].Prefix, "0");
          } else {
            rust.SendChatMessage(player, prefix.ranksandtitles, msgs.noData, "0");
            this.checkPlayerData(player, steamID);
          }
          break;
      }
    } catch (e) {
      print(e.message.toString());
    }
  },

  /*-----------------------------------------------------------------
          getClosest
          -- Locates closes rank to current players karma
          - @arr - Array - empty array to gather data
          - @closestTo - the current karma of the player
   ------------------------------------------------------------------*/
  getClosest: function(arr, closestTo) {
    try {
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
    } catch (e) {
      print(e.message.toString());
    }
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
    if (playerID === "Test") return true;
    var noAdmin = this.Config.Settings.noAdmin;

    if (TitlesData.PlayerData[playerID].isAdmin && noAdmin) {
      print("Admins turned off for rankings. Skipping Admin.");
      return false;
    } else {
      var i = 0,
        j = this.Config.main.length,
        kills = TitlesData.PlayerData[playerID].Kills,
        karma = TitlesData.PlayerData[playerID].Karma,
        karmaOn = this.Config.Settings.karma,
        useBoth = this.Config.Settings.useBoth,
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
        rust.SendChatMessage(player, prefix.ranks, "<color=green>" + msgs.Promoted + "</color>" + " " + TitlesData.PlayerData[steamID].Title, "0");
      } else if (TitlesData.PlayerData[playerID].Rank < oldRank) {
        rust.SendChatMessage(player, prefix.ranks, "<color=red>" + msgs.Demoted + "</color>", "0");
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
      j = this.Config.main.length;
    for (i; i < j; i++) {
      if (this.Config.main[i].title === TitlesData.PlayerData[victimID].Title) {
        return this.Config.main[i].karmaModifier;
      } else {
        return 1;
      }
    }
  },

  /*-----------------------------------------------------------------
                    Anti-Abuse System
  ------------------------------------------------------------------*/

  //Checks if a player killed by a clanmate or if they're friends
  //returns boolean to deathtracker to see if it should record the kill or not
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

  //Keeps track of kill counts of certain players (friends or clan mates)
  //then sends this information to see if we should allow karma to send or not
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
    try {
      var victim = entity,
        attacker = hitinfo.Initiator,
        victimID,
        killerID;
      var karmaOn = this.Config.Settings.karma;
      var useKDR = this.Config.Settings.useKDR;
      var antiSleeper = this.Config.Settings.antiSleeper;


      if (victim.ToPlayer() && attacker.ToPlayer() && victim.displayName !== attacker.displayName) {
        var killer = attacker.ToPlayer();
        killerID = rust.UserIDFromPlayer(killer);
        victimID = rust.UserIDFromPlayer(victim);
        if (this.antiFriend(victimID, attackerID)) return false;
        if (antiSleeper && !victim.IsConnected()) {
          attacker.ChatMessage(msgs.offline);
          return false;
        }
        if (!TitlesData.PlayerData[killerID]) {
          print("Killer does not have registered Data in Data File.");
          print("Attempting to create killer Data file...");
          this.checkPlayerData(killer, killerID);
        } else if (!TitlesData.PlayerData[victimID] && victim.IsConnected()) {
          print("Victim does not have registered Data in Data File");
          print("Attempting to create Victim Data File...");
          this.checkPlayerData(victim, victimID);
        }

        if (karmaOn && TitlesData.PlayerData[victimID].Karma >= 0) {
          TitlesData.PlayerData[killerID].Kills += 1;
          TitlesData.PlayerData[victimID].Deaths += 1;
          TitlesData.PlayerData[killerID].Karma -= this.getKarma(victimID);
          rust.SendChatMessage(killer, prefix.ranks, msgs.loseKarma + " (" + this.getKarma(victimID) + ")", "0");
        } else if (karmaOn && TitlesData.PlayerData[victimID].Karma < 0) {
          TitlesData.PlayerData[killerID].Kills += 1;
          TitlesData.PlayerData[victimID].Deaths += 1;
          TitlesData.PlayerData[killerID].Karma += this.getKarma(victimID);
          rust.SendChatMessage(killer, prefix.ranks, msgs.gainKarma + " (" + this.getKarma(victimID) + ")", "0");
        } else {
          TitlesData.PlayerData[killerID].Kills += 1;
          TitlesData.PlayerData[victimID].Deaths += 1;
        }
        this.setRankTitle(killerID, killer);
        this.updateKDR(TitlesData.PlayerData[victimID].Kills, TitlesData.PlayerData[victimID].Deaths, victim.ToPlayer());
        this.updateKDR(TitlesData.PlayerData[killerID].Kills, TitlesData.PlayerData[killerID].Deaths, killer);
      } else if (victim.ToPlayer() && victim.displayName === attacker.displayName) {
        victimID = rust.UserIDFromPlayer(victim);
        TitlesData.PlayerData[victimID].Deaths += 1;
        this.updateKDR(TitlesData.PlayerData[victimID].Kills, TitlesData.PlayerData[victimID].Deaths, victim.ToPlayer());
      } else {
        return false;
      }
    } catch (e) {
      print(e.message.toString());
    }
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
      rust.SendChatMessage(player, prefix.ranks, msgs.setKarma, "0");
    } else {
      rust.SendChatMessage(player, prefix.ranks, msgs.setKarma0, "0");
      return false;
    }
    this.checkPlayerData(getPlayer[0], getPlayer[1]);
  },

  checkKarma: function(player, cmd, args) {
    var getPlayer = this.findPlayerByName(args[1]);
    if (getPlayer) {
      rust.SendChatMessage(player, prefix.ranks, getPlayer[0].displayName + msgs.plyrKarma + TitlesData.PlayerData[getPlayer[1]].Karma, "0");
    } else {
      rust.SendChatMessage(player, prefix.ranks, msgs.checkFailed, "0");
    }
  },

  addKarma: function(player, cmd, args) {
    var getPlayer = this.findPlayerByName(args[1]);
    var karmaAmt = Number(args[2]);
    if (typeof(karmaAmt) === "number") {
      TitlesData.PlayerData[getPlayer[1]].Karma += karmaAmt;
      this.saveData();
      rust.SendChatMessage(player, prefix.ranks, msgs.addKarma, "0");
    }
    this.checkPlayerData(getPlayer[0], getPlayer[1]);
  },

  removeKarma: function(player, cmd, args) {
    var getPlayer = this.findPlayerByName(args[1]);
    var karmaAmt = Number(args[2]);
    if (typeof(karmaAmt) === "number") {
      TitlesData.PlayerData[getPlayer[1]].Karma -= karmaAmt;
      this.saveData();
      rust.SendChatMessage(player, prefix.ranks, msgs.removeKarma, "0");
    }
    this.checkPlayerData(getPlayer[0], getPlayer[1]);
  },

  //this function is caused by our death checker, this sends data to our data file to keep track of a KDR for the
  //player normally it is called twice each kill (called at the same time) luckily it processes and handles the
  //Ids efficiently so it knows where to send what.
  updateKDR: function(kills, deaths, player) {
    var steamID = rust.UserIDFromPlayer(player);
    var killsToDeaths = kills / deaths;
    killsToDeaths = Math.ceil(killsToDeaths * 100) / 100;
    TitlesData.PlayerData[steamID].KDR = killsToDeaths;
    this.saveData();
  },


  //this is our function that is called by /rt stats it is setup so it will display the currently asking players
  //stats from the data file. It searches the playerdata via steamID.
  checkStats: function(player, cmd, args) {
    var steamID = rust.UserIDFromPlayer(player);
    rust.SendChatMessage(player, prefix.ranks, msgs.kills + TitlesData.PlayerData[steamID].Kills, "0");
    rust.SendChatMessage(player, prefix.ranks, msgs.deaths + TitlesData.PlayerData[steamID].Deaths, "0");
    rust.SendChatMessage(player, prefix.ranks, msgs.kdr + TitlesData.PlayerData[steamID].KDR, "0");
    if (this.Config.Settings.karma) rust.SendChatMessage(player, prefix.ranks, msgs.karma + TitlesData.PlayerData[steamID].Karma, "0");
  },

  //Wipe player resets the chosen players kills, deaths, kdr, and their karma (if its turned on) it does a quick search
  //for the player using our find function and then sends the data to the target player to replace the current set data
  //it then saves and finishes up.
  wipePlayer: function(player, cmd, args) {
    var target;
    if (args[1] !== "all") {
      target = this.findPlayerByName(args[1]);
      if (target[1].length) {
        TitlesData.PlayerData[target[1]].Kills = 0;
        TitlesData.PlayerData[target[1]].Deaths = 0;
        TitlesData.PlayerData[target[1]].KDR = 0;
        if (this.Config.Settings.karma) TitlesData.PlayerData[target[1]].Karma = 0;
        rust.SendChatMessage(player, prefix.ranks, msgs.plyrWiped, "0");
        this.setRankTitle(target[1], target[0]);
      } else if (!target[1].length) {
        rust.SendChatMessage(player, prefix.ranks, msgs.NoPlyrs, "0");
        return false;
      } else {
        rust.SendChatMessage(player, prefix.ranks, msgs.NoPlyrs, "0");
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
      print(args[1] + " " + args[2] + " " + args[3]);
      temp = {
        "title": args[1].toString() || "default",
        "Color": args[2].toString() || "#FFFFFF",
        "permission": args[3].toString() || "player"
      };
      this.Config.prefixTitles.push(temp);
      rust.SendChatMessage(player, prefix.ranks, msgs.crtPrefix.replace("{prefix}", temp.title), "0");
    } else if (args.length >= 6) {
      print(args[1] + " " + args[2] + " " + args[3]);
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
      rust.SendChatMessage(player, prefix.ranks, msgs.rankCreated.replace("{rank}", temp.title), "0");
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
        rust.SendChatMessage(player, prefix.ranks, msgs.rankDel.replace("{rank}", name), "0");
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
      TitlesData.PlayerData[getPlayer[1]].Prefix = "";
      permission.RemoveUserGroup(getPlayer[1], this.Config.prefixTitles[i].permission);
      this.saveData();
      this.setRankTitle(getPlayer[1], getPlayer[0]);
      rust.SendChatMessage(player, prefix.ranks, msgs.reset + " " + getPlayer[0].displayName, "0");
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
      rust.SendChatMessage(player, prefix.titles, "Your tag is now hidden!", "0");
    } else {
      TitlesData.PlayerData[steamID].hidden = false;
      rust.SendChatMessage(player, prefix.titles, "Your tag is no longer hidden!", "0");
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
          TitlesData.PlayerData[getPlayer[1]].Prefix = this.Config.prefixTitles[i].title;
          permission.AddUserGroup(getPlayer[1], this.Config.prefixTitles[i].permission);
          rust.SendChatMessage(player, prefix.ranksandtitles, msgs.setSuccs, "0");
        }
      }
    } else {
      rust.SendChatMessage(player, prefix.ranksandtitles, msgs.needTitle, "0");
      return false;
    }
    this.saveData();
  },

  noAdmin: function(player, cmd, args) {
    var noAdmin = this.Config.Settings.noAdmin;
    if (noAdmin) {
      this.Config.Settings.noAdmin = false;
      rust.SendChatMessage(player, prefix.ranksandtitles, msgs.adminsOn, "0");
    } else {
      this.Config.Settings.noAdmin = true;
      rust.SendChatMessage(player, prefix.ranksandtitles, msgs.adminsOff, "0");
    }
    this.SaveConfig();
  },

  rtHelp: function(player, cmd, args) {
    rust.SendChatMessage(player, null, "--------------RanksAndTitles Commands------------", "0");
    var authLvl = player.net.connection.authLevel;
    for (var i = 0; i < this.Config.Help.length; i++) {
      rust.SendChatMessage(player, null, this.Config.Help[i], "0");
    }
    if (authLvl >= 2) {
      rust.SendChatMessage(player, null, "<color=orange>--------------Admin Commands------------</color>", "0");
      for (var j = 0; j < this.Config.AdminHelp.length; j++) {
        rust.SendChatMessage(player, null, this.Config.AdminHelp[j], "0");
      }
    }
  },

  SendHelpText: function(player) {
    rust.SendChatMessage(player, prefix.ranksandtitles, msgs.help, "0");
  },

  /*-----------------------------------------------------------------
                        Chat Handling
  ------------------------------------------------------------------*/

  //This function is used by playerchat to grab the correct colors for the rank, or title used by the player
  //it will then send back the found color for the chat function to use.
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

  //Our char function is called whenever a chat message is sent, it grabs a slew of information including, player files, the message
  //the player title and realname, and the steamId, using all of this it checks to make sure the chat wasn't empty or a command
  //then if checks if color support is activated if so it will sent the chat with the colored title
  //if its not enabled then it will send a default message with the players assigned title without the color.
  //We have to make sure we return false afterwards or else we will get double chat messages with every chat sent.
  OnPlayerChat: function(arg) {
    try {
      var player = arg.connection.player,
        steamID = rust.UserIDFromPlayer(player);
      if (TitlesData.PlayerData[steamID] === undefined) {
        this.checkPlayerData(player, steamID);
        print("Building Player Data");
      }

      if (!chatHandler) {
        var msg = arg.GetString(0, "text");
        if (msg.substring(1, 1) === "/" || msg === "") return null;

        var colorOn = this.Config.Settings.colorSupport,
          color = this.getColor(steamID),
          displayName = player.displayName,
          useBoth = this.Config.Settings.useBoth,
          chatColor = "<color=" + this.Config.Settings.chatColor + ">";
        authLevel = player.net.connection.authLevel;

        if (colorOn && this.hasPermission(player, this.Config.Permissions.isStaff)) {
          useColor = "<color=" + this.Config.Settings.chatNameColor + ">";
        } else {
          useColor = "<color=" + this.Config.Settings.staffchatNameColor + ">";
        }

        if (colorOn) {
          titleColor = "<color=" + color[0] + ">[";
        } else {
          titleColor = "";
        }

        if (useBoth && TitlesData.PlayerData[steamID].Prefix !== "") {
          usePrefix = TitlesData.PlayerData[steamID].Prefix + "]</color> ";
          prefixColor = "<color=" + color[1] + ">[";
        } else if (!useBoth || TitlesData.PlayerData[steamID].Prefix === "") {
          usePrefix = "";
          prefixColor = "";
        }

        if (TitlesData.PlayerData[steamID].hidden) {
          usePrefix = "";
          useTitle = "";
        } else {
          useTitle = TitlesData.PlayerData[steamID].Title + "]</color>: ";
        }

        if (this.Config.Settings.dropRank) {
          useTitle = "";
          titleColor = "";
        }

        formattedMsg = prefixColor + usePrefix + useColor + displayName + "</color> " + titleColor + useTitle + chatColor + msg + "</color>";
        global.ConsoleSystem.Broadcast("chat.add", steamID, formattedMsg);
        print(player.displayName + ": " + msg);
        return false;
      } else {
        return null;
      }
    } catch (e) {
      print(e.message.toString());
    }
  },
};
