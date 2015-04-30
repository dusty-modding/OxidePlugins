var BountyBoard = {
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
    var phAPI = plugins.Find("PermissionHandler");
    if (phAPI) callCheck = phAPI.Object.checkPassed();
    command.AddChatCommand("ah", this.Plugin, "cmdSwitch");
    command.AddChatCommand("tester", this.Plugin, "runCheck");
  },

  LoadDefaultConfig: function() {
    this.Config.authLevel = 2;
    this.Config.Version = "1.0";
    this.Config.Settings = {
      "maxTime": 86400,
      "minTime": 3600,
      "maxAuctions": 25,
      "fees": 0.05,
      "defaultStartBid": 100,
			"holdOffline": true
    };

    this.Config.PermHandle = { //Permission Handler Support
      "additions": {
        "owner": ["ahCanClear"],
        "default": ["canBid", "canCreateAuction", "canBuyOut"],
        "admin": ["ahCanClear"],
        "donor": ["canBid", "canCreateAuction", "canBuyOut"]
      },
      "perms": {
        "Clear": "ahCanClear",
        "Bid": "canBid",
        "Create": "canCreateAuction",
        "Buy": "canBuyOut"
      },
      "groups": {},
      "commands": {
        "ah": {
          "args": ["bid", "buy", "create", "clear"],
          "perms": ["canBid", "canBuyOut", "canCreateAuction", "ahCanClear"]
        }
      }
    };

    this.Config.Prefix = "AuctionHouse";

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

    this.Config.Help = [
      "<size=18><color=#ce422b>Auction House Help</color></size>",
      "/ah bid amount item autctionnumber - place a bid on the designated item.",
      "/ah buy auctionnumber - buys out an auction at its buyitnow price if open",
      "/ah create item amt timer buyitnow buyitnowitemType - creates an auction buyitnow is optional."
    ];
    this.Config.AdminHelp = [
      "/ah clear - Clear AuctionHouse Data"
    ];
  },

  //----------------------------------------
  //         String Builder
  //		Builds our strings with replace
  //----------------------------------------
  buildString: function(string, values) {
    var temp = [],
      i = 0,
      sb = "";

    if (values.length === 0) {
      return string;
    }

    temp.push(string.match(/\{([^{]+)\}/g));
    for (i; i < temp.length; i++) {
      sb = string.replace(temp[i], values[i]);
    }
    return sb;
  },

  //----------------------------------------
  //         Find Player
  //		Finds a player based off
  //		 their name or SteamID
  //----------------------------------------
  findPlayerByName: function(playerName) {
    try {
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
    } catch (e) {
      print(e.message.toString());
    }
  },

  //----------------------------------------
  //         Timer Control
  //		Handles Timers and Expiration
  //----------------------------------------
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

	//----------------------------------------
  //        Offline Handler
  //		Handles Offline Players
  //----------------------------------------
	OnPlayerInit: function(player) {
		this.checkHolding(player);
	},

	offlineHandler: function(auctionNum, owner, buyer) {
		if (owner !== null) {
			user = rust.UserIDFromPlayer(owner);
		} else {
			user = rust.UserIDFromPlayer(buyer);
		}

		AuctionData.OfflineHolding[user] = AuctionData.OfflineHolding[user];
		AuctionData.OfflineHolding[user].itemName = AuctionData.OpenAuctions[auctionNum].itemName;
		AuctionData.OfflineHolding[user].itemAmt = AuctionData.OpenAuctions[auctionNum].itemAmt;
		AuctionData.OfflineHolding[user].auctionNum = AuctionData.OfflineHolding[auctionNum]
		this.saveData();
	},
//TODO: write offline function for owner or a method to tell the difference between a buyer and owner
	checkHolding: function(player) {
		var steamID = rust.UserIDFromPlayer(player);
		for (var user in AuctionData.OfflineHolding) {
			if (steamID === user) {
				this.payment(player, true, AuctionData.OfflineHolding[user].auctionNum, false, true);
			}
		}
	},

  //----------------------------------------
  //     Local Permission Handling
  //      When Permission Handler
  //         is not present
  //----------------------------------------
  hasPermission: function(player, perm) {
    var steamID = rust.UserIDFromPlayer(player);
    if (player.net.connection.authLevel === 2) {
      return true;
    }

    if (permission.UserHasPermission(steamID, perm)) {
      return true;
    }
    rust.SendChatMessage(player, prefix.PermissionHandler, msgs.noPermission, "0");
    return false;
  },

  //----------------------------------------
  //          Data Handling
  //----------------------------------------
  saveData: function() {
    data.SaveData("AuctionHouse");
  },

  getData: function() {
    AuctionData = data.GetData("AuctionHouse");
    AuctionData = AuctionData || {};
    AuctionData.NumOfAuctions = AuctionData.NumOfAuctions || 0;
		AuctionData.OfflineHolding = AuctionData.OfflineHolding || {};
    AuctionData.OpenAuctions = AuctionData.OpenAuctions || {};
  },

	offlineData: function(player) {
		var steamID = rust.UserIDFromPlayer(player);
	},

  //-----------------------------------------
  //        Transaction Handling
  //	Handle how transactions are processed
  //-----------------------------------------

  payment: function(player, paid, auctionNum, isBuyNow, isOffline) {

    if (isBuyNow) {
      buyItNow = true;
    } else {
      buyItNow = false;
    }

    if (paid) {
      var definition = global.ItemManager.FindItemDefinition(AuctionData.OpenAuctions[auctionNum].itemName);
      player.inventory.GiveItem(global.ItemManager.CreateByItemID(Number(definition.itemid), Number(AuctionData.OpenAuctions[auctionNum].itemAmt), false), player.inventory.containerMain);
      if (!isOffline) this.payOwner(AuctionData.OpenAuctions[auctionNum].owner, auctionNum, buyItNow);
    } else {
      return false;
    }
  },

  payOwner: function(owner, auctionNum, isBuyNow) {
    var getOwner = this.findPlayerByName(owner);
    var definition = global.ItemManager.FindItemDefinition(AuctionData.OpenAuctions[auctionNum].itemName);

		if (!getOwner[0].isConnected()) {
			this.offlineHandler(getOwner[0]);
		}

    if (isBuyNow) {
      definition = global.ItemManager.FindItemDefinition(AuctionData.OpenAuctions[auctionNum].buyItNowType);
      getOwner[0].inventory.GiveItem(global.ItemManager.CreateByItemID(Number(definition.itemid), Number(AuctionData.OpenAuctions[auctionNum].buyItNowPrice), false), player.inventory.containerMain);
    } else {
      getOwner[0].inventory.GiveItem(global.ItemManager.CreateByItemID(Number(definition.itemid), Number(AuctionData.OpenAuctions[auctionNum].currentBid), false), player.inventory.containerMain);
    }
    this.finished(auctionNum);
  },

  finished: function(auctionNum) {
    delete AuctionData.OpenAuctions[auctionNum];
    AuctionData.NumOfAuctions -= 1;
    this.killTimer(auctionNum);
  },

  //----------------------------------------
  //          Command Handling
  //----------------------------------------
  cmdSwitch: function(player, cmd, args) {
    var steamID = rust.UserIDFromPlayer(player);
    var authLvl = player.net.connection.authLevel;
    var perms = this.Config.PermHandle.perms;
    var noPerm = rust.SendChatMessage(player, this.prefix, this.msgs.noPermission, "0");
    switch (args[0]) {
      case "bid":
        if (callCheck || this.hasPermission(player, perms.Bid)) {
          this.sendBid(player, cmd, args);
        } else {
          return noPerm;
        }
        break;
      case "buy":
        if (callCheck || this.hasPermission(player, perms.Buy)) {
          this.buyItNow(player, cmd, args);
        } else {
          return noPerm;
        }
        break;
      case "create":
        if (callCheck || this.hasPermission(player, perms.Create)) {
          this.createAuction(player, cmd, args);
        } else {
          return noPerm;
        }
        break;
      case "list":
        if (callCheck || this.hasPermission(player, perms.List)) {
          this.listAuctions(player, cmd, args);
        } else {
          return noPerm;
        }
        break;
      case "clear":
        if (callCheck || this.hasPermission(player, perms.Clear)) {
          this.resetData(player, cmd, args);
        } else {
          return noPerm;
        }
        break;
      default:
        this.listAuctions(player, cmd, args);
        break;
    }
  },

  //----------------------------------------
  //         Command Functions
  //----------------------------------------
  sendBid: function(player, cmd, args) {
    // /ah bid amount item autctionnumber
    if (args.length === 4) {
      //Grab the information from our command
      var bidAmt = Number(args[1]);
      var itemName = args[2];
      var auctionNum = Number(args[3]);
      var currentBid = AuctionData.OpenAuctions[auctionNum].currentBid;

      if (itemName === AuctionData.OpenAuctions[auctionNum].itemName) {
        rust.SendChatMessage(player, this.prefix, this.msgs.sameItem.replace("{item}", itemName), "0");
        return false;
      }

      //Build a search to find the auction in our data
      if (AuctionData.OpenAuctions[auctionNum] !== undefined && currentBid < bidAmt) {
        AuctionData.OpenAuctions[auctionNum].currentBid = bidAmt;
        rust.SendChatMessage(player, this.prefix, this.buildString(this.msgs.bidSuccess, [bidAmt, auctionNum]), "0");
        rust.BroadcastChat(player, this.prefix, this.buildString(this.msgs.bidPlaced, [player, itemName]));
      } else if (currentBid >= bidAmt) {
        rust.SendChatMessage(player, this.prefix, this.msgs.toLow.replace("{currentBid}", auctionNum), "0");
        return false;
      } else {
        rust.SendChatMessage(player, this.prefix, this.msgs.notFound.replace("{auctionNum}", auctionNum), "0");
        return false;
      }
    } else {
      rust.SendChatMessage(player, this.prefix, this.msgs.badArgs.replace("{struct}", "/ah bid amount item autctionnumber"), "0");
      return false;
    }
		this.saveData();
  },

  buyItNow: function(player, cmd, args) {
    var steamID = rust.UserIDFromPlayer(player);
    var authLvl = player.net.connection.authLevel;
    var main = player.inventory.containerMain;
    var mainList = main.itemList.GetEnumerator();
    var auctionNum = Number(args[1]);

    if (args.length !== 2) {
      rust.SendChatMessage(player, this.prefix, this.msgs.badArgs.replace("{struct}", "/ah buy auctionnumber"), "0");
    }

    //Loop through the built main item list of a players inventory grabbing the names, amounts, and conditions if we find
    //a match then break the loop on that item to be used with out variables
    while (mainList.MoveNext()) {
      var name = mainList.Current.info.shortname,
        amount = mainList.Current.amount,
        condition = mainList.Current.condition;
      if (name === AuctionData.OpenAuctions[auctionNum].buyItNowType && AuctionData.OpenAuctions[auctionNum].buyItNowPrice <= amount &&
        AuctionData.OpenAuctions[auctionNum].buyItNowPrice > 0 && condition > 0) {
        break;
      }
    }
    //check to make sure the auction number is defined, and that the buyitnow price is defined.
    if (AuctionData.OpenAuctions[auctionNum] !== undefined && AuctionData.OpenAuctions[auctionNum].buyItNowPrice !== undefined &&
      AuctionData.OpenAuctions[auctionNum].buyItNowType === name) {
      var definition = global.ItemManager.FindItemDefinition(AuctionData.OpenAuctions[auctionNum].buyItNowType);
      main.Take(null, Number(definition.itemid), AuctionData.OpenAuctions[auctionNum].buyItNowPrice);
      this.payment(player, true, auctionNum, true);
    }
		this.saveData();
  },

  createAuction: function(player, cmd, args) {
    if (args.length !== 4 || args.length !== 6) {
      rust.SendChatMessage(player, this.prefix, this.msgs.badArgs.replace("{struct}", "/ah create item amt timer buyitnow buyitnowtype"), "0");
    }

    var itemName = args[1];
    var itemAmount = Number(args[2]);
    var timer = Number(args[3]);
    if (args.length === 6) {
      buyNow = Number(args[4]);
      buyNowType = args[5];
    }
    if (this.Config.Settings.maxAuctions >= numOfAuctions) {
      AuctionData.NumOfAuctions += 1;
      if (this.Config.Settings.maxTime >= timer && this.Config.Settings.minTime <= timer) {
        this.buildTimer(timer, numOfAuctions);
      } else {
        rust.SendChatMessage(player, this.prefix, this.msgs.badTimer, "0");
        return false;
      }

      AuctionData.OpenAuctions[numOfAuctions].itemName = itemName;
      AuctionData.OpenAuctions[numOfAuctions].itemAmt = itemAmount;
      AuctionData.OpenAuctions[numOfAuctions].currentBid = this.Config.Settings.defaultStartBid;
      if (buyNow !== null && buyNow !== undefined) {
        AuctionData.OpenAuctions[numOfAuctions].buyItNowPrice = buyNow;
        AuctionData.OpenAuctions[numOfAuctions].buyItNowType = buyNowType;
      }
      AuctionData.OpenAuctions[numOfAuctions].owner = player.displayName;
      rust.SendChatMessage(player, this.prefix, this.buildString(this.msgs.createSuc, [numOfAuctions]), "0");
      rust.BroadcastChat(player, this.prefix, this.buildString(this.msgs.createBroad, [player, numOfAuctions, itemAmount, itemName]));
    }
		this.saveData();
  },

  resetData: function(player, cmd, args) {
    delete AuctionData.OpenAuctions;
    AuctionData.OpenAuctions = {};
    AuctionData.NumOfAuctions = 0;
  },

  listAuctions: function(player, cmd, args) {
    var numOfAuctions = AuctionData.NumOfAuctions;
    for (var key in AuctionData.OpenAuctions) {
      rust.SendChatMessage(player, this.prefix, this.msgs.auctionList.replace("{auction}",
        key + ": " + AuctionData.OpenAuctions[key].itemName + " " + AuctionData.OpenAuctions[key].itemAmt) + "\n", "0");
    }
  }
};
