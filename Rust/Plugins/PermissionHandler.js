var PermissionHandler = {
  Title: "Permissions Handler",
  Author: "Killparadise",
  Version: V(1, 0, 0),
  Init: function() {
    command.AddChatCommand("ph", this.Plugin, "cmdSwitch");
  },

  OnServerInitialized: function() {
    passed = false;
    this.msgs = this.Config.Messages;
  },

  LoadDefaultConfig: function() {
    this.Config = {
      "Version": "1.0",
      "Permissions": {
        "group": "canCreateGroup",
        "rgroup": "canRemGroup",
        "add": "canAdd",
        "set": "canSet",
        "remove": "canRem",
        "default": "canRegister"
      },
      "Groups": {
        "player": [],
        "moderator": [],
        "admin": [
          "canCreateGroup",
          "canRemGroup",
          "canAdd",
          "canSet",
          "canRem",
          "canRegister"
        ]
      },
      "Prefix": "PermissionHandler",
      "Messages": {
        "shortArgs": "Not enough values passed",
        "noGroup": "Could not find the group {group}",
        "noPermission": "You do not have permission to do this.",
        "success": "Successfully added player to {group}!",
        "noPlugin": "No Plugin Found. Please try again.",
        "noObject": "The plugin {plugin} does not have proper Permission handler support.",
        "alreadyExists": "<color=red>Group Already Exists!</color>",
        "doesntExists": "<color=red>Group does not exist!</color>",
        "addedToGroup": "<color=lime>{player}</color> has added you to the<color=lime> {group} </color>permissions group.",
        "notFound": "Player not Found"
      }
    };
  },


  /*-----------------------------------------------------------------
                        API
    -----------------------------------------------------------------
          checkPass
          -- Returns true or false passed on if perms check passed
   ------------------------------------------------------------------*/
  checkPass: function() {
    return passed;
  },

  /*-----------------------------------------------------------------
          String Builder
          -- Builds and returns a string based off array of values
   ------------------------------------------------------------------*/
  buildString: function(string, values) {
    var temp = [],
      i = 0,
      sb = "";

    if (values.length === 0) {
      return string;
    }
    temp.push(string.match(/\{([^{]+)\}/g));
    temp = temp.toString().split(",");
    for (i; i < temp.length; i++) {
      sb = string.replace(temp[i], values[i]);
      print(temp[i] + " values: " + values[i]);
    }
    return sb;
  },

  /*-----------------------------------------------------------------
          findPlayer
          -- Finds a players based on name or SteamID
          -- returns an array with a base player, and steamid
   ------------------------------------------------------------------*/
  findPlayer: function(playerName) {
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

  /*-----------------------------------------------------------------
          Permission Check
          -- checks user for permission
          -- sets passed var, and returns boolean
   ------------------------------------------------------------------*/
  hasPermission: function(player, perm) {
    var steamID = rust.UserIDFromPlayer(player);
    if (player.net.connection.authLevel === 2) {
      passed = true;
    } else if (permission.UserHasPermission(steamID, perm)) {
      passed = true;
    } else {
      player.ChatMessage(this.msgs.noPermission);
      passed = false;
    }
    return passed;
  },

  /*-----------------------------------------------------------------
          Register Permissions
          -- Registers all single and group permissions
          -- Builds Permission Groups
   ------------------------------------------------------------------*/
  registerPermissions: function() {
    var i = 0;
    g = 3;
    //register single permissions
    for (var key in this.Config.Permissions) {
      if (!permission.PermissionExists(this.Config.Permissions[key], this.Plugin)) {
        permission.RegisterPermission(this.Config.Permissions[key], this.Plugin);
      }
    }
    //register our Groups
    for (var group in this.Config.Groups) {
      if (!permission.GroupExists(group)) {
        permission.CreateGroup(group, group, g++);
      }
      //register permissions to Groups
      for (i; i < this.Config.Groups[key].length; i++) {
        if (!permission.GroupHasPermission(group, this.Config.Groups[key][i])) {
          permission.GrantGroupPermission(group, this.Config.Groups[key][i], this.Plugin);
        }
      }
    }
  },

  /*-----------------------------------------------------------------
          setGoup
          -- Builds a new permissions group
          Syntax: /ph group groupname
   ------------------------------------------------------------------*/
  setGroup: function(player, cmd, args) {
    var name = args[1].toString();
    if (!permission.GroupExists(name)) {
      permission.CreateGroup(name.toLowerCase(), name, g++);
    } else {
      player.ChatMessage(this.msgs.alreadyExists);
      return false;
    }
  },

  /*-----------------------------------------------------------------
          remGroup
          -- Removes a desired permissions group
          Syntax: /ph rgroup groupname
   ------------------------------------------------------------------*/
  remGroup: function(player, cmd, args) {
    var name = args[1].toString();
    if (permission.GroupExists(name)) {
      permission.RemoveGroup(name.toLowerCase());
    } else {
      player.ChatMessage(this.msgs.doesntExists);
      return false;
    }
  },

  /*-----------------------------------------------------------------
          addPlugin
          -- Adds a desired plugin that supports
          -- permission handler objects and build them into
          -- our config and re run register
          Syntax: /ph add pluginname
            --Note: pluginname needs to be the EXACT name
   ------------------------------------------------------------------*/
  addPlugin: function(player, cmd, args) {
    //First grab our plugin
    var plugin = plugins.Find(args[1]);
    //Did the user enter a correct plugin?
    if (!plugin) {
      player.ChatMessage(this.msgs.noPlugin);
      return false;
    }
    //Now does the plugin have a Permission Handler object?
    if (plugin.Config.pHandler) {
      print("[Permission Handler]: Located Permission Handler Object... Uploading...");
      if (plugin.Config.pHandler.Groups) {
        for (var key in plugin.Config.pHandler.Groups) {
          this.Config.Groups[key] = plugin.Config.pHandler.Groups[key];
        }
      }
      if (plugin.Config.pHandler.Permissions) {
        for (var perm in plugin.Config.pHandler.Permissions) {
          this.Config.Permissions[perm] = plugin.Config.pHandler.Permissions[perm];
        }
      }
      this.SaveConfig();
      this.registerPermissions();
      this.finish(plugin);
    } else {
      player.ChatMessage(this.msgs.noObject.replace("{plugin}", args[1]));
      return false;
    }

  },

  /*-----------------------------------------------------------------
          setPlayer
          -- Adds a player to a desired permission group
          Syntax: /ph set playername groupname
   ------------------------------------------------------------------*/
  setPlayer: function(player, cmd, args) {
    var target = this.findPlayer(args[1]);
    var group = args[2];
    if (!target) {
      player.ChatMessage(this.msgs.notFound);
      return false;
    }
    if (permission.GroupExists(group)) {
      permission.AddUserGroup(target[1], group);
      player.ChatMessage(this.msgs.success.replace("{group}", group));
      target[0].ChatMessage(this.buildString(this.msgs.addedToGroup, [player.displayName, group]));
    } else {
      player.ChatMessage(this.msgs.doesntExists);
    }

  },

  /*-----------------------------------------------------------------
          removePlayer
          -- Removes a player from a permission group
          Syntax: /ph remove playername groupname
   ------------------------------------------------------------------*/
  removePlayer: function(player, cmd, args) {
    var target = this.findPlayer(args[1]);
    var group = args[2];
    if (!target) {
      player.ChatMessage(this.msgs.notFound);
      return false;
    }
    var tarGroups = permission.GetUserGroups(target[1]);

    if (permission.GroupExists(group) && tarGroups.indexOf(group) > -1) {
      permission.AddUserGroup(target[1], group);
      player.ChatMessage(this.msgs.success.replace("{group}", group));
      target[0].ChatMessage(this.buildString(this.msgs.addedToGroup, [player.displayName, group]));
    } else {
      player.ChatMessage(this.msgs.doesntExists);
    }

  },

  /*-----------------------------------------------------------------
          cmdSwitch
          -- Handles command arguments & permission checks
   ------------------------------------------------------------------*/
  cmdSwitch: function(player, cmd, args) {
    var steamID = rust.UserIDFromPlayer(player), allowed;
    var command = args[0];
    if (command === "") {
      allowed = this.hasPermission(player, this.Config.Permissions.default);
    } else {
      allowed = this.hasPermission(player, this.Config.Permissions.command);
    }
    switch (args[0]) {
      case "group":
        if (allowed) this.setGroup(player, cmd, args);
        break;
      case "rgroup":
        if (allowed) this.remGroup(player, cmd, args);
        break;
      case "add":
        if (allowed) this.addPlugin(player, cmd, args);
        break;
      case "set":
        if (allowed) this.setPlayer(player, cmd, args);
        break;
      case "remove":
        if (allowed) this.removePlayer(player, cmd, args);
        break;
      default:
        if (allowed) {
          player.ChatMessage(this.msgs.register);
          this.registerPermissions();
        }
        break;
    }

  },

  /*-----------------------------------------------------------------
          finished
          -- Removes the handler permissions from the other
          -- plugin, or saves it if delete is set to false
   ------------------------------------------------------------------*/
  finished: function(ph) {
    if (ph.Config.pHandler.delete === undefined || ph.Config.pHandler.delete) {
      print("[Permission Handler]: Finished grabbing data from config and storing it on local config. Removing JSON object.");
      delete ph.Config.pHandler;
      ph.SaveConfig();
    } else {
      print("[Permission Handler]: Plugin wants to keep the ph Object for local use... Not deleting.");
      return false;
    }
  },

  OnPlayerChat: function(args) {

  }
};
