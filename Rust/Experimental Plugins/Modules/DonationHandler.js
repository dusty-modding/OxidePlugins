var DonationHandler = {
  Title: "Donation Handler Addon",
  Author: "Killparadise",
  Version: V(1, 0, 0),
  Init: function() {
    global = importNamespace("");
    command.AddChatCommand("dh", this.Plugin, "donorCmd");
  },

  OnServerInitialized: function() {
    RanksAndTitles = plugins.Find('RanksAndTitles');
    this.msgs = this.Config.Messages;
    if (RanksAndTitles) {
      RanksPrefixes = this.getRanksData();
      RanksData = data.GetData("RanksandTitles");
    } else {
      print("[ERROR]: This plugin cannot run without RanksAndTitles");
      this.Unload();
      return false;
    }
  },

  OnPlayerInit: function(player) {
    var steamID = rust.UserIDFromPlayer(player);
    this.prefixData(steamID);
  },

  LoadDefaultConfig: function() {
    this.Config.Messages = {
      
    };
  },

  hasPermission: function(player, perm) {
    var steamID = rust.UserIDFromPlayer(player);
    if (player.net.connection.authLevel === 2) {
      return true;
    }

    if (permission.UserHasPermission(steamID, perm)) {
      return true;
    }
    rust.SendChatMessage(player, prefix, this.msgs.noPerms, "0");
    return false;
  },

  Unload: function() {
    throw "RanksAndTitles Not Found";
  },

  getRanksData: function() {
    var len = RanksAndTitles.Config.prefixTitles.length,
      temp = [];
    for (var i = 0; i < len; i++) {
      temp.push(RanksAndTitles.Config.prefixTitles[i].title);
    }
    return temp;
  },

  donorCmd: function(player, cmd, args) {
    var steamID = rust.UserIDFromPlayer(player);

    data.SaveData('RanksandTitles');
  }
};
