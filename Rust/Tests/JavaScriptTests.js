var JavaScriptTests = {
    Title: "JS API Tests",
    Author: "Killparadise",
    Version: V(1, 0, 0),
    Init: function() {
        global = importNamespace("");
        command.AddChatCommand("js", this.Plugin, "runTest");
    },

    OnServerInitialized: function() {
        phAPI = plugins.Find("PermissionHandler");
    },

    LoadDefaultConfig: function() {
        this.Config.Version = "1.0";
        this.Config.pHandler = {
          "Permissions": {
            "perm1": "canperm1",
            "perm2": "canperm2",
            "perm3": "canperm3"
          },
          "Groups": {
            "group1": [
              "canperm1"
              ],
            "group2": [
              "canperm1",
              "canperm2",
              "canperm3"
            ]
          },
          "delete": true
        };
    },

    runTest: function(player, cmd, args) {
        try {
            print(phAPI.Object.checkPass());
            if (phAPI.Object.checkPass()) {
                print("API passed perm. check finished with success");
            } else {
                print("System Failed, check did not pass perm or perm was not passed correctly. Check log!");
            }
        } catch (e) {
            print(e.message.toString());
        }
    }
};
