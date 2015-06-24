function dataHandler() {
  TitlesData = data.GetData('RanksandTitles');
  TitlesData = TitlesData || {};
  TitlesData.PlayerData = TitlesData.PlayerData || {};
}

dataHandler.prototype = {
  checkPlayerData: function(player) {
    var steamID = rust.UserIDFromPlayer(player);
    TitlesData.PlayerData[steamID] = TitlesData.PlayerData[steamID] || {};
    TitlesData.PlayerData[steamID].RealName = TitlesData.PlayerData[steamID].RealName || player.displayName;
    TitlesData.PlayerData[steamID].Title = TitlesData.PlayerData[steamID].Title || "";
    TitlesData.PlayerData[steamID].Prefix = TitlesData.PlayerData[steamID].Prefix || "";
    TitlesData.PlayerData[steamID].Rank = TitlesData.PlayerData[steamID].Rank || 0;
    TitlesData.PlayerData[steamID].Kills = TitlesData.PlayerData[steamID].Kills || 0;
    TitlesData.PlayerData[steamID].KDR = TitlesData.PlayerData[steamID].KDR || 0;
    TitlesData.PlayerData[steamID].Deaths = TitlesData.PlayerData[steamID].Deaths || 0;
    TitlesData.PlayerData[steamID].Karma = TitlesData.PlayerData[steamID].Karma || 0;
    TitlesData.PlayerData[steamID].isAdmin = TitlesData.PlayerData[steamID].isStaff || this.hasPermission(player, this.Config.Permissions.staff) || false;
  },
  checkData: function(player) {
    var steamID = rust.UserIDFromPlayer(player);
    if (!TitlesData.PlayerData[steamID]) {
      print("Data Not Present");
      this.checkPlayerData(player, steamID);
    }
    return false;
  },
  saveData: function() {
    data.SaveData('RanksandTitles');
  },
  clearData: function(player, cmd, args) {
    delete TitlesData.PlayerData;
    rust.SendChatMessage(player, prefix, msgs.clearData, "0");
    TitlesData.PlayerData = TitlesData.PlayerData || {};
    this.saveData();
    return new dataHandler();
  }
};

function API() {
  this.defaults = "";
}

API.prototype = {
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
};

var RanksAndTitles = {
  Title: "Ranks And Titles",
  Author: "KillParadise",
  Version: V(2, 0, 0),
  Init: function() {
    API = new API();
    this.LoadDefaultConfig();
    this.updateConfig();
    this.getData();
    this.registerPermissions();
    dh = new dataHandler();
    msgs = this.Config.Messages;
    prefix = this.Config.Prefix;
    karmaOn = this.Config.Settings.karma;
    useBoth = this.Config.Settings.useBoth;
    noAdmin = this.Config.Settings.noAdmin;
    global = importNamespace("");
    command.AddChatCommand("rt", this.Plugin, "switchCmd");
    command.AddConsoleCommand("ranks.build", this.Plugin, "cBuild");
    command.AddConsoleCommand("ranks.delete", this.Plugin, "cDelete");
  },

  OnPlayerInit: function(player) {
    this.dataHandler.checkPlayerData(player);
    this.setter = new setter(player);
  },

  OnServerInitialized: function() {
    prefixHandler = plugins.Find('PrefixHandler');
    chatHandler = plugins.Find('chathandler');
  },

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

  LoadDefaultConfig: function() {
    this.Config.Version = this.Config.Version || "1.6.4";
    this.Config.Settings = this.Config.Settings || {
      "useKarma": true,
      "colorSupport": true,
      "noAdmin": false,
      "showPrefix": true,
      "hideRank": false,
      "antiSleeper": false,
      "useKDR": false,
      "deathMsgs": true,
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
      "hideAdmin": "Admins ranks turned {status}.",
      "help": "/rt help - Get RanksAndTitles Command Help",
      "clearData": "Plugin Data Wiped...",
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
      "slain": "<color=lime>{slayer}</color> the <color={slayerColor}>{title}</color> has slain <color=lime>{slain}</color> the <color={slainColor}>{stitle}</color>!"
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

  OnEntityDeath: function(entity, hitinfo) {
    var deathHandler = new deathHandler();
    deathHandler.init(entity, hitinfo);
  },
  OnPlayerChat: function(arg) {
    if (chatHandler) return null;
    var callChat = new chatHandler();
    callChat.init(arg);
  },
  switchCmd: function(player, cmd, args) {
    var cmdHandler = new commandHandler();
    cmdHandler.init(player, cmd, args);
  },
};
