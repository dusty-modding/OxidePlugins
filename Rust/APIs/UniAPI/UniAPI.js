/**
 * Universal Economincs Tutorial:
 *
 * This Plugin is an API based Economy builder
 * This plugin supports: Python, C#, Lua, JS
 * All information travels through JSON to make this possible
 *
 * User:
 *     No need for you to do any modifications here, please stick to the config
 *
 * Developers: 
 *     In order to use the API functionality of Universal Economics, first call UniAPI into your plugin
 *     var UniAPI = plugin.Find("UniAPI");
 *     -- Then you can plug into the API prototype like so:
 *     var UniAPI = UniAPI.API;
 *     This will plug you directly into the API portion of the prototype without needing to pull
 *     the rest of the object.
 *     Now you can make a call to any of the API functionality you need:
 *     var pBalance = UniAPI.Call("getPlayerBal", steamID);
 *     this will return the players current balance as a Number for you to use.
 *     See the docs above each API function to see what they do.
 */

function API() {
    this.Status = "Active";
};

API.prototype = {

    /**
     * Returns the requested players balance, uses steamID to traverse data files
     * @method   getPlayerBal
     * @memberOf UniAPI
     * @param    {String}          steamID [Requested players steam ID]
     * @return   {Number}                  [Returns a Number from the data JSON]
     */
    getPlayerBal: function(steamID) {
        if (typeof(UniEcon.PlayerData[steamID]) === "undefined") this.loadData(steamID);
        return UniEcon.PlayerData[steamID].Account;
    },

    /**
     * Returns the requested players current Wallet balance, using steam ID
     * @method   getPlayerWallet
     * @memberOf UniAPI
     * @param    {String}          steamID [Requested players steam ID]
     * @return   {Number}                  [Returns a Number from the data JSON]
     */
    getPlayerWallet: function(steamID) {
        if (typeof(UniEcon.PlayerData[steamID]) === "undefined") this.loadData(steamID);
        return UniEcon.PlayerData[steamID].Wallet;
    },

    /**
     * Set the Requested players balance and then returns the balance.
     * @method   setPlayerBal
     * @memberOf UniAPI
     * @param    {String}          steamID [Requested players steam ID]
     * @return   {Number}                  [Returns a Number from the data JSON]
     */
    setPlayerBal: function(steamID, amt) {
        if (typeof(UniEcon.PlayerData[steamID]) === "undefined") this.loadData(steamID);
        UniEcon.PlayerData[steamID].Account = amt;
        this.saveData();
        return UniEcon.PlayerData[steamID].Account;
    },

    /**
     * Set the Requested players wallet and then returns the wallet.
     * @method   setPlayerWal
     * @memberOf UniAPI
     * @param    {String}          steamID [Requested players steam ID]
     * @return   {Number}                  [Returns a Number from the data JSON]
     */
    setPlayerWal: function(steamID, amt) {
        if (typeof(UniEcon.PlayerData[steamID]) === "undefined") this.loadData(steamID);
        UniEcon.PlayerData[steamID].Wallet = amt;
        this.saveData();
        return UniEcon.PlayerData[steamID].Wallet;
    },

    /**
     * Deposits the given amount into the players balance
     * @method   depToPlayer
     * @memberOf UniAPI
     * @param    {String}          steamID [Requested players steam ID]
     * @param    {Number}          amt     [Amount to deposit into the balance]
     * @return   {Number}                  [Returns the balance after depositing the amount]
     */
    depToPlayer: function(steamID, amt) {
        if (typeof(UniEcon.PlayerData[steamID]) === "undefined") this.loadData(steamID);
        UniEcon.PlayerData[steamID].Account += Number(amt);
        this.saveData();
        return UniEcon.PlayerData[steamID].Account;
    },

    /**
     * Withdraws the given amount from the players balance
     * @method   withFromPlayer
     * @memberOf UniAPI
     * @param    {String}          steamID [Requested players steam ID]
     * @param    {Number}          amt     [Amount to withdraw from the balance]
     * @return   {Number}                  [Returns the balance after withdrawing the amount]
     */
    withFromPlayer: function(steamID, amt) {
        if (typeof(UniEcon.PlayerData[steamID]) === "undefined") this.loadData(steamID);
        UniEcon.PlayerData[steamID].Account -= amt;
        this.saveData();
        return UniEcon.PlayerData[steamID].Account;
    },

    /**
     * Transfers the given amount from one player to another
     * @method   transferFunds
     * @memberOf UniAPI
     * @param    {String}          senderID   [Senders SteamID]
     * @param    {String}          recieverID [Recievers SteamID]
     * @param    {Number}          amt        [Amount of funds to transfer]
     * @return   {Boolean}                     [Returns true or false if transfer completed]
     */
    transferFunds: function(senderID, recieverID, amt) {

        if (this.Config.fees) {
            var diff = amt * this.Config.fees;
            amt = amt - diff;
        }

        if (typeof(UniEcon.PlayerData[senderID]) === "undefined" || typeof(UniEcon.PlayerData[recieverID]) === "undefined") {
            this.loadData(senderID);
            this.loadData(recieverID);
        }

        if (UniEcon.PlayerData[senderID].Account >= amt) {
            UniEcon.PlayerData[senderID].Account -= amt;
            UniEcon.PlayerData[recieverID].Account += amt;
            this.saveData();
            return true;
        }

        return false;
    },

    /**
     * Debug Test Calls to API for purposes of multi-language support
     * @method   testAPI
     * @memberOf UniAPI
     * @param    {Boolean}          test [Execute trigger]
     * @return   {String/Boolean}               [Returns either the API status, or false]
     */
    testAPI: function(test) {
        if (test) {
            return print(this.Status);
        }
        return false;
    }
};

