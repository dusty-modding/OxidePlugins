var JavaScriptTests = {
    Title: "JS API Tests",
    Author: "Killparadise",
    Version: V(1, 0, 0),
    Init: function() {
        command.AddChatCommand("js", this.Plugin, "runTest");
    },

    LoadDefaultConfig: function() {
        this.Config.Version = "1.0";
    },

    runTest: function(player, cmd, args) {
        try {
            print(API.test(true));
        } catch (e) {
            print(e.message.toString());
        }
    }
};
