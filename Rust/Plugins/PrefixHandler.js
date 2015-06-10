var PrefixHandler = {
    Title: "Prefix Handler",
    Author: "Killparadise",
    Version: V(1, 0, 0),
    Init: function() {
        this.getData();
        global = importNamespace("");
        command.AddChatCommand("ph", this.Plugin, "preifxCmd");
    },

    OnServerInitialized: function() {
        RanksAndTitles = plugins.Find('RanksAndTitles');
        this.msgs = this.Config.Messages;
        if (RanksAndTitles) {
            this.getRanksData();
        } else {
            print("This plugin cannot run without RanksAndTitles");
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
            "noPrefix": "Prefix Not Found",
            "nonActive": "This Prefix is Currently not active",
            "success": "Your prefix was changed successfully"
        }
    },

    Unload: function() {
        throw "RanksAndTitles Not Found";
        return false;
    },

    saveData: function(type) {
        if (type !== undefined) {
            data.SaveData(type);
        } else {
            data.SaveData('PrefixHandler');
            data.SaveData('RanksandTitles');
        }
    },

    getData: function() {
        prefixData = data.GetData('PrefixHandler');
        prefixData = prefixData || {};
        prefixData.playerData = prefixData.playerData || {};
    },

    prefixData: function(steamID) {
        prefixData.playerData[steamID].Prefixes = prefixData.playerData[steamID].Prefixes || [];
    },

    getRanksData: function() {
        RanksData = data.GetData('RanksandTitles');
    },
    // Handles the players /ph command to switch to a desired prefix
    prefixCmd: function(player, cmd, args) {
        var steamID = rust.UserIDFromPlayer(player);
        if (!prefixData.playerData[steamID]) {
            this.prefixData(steamID);
        }

        if (args.length === 1) {
            var prefix = args[0]
            var i = 0,
                len = RanksAndTitles.Config.prefixTitles.length;

            for (i, i < len; i++) {
                if (prefixData.playerData[steamID].Prefixes.indexOf(prefix) > -1 && RanksAndTitles.Config.prefixTitles[i].title.toLowerCase() === prefix.toLowerCase()) {
                    player.ChatMessage(msgs.success);
                    RanksData.PlayerData[steamID].Prefix = RanksAndTitles.Config.prefixTitles[i].title;
                    this.saveData('RanksandTitles');
                    break;
                } else if (prefixData.playerData[steamID].Prefixes.indexOf(prefix) === -1 && i === len) {
                    player.ChatMessage(msgs.noPrefix);
                } else if (RanksAndTitles.Config.prefixTitles[i] !== prefix && i === len) {
                    player.ChatMessage(msgs.nonActive);
                }
            }
        }
        return false;
    },

    handleMultiPrefix: function(steamID, prefix, save) {
        for (var i = 0; i < RanksAndTitles.Config.prefixTitles.length; i++) {
            if (RanksAndTitles.Config.prefixTitles[i].title.toLowerCase() === prefix.toLowerCase()) {
                if (save === '-save') prefixData.playerData[steamID].Prefixes.push(RanksAndTitles.Config.prefixTitles[i].title);
                RanksData.PlayerData[steamID].Prefix = RanksAndTitles.Config.prefixTitles[i].title;
            }
        }
        this.saveData();
    }
}