var UniAPI = {
        Title: "Universal API",
        Author: "KillParadise",
        Version: V(1, 0, 0),
        API: new API();
        global = importNamespace(""),
        this.msgs = UniAPI.Config.Messages,
        this.prefix = UniAPI.Config.Prefix,
        depositing = {};
        Init: function() {

            this.getData();
            command.AddChatCommand("uni", this.Plugin, "uniEconSwitch");
            command.AddConsoleCommand("uni.eco", this.Plugin, "C_Eco");
        },

        OnServerInitialized: function() {
            print(this.Title + " is loading... ");
            if (this.Config.firstBootup) {
                var list = global.BasePlayer.activePlayerList.GetEnumerator(),
                    while (list.MoveNext()) {
                        this.loadData(list.Current);
                    }
                this.SaveConfig();
            }
        },

        OnPlayerInit: function(player) {
            var steamID = rust.UserIDFromPlayer(player);
            this.loadData(player);
            depositing[steamID] = false;
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
            rust.SendChatMessage(player, this.prefix, this.msgs.noPerms, "0");
            return false;
        },

        updateConfig: function() {
            if (this.Config.Version !== "1.0.0") {
                print("Config Update Found... Updating");
                this.LoadDefaultConfig();
                this.Config.Version === "1.0.0";
                print("Update Finished. Updated to: v1.0.0");
            }
        },

        LoadDefaultConfig: function() {
            this.Config.firstBootup = this.Config.firstBootup || true;
            this.Config.Settings = {
                "starterBalance": 500,
                "fees": 0.05,
                "currency": "$",
                "currencyName": "Dollar",
                "lossWhenKilled": true,
                "lossWhenSuicide": false,
                "lossOnKilledByAnimal": 0.20,
                "lossOnKilledByPlayer": 0.35,
                "lossOnSuicide": 400,
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
                "gain": "<color=green>You've picked {amount} from the body.</color>",
                "depCancel": "<color=red>Deposit canceled.</color>",
                "clearSuc": "Successfully Cleared {data}",
                "info": "<color=Orange>Transfer Fee: </color>{fee}\n<color=Orange>Killed by Animal Loss: </color>{aloss}\n < color = Orange > Killed by Player Loss: < /color>{ploss}\n<color=Orange>Loss on Suicide:</color > {
                sloss
            }
            "
        };
        this.Config.Permissions = {
            "set": "uniCanSet",
            "add": "uniCanAddFunds",
            "rem": "uniCanRemFunds",
            "clr": "uniCanClearData",
            "staff": "isStaff"
        };
        this.Config.Help = [
            "/uni with amount - Withdraw a certain amount from Account to your Wallet.",
            "/uni dep amount - Deposit a certain amount from Wallet to your Account.",
            "/uni tran player amt - Transfer amount to another player."
        ];
        this.Config.adminHelp = [
            "/uni set player amt - Sets the chosen players Account balance to entered amount",
            "/uni add player amt - Adds funds to the chosen players Account balance",
            "/uni rem player amt - Removes funds from the chosen players Account balance",
            "/uni clr <all> - Clears data from the data file, use 'all' to clear all data or leave blank to clear only depositing"
        ];
    },

    getData: function() {
        UniEcon = data.GetData("UniEcon");
        UniEcon = UniEcon || {};
        UniEcon.PlayerData = UniEcon.PlayerData || {};
    },

    loadData: function(player) {
        var steamID = rust.UserIDFromPlayer(player);
        UniEcon.PlayerData[steamID] = UniEcon.PlayerData[steamID] || {};
        UniEcon.PlayerData[steamID].Name = UniEcon.PlayerData[steamID].Name || player.displayName;
        UniEcon.PlayerData[steamID].Account = UniEcon.PlayerData[steamID].Account || this.Config.Settings.starterBalance;
        UniEcon.PlayerData[steamID].Wallet = UniEcon.PlayerData[steamID].Wallet || 0;
        this.saveData();
    },

    saveData: function() {
        data.SaveData("UniEcon");
    },

    clearDepositing: function(args) {
        if (args[1] === "all") {
            delete UniEcon.PlayerData;
            UniEcon.PlayerData = {};
            depositing = {};
            player.ChatMessage(this.msgs.clearSuc.replace("{data}", "all data"));
        } else {
            depositing = {};
            player.ChatMessage(this.msgs.clearSuc.replace("{data}", "depositing data"));
        }
        return false;
    },

    uniEconSwitch: function(player, cmds, args) {
        var steamID = rust.UserIDFromPlayer(player),
            allowed = false;
        if (permission.PermissionExists(this.Config.Permissions[args[0]])) allowed = this.hasPermission(player, this.Config.Permissions[args[0]]);
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
            case "clr":
                if (allowed) this.clearDepositing(args);
                break;
            case "help":
                this.uniHelp(player, cmds, args);
            case "info":
                this.sendInfo(player, cmds, args);
            default:
                rust.SendChatMessage(player, "UniEcon", this.msgs.bal + "<color=green>" + this.Config.Settings.currency + UniEcon.PlayerData[steamID].Account + "</color>", "0");
                rust.SendChatMessage(player, "UniEcon", this.msgs.wal + "<color=green>" + this.Config.Settings.currency + UniEcon.PlayerData[steamID].Account + "</color>", "0");
                break;
        }
    },

    sendInfo: function(player, cmds, args) {
        var rObj = {
            fee: (this.Config.Settings.fees * 100).toString() + "%",
            aloss: (this.Config.Settings.lossOnKilledByAnimal * 100).toString() + "%",
            ploss: (this.Config.Settings.lossOnKilledByPlayer * 100).toString() + "%",
            sloss: (this.Config.Settings.lossOnSuicide * 100).toString() + "%"
        }
        player.ChatMessage("<size=18><color=#FF4D4D>Universal Economics Info</color></size>");
        player.ChatMessage(this.msgs.info.replace(/\{fees\}|\{aloss\}|\{ploss\}|\{sloss\}/g, function(match) {
            return rObj[match];
        }));
    },

    //Console check on economy status
    C_Eco: function(arg) {
        //TODO: yeah do something to send console an economy update.
        var cmd = arg.GetString(0, ""),
            getPlayer, target;
        switch (cmd) {
            case "save":
                this.saveData();
                print("UniAPI Saved Successfully!");
                break;
            case "balance":
                getplayer = arg.GetString(1, "");
                target = this.findPlayer(getPlayer);
                print("Player: " + UniEcon.PlayerData[target[1]].Name + "\nBalance: " + UniEcon.PlayerData[target[1]].Account + "\nWallet: " + UniEcon.PlayerData[target[1]].Wallet);
                break;
            case "set":
                getplayer = arg.GetString(1, "");
                target = this.findPlayer(getPlayer);
                this.setBal(target[0], arg);
                break;
            case "clr":
                this.clearDepositing(arg[1]);
                break;
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
            loss = 0;

        if (attacket.ToPlayer() !== null) attackerID = rust.UserIDFromPlayer(attacker);
        if (depositing[victimID]) this.cancelDeposit(victim, victimID);

        if (this.Config.Settings.lossWhenKilled) {
            if (UniEcon.PlayerData[victimID].Wallet > this.Config.starterBalance && attackerID) {
                loss = UniEcon.PlayerData[victimID].Wallet * this.Config.Settings.lossOnKilledByPlayer;
                UniEcon.PlayerData[attackerID].Wallet += loss;
                victim.ChatMessage(this.msgs.loss.replace("{amount}", this.Config.Settings.currency + loss));
                attacker.ChatMessage(this.msgs.gain.replace("{amount}", this.Config.Settings.currency + loss));
            } else if (UniEcon.PlayerData[victimID].Wallet > this.Config.starterBalance && attackerID === victimID && this.Config.Settings.lossWhenSuicide) {
                loss = this.Config.Settings.lossOnSuicide;
                victim.ChatMessage(this.msgs.loss.replace("{amount}", this.Config.Settings.currency + loss));
            } else if (UniEcon.PlayerData[victimID].Wallet > this.Config.starterBalance && !attackerID && this.Config.Settings.lossOnKilledByAnimal > 0) {
                loss = UniEcon.PlayerData[victimID].Wallet * this.Config.Settings.lossOnKilledByAnimal;
                victim.ChatMessage(this.msgs.loss.replace("{amount}", this.Config.Settings.currency + loss));
            }
            UniEcon.PlayerData[victimID].Wallet -= loss;
            this.saveData();
        }
        return false;
    },

    transfer: function(player, cmd, args) {
        var steamID = rust.UserIDFromPlayer(player);
        var P1currBal = UniEcon.PlayerData[steamID].Account,
            getPlayer, P2currBal, getAmount;
        if (args.length >= 2) {
            getPlayer = this.findPlayer(arg[1]);
            P2currBal = UniEcon.PlayerData[getPlayer[1]].Account;
            getAmount = Number(args[2]);
        } else {
            rust.SendChatMessage(player, "UniEcon", this.msgs.noArgs, "0");
        }

        if (this.Config.fees) {
            var diff = getAmount * this.Config.fees;
            getAmount = getAmount - diff;
        }

        if (getplayer && getAmount) {
            if (P1currBal >= getAmount) {
                var P1newBal = P1currBal - getAmount;
                var P2newBal = P2currBal + getAmount;
                UniEcon.PlayerData[steamID].Account = P1newBal;
                UniEcon.PlayerData[getPlayer[1]].Account = P2newBal;
                rust.SendChatMessage(player, "UniEcon", this.msgs.transGood, "0");
                rust.SendChatMessage(getPlayer[0], "UniEcon", this.msgs.transGood, "0");
            }
        }
        this.saveData();
    },

    deposit: function(player, cmd, args) {
        var steamID = rust.UserIDFromPlayer(player);
        var currBal = UniEcon.PlayerData[steamID].Account,
            amt = Number(args[1]);
        if (args.length === 2 && UniEcon.PlayerData[steamID].Wallet >= amt) {
            player.ChatMessage(this.msgs.plsWait);

            if (this.Config.Settings.timerOnDeposit) {
                depositing[steamID] = true;
                depositTimer = timer.Once(this.Config.Settings.timerLength, function() {
                    UniEcon.PlayerData[steamID].Account += amt;
                    UniEcon.PlayerData[steamID].Wallet -= amt;
                    depositing[steamID] = false;
                    rust.SendChatMessage(player, "UniEcon", this.msgs.deposit.replace("{result}", "Successful"), "0");
                }, this.Plugin);
            } else {
                UniEcon.PlayerData[steamID].Account += amt;
                UniEcon.PlayerData[steamID].Wallet -= amt;
                rust.SendChatMessage(player, "UniEcon", this.msgs.deposit.replace("{result}", "Successful"), "0");
            }
        } else if (UniEcon.PlayerData[steamID].Wallet < amt) {
            rust.SendChatMessage(player, "UniEcon", this.msgs.noFunds, "0");
            return false;
        } else {
            rust.SendChatMessage(player, "UniEcon", this.msgs.deposit.replace("{result}", "Unsuccessful"), "1");
            return false;
        }
        this.saveData();
    },

    cancelDeposit: function(player, steamID) {
        if (depositing[steamID] && depositTimer) {
            depositTimer.Destroy();
            depositing[steamID] = false;
            player.ChatMessage(this.msgs.depCancel);
        }
        return false;
    },

    withdrawl: function(player, cmd, args) {
        var steamID = rust.UserIDFromPlayer(player);
        var currBal = UniEcon.PlayerData[steamID].Account;
        var amt = Number(args[1]);
        if (args.length === 2 && currBal >= Number(args[1])) {
            UniEcon.PlayerData[steamID].Wallet += amt;
            UniEcon.PlayerData[steamID].Account -= amt;
            rust.SendChatMessage(player, "UniEcon", this.msgs.withdraw.replace("{result}", "Successful"), "0");
        } else if (currBal < Number(args[1])) {
            rust.SendChatMessage(player, "UniEcon", this.msgs.noFunds, "0");
        } else {
            rust.SendChatMessage(player, "UniEcon", this.msgs.withdraw.replace("{result}", "Unsuccessful"), "1");
        }
        this.saveData();
        return false;
    },

    setBal: function(player, args) {
        if (args.length === 3) {
            var getPlayer = this.findPlayer(args[1]);
            var amt = Number(args[2]);
            UniEcon.PlayerData[getPlayer[1]].Account = amt;
            player.ChatMessage(this.msgs.adminFunds.replace("{cmd}", "Set"));
        } else {
            player.ChatMessage(this.msgs.noArgs);
        }
        this.saveData();
    },

    addFunds: function(player, cmd, args) {
        if (args.length === 3) {
            var getPlayer = this.findPlayer(args[1]);
            var amt = Number(args[2]);
            UniEcon.PlayerData[getPlayer[1]].Account += amt;
            player.ChatMessage(this.msgs.adminFunds.replace("{cmd}", "Added"));
        } else {
            player.ChatMessage(this.msgs.noArgs);
        }
        this.saveData();
    },

    remFunds: function(player, cmd, args) {
        if (args.length === 3) {
            var getPlayer = this.findPlayer(args[1]);
            var amt = Number(args[2]);
            UniEcon.PlayerData[getPlayer[1]].Account -= amt;
            player.ChatMessage(this.msgs.adminFunds.replace("{cmd}", "Removed"));
        } else {
            player.ChatMessage(this.msgs.noArgs);
        }
        this.saveData();
    },

    uniHelp: function(player, cmd, args) {
        var i = 0,
            ii = 0,
            hlen = this.Config.Help.length,
            ahlen = this.Config.adminHelp.length;
        player.ChatMessage("<size=18><color=#FF4D4D>Universal Economics:</color></size>");
        for (; i < hlen; i++) {
            player.ChatMessage(this.Config.Help[i]);
        }
        player.ChatMessage("-----------------------------------------------------");
        if (permission.UserHasPermission("isStaff")) {
            for (; ii < ahlen; ii++) {
                player.ChatMessage(this.Config.adminHelp[ii]);
            }
        }
        player.ChatMessage("-----------------------------------------------------");
    }
};