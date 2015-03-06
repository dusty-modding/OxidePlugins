var UniAPI = {
    Title: "Universal Economics",
    Author: "Killparadise",
    Version: V(1, 0, 0),
    HasConfig: true,
    Init: function() {
    	global = importNamespace("");
        this.getData();

        UniAPI.fees = this.Config.Settings.fees || 0.05;

        command.AddChatCommand("bal", this.Plugin, "checkBalance");
        command.AddChatCommand("tran", this.Plugin, "transfer");
        command.AddChatCommand("dep", this.Plugin, "depositMoney");
        command.AddChatCommand("with", this.Plugin, "withdrawMoney");
        command.AddChatCommand("set", this.Plugin, "setMoney");

        command.AddConsoleCommand("uni.ceco", this.Plugin, "C_Eco");
        msgs = this.Config.Messages;
    },

    OnServerInitialized: function() {

    },

    OnPlayerInit: function(player) {
    	this.loadData(player);
    },

    LoadDefaultConfig: function() {
        this.Config.Settings = {
            "starterBalance": 500,
            "authLvl": 2,
            "fees": 0.05,
            "currency": "$",
            "currencyName": "Dollar"
        };

        this.Config.Messages = {
        	"bal": "Your current balance is: ",
        	"transGood": "Transferred Funds Successfully",
        	"setGood": "Added funds Successfully.",
        	"setBad": "Failed to set player funds.",
        	"deposit": "Deposited funds successfully.",
        	"withdrawl": "Withdrew funds successfully.",
        	"noFunds": "Not Enough funds..."
        }
    },

    getData: function() {
        UniAPI = data.GetData("UniAPI");
        UniAPI = UniAPI || {};
        UniAPI.PlayerData = UniAPI.PlayerData || {};
        this.saveData();
    },

    loadData: function(player) {
    	var steamID = rust.UserIDFromPlayer(player);
        var authLvl = player.net.connection.authLevel;
    	UniAPI.PlayerData[steamID] = UniAPI.PlayerData[steamID] || {};
    	UniAPI.PlayerData[steamID].Name = UniAPI.PlayerData[steamID].Name || player.displayName;
    	UniAPI.PlayerData[steamID].Account = UniAPI.PlayerData[steamID].Account || this.Config.Settings.starterBalance;
    },

    saveData: function() {
        data.SaveData("UniAPI");
    },

    checkAccess: function(player) {

    },

    //This is so we can find a player if a name is entered as a string. We can get a player object back
    findPlayerByName: function(player, args) {
        var global = importNamespace("");
        var found = [];
        var argument = args[1]
        var itPlayerList = global.BasePlayer.activePlayerList.GetEnumerator();
        while (itPlayerList.MoveNext()) {
            var displayName = itPlayerList.Current.displayName.toLowerCase();
        }
        if (displayName.search(argument) > -1) {
            var targetPlayer = global.BasePlayer.Find(displayName);
        }
        if (targetPlayer) {
            found.push(targetPlayer);
            foundID = rust.UserIDFromPlayer(targetPlayer);
            found.push(foundID);
            return found;
        } else {
            rust.SendChatMessage(player, "Titles", msgs.NoPlyrs, "0");
            return false;
        }
    },

    //Console check on economy status
    C_Eco: function() {
    	//TODO: yeah do something to send console an economy update.
    },

    checkBalance: function(player, cmd, args) {
    	var steamID = rust.UserIDFromPlayer(player);
    	rust.SendChatMessage(player, "UniEcon", msgs.bal + this.Config.Settings.currency + UniAPI.PlayerData[steamID].Account, "0");
    },

    transfer: function(player, cmd, args) {
    	
    },
}
