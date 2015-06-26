function PrefixHandler(title, author, version, args) {
  this.Title = title;
  this.Author = author;
  this.Version = version;
  this.RanksData = args[0];
  this.RanksConfig = args[1];
  this.RanksConfig.phMsgs = this.RanksConfig.phMsgs || {
    "noPrefix": "Prefix Not Found",
    "nonActive": "This Prefix is Currently not active",
    "success": "Your prefix was changed successfully",
    "noPerms": "You do not have Permission to use this prefix",
    "title": "Current Avaliable Prefixes",
    "info": "Use /ph prefixname to set a prefix"
  };
  command.AddChatCommand("ph", this.Plugin, "preifxCmd");
}

PrefixHandler.prototype = {

  OnPlayerInit: function(player) {
    var steamID = rust.UserIDFromPlayer(player);
    this.prefixData(steamID);
  },

  hasPermission: function(player, perm) {
    var steamID = rust.UserIDFromPlayer(player);
    if (player.net.connection.authLevel === 2) {
      return true;
    }

    if (permission.UserHasPermission(steamID, perm)) {
      return true;
    }
    rust.SendChatMessage(player, prefix, this.RanksConfig.phMsgs.noPerms, "0");
    return false;
  },

  getRanksData: function() {
    var len = this.RanksConfig.prefixTitles.length,
      temp = [];
    for (var i = 0; i < len; i++) {
      temp.push(this.RanksConfig.prefixTitles[i].title);
    }
    return temp;
  },

  prefixCmd: function(player, cmd, args) {
    var steamID = rust.UserIDFromPlayer(player);
    var RanksPrefixes = this.RanksConfig.prefixTitles;
    for (var i = 0, len = RanksPrefixes.length; i < len; i++) {
      if (args.length > 0) {
        if (args[0].toLowerCase() === RanksPrefixes[i].toLowerCase() && this.hasPermission(player, args[0])) {
          this.RanksData.PlayerData[steamID].Prefix = RanksPrefixes[i];
          player.SendChatMessage(this.RanksConfig.phMsgs.success);
          data.SaveData('RanksandTitles');
          return false;
        }
      } else {
        player.SendChatMessage(this.msgs.title);
        player.SendChatMessage("--------------------------");
        if (this.hasPermission(player, RanksPrefixes[i])) {
          player.SendChatMessage("<color=orange>" + RanksPrefixes[i] + "</color>");
        }
        player.SendChatMessage("--------------------------");
        player.SendChatMessage(this.msgs.info);
        return false;
      }
    }
    player.SendChatMessage(this.RanksConfig.phMsgs.noPrefix);
    return false;
  }
};
