var BountyBoard = {
    Title: "Bounty Board",
    Author: "Killparadise",
    Version: V(1, 0, 0),
    HasConfig: true,
    Init: function() {
        this.getData();
    },
    
    OnServerInitialized: function() {
        msgs = this.Config.Messages;
        prefix = this.Config.Prefix;
        command.AddChatCommand("bounty", this.Plugin, "cmdBounty");
    },

    LoadDefaultConfig: function() {
        this.Config.authLevel = 2;
        this.Config.Settings = {
            "canSetBounties": true,
            "autoBounties": true,
            "maxBounty": 100000,
            "targetModifier": 2,
            "staffCollect": false,
            "useEcon": false
        };

        this.Config.Prefix = "BountyBoard";

        this.Config.Messages = {
            "curBounty": "The Current Bounty on your head is: ",
            "invSyn": "Syntax Invalid, Please try again. {cmd}",
            "noBty": "Target has no Bounty!",
            "setTar": "Target set. Happy Hunting.",
            "setTrgWarn": " Made you his target! Watch out!",
            "curTar": "Your current target is: ",
            "offline": "That Player is currently offline.",
            "btyClaim": "{plyrName} has taken the bounty of {btyAmt} from {deadPlyr}!",
            "staff": "Sorry, Staff cannot collect Bounties from slain players.".
            "btyPlaced": "Someone placed a {bty} on you!",
            "notEnough": "Not Enough {RssName}",
            "overMax": "You cannot exceed the max bounty of {maxBty}",
            "notFound": "Item Not Found.",
            "currBty": "The Current Bounty on your head is: ",
            "resetData": "BountyBoard Data Reset"
        };
    },

    OnPlayerInit: function(player) {
        this.checkPlayerData(player);
    },

    //----------------------------------------
    //          Finding Player Info
    //----------------------------------------
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

    findPlayerByID: function(playerid) {
        var global = importNamespace("");
        var targetPlayer = global.BasePlayer.Find(playerid);
        if (targetPlayer) {
            return targetPlayer;
        } else {
            return false;
        }
    },

    //----------------------------------------
    //          Data Handling
    //----------------------------------------
    getData: function() {
        BountyData = data.GetData('Bounty');
        BountyData = BountyData || {};
        BountyData.PlayerData = BountyData.PlayerData || {};
        BountyData.Board = BountyData.Board || {};
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
        BountyData.PlayerData[steamID].Bounty = BountyData.PlayerData[steamID].Bounty || "";
        BountyData.PlayerData[steamID].BountyType = BountyData.PlayerData[steamID].BountyType || "";
        BountyData.PlayerData[steamID].isStaff = BountyData.PlayerData[steamID].isStaff || (authLvl > 0) || false;
        this.saveData();
    },

    //----------------------------------------
    //          Command Handling
    //----------------------------------------
    cmdBounty: function(player, cmd, args) {
        var steamID = rust.UserIDFromPlayer(player);
        switch (args[0]) {
            case "add":
                this.addBounty(player, cmd, args);
                break;
            case "target":
                this.setTarget(player, cmd, args);
                break;
            case "reset":
                if (authLvl >= this.Config.authLevel) {
                    this.resetData(player, cmd, args);
                } else if (authLvl < this.Config.authLevel) {
                    rust.SendChatMessage(player, prefix, msgs.noPerms, "0");
                    return false;
                } else {
                    rust.SendChatMessage(player, prefix, msgs.badSyntaxRank, "0");
                    return false;
                }
            default:
                rust.SendChatMessage(player, prefix, msgs.currBty + " " + BountyData.PlayerData[steamID].Bounty, "0");
                break;
        }
    },

    resetData: function(player, cmd, args) {
        delete BoardData.PlayerData;
        delete BoardData.Board;
        this.saveData();
        this.getData();
        rust.SendChatMessage(player, prefix, msgs.resetData, "0");
    },

    setTarget: function(player, cmd, args) {
        if (args.length === 2) {
            var pName = this.findPlayerByName(args[1]);
            var steamID = rust.UserIDFromPlayer(player);
        } else if (args.length === 1) {
            rust.SendChatMessage(player, prefix, msgs.curTar, "0");
        } else {
            rust.SendChatMessage(player, prefix, msgs.invSyn.replace("{cmd}", "/bty target playername"), "0");
        }

        if (pName[0].displayName !== player.displayName && BountyData.PlayerData[pName[1]].Bounty !== "" && pName[0].IsConnected()) {
            BountyData.PlayerData[steamID].Target = pName[0].displayName;
            rust.SendChatMessage(player, prefix, msgs.setTar, "0");
            rust.SendChatMessage(pName[0], prefix, player.displayName + msgs.setTrgWarn, "0");
        } else if (!pName[0].IsConnected()) {
            rust.SendChatMessage(player, prefix, msgs.offline, "0");
        } else {
            rust.SendChatMessage(player, prefix, msgs.noBty, "0");
        }
    },

    addBounty: function(player, cmd, args) {
        // /bty add playername amt itemname
        //       0    1         2     3
        try {
            var steamID = rust.UserIDFromPlayer(player);
            var authLvl = player.net.connection.authLevel;
            var main = player.inventory.containerMain;
            var mainList = main.itemList.GetEnumerator();
            var argObj = {
                "plyrName": args[1],
                "amt": Number(args[2]),
                "itemName": args[3]
            };
            var targetPlayer = this.findPlayerByName(player, args);
            while (mainList.MoveNext()) {
                var name = mainList.Current.info.shortname,
                    amount = mainList.Current.amount,
                    condition = mainList.Current.condition;
                if (name === argObj.itemName && argObj.amt <= amount && argObj.amt <= this.Config.Settings.maxBounty) {
                    var newAmt = amount - argObj.amt;
                    amount = newAmt;
                    BountyData.PlayerData[steamID].Bounty = argObj.amt + " " + argObj.itemName;
                    BountyData.PlayerData[steamID].BountyType = argObj.itemName;
                    rust.SendChatMessage(targetPlayer[0], prefix, msgs.btyPlaced.replace("{bty}", argObj.amt + " " + argObj.itemName), "0");
                } else if (argObj.amt > amount) {
                    rust.SendChatMessage(player, prefix, msgs.notEnough.replace("{RssName}", argObj.itemName), "0");
                } else if (argObj.amt > this.Config.Settings.maxBounty) {
                    rust.SendChatMessage(player, prefix, msgs.overMax.replace("{maxBty}", this.Config.Settings.maxBounty), "0");
                } else {
                    rust.SendChatMessage(player, prefix, msgs.notFound, "0");
                }
            }
            this.saveData();
            this.updateBoard(targetPlayer[1], argObj.amt, argObj.itemName)
        } catch (e) {
            print(e.message.toString())
        }
    },

    //----------------------------------------
    //          Board Handling
    //----------------------------------------
    updateBoard: function(targetID, claimed, amount, itemName) {
        //TODO: update the bounty board with new bounties and claimed bounties.
        var getPlayer = this.findPlayerByID(targetID);
        if (BountyData.Board[targetID] === undefined) {
            BountyData.Board[targetID] = {};
            BountyData.Board[targetID].Name = getPlayer[0].displayName;
            BountyData.Board[targetID].Amount = [amount + " " + itemName];
            BountyData.Board[targetID].ItemType = [itemName];
        } else if (claimed === false && BountyData.Board[targetID] !== undefined) {
            BountyData.Board[targetID].Amount.push(amount + " " + itemName);
            BountyData.Board[targetID].ItemType.push(itemName);
        } else {
            BountyData.Board[targetID] = null;
            delete BountyData.Board[targetID];
        }
        this.saveData();
    },

    checkBoard: function(player, cmd, args) {
        rust.SendChatMessage(player, "", "------Bounty Board------", "0");
        for (var key in BountyData.Board) {
                rust.SendChatMessage(player, "", BountyData.Board[key].Name + ": " + BountData.Bounties[key].Amount, "0");
        }
        rust.SendChatMessage(player, "", "------Happy Hunting------", "0");
    },

    claimBounty: function(victimID, attackerID) {
        var amount = BountyData.Board[victimID].Amount,
        item = BountyData.Board[victimID].ItemType,
        claimed = false;
        var getPlayer = this.findPlayerByID(attackerID);
        var i = 0;
        for (i; i < amount.length; i++) {
            this.giveItem(getPlayer[0], item[i], amount[i]);
            if (i >= amount.length) {
                claimed = true;
            } 
        }
        this.updateBoard(victimID, claimed, 0, null);
    },

    giveItem: function(player, itemName, amount) {
        itemName = itemName.toLowerCase();
        var definition = ItemManager.FindItemDefinition(itemName);
        if (definition == null) return print("Unable to Find an Item for Bounty.");
        player.inventory.GiveItem(ItemManager.CreateByItemID(Number(definition.itemid, amount, false)), player.inventory.containerMain);
    },

    OnEntityDeath: function(entity, hitinfo) {
        var victim = entity;
        var attacker = hitinfo.Initiator;

        if (victim.ToPlayer() && attacker.ToPlayer() && victim.displayName !== attacker.displayName) {
            var victimID = rust.UserIDFromPlayer(victim),
                attackerID = rust.UserIDFromPlayer(attacker);
            if (!TitlesData.PlayerData[victimID] && victim.IsConnected()) {
                print("Data File not found for " + victim.displayName + ", attempting build now...");
                return this.checkPlayerData(victim);
            } else if (!TitlesData.PlayerData[killerID]) {
                print("Data File not found for " + attacker.displayName + ", attempting build now...");
                return this.checkPlayerData(attacker);
            } else if (!TitlesData.PlayerData[victimID] && !victim.IsConnected()) {
                    print("Victim has no data but was offline, unable to build a data file.");
            }

            if (BountyData.PlayerData[attackerID].isStaff && !this.Config.Settings.staffCollect) {
                rust.SendChatMessage(player, prefix, msgs.staff, "0");
                return false;
            }

            if (BountyData.PlayerData[victimID].Bounty !== "" && BountyData.PlayerData[attackerID].Target === victim.displayName && victim.displayName !== attacker.displayName) {
                var rpObj = {
                    "plyrName": attacker.displayName,
                    "btyAmt": BountyData.PlayerData[victimID].Bounty * targetModifier,
                    "deadPlyr": victim.displayName
                }
                rust.SendChatMessage(player, prefix, msgs.btyClaim.replace(/plyrName|btyAmt|deadPlyr|/g, function(matched) {
                    return rpObj[matched]
                }), "0");
                this.claimBounty(victimID, attackerID);
            }

        } else if (victim.ToPlayer() && victim.displayName === attacker.displayName) {
            return false;
        }
    }
}
