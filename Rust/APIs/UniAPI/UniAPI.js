UniAPI.API = function() {
    this.Status = "Active";
}

UniAPI.API.prototype = {

    getPlayerBal: function(steamID) {
        if (typeof(UniAPI.PlayerData[steamID]) === "undefined") this.loadData(steamID);
        return UniAPI.PlayerData[steamID].Account;
    },

    getPlayerWallet: function(steamID) {
        if (typeof(UniAPI.PlayerData[steamID]) === "undefined") this.loadData(steamID);
        return UniAPI.PlayerData[steamID].Wallet;
    },

    setPlayerBal: function(steamID, amt) {
        if (typeof(UniAPI.PlayerData[steamID]) === "undefined") this.loadData(steamID);
        UniAPI.PlayerData[steamID].Account = amt;
        return this.saveData();
    },

    depToPlayer: function(steamID, amt) {
        if (typeof(UniAPI.PlayerData[steamID]) === "undefined") this.loadData(steamID);
        UniAPI.PlayerData[steamID].Account + amt;
        return this.saveData();
    },

    withFromPlayer: function(steamID, amt) {
        if (typeof(UniAPI.PlayerData[steamID]) === "undefined") this.loadData(steamID);
        UniAPI.PlayerData[steamID].Account - amt;
        return this.saveData();
    },

    transferFunds: function(senderID, recieverID, amt) {

        if (this.Config.fees) {
            var diff = amt * this.Config.fees;
            amt = amt - diff;
        }

        if (typeof(UniAPI.PlayerData[senderID]) === "undefined" || typeof(UniAPI.PlayerData[recieverID]) === "undefined") {
            this.loadData(senderID);
            this.loadData(recieverID);
        }

        if (UniAPI.PlayerData[senderID].Account >= amt) {
            UniAPI.PlayerData[senderID].Account -= amt;
            UniAPI.PlayerData[recieverID].Account += amt;
        }
        return this.saveData();
    },

    testAPI: function(test) {
        if (test) {
            return print(this.Status);
        }
        return false;
    }
}


