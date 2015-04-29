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
      "bidPlaced": "{player} has placed a bid on {item}",
      "auctionCreate": "Auction successfully created. Auction #: {auctionnumber}",
      "auctionList": "------Open Auctions------\n{auctions}",
      "noPermission": "You do not have permission to use this command."
		};

		this.Config.Help = [
      "/ah bid amount item autctionnumber buyitnow - place a bid on the designated item buyitnow is optional.",
      "/ah buy auctionnumber - buys out an auction at its buyitnow price if open",
      "/ah create item amt timer - creates an auction"
		];
		this.Config.AdminHelp = [
      "/ah clear - Clear AuctionHouse Data"
		];
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
    AuctionData.OpenAuctions = AuctionData.OpenAuctions || {};
  },

  setupData: function(auctionNumber) {
    AuctionData.OpenAuctions[auctionNumber] = AuctionData.OpenAuctions[auctionNumber] || {};
    AuctionData.OpenAuctions[auctionNumber].itemName = AuctionData.OpenAuctions[auctionNumber].itemName || "";
    AuctionData.OpenAuctions[auctionNumber].currentBid = AuctionData.OpenAuctions[auctionNumber].currentBid || 0;
    AuctionData.OpenAuctions[auctionNumber].buyItNowPrice = AuctionData.OpenAuctions[auctionNumber].buyItNowPrice || "";
    AuctionData.OpenAuctions[auctionNumber].owner = AuctionData.OpenAuctions[auctionNumber].owner || "";
    this.saveData();
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
          this.buy(player, cmd, args);
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

	},

	buy: function(player, cmd, args) {

	},

	createAuction: function(player, cmd, args) {

	},

	resetData: function(player, cmd, args) {

	},
};
