var StaffStar = {
  Title: "Staff Star",
  Author: "Killparadise",
  Version: V(1, 0, 1),
  Init: function() {
    this.registerPermissions();
    this.getData();
    global = importNamespace("");
  },

  OnPlayerInit: function(player) {
    var steamID = rust.UserIDFromPlayer(player);
    for (var i = 0; i < this.Config.Permissions.length; i++) {
      if (this.hasPermission(player, this.Config.Permissions[i])) {
        this.handleData(steamID);
        StaffData.PlayerData[steamID].perm = this.Config.Permissions[i];
      }
    }
    this.saveData();
  },

  OnServerInitialized: function() {
    print("Booting up Staff Star");
  },

  LoadDefaultConfig: function() {
    this.Config.Permissions = ["isStaff", "isdonator"];
    this.Config.values = {
      "isStaff": {
        "symbol": "<color=yellow>★</color>",
        "color": "#FFFFFF"
      },
      "isdonator": {
        "symbol": "<color=red>★</color>",
        "color": "#FFFFFF"
      }
    };
  },
  //----------------------------------------
  //          Data Handling
  //      All data handling systems
  //----------------------------------------
  handleData: function(steamID) {
    StaffData[steamID] = StaffData[steamID] || {};
    StaffData[steamID].perm = StaffData[steamID].perm || "";
  },

  getData: function() {
    StaffData = data.GetData("StaffStar");
    StaffData = StaffData || {};
  },

  saveData: function() {
    data.SaveData("StaffStar");
  },

  //----------------------------------------
  //     Permission Handling
  //    Handle Rank and User Permissions
  //----------------------------------------
  hasPermission: function(player, perm) {
    var steamID = rust.UserIDFromPlayer(player);
    if (permission.UserHasPermission(steamID, perm)) {
      return true;
    }
    return false;
  },

  registerPermissions: function() {
    //single permissions
    for (var i = 0; i < this.Config.Permissions.length; i++) {
      if (!permission.PermissionExists(this.Config.Permissions[i])) {
        permission.RegisterPermission(this.Config.Permissions[i], this.Plugin);
      }
    }
  },
  //----------------------------------------
  //     Chat Handler
  //    Grabs chat and modifies if needed
  //----------------------------------------
  OnPlayerChat: function(arg) {
    var player = arg.connection.player,
      steamID = rust.UserIDFromPlayer(player),
      msg = arg.GetString(0, "text"),
      formattedMsg = msg;

    if (StaffData[steamID] && StaffData[steamID].perm) {
      formattedMsg = this.Config.values[StaffData[steamID].perm].symbol + '<color=' + this.Config.values[StaffData[steamID].perm].color + '>' + player.displayName + "</color>: " + msg;
      global.ConsoleSystem.Broadcast("chat.add", steamID, formattedMsg);
      print(player.displayName + ": " + msg);
      return false;
    }
  }
};
