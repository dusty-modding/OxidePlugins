function ParaAPI(title, author, version) {
  this.Title = title;
  this.Author = author;
  this.Version = version;
}

ParaAPI.prototype = {
  Init: function() {
    global = importNamespace("");
  },

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

  moduleHandler: function() {
    var modules = {};
    modules = {
      PrefixHandler: new PrefixHandler(this.Title, this.Author, V(1, 0, 0), [moduleData, this.Config]),
      PunishmentSystem: new PunishmentSystem(this.Title, this.Author, V(1, 0, 0), [moduleData, this.Config]),
      Ranks: new RanksSystem(this.Title, this.Author, V(1, 0, 0), [moduleData, this.Config]),
      Achievements: new Achievements(this.Title, this.Author, V(1, 0, 0), [moduleData, this.Config])
    };
    print("Modules");
    print("----------------------------------");
    if (modules.length) {
      if (modules.PrefixHandler) {
        print("[Modules]: Located Prefix Handler Module.");
        print("[PrefixHandler]: Loaded Successfully");
      }
      if (modules.PunishmentSystem) {
        print("[Modules]: Located Punishment Module.");
        print("[Punishment]: Loaded Successfully");
      }
      if (modules.Achievements) {
        print("[Modules]: Located Achievements Module.");
        print("[Achievements]: Loaded Successfully");
      }
      if (modules.Ranks) {
        print("[Modules]: Located Ranks Module.");
        print("[Ranks]: Loaded Successfully");
      }
    } else {
      print("[Modules]: No Modules Located");
    }
    print("----------------------------------");
    this.SaveConfig();
  },

  LoadDefaultConfig: function() {
    this.Config.Info = "Welcome to ParaAPI, this config is the hub of all Module Plugins designed by KillParadise. This setup is the same with the Data file, Think of this as a central 'Hub' for the data";
  },

  getData: function() {
    APIData = data.GetData("ParaAPI");
  },

  saveData: function() {
    data.SaveData('ParaAPI');
  },

  clearData: function(data) {
    delete data;
  },

  refreshData: function(steamID, data) {
    if (data.PlayerData[steamID] === undefined) {
      print("No Data found, Attempting to build Data");
    }
    TitlesData.PlayerData[steamID].Title = "";
    this.checkPlayerData(player, steamID);
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

  getDataSet: function(data, value) {
    var temp = [];
    for (var i = 0, len = data.length; i < len; i++) {
      temp.push(data[i][value]);
    }
    return temp;
  },

  getValue: function(array, param, data) {
    var i = 0,
      value = 0,
      j = array.length;
    for (i; i < j; i++) {
      if (array[i][param] === data) {
        value = value[i][param];
        break;
      } else {
        value = 1;
      }
    }
    return value;
  },

  getColor: function(data) {
    var color = "",
      colorArr = [];
    for (var i = 0, len = data.array.length; i < len; i++) {
      if (data.PlayerData[data.steamID][data.value] === data.array[i][data.value]) {
        color = data.array[i][data.value];
      }
    }
    return color;
  },

  getClosest: function(closestTo, data, value) {
    var arr = this.getDataSet(data, value);
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

  antiAbuse: function(user, user2) {
    if (clansOn) {
      Clan1 = clansOn.GetClanOf(user);
      Clan2 = clansOn.GetClanOf(user2);
      if (Clan1 === Clan2) {
        return true;
      } else {
        return false;
      }
    }
    return false;
  },

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
};

var API = new ParaAPI("ParaAPI", "KillParadise", V(1, 0, 0));
