var RanksAndTitlesReWrite = {
  Title: "Ranks And Titles",
  Author: "Killparadise",
  Version: V(2, 0, 0),
  ResourceId: 830,
  Url: "http://oxidemod.org/resources/ranks-and-titles.830/",


  Init: function() {
    global = importNamespace("");
    this.loadTitleData();
    //this.registerPermissions();
    command.AddChatCommand("rt", this.Plugin, "switchCmd");
    //command.AddChatCommand("rtdebug", this.Plugin, "debug");
  },
  OnServerInitialized: function() {
    msgs = this.Config.Messages;
    prefix = this.Config.Prefix;
    chatHandler = plugins.Find('chathandler');
    this.updateConfig();
  },
  updateConfig: function() {
    if (this.Config.Version !== "2.0") {
      print("[RanksAndTitles] Updating Config, to latest version.");
      this.LoadDefaultConfig();
    } else {
      return false;
    }
  },
  LoadDefaultConfig: function() {
    this.Config.version = "2.0";
    this.Config = {
      "Settings": {

      },
      "Primary": {
        "Player": {
          "rank": 0,
          "name": "Player",
          "karma": 0,
          "kills": 0,
          "Color": "#FFFFFF",
          "karmaModifier": 1
        }
      },
      "Secondary": [
        {
          "name": "Owner",
          "color": "#505886"
        },
        {
          "name": "Mod",
          "color": "#add8e6ff"
        },
        {
          "name": "Admin",
          "color": "#800000ff"
        },
        {
          "name": "Donor",
          "color": "#ffa500ff"
        }
      ],
      "Messages": {

      },
      "Help": [],
      "AdminHelp": []
    };
  },
  /*-----------------------------------------------------------------
            When the Player finishes loading in
------------------------------------------------------------------*/
  OnPlayerInit: function(player) {
    var steamID = rust.UserIDFromPlayer(player);
    this.checkPlayerData(player, steamID);
  },
  /*-----------------------------------------------------------------
            All of our data handling
------------------------------------------------------------------*/
  loadTitleData: function() {
    //Lets get our own data and then check to see if theres a groups data file
    TitlesData = data.GetData('RanksandTitles');
    TitlesData = TitlesData || {};
    TitlesData.PlayerData = TitlesData.PlayerData || {};
    GroupData = data.GetData("Groups");
    GroupData = GroupData || {};
  },
  checkPlayerData: function(player, steamID) {
    //Okay lets check our data file for player data
    try {
      var authLvl = player.net.connection.authLevel;
      TitlesData.PlayerData[steamID] = TitlesData.PlayerData[steamID] || {};
      TitlesData.PlayerData[steamID].PlayerID = TitlesData.PlayerData[steamID].PlayerID || steamID;
      TitlesData.PlayerData[steamID].RealName = TitlesData.PlayerData[steamID].RealName || this.getName(player);
      TitlesData.PlayerData[steamID].plyrGroup = TitlesData.PlayerData[steamID].plyrGroup || "";
      TitlesData.PlayerData[steamID].Title = TitlesData.PlayerData[steamID].Title || "";
      TitlesData.PlayerData[steamID].Rank = TitlesData.PlayerData[steamID].Rank || 0;
      TitlesData.PlayerData[steamID].Kills = TitlesData.PlayerData[steamID].Kills || 0;
      TitlesData.PlayerData[steamID].KDR = TitlesData.PlayerData[steamID].KDR || 0;
      TitlesData.PlayerData[steamID].Deaths = TitlesData.PlayerData[steamID].Deaths || 0;
      TitlesData.PlayerData[steamID].Karma = TitlesData.PlayerData[steamID].Karma || 0;
      TitlesData.PlayerData[steamID].isAdmin = TitlesData.PlayerData[steamID].isAdmin || (authLvl >= 2) || false;
      TitlesData.PlayerData[steamID].hidden = TitlesData.PlayerData[steamID].hidden || false;
      this.saveData();
      this.setRankTitle(steamID, player);
    } catch (e) {
      print(e.message.toString());
    }
  },
};
