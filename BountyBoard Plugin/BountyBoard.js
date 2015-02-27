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
        command.AddChatCommand("bounty", this.Plugin, "cmdBounty");
    },

    LoadDefaultConfig: function() {
        this.Config.authLevel = 2;
        this.Config.Settings = {
            "canSetBounties": true,
            "autoBounties": true,
            "maxBounty": 100000
        };
    },

    OnPlayerInit: function(player) {
        this.checkPlayerData(player);
    },

    getData: function() {
        BountyData = data.GetData('Bounty');
        BountyData = BountyData || {};
        BountyData.Bounties = BountyData.Bounties || {};
        BountyData.PlayerData = BountyData.PlayerData || {};
        this.saveData();
    },

    saveData: function() {
        data.SaveData('Bounty');
    },

    checkPlayerData: function(player) {
        var steamID = rust.UserIDFromPlayer(player);
        var authLvl = player.net.connection.authLevel;
        BountyData.PlayerData[steamID] = BountyData.PlayerData[steamID] || {};
        BountyData.PlayerData[steamID].Bounty = BountyData.PlayerData[steamID].Bounty || 0;
        BountyData.PlayerData[steamID].Kills = BountyData.PlayerData[steamID].Kills || 0;
        BountyData.PlayerData[steamID].Deaths = BountyData.PlayerData[steamID].Deaths || 0;
        BountyData.PlayerData[steamID].isStaff = BountyData.PlayerData[steamID].isStaff || (authLvl > 0) || false;
        BountyData.Bounties[steamID].Target = BountyData.Bounties[steamID].Target || player.DisplayName || "";
        BountyData.Bounties[steamID].Amount = BountyData.Bounties[steamID].Amount || 0;
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
                        rust.SendChatMessage(target, "BountyBoard", "Someone place a " + amount + " Bounty on you!", "0");
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
