var UniAPI = {
    Title: "Universal Economics",
    Author: "Killparadise",
    Version: V(1, 0, 0),
    HasConfig: true,
    Init: function() {
        global = importNamespace("");
        this.getData();

        UniAPI.fees = this.Config.Settings.fees || 0.05;
        command.AddChatCommand("uni", this.Plugin, "uniEconSwitch");

        command.AddConsoleCommand("uni.eco", this.Plugin, "C_Eco");
        msgs = this.Config.Messages;
    },

    OnServerInitialized: function() {
        print(this.Title + " is booting up... Welcome aboard.");
    },

    OnPlayerInit: function(player) {
        this.loadData(player);
    },

    /*--------------------------------------------
                Start API setup
    ----------------------------------------------*/
    getPlayerBal: function(steamID, player) {
        if (steamID !== null) {
            balance = UniAPI.PlayerData[steamID].Account;
        } else {
            var steamID = rust.UserIDFromPlayer(player);
            balance = UniAPI.PlayerData[steamID].Account;
        }
        return balance;
    },

    setPlayerBal: function(steamID, amt) {
        UniAPI.PlayerData[steamID].Account = amt;
        this.saveData();
        rust.SendChatMessage(player, "UniEcon", msgs.setCmpl, "0");
    },

    depToPlayer: function(steamID, player, amt) {
        if (steamID !== null) {
            var getPlayer = this.findPlayerByName(steamID);
            getDeposit = this.deposit(getPlayer[0], null, amt);
        } else if (player !== null && steamID === null) {
            var steamID = rust.UserIDFromPlayer(player);
            var getPlayer = this.findPlayerByName(steamID);
            getDeposit = this.deposit(getPlayer[0], null, amt);
        } else {
            rust.SendChatMessage(player, "UniEcon", msgs.noArgs, "0");
        }

        if (getDeposit) {
            rust.SendChatMessage(player, "UniEcon", msgs.customSuccessDep, "0");
        } else {
            rust.SendChatMessage(player, "UniEcon", msgs.customFailedDep, "0");
        }
        this.saveData();
    },

    withFromPlayer: function(steamID, player, amt) {
        if (steamID !== null) {
            var getPlayer = this.findPlayerByName(steamID);
            getDeposit = this.withdrawl(getPlayer[0], null, amt);
        } else if (player !== null && steamID === null) {
            var steamID = rust.UserIDFromPlayer(player);
            var getPlayer = this.findPlayerByName(steamID);
            getDeposit = this.withdrawl(getPlayer[0], null, amt);
        } else {
            rust.SendChatMessage(player, "UniEcon", msgs.noArgs, "0");
        }

        if (getDeposit) {
            rust.SendChatMessage(player, "UniEcon", msgs.customSuccessWithDrawl, "0");
        } else {
            rust.SendChatMessage(player, "UniEcon", msgs.customFailedWithDrawl, "0");
        }
        this.saveData();
    },

    transferFunds: function(senderID, recieverID, sender, receiver, amt) {
        if (steamID !== null && steamID2 !== null) {
            sender = this.findPlayerByName(senderID);
            receiver = this.findPlayerByName(recieverID);
        } else if (player !== null && player2 !== null) {
            senderID = rust.UserIDFromPlayer(sender);
            recieverID = rust.UserIDFromPlayer(receiver);
        }

        if (this.Config.fees) {
            var diff = amt * this.Config.fees;
            amt = diff;
        }

        if ((UniAPI.PlayerData[sender[1]] !== undefined && UniAPI.PlayerData[receiver[1]] !== undefined)) {
            if (UniAPI.PlayerData[sender[1]].Account >= amt) {
                UniAPI.PlayerData[sender[1]].Account -= amt;
                UniAPI.PlayerData[receiver[1]].Account += amt;
                rust.SendChatMessage(sender[0], "UniEcon", msgs.transGood, "0");
                rust.SendChatMessage(receiver[0], "UniEcon", msgs.transGood, "0");
            }
        } else if (UniAPI.PlayerData[senderID] !== undefined && UniAPI.PlayerData[senderID] !== undefined) {
            if (UniAPI.PlayerData[senderID].Account >= amt) {
                UniAPI.PlayerData[senderID].Account -= amt;
                UniAPI.PlayerData[receiverID].Account += amt;
                rust.SendChatMessage(sender, "UniEcon", msgs.transGood, "0");
                rust.SendChatMessage(receiver, "UniEcon", msgs.transGood, "0");
            }
        } else {
            this.loadData(sender[0]);
            this.loadData(receiver[0]);
        }
        this.saveData();
    },

    /*--------------------------------------------
                    End API
    ----------------------------------------------*/

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
            "noFunds": "Not Enough funds...",
            "noArgs": "Incorrect Args sent...",
            "setCmpl": "Set players funds successfully"
        };

        this.Config.CustomMsgs = {
            "customSuccessDep": "",
            "customFailedDep": "",
            "customSuccessWithDrawl": "",
            "customFailedWithDrawl": ""
        }
    },

    getData: function() {
        UniAPI = data.GetData("UniAPI");
        UniAPI = UniAPI || {};
        UniAPI.PlayerData = UniAPI.PlayerData || {};
    },

    loadData: function(player) {
        var steamID = rust.UserIDFromPlayer(player);
        var authLvl = player.net.connection.authLevel;
        UniAPI.PlayerData[steamID] = UniAPI.PlayerData[steamID] || {};
        UniAPI.PlayerData[steamID].Name = UniAPI.PlayerData[steamID].Name || player.displayName;
        UniAPI.PlayerData[steamID].Account = UniAPI.PlayerData[steamID].Account || this.Config.Settings.starterBalance;
        this.saveData();
    },

    saveData: function() {
        data.SaveData("UniAPI");
    },

    uniEconSwitch: function(player, cmds, args) {
        var authLvl = player.net.connection.authLevel;
        var steamID = rust.UserIDFromPlayer(player);

        switch (args[0]) {
            case "with":
                this.withdrawl(player, cmds, args);
                break;
            case "dep":
                this.deposit(player, cmds, args);
                break;
            case "set":
                this.setBal(player, cmds, args);
                break;
            case "tran":
                this.transfer(player, cmds, args);
                break;
            default:
                rust.SendChatMessage(player, "UniEcon", msgs.bal + this.Config.Settings.currency + UniAPI.PlayerData[steamID].Account, "0");
                break;
        }
    }

    //This is so we can find a player if a name is entered as a string. We can get a player object back
        findPlayerByName: function(player, args) {
        try {
            var global = importNamespace("");
            var found = [],
                matches = [];
            var playerName = args[1].toLowerCase();
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
                rust.SendChatMessage(player, prefix.uniAPI, msgs.NoPlyrs, "0");
                return false;
            }
        } catch (e) {
            print(e.message.toString());
        }
    },

    //Console check on economy status
    C_Eco: function(arg) {
        //TODO: yeah do something to send console an economy update.
        var cmd = arg.GetString(0, "");
        switch (cmd) {
            case "save":
                this.saveData();
                print("UniAPI Saved Successfully!");
                break;
            case "balance":
                var getplayer = arg.GetString(1, "");
                var target = this.findPlayerByName(getPlayer);
                var getPData = [UniAPI.PlayerData[target[1]].Name, UniAPI.PlayerData[target[1]].Account];
                print("Player: " + getPData[0] + " balance: " + getPData[1]);
            case "set":
                var getplayer = arg.GetString(1, "");
                var target = this.findPlayerByName(getPlayer);
                this.setBal(target[0], null, arg);
        }
    },

    transfer: function(player, cmd, args) {
        // setup: /uni tran playername amount
        var steamID = rust.UserIDFromPlayer(player);
        var P1currBal = UniAPI.PlayerData[steamID].Account;
        if (args.length >= 2) {
            var getPlayer = this.findPlayerByName(arg[1]);
            var P2currBal = UniAPI.PlayerData[getPlayer[1]].Account;
            var getAmount = Number(args[2]);
        } else {
            rust.SendChatMessage(player, "UniEcon", msgs.noArgs, "0");
        }

        if (this.Config.fees) {
            var diff = getAmount * this.Config.fees;
            getAmount = diff;
        }

        if (getplayer && getAmount) {
            if (P1currBal >= getAmount) {
                var P1newBal = P1currBal - getAmount;
                var P2newBal = P2currBal + getAmount;
                UniAPI.PlayerData[steamID].Account = P1newBal;
                UniAPI.PlayerData[getPlayer[1]].Account = P2newBal;
                rust.SendChatMessage(player, "UniEcon", msgs.transGood, "0");
                rust.SendChatMessage(getPlayer[0], "UniEcon", msgs.transGood, "0");
            }
        }
        this.saveData();
    },

    deposit: function(player, cmd, args) {
        var steamID = rust.UserIDFromPlayer(player);
        var currBal = UniAPI.PlayerData[steamID].Account;
        if (args.length >= 1) {
            var newBal = currBal + Number(args[1])
        }
        this.saveData();
        return newBal;
    },

    withdrawl: function(player, cmd, args) {
        var steamID = rust.UserIDFromPlayer(player);
        var currBal = UniAPI.PlayerData[steamID].Account;
        if (args.length >= 1 && currBal >= Number(args[1])) {
            var newBal = currBal - Number(args[1])
        } else {
            rust.SendChatMessage(player, "UniEcon", msgs.noFunds, "0");
        }
        this.saveData();
        return newBal;
    },

    setBal: function(player, cmd, args) {
        var steamID = rust.UserIDFromPlayer(player);
        if (args.length === 1) {
            UniAPI.PlayerData[steamID].Account = Number(args[1]);
            rust.SendChatMessage(player, "UniEcon", msgs.setCmpl, "0");
        }
        this.saveData();
    }
}