var UniAPI = {
    Title: "Universal Economics",
    Author: "Killparadise",
    Version: V(1, 0, 0),
    Init: function() {
        global = importNamespace("");
        this.getData();

        API = new API();
        command.AddChatCommand("uni", this.Plugin, "uniEconSwitch");
        command.AddConsoleCommand("uni.eco", this.Plugin, "C_Eco");
        msgs = this.Config.Messages;
        prefix = this.Config.Prefix;
    },

    OnServerInitialized: function() {
        print(this.Title + " is booting up... Welcome aboard.");
        if (this.Config.firstBootup) {
            print("Running First Boot, getting current player list...");
            var list = global.BasePlayer.activePlayerList.GetEnumerator();
            while (list.MoveNext()) {
                this.loadData(list.Current);
            }
            this.Config.firstBootup = false;
            this.SaveConfig();
            print("Done building getting list. Data Built.");
        }
    },

    OnPlayerInit: function(player) {
        this.loadData(player);
    },

    registerPermissions: function() {
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

    LoadDefaultConfig: function() {
        this.Config.firstBootup = true;
        this.Config.Settings = {
            "starterBalance": 500,
            "fees": 0.05,
            "currency": "$",
            "currencyName": "Dollar",
            "lossWhenKilled": true,
            "lossOnKilledByAnimal": 0.20,
            "lossOnKilledByPlayer": 0.35,
            "timerOnDeposit": true,
            "timerLength": 120
        };

        this.Config.Prefix = "UniEconomics";

        this.Config.Messages = {
            "bal": "Your current balance is: ",
            "wal": "Your current Wallet balance is: ",
            "transGood": "Transferred Funds Successfully",
            "setGood": "Added funds Successfully.",
            "setBad": "Failed to set player funds.",
            "deposit": "Deposited {result}.",
            "withdrawl": "Withdraw {result}",
            "noFunds": "Not Enough funds...",
            "noArgs": "Incorrect Args sent...",
            "setCmpl": "Set players funds successfully",
            "adminFunds": "{cmd} Funds successfully.",
            "plsWait": "Depositing Fund, Please wait...",
            "loss": "<color=red>You were killed and lost {amount}</color>",
            "gain": "<color=green>You've picked {amount} from the body.</color>"
        };

        this.Config.Permissions = {
            "set": "canSet",
            "add": "canAddFunds",
            "rem": "canRemFunds"
        }
    },

    getData: function() {
        UniAPI = data.GetData("UniAPI");
        UniAPI = UniAPI || {};
        UniAPI.PlayerData = UniAPI.PlayerData || {};
    },

    loadData: function(player) {
        var steamID = rust.UserIDFromPlayer(player);
        UniAPI.PlayerData[steamID] = UniAPI.PlayerData[steamID] || {};
        UniAPI.PlayerData[steamID].Name = UniAPI.PlayerData[steamID].Name || player.displayName;
        UniAPI.PlayerData[steamID].Account = UniAPI.PlayerData[steamID].Account || this.Config.Settings.starterBalance;
        UniAPI.PlayerData[steamID].Wallet = UniAPI.PlayerData[steamID].Wallet || 0;
        this.saveData();
    },

    saveData: function() {
        data.SaveData("UniAPI");
    },

    uniEconSwitch: function(player, cmds, args) {
        var steamID = rust.UserIDFromPlayer(player);
        if (permission.PermissionExists(this.Config.Permissions[args[0]])) var allowed = this.hasPermission(player, this.Config.Permissions[args[0]]);
        switch (args[0]) {
            case "with":
                this.withdrawl(player, cmds, args);
                break;
            case "dep":
                this.deposit(player, cmds, args);
                break;
            case "set":
                if (allowed) this.setBal(player, cmds, args);
                break;
            case "tran":
                this.transfer(player, cmds, args);
                break;
            case "add":
                if (allowed) this.addFunds(player, cmds, args);
                break;
            case "rem":
                if (allowed) this.remFunds(player, cmds, args);
                break;
            default:
                rust.SendChatMessage(player, "UniEcon", msgs.bal + "<color=green>" + this.Config.Settings.currency + UniAPI.PlayerData[steamID].Account + "</color>", "0");
                rust.SendChatMessage(player, "UniEcon", msgs.wal + "<color=green>" + this.Config.Settings.currency + UniAPI.PlayerData[steamID].Account + "</color>", "0");
                break;
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
                var target = this.findPlayer(getPlayer);
                print("Player: " + UniAPI.PlayerData[target[1]].Name + "\nBalance: " + UniAPI.PlayerData[target[1]].Account + "\nWallet: " + UniAPI.PlayerData[target[1]].Wallet);
            case "set":
                var getplayer = arg.GetString(1, "");
                var target = this.findPlayer(getPlayer);
                this.setBal(target[0], null, arg);
        }
    },

    findPlayer: function(playerName) {
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

    OnEntityDeath: function(entity, hitinfo) {
        var victim = entity,
            attacker = hitinfo.Initiator;
        if (!victim.ToPlayer() || victim === null) return false;
        var victimID = rust.UserIDFromPlayer(victim),
            if (attacket.ToPlayer() !== null) attackerID = rust.UserIDFromPlayer(attacker);

        if (this.Config.Settings.lossWhenKilled) {
            if (UniAPI.PlayerData[victimID].Account + 150 > this.Config.starterBalance && attackerID) {
                var loss = UniAPI.PlayerData[victimID].Account * this.Config.Settings.lossOnKilledByPlayer;
                UniAPI.PlayerData[victimID].Account -= loss;
                victim.ChatMessage(msgs.loss.replace("{amount}", this.Config.Settings.currency + loss));
                UniAPI.PlayerData[attackerID].Account += loss;
                attacker.ChatMessage(msgs.gain.replace("{amount}", this.Config.Settings.currency + loss));
            } else if (UniAPI.PlayerData[victimID].Account + 150 > this.Config.starterBalance && !attackerID && this.Config.Settings.lossOnKilledByAnimal > 0) {
                var loss = UniAPI.PlayerData[victimID].Account * this.Config.Settings.lossOnKilledByAnimal;
                UniAPI.PlayerData[victimID].Account -= loss;
                victim.ChatMessage(msgs.loss.replace("{amount}", this.Config.Settings.currency + loss));
            }
        }
        return false;
    },

    transfer: function(player, cmd, args) {
        // setup: /uni tran playername amount
        var steamID = rust.UserIDFromPlayer(player);
        var P1currBal = UniAPI.PlayerData[steamID].Account;
        if (args.length >= 2) {
            var getPlayer = this.findPlayer(arg[1]);
            var P2currBal = UniAPI.PlayerData[getPlayer[1]].Account;
            var getAmount = Number(args[2]);
        } else {
            rust.SendChatMessage(player, "UniEcon", msgs.noArgs, "0");
        }

        if (this.Config.fees) {
            var diff = getAmount * this.Config.fees;
            getAmount = getAmount - diff;
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
        var currBal = UniAPI.PlayerData[steamID].Account,
            amt = Number(args[1]);
        if (args.length === 2 && UniAPI.PlayerData[steamID].Wallet >= amt) {
            player.ChatMessage(msgs.plsWait);

            if (this.Config.Settings.timerOnDeposit) {
                timer.Once(this.Config.Settings.timerLength, function() {
                    UniAPI.PlayerData[steamID].Account += amt;
                    UniAPI.PlayerData[steamID].Wallet -= amt;
                    rust.SendChatMessage(player, "UniEcon", msgs.deposit.replace("{result}", "Successful"), "0");
                }, this.Plugin);
            } else {
                UniAPI.PlayerData[steamID].Account += amt;
                UniAPI.PlayerData[steamID].Wallet -= amt;
                rust.SendChatMessage(player, "UniEcon", msgs.deposit.replace("{result}", "Successful"), "0");
            }
        } else if (UniAPI.PlayerData[steamID].Wallet < amt) {
            rust.SendChatMessage(player, "UniEcon", msgs.noFunds, "0");
            return false;
        } else {
            rust.SendChatMessage(player, "UniEcon", msgs.deposit.replace("{result}", "Unsuccessful"), "1");
            return false;
        }
        this.saveData();
    },

    withdrawl: function(player, cmd, args) {
        var steamID = rust.UserIDFromPlayer(player);
        var currBal = UniAPI.PlayerData[steamID].Account;
        var amt = Number(args[1]);
        if (args.length === 2 && currBal >= Number(args[1])) {
            UniAPI.PlayerData[steamID].Wallet += amt;
            UniAPI.PlayerData[steamID].Account -= amt;
            rust.SendChatMessage(player, "UniEcon", msgs.withdraw.replace("{result}", "Successful"), "0");
        } else if (currBal < Number(args[1])) {
            rust.SendChatMessage(player, "UniEcon", msgs.noFunds, "0");
        } else {
            rust.SendChatMessage(player, "UniEcon", msgs.withdraw.replace("{result}", "Unsuccessful"), "1");
        }
        this.saveData();
        return false;
    },

    setBal: function(player, cmd, args) {
        if (args.length === 3) {
            var getPlayer = this.findPlayer(args[1]);
            var amt = Number(args[2]);
            UniAPI.PlayerData[getPlayer[1]].Account = amt;
            player.ChatMessage(msgs.adminFunds.replace("{cmd}", "Added"));
        } else {
            player.ChatMessage(msgs.noArgs);
        }
        this.saveData();
    },

    addFunds: function(player, cmd, args) {
        if (args.length === 3) {
            var getPlayer = this.findPlayer(args[1]);
            var amt = Number(args[2]);
            UniAPI.PlayerData[getPlayer[1]].Account += amt;
            player.ChatMessage(msgs.adminFunds.replace("{cmd}", "Added"));
        } else {
            player.ChatMessage(msgs.noArgs);
        }
        this.saveData();
    },

    remFunds: function(player, cmd, args) {
        if (args.length === 3) {
            var getPlayer = this.findPlayer(args[1]);
            var amt = Number(args[2]);
            UniAPI.PlayerData[getPlayer[1]].Account -= amt;
            player.ChatMessage(msgs.adminFunds.replace("{cmd}", "Removed"));
        } else {
            player.ChatMessage(msgs.noArgs);
        }
        this.saveData();
    },
}
