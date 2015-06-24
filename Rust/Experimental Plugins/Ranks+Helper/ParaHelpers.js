function ParaHelpers(title, author, version) {
  this.Title = title;
  this.Author = autor;
  this.Version = version;
  this.clansOn = plugins.Find("Clans");
  Init: function() {
    print("Helpers Loaded");
  }
};

ParaHelpers.prototype = {

  /*-----------------------------------------------------------------
          saveData
          -- Handles building initial player data
          -- and setting proper values on login
   ------------------------------------------------------------------*/
  saveData: function(plugin) {
    data.SaveData(plugin);
  },

  /*-----------------------------------------------------------------
          findPlayer
          -- Locates Base Player object using the users name
          - @playerName - String - of base player name
   ------------------------------------------------------------------*/
  findPlayer: function(playerName) {
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

  /*-----------------------------------------------------------------
          getClosest
          -- Locates closes rank to current players karma
          - @arr - Array - empty array to gather data
          - @closestTo - the current karma of the player
   ------------------------------------------------------------------*/
  getClosest: function(arr, closestTo) {
    if (arr.length > 0) {

      for (var i = 0; i < arr.length; i++) {
        if (closestTo >= 0) {
          if (arr[i] <= closestTo && arr[i] >= 0) closest = arr[i];
        } else if (closestTo <= 0) {
          if (arr[i] >= closestTo && arr[i] <= 0) closest = arr[i];
        }
      }
    } else {
      print("ERROR: Array is NULL or Empty.");
      return false;
    }
    return closest;
  },

  /*-----------------------------------------------------------------
          getRanksArray
          -- Builds an array of karma values to compare
          -- against the players current karma
          -@arr - Array[] - The array of objects we want to build from
          -@value - property - An object property to return
   ------------------------------------------------------------------*/
  buildArray: function(arr, value) {
    var temp = [];
    for (var i = 0; i < arr.length; i++) {
      temp.push(arr[i][value]);
    }
    return temp;
  },

  /*-----------------------------------------------------------------
          getKarma
          -- Grabs the victims title and locates the karmaModifier
          - @victimID - Victims Steam ID
   ------------------------------------------------------------------*/
  getValue: function(arr, value, data) {
    var i = 0,
      tmp,
      j = arr.length;
    for (i; i < j; i++) {
      if (arr[i][value] === data) {
        tmp = arr[i][value];
        break;
      } else {
        tmp = 1;
      }
    }
    return tmp;
  },

  /*-----------------------------------------------------------------
          getColor
          -- Handles finding, and grabbing the
          -- current color of the player
          - @steamID - Current User id to grab the color for.
   ------------------------------------------------------------------*/
  getColor: function(arr, data, value) {
    var i = 0,
      color,
      colorArr = [],
      for (i; i < arr.length; i++) {
        if (data === arr[i][value]) {
          color = arr[i].Color;
        }
      }
    return color;
  },

  /*-----------------------------------------------------------------
          antiAbuse
          -- Handles friends, and clan mate killings
          -- karma system
          - @users - Array[] - Array of users
   ------------------------------------------------------------------*/
  antiAbuse: function(users) {
    if (this.clansOn) {
      clanOne = this.clansOn.GetClanOf(users[0]);
      clanTwo = this.clansOn.GetClanOf(users[1]);
      if (clanOne === clanTwo) {
        return true;
      } else {
        return false;
      }
    }
    return false;
  },

  /*-----------------------------------------------------------------
          buildString
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
          updateConfig
          -- Smart update for config built each time
   ------------------------------------------------------------------*/
  updateConfig: function(plugin, version) {
    var counter = 0;

    if (plugin.Config.Version !== version) {
      print("WARNING: Config Outdated");
    } else {
      print("Config already at latest version: v" + plugin.Config.Version);
      return false;
    }
    plugin.SaveConfig();
  },

  sendHelp: function(msgs, player, title) {
    rust.SendChatMessage(player, null, "--------------" + title + " Commands------------", "0");
    var authLvl = player.net.connection.authLevel;
    for (var i = 0; i < msgs[0].length; i++) {
      player.ChatMessage(msgs[0][i]);
    }
    if (this.hasPermission(player, "isStaff")) {
      rust.SendChatMessage(player, null, "<color=orange>--------------Admin Commands------------</color>", "0");
      for (var j = 0; j < msgs[1].length; j++) {
        player.ChatMessage(msgs[1][j]);
      }
    }
  }
}

var helpers = new ParaHelpers("ParaHelpers", "KillParadise", V(1, 0, 0));
