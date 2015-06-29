var AuctionHouse = {
    Title: "Auction House",
    Author: "Killparadise",
    Version: V(1, 0, 0),
    Init: function() {
    	this.getData();
        global = importNamespace("");
    },

    OnServerInitialized: function() {
    	this.msgs = this.Config.Messages;
        this.prefix = this.Config.Prefix;
        command.AddChatCommand("ah", this.Plugin, "cmdSwitch");
    },

    LoadDefaultConfig: function() {
    	this.Config.Settings = {
    		"maxAuctionsPerPlayer": 1,
            "maxAuctionsOnServer": 25,
    		"maxTime": 86400,
            "minTime": 3600,
            "fees": 0.05,
            "defaultStartBid": 100,
    	};
    	this.Config.Permissions = {
            "clear": "ahCanClear",
            "bid": "canBid",
            "create": "canCreate",
            "buy": "canBuyOut"
        };
        this.Config.Prefix = "AuctionHouse";
        this.Config.Help = [
            "<size=18><color=#ce422b>Auction House Help</color></size>",
            "/ah bid amount item autctionnumber - place a bid on the designated item.",
            "/ah buy auctionnumber - buys out an auction at its buyitnow price if open",
            "/ah create item amt timer buyitnow buyitnowitemType - creates an auction buyitnow is optional."
        ];
        this.Config.AdminHelp = [
            "/ah clear - Clear AuctionHouse Data"
        ];
        this.Config.Messages = {
            "bidPlaced": "<color=lime>{player}</color> has placed a bid on <color=lime>{item}</color>",
            "bidSuccess": "{bid} Placed successfully on {auction}",
            "auctionCreate": "Auction successfully created. Auction #: {auctionnumber}",
            "auctionList": "------Open Auctions------\n{auctions}",
            "noPermission": "You do not have permission to use this command.",
            "badArgs": "Incorrect Syntax, please use {struct}",
            "notFound": "Auction #{auctionNum} was not found.",
            "toLow": "The Bid entered is not greater than the current bid of {currentBid}.",
            "expired": "This Auction has already expired!",
            "return": "Your auction has expired your {amount} {item} has been returned.",
            "badTimer": "The timer did not meet min or max requirments.",
            "auctionEnding": "<color=lime>{auctionNum}</color> owned by <color=lime>{owner}</color> is expiring in <color=red>{timeleft}</color>",
            "createSuc": "<color=green>Auction #{auctionNum} created successfully.</color>",
            "createBroad": "<color=lime>{owner}</color> has started a new auction #{auctionNum} with <color=green>{itemAmt} {itemName}</color>",
            "sameItem": "<color=red>You cannot bid with the same item type as whats being sold!</color><color=lime>Item: {item}</color>"
        };
    },

    OnPlayerInit: function(player) {
    	var steamID = rust.UserIDFromPlayer(player);
    	this.buildPlayer(steamID);
    },

    OnPlayerDisconnected: function(player) {
    	var steamID = rust.UserIDFromPlayer(player);
    	this.offlineHandler(steamID);
    },

    getData: function() {
    	AuctionData = data.GetData("AuctionData");
    	AuctionData = AuctionData || {};
    	AuctionData.PlayerData = AuctionData.PlayerData || {};
    	AuctionData.OpenAuctions = AuctionData.OpenAuctions || {};
    	AuctionData.OfflineHoldings = AuctionData.OfflineHoldings || {};
    },

    buildPlayer: function(steamID) {
    	AuctionData.PlayerData[steamID] = AuctionData.PlayerData[steamID] || {};
    	AuctionData.PlayerData[steamID].NumberOfAuctions = AuctionData.PlayerData[steamID].NumberOfAuctions || 0;
    	AuctionData.PlayerData[steamID].AuctionsOwned = AuctionData.PlayerData[steamID].AuctionsOwned || [];
    	AuctionData.PlayerData[steamID].AuctionsBid = AuctionData.PlayerData[steamID].AuctionsBid || [];
    },

    saveData: function() {
        data.SaveData("AuctionHouse");
    },

    registerPermissions: function() {
        //single permissions
        for (var perm in this.Config.Permissions) {
            if (!permission.PermissionExists(this.Config.Permissions[perm])) {
                permission.RegisterPermission(this.Config.Permissions[perm], this.Plugin);
            }
        }
    },

    hasPermission: function(player, perm) {
        var steamID = rust.UserIDFromPlayer(player);
        if (player.net.connection.authLevel >= 1) {
            return true;
        }

        if (permission.UserHasPermission(steamID, perm)) {
            return true;
        }
        rust.SendChatMessage(player, prefix, msgs.noPerms, "0");
        return false;
    },

    buildString: function(string, values) {
        var temp = [],
            tempColor = [],
            i = 0,
            sb = "",
            regObj = {};
        var re = "";

        if (values.length === 0) {
            return string;
        }
        if (string.constructor === Array) {
            for (var ii = 0, len = string.length; ii < len; ii++) {
                temp.push(string[ii].match(/\{([^{]+)\}/g));
                newString = string[ii].replace(temp[ii], values[ii]);
                sb += newString + "\n";
            }
        } else {
            temp.push(string.match(/\{([^{]+)\}/g));
            temp = temp.toString().split(",");
            for (i; i < temp.length; i++) {
                regObj[temp[i]] = values[i];
                re += temp[i] + "|";
            }
            re = re.substring("|", re.length - 1);
            var expression = new RegExp(re, "g");
            sb = string.replace(expression, function(match) {
                return regObj[match];
            });
        }
        return sb;
    },

    findPlayerByName: function(playerName) {
        var found = [],
            foundID;
        playerName = playerName.toLowerCase();
        var itPlayerList = global.BasePlayer.activePlayerList.GetEnumerator();
        while (itPlayerList.MoveNext()) {

            var displayName = itPlayerList.Current.displayName.toLowerCase();

            if (displayName.search(playerName) > -1) {
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

    buildTimer: function(auctionTimer, auctionNum) {
        timerObj[auctionNum] = timer.Once(auctionTimer, function() {
            this.finished(auctionNum);
        }, this.Plugin);
    },

    killTimer: function(auctionNum) {
        for (var key in timerObj) {
            if (key === auctionNum) {
                timerObj[key].Destroy();
                delete timerObj[key];
            }
        }
    },

    offlineHandler: function(steamID) {
    	var pAuction = AuctionData.PlayerData[steamID];

    },
};
