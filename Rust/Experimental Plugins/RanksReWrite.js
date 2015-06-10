var RanksObject = function() {
  Title = "RanksAndTitles";
  Author = "Killparadise";
  Version = V(1, 6, 0);
  ResourceId = 830;
  Url = "http://oxidemod.org/resources/ranks-and-titles.830/";
  d.getData();
};

RanksObject.prototype = {

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

  OnPlayerInit: function(player) {
    var steamID = rust.UserIDFromPlayer(player);
    localData.checkData(steamID);
  },

  LoadDefaultConfig: function() {

  },

  OnPlayerChat: function(arg) {
    var msg = arg.GetString(0, "text");
    var options = callChat.init(msg, arg);

    formattedMsg = options.colorAttr.prefix.color + options.colorAttr.prefix.rank + options.colorAttr.title.displayColor + options.player.displayName + "</color> " +
      options.colorAttr.title.titleColor + options.useTitle + options.chatColor + options.msg + "</color>";

    global.ConsoleSystem.Broadcast("chat.add", steamID, formattedMsg);

    print(options.player.displayName + ": " + options.msg);
    return false;
  },

  sendMessage: function(player, string, args) {
    var sb = new stringBuilder(string, args);
    if (player !== "global") {
      player.ChatMessage(sb);
    } else {
      rust.BroadcastChat(prefix, sb);
    }
  }

};

RanksObject.stringBuilder.prototype = function(string, values) {
  var temp = [],
    tempColor = [],
    i = 0,
    sb = "";

  if (values.length === 0) {
    return string;
  }

  if (string.constructor === Array) {
    for (var ii = 0, len = string.length; ii < len; ii++) {
      temp.push(string[ii].match(/\{([^{]+)\}/g));
    }
  } else {
    temp.push(string.match(/\{([^{]+)\}/g));
  }

  temp = temp.toString().split(",");
  for (i; i < temp.length; i++) {
    sb = string.replace(temp[i], values[i]);
    print(temp[i] + " values: " + values[i]);
  }
  return sb;
};

RanksObject.callChat.prototype = {

  init: function(msg, arg) {
    if (chatHandler) return false;
    if (msg.substring(1, 1) === "/" || msg === "") return null;
    if (TitlesData.PlayerData[steamID] === undefined) {
      this.checkPlayerData(player, steamID);
      print("Building Player Data");
    }
    var player = arg.connection.player,
      steamID = rust.UserIDFromPlayer(player),
      options = {
        player: player,
        steamID: steamID,
        titleColor: "",
        usePrefix: "",
        prefixColor: "",
        useTitle: this.getPlayerTitle(steamID),
        formattedMsg: "",
        color: this.getColor(steamID),
        chatColor: "<color:" + this.Config.Settings.chatColor + ">",
        colorAttr: {
          title: this.getDisplayColors(player),
          prefix: this.getPrefixColors(steamID)
        }
      };
    return options;
  },

  getDisplayColors: function(player) {
    var color = {};
    if (this.Config.Settings.colorSupport && this.hasPermission(player, this.Config.Permissions.isStaff)) {
      color.displayColor = "<color=" + this.Config.Settings.chatNameColor + ">";
      color.titleColor = "<color=" + color[0] + ">[";
    } else {
      color.displayColor = "<color=" + this.Config.Settings.staffchatNameColor + ">";
      color.titleColor = "<color=" + color[0] + ">[";
    }
    return color;
  },

  getPrefixColors: function(steamID) {
    var ret = {
      rank: "",
      color: ""
    };
    if (this.Config.Settings.useBoth && TitlesData.PlayerData[steamID].Prefix !== "") {
      ret.rank = TitlesData.PlayerData[steamID].Prefix + "]</color> ";
      ret.color = "<color=" + color[1] + ">[";
    }
    return ret;
  },

  getPlayerTitle: function(steamID) {
    if (!this.Config.Settings.dropRank && !TitlesData.PlayerData[steamID].hidden) {
      return TitlesData.PlayerData[steamID].Title + "]</color>: ";
    }
  },
};

RanksObject.dataHandler.prototype = {
  getData: function() {
    TitlesData = data.GetData('RanksandTitles');
    TitlesData = TitlesData || {};
    TitlesData.PlayerData = TitlesData.PlayerData || {};
    TitlesData.AntiAbuse = TitlesData.AntiAbuse || {};
  },

  checkData: function(steamID) {
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
    TitlesData.PlayerData[steamID].isAdmin = TitlesData.PlayerData[steamID].isAdmin || this.hasPermission(player, this.Config.Permissions.isStaff) || false;
    TitlesData.PlayerData[steamID].hidden = TitlesData.PlayerData[steamID].hidden || false;
  },

  saveData: function() {
    this.SaveData("RanksandTitles");
  }
};

RanksObject.API.prototype = {
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

var RanksAndTitles = new RanksObject();
var localData = new dataHandler();
var callChat = new callChat();
RanksAndTitles.Init();
