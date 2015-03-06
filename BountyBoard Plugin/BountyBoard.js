var BountyBoard = {
    Title: "Bounty Board",
    Author: "Killparadise",
    Version: V(0, 1, 0),
    HasConfig: true,
    Init: function() {
        try {
        GetEconomy = plugins.Find('00-Economics');
        if (GetEconomy) {
            print("Found Economics")
            EconAPI = GetEconomyAPI()
            print(EconomyAPI)
        } else {
            print("Economics not found!");
        }
    } catch(e) {
        print(e.message.toString());
        print(GetEconomy)
    }
        this.getData();
    },
    OnServerInitialized: function() {
        print(this.Title + " Is now loading, please wait...");
        msgs = this.Config.Messages;
        command.AddChatCommand("bounty", this.Plugin, "cmdBounty");
    },

    LoadDefaultConfig: function() {
        this.Config.authLevel = 2;
        this.Config.Settings = {
            "canSetBounties": true,
            "autoBounties": true,
            "maxBounty": 100000,
            "killsTillNemisis": 5
        };

        this.Config.Messages = {
            "curBounty": "The Current Bounty on your head is: ",
            "curNem": "Your current Nemesis is: ",
            "invSyn": "Syntax Invalid, Please try again.",
            "noBty": "Target has no Bounty!",
            "setTar": "Target set. Happy Hunting.",
            "setTrgWarn": " Made you his target! Watch out!",
            "curTar": "Your current target is: ",
            "offline": "That Player is currently offline."
        };
    },

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

    OnPlayerInit: function(player) {
        this.checkPlayerData(player);
    },

    getData: function() {
        BountyData = data.GetData('Bounty');
        BountyData = BountyData || {};
        BountyData.PlayerData = BountyData.PlayerData || {};
        BountyData.BgData = BountyData.BgData || {};
        this.saveData();
    },

    saveData: function() {
        data.SaveData('Bounty');
    },

    checkPlayerData: function(player) {
        var steamID = rust.UserIDFromPlayer(player);
        var authLvl = player.net.connection.authLevel;
        BountyData.PlayerData[steamID] = BountyData.PlayerData[steamID] || {};
        BountyData.PlayerData[steamID].Nemesis = BountyData.PlayerData[steamID].Nemesis || "";
        BountyData.PlayerData[steamID].Target = BountyData.PlayerData[steamID].Target || "";
        BountyData.PlayerData[steamID].Bounty = BountyData.PlayerData[steamID].Bounty || 0;
        BountyData.PlayerData[steamID].Kills = BountyData.PlayerData[steamID].Kills || 0;
        BountyData.PlayerData[steamID].Deaths = BountyData.PlayerData[steamID].Deaths || 0;
        BountyData.PlayerData[steamID].isStaff = BountyData.PlayerData[steamID].isStaff || (authLvl > 0) || false;
        this.saveData();
    },

    cmdBounty: function(player, cmd, args) {
        var steamID = rust.UserIDFromPlayer(player);
        switch (args[0]) {
            case "add":
                this.addBounty(player, cmd, args);
                break;
            case "check":
                this.checkBoard(player, cmd, args);
                break;
            case "target":
                this.setTarget(player, cmd, args);
                break;
            case "nemesis":
                this.setNemesis(player, cmd, args);
                break;
            case "reset":
                if (authLvl >= this.Config.authLevel) {
                    this.resetData(player, cmd, args);
                } else if (authLvl < this.Config.authLevel) {
                    rust.SendChatMessage(player, "Titles", msgs.noPerms, "0");
                    return false;
                } else {
                    rust.SendChatMessage(player, "Titles", msgs.badSyntaxRank, "0");
                    return false;
                }
            default:
                rust.SendChatMessage(player, "BountyBoard", "The current Bounty on your head is: " + BountyData.PlayerData[steamID].Bounty, "0");
                break;
        }
    },

    addBounty: function(player, cmd, args) {
        try {
        var steamID = rust.UserIDFromPlayer(player);
        EconomyData = EconomyAPI.GetUserDataFromPlayer(player);
        EconomyData = EconomyAPI.GetUserData(steamID);
        var authLvl = player.net.connection.authLevel;
        if (this.Config.canSetBounties && !BountyData.PlayerData[steamID].isStaff) {
            if (args[0] === "add" && args.length === 3) {
                var target = args[2].ToPlayer();
                var amount = args[3];
                var targetID = rust.UserIDFromPlayer(target);
                if (targetID.length && amount < this.Config.Settings.maxBounty) {
                    if (EconomyData.Withdraw(amount)) {
                        BountyData.PlayerData[targetID].Bounty = amount;
                        rust.SendChatMessage(player, "BountyBoard", "Set " + amount + " On player: " + target, "0");
                        rust.SendChatMessage(target, "BountyBoard", "Someone placed a " + amount + " Bounty on you!", "0");
                        this.updateBoard(target, amount, targetID);
                    } else {
                        rust.SendChatMessage(player, "BountyBoard", "You don't have enough funds!", "0");
                    }
                } else if (amount > this.Config.maxBounty) {
                    rust.SendChatMessage(player, "BountyBoard", "You canot exceed the set max bounty: " + this.Config.Settings.maxBounty, "0");
                } else if (!targetID.length) {
                    rust.SendChatMessage(player, "BountyBoard", "Invalid Player name, please try again.", "0");
                } else {
                    rust.SendChatMessage(player, "BountyBoard", "Invalid Syntax please use: /bounty add playername amount", "0");
                }
            }
        } else {
            rust.SendChatMessage(player, "BountyBoard", "Sorry this is disabled currently!", "0");
        }
    } catch(e) {
        print(e.message.toString())
    }
    },

    updateBoard: function(target, amount, targetID) {
        //TODO: update the bounty board with new bounties and claimed bounties.
        BountyData.Bounties[targetID].Amount = amount;
        this.saveData();
        EconomyData.SaveData();
    },

    checkBoard: function(player, cmd, args) {
        rust.SendChatMessage(player, "", "------Bounty Board------", "0");
        for (var i = 0; i < BountyData.Bounties.length; i++) {
            if (BountyData.Bounties[i].Amount > 0) {
                rust.SendChatMessage(player, "", BountyData.Bounties[i].Target + ": $" + BountData.Bounties[i].Amount, "0");
            }
        }
        rust.SendChatMessage(player, "", "------Happy Hunting------", "0");
    },

    setTarget: function(player, cmd, args) {
        if (args.length === 2) {
            var pName = this.findPlayerByName(args[1]);
            var steamID = rust.UserIDFromPlayer(player);
        } else if (args.length === 1) {
            rust.SendChatMessage(player, "BountyBoard", msgs.curTar, "0");
        } else {
            rust.SendChatMessage(player, "BountyBoard", msgs.invSyn, "0");
        }

        if (pName[0].displayName !== player.displayName && BountyData.PlayerData[pName[1]].Bounty > 0 && pName[0].IsConnected()) {
            BountyData.PlayerData[steamID].Target = pName[0].displayName;
            rust.SendChatMessage(player, "BountyBoard", msgs.setTar, "0");
            rust.SendChatMessage(pName[0], "BountyBoard", player.displayName + msgs.setTrgWarn, "0");
        } else if (!pName[0].IsConnected()) {
            rust.SendChatMessage(player, "BountyBoard", msgs.offline, "0");
        } else {
            rust.SendChatMessage(player, "BountyBoard", msgs.noBty, "0");
        }
    },

    setNemesis: function(player, cmd, args) {

    },

    resetData: function(player, cmd, args) {

    },

    OnEntityDeath: function(entity, hitinfo) {
        var victim = entity;
        var attacker = hitinfo.Initiator;
        attacker = attacker.ToPlayer();
        var victimID = rust.UserIDFromPlayer(victim), attackerID = rust.UserIDFromPlayer(attacker);
        var EconomyData = EconomyAPI.GetUserDataFromPlayer(player);
        var EconomyData = EconomyAPI.GetUserData(attackerID);
        if (victim.indexOf('BasePlayer') > -1 && BountyData.Bounties[victimID].Amount > 0) {
            var victimID = rust.UserIDFromPlayer(victim)
            EconomyData.Deposit(BountyData.Bounties[victimID].Amount);
            rust.BroadcastChat("BountyBoard", attack.DisplayName + " Has claimed the bounty on " + victim.DisplayName + " In the Amount of: " + BountyData.Bounties[victimID].Amount)
            EconomyData.SaveData();
            this.updateBoard(victim, 0, victimID);
        }
    }
}
