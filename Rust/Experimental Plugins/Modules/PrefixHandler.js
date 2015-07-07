function prefixHandler(args) {
  if (args.length > 0) {
    this.init(args);
  }
  else {
    return false;
  }
}

prefixHandler.prototype = {

  init: function(args) {
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
  },

  prefixUpdate: function(player, cmd, args) {
    print("Ran Prefix Command");
    var uData = data.GetData('oxide.users');
    try {
    var steamID = rust.UserIDFromPlayer(player);
    var RanksPrefixes = this.RanksConfig.Main.Prefixes;
    if (args.length === 1) {
      this.displayPrefixes(player, uData[steamID].Groups);
      return false;
    }

    if (args.length === 2) {
    for (var i = 0, len = RanksPrefixes.length; i < len; i++) {
      for (var q = 0, uLen = uData[steamID].Groups.length; q < uLen; q++) {
        if (args[1].toLowerCase() === RanksPrefixes[i].permission.toLowerCase() && RanksPrefixes[i].permission === uData[steamID].Groups[q]) {
          this.RanksData.PlayerData[steamID].Prefix = uData[steamID].Groups[q].replace(/\w+/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
          player.ChatMessage(this.RanksConfig.phMsgs.success);
          data.SaveData('RanksandTitles');
          return false;
        }
      else if (args.length > 2) {
        player.ChatMessage(this.RanksConfig.phMsgs.info);
        return false;
      }
    }
  }
}
    player.ChatMessage(this.RanksConfig.phMsgs.noPerms);
  } catch(e) {
    print(e.message.toString());
  }
    return false;
  },

  displayPrefixes: function(player, gArr) {
    player.ChatMessage(this.RanksConfig.phMsgs.title);
    player.ChatMessage("--------------------------");
    for (var i = 0, len = gArr.length; i < len; i++) {
      player.ChatMessage("<color=orange>" + gArr[i] + "</color>");
    }
    player.ChatMessage("--------------------------");
    player.ChatMessage("<color=lime>" + this.RanksConfig.phMsgs.info+ "</color>");
  }
};

var PrefixHandler = {
  Title: "Prefix Handler",
  Author: "KillParadise",
  Version: V(1,0,0),
  Init: function() {
    print("PrefixHandler Installed. Please Reload RanksAndTitles");

  }
};
