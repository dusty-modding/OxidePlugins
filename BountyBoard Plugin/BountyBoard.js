var BountyBoard = {
    Title: "Bounty Board",
    Author: "Killparadise",
    Version: V(1, 0, 0),
    HasConfig: true,
    Init: function() {
        try {
        GetEconomy = plugins.Find('00-Economics');
        if (GetEconomy) {
            print("Found Economics")
            EconAPI = Econ.Call("GetEconomyAPI", null)
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
        msgs = this.Config.Messages;
        command.AddChatCommand("bounty", this.Plugin, "cmdBounty");
    },

    LoadDefaultConfig: function() {
        this.Config.authLevel = 2;
        this.Config.Settings = {
            "canSetBounties": true,
            "autoBounties": true,
            "maxBounty": 100000,
            "targetModifier": 2,
            "staffCollect": false
        };

        this.Config.Messages = {
            "curBounty": "The Current Bounty on your head is: ",
            "invSyn": "Syntax Invalid, Please try again.",
            "noBty": "Target has no Bounty!",
            "setTar": "Target set. Happy Hunting.",
            "setTrgWarn": " Made you his target! Watch out!",
            "curTar": "Your current target is: ",
            "offline": "That Player is currently offline.",
            "btyClaim": "{plyrName} has taken the bounty of {btyAmt} from {deadPlyr}!",
            "staff": "Sorry, Staff cannot collect Bounties from slain players.".
            "btyPlaced": "Someone placed a "
        };
    },

    OnPlayerInit: function(player) {
        this.checkPlayerData(player);
    },

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
                rust.SendChatMessage(player, prefix.titles, msgs.NoPlyrs, "0");
                return false;
            }
        } catch (e) {
            print(e.message.toString());
        }
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
        BountyData.PlayerData[steamID].Target = BountyData.PlayerData[steamID].Target || "";
        BountyData.PlayerData[steamID].Bounty = BountyData.PlayerData[steamID].Bounty || 0;
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
        EconomyData = EconAPI.GetUserData(steamID);
        var authLvl = player.net.connection.authLevel;
        if (this.Config.canSetBounties && !BountyData.PlayerData[steamID].isStaff) {
            if (args[0] === "add" && args.length === 3) {
                var target = this.findPlayerByName(args[2]);
                var amount = args[3];
                var targetID = rust.UserIDFromPlayer(target);
                if (targetID.length && amount <= this.Config.Settings.maxBounty) {
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

    updateBoard: function(targetID, amount) {
        //TODO: update the bounty board with new bounties and claimed bounties.
        var EconAPI = EconAPI.GetUserData(targetID);
        BountyData.PlayerData[targetID].Amount = amount;
        this.saveData();
        EconAPI.SaveData();
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

    OnEntityDeath: function(entity, hitinfo) {
        var victim = entity;
        var attacker = hitinfo.Initiator;

        if (victim.ToPlayer() && attacker.ToPlayer() && victim.displayName !== attacker.displayName) {
        var victimID = rust.UserIDFromPlayer(victim), attackerID = rust.UserIDFromPlayer(attacker);
        var EconAPI = EconAPI.GetUserData(attackerID);
        if (BountyData.PlayerData[victimID] === undefined) {
            print("Data File not found for Victim, attempting build now...");
            return this.checkPlayerData(victim);
        } else if (BountyData.PlayerData[attakerID] === undefined) {
            print("Data File not found for Attacker, attempting build now...");
            return this.checkPlayerData(attacker);
        }

        if (BountyData.PlayerData[attackerID].isStaff && !this.Config.Settings.staffCollect) {
            rust.SendChatMessage(player, "BountyBoard", msgs.staff, "0");
            return false;
        }

        if (BountyData.PlayerData[victimID].Bounty > 0 && BountyData.PlayerData[attackerID].Target === victim.displayName && victim.displayName !== attacker.displayName) {
            EconAPI.Deposit(BountyData.PlayerData[victimID].Bounty * targetModifier);
            var rpObj = {plyrName: attacker.displayName, btyAmt: BountyData.PlayerData[victimID].Bounty * targetModifier, deadPlyr: victim.displayName} 
            rust.SendChatMessage(player, "BountyBoard", msgs.btyClaim.replace(/plyrName|btyAmt|deadPlyr|/g, function(matched){return rpObj[matched]}), "0");
            BountyData.PlayerData[victimID].Bounty = 0;
            this.updateBoard(victimID, BountyData.PlayerData[victimID].Bounty);
        }

    } else if (victim.ToPlayer() && victim.displayName === attacker.displayName) {
        return false;
    }
    }
}
