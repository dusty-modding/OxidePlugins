var RanksAndTitles = {
  Title: "Ranks And Titles",
  Author: "Killparadise",
  Version: V(0, 1, 1),
  ResourceId: 830,
  HasConfig: true,
  Init: function() {
    GroupsAPI = plugins.Find('RotAG-Groups');
    if (GroupsAPI) {
      GroupsAPI = true;
      print('Groups Found. Loading...')
    } else {
      GroupsAPI = false;
    }
    this.loadTitleData();
    this.buildSetupData();
    command.AddChatCommand("rtconvert", this.Plugin, "resetData");
  },

  OnServerInitialized: function() {
    print(this.Title + " Is now loading, please wait...");
    if (TitlesData.SetupData.Type && TitlesData.SetupData.Type != "") {
      this.startPlugin();
    } else {
      command.AddChatCommand("setup", this.Plugin, "cmdStartSetup");
    }
  },

  LoadDefaultConfig: function() {
    this.Config.authLevel = 2;
    this.Config.Settings = {
      "showPlayer": true,
      "hideAllAdmins": false
    };
    this.Config.Titles = [{
      "authLvl": 0,
      "title": "Player",
      "Exclude": false
    }, {
      "authLvl": 0,
      "title": "Donor",
      "Exclude": true
    }, {
      "authLvl": 1,
      "title": "Mod",
      "Exclude": true
    }, {
      "authLvl": 2,
      "title": "Admin",
      "Exclude": true
    }, {
      "authLvl": 2,
      "title": "Owner",
      "Exclude": true
    }];
    this.Config.Ranks = [{
      "rank": 0,
      "title": "New Guy",
      "killsNeeded": 0
    }, {
      "rank": 1,
      "title": "Recruit",
      "killsNeeded": 10
    }, {
      "rank": 2,
      "title": "Soldier",
      "killsNeeded": 20
    }, {
      "rank": 3,
      "title": "Bandit",
      "killsNeeded": 25
    }, {
      "rank": 4,
      "title": "Captain",
      "killsNeeded": 35
    }, {
      "rank": 5,
      "title": "Bandit Lord",
      "killsNeeded": 50
    }, {
      "rank": 6,
      "title": "Badass",
      "killsNeeded": 100
    }];
  },

  /*-----------------------------------------------------------------
                  When the Player finishes loading in
  ------------------------------------------------------------------*/
  OnPlayerInit: function(player) {
    steamID = rust.UserIDFromPlayer(player);
    this.checkPlayerData(player);
    if (TitlesData.SetupData.Type === "ranks") {
      this.setRank(steamID, TitlesData.PlayerData[steamID].Kills, player)
    } else if (TitlesData.SetupData.Type === "titles") {
      this.setTitles(steamID, player);
    }
  },

  /*-----------------------------------------------------------------
                  Get all of our Data
  ------------------------------------------------------------------*/
  loadTitleData: function() {
    //Lets get our own data and then check to see if theres a groups data file
    TitlesData = data.GetData('RanksandTitles');
    TitlesData = TitlesData || {};
    TitlesData.SetupData = TitlesData.SetupData || {};
    TitlesData.SetupData.Type = TitlesData.SetupData.Type || "";
    TitlesData.PlayerData = TitlesData.PlayerData || {};
    GroupData = data.GetData("Groups");
    GroupData = GroupData || {};
  },


  checkPlayerData: function(player) {
    //Okay lets check our data file for player data
      var authLvl = player.net.connection.authLevel;
      var steamID = rust.UserIDFromPlayer(player);
      TitlesData.PlayerData[steamID] = TitlesData.PlayerData[steamID] || {};
      TitlesData.PlayerData[steamID].PlayerID = TitlesData.PlayerData[steamID].PlayerID || steamID;
      TitlesData.PlayerData[steamID].RealName = TitlesData.PlayerData[steamID].RealName || player.displayName || "";
      TitlesData.PlayerData[steamID].Title = TitlesData.PlayerData[steamID].Title || "Player";
      TitlesData.PlayerData[steamID].Rank = TitlesData.PlayerData[steamID].Rank || "";
      TitlesData.PlayerData[steamID].Kills = TitlesData.PlayerData[steamID].Kills || 0;
      TitlesData.PlayerData[steamID].KDR = TitlesData.PlayerData[steamID].KDR || 0;
      TitlesData.PlayerData[steamID].Deaths = TitlesData.PlayerData[steamID].Deaths || 0;
      TitlesData.PlayerData[steamID].isAdmin = TitlesData.PlayerData[steamID].isAdmin || (authLvl >= 2) || false;
      TitlesData.PlayerData[steamID].hidden = TitlesData.PlayerData[steamID].hidden || false;
      showPlayer = this.Config.Settings.showPlayer;
      this.saveData();
  },

  buildSetupData: function() {
    TitlesData.SetupData.Type = TitlesData.SetupData.Type || "";

  },
  saveData: function() {
    //Save our data to our titles data file
    data.SaveData('RanksandTitles');

  },

  resetData: function(player, cmd, args) {
    rust.SendChatMessage(player, "RanksAndTitles", "Data Reset", "0");
    this.checkPlayerData(player);
  },

  findPlayerByName: function(args) {
      var global = importNamespace("");
      var found = [];
      var argument = args[1]
      var targetPlayer = global.BasePlayer.Find(argument);
      if (targetPlayer != null) {
        found.push(targetPlayer);
        foundID = rust.UserIDFromPlayer(targetPlayer);
        found.push(foundID);
        return found;
      } else {
        rust.SendChatMessage(player, "Titles", "No Players Found", "0");
      }
  },

  findPlayer: function(playerid) {
      var global = importNamespace("");
      targetPlayer = global.BasePlayer.Find(playerid);
      if (targetPlayer != null) {
        return targetPlayer;
      } else {
        rust.SendChatMessage(player, "Titles", "No Players Found", "0");
      }
  },

  /*-----------------------------------------------------------------
                    Run Setup
    ------------------------------------------------------------------*/

  cmdStartSetup: function(player, cmd, args) {
    var authLvl = player.net.connection.authLevel;
    if (authLvl >= 2 && args.length < 1) {
      rust.SendChatMessage(player, "RankAndTitles", "How do you want the system to run? Ranks or Titles?", "0");
      rust.SendChatMessage(player, "RankAndTitles", "For info type /setup info ranks or titles", "0");
    } else if (authLvl >= 2 && args.length >= 1) {
      switch (args[0]) {
        case "info":
          if (args[1] === "ranks") {
            rust.SendChatMessage(player, "RankAndTitles", "Ranks for players this is an automated system based on kills later this may be used with my bounty board plugin", "0");
          } else if (args[1] === "titles") {
            rust.SendChatMessage(player, "RankAndTitles", "Titles works for if you want to create and assign your own titles", "0");
          } else {
            rust.SendChatMessage(player, "RankAndTitles", "You didn't use ranks or titles in the command for info.", "0");
          }
          break;
        case "ranks":
          rust.SendChatMessage(player, "RankAndTitles", "You've chosen ranks! Great! Now you can use /setranks finish to finish setup.", "0");
            command.AddChatCommand("setranks", this.Plugin, "setupRanks");
          break;
        case "titles":
          rust.SendChatMessage(player, "RankAndTitles", "You've chosen titles! Great! Now you can use /settitle finish to finish setup.", "0");
          command.AddChatCommand("settitle", this.Plugin, "setupTitles");
          break;
        default:
          rust.SendChatMessage(player, "RankAndTitles", "Incorrect command structure, please try again.", "0");
          break;
      }
    } else {
      rust.SendChatMessage(player, "RankAndTitles", "You do not have permission to use this command!", "0");
    }
  },

  setupRanks: function(player, cmd, args) {
      var authLvl = player.net.connection.authLevel;
      if (authLvl >= 2) {
        if (TitlesData.SetupData.Type == "titles" && !args.length) {
          rust.SendChatMessage(player, "RankAndTitles", "WARNING: Your current type is" + TitlesData.SetupData.Type + "changing this will reset your data files! Recommend Backing them up!", "0");
        } else if (TitlesData.SetupData.Type === "" && !args.length) {
          rust.SendChatMessage(player, "RankAndTitles", "please use /setranks finish to finish setup.", "0")
        } else {
          rust.SendChatMessage(player, "RankAndTitles", "You already have ranks set! no need to set it again!", "0");
        }
        if (args.length && args[0] === "finish" && TitlesData.SetupData.Type != "titles") {
          rust.SendChatMessage(player, "RankAndTitles", "Great! The plugin will now build the correct data and configurations.", "0");
          TitlesData.SetupData.Type = "ranks";
          this.startPlugin();
          this.saveData();
        } else if (args.length && args[0] === "finish" && TitlesData.SetupData.Type == "titles") {
          TitlesData.SetupData.Type = "ranks";
          print("Converting player data from titles, to ranks.");
          rust.BroadcastChat('RanksAndTitles', "The Server Admin has switched to Ranks, please use /rtconvert to reload your player ranks and titles data.", 0);
        }
      } else {
        rust.SendChatMessage(player, "RankAndTitles", "You do not have permission to use this command!", "0");
      }
  },

  setupTitles: function(player, cmd, args) {
    var authLvl = player.net.connection.authLevel;
    if (authLvl >= 2) {
      if (TitlesData.SetupData.Type == "ranks" && !args.length) {
        rust.SendChatMessage(player, "RankAndTitles", "WARNING: Your current type is" + TitlesData.SetupData.Type + "changing this will reset your data files! Recommend Backing them up!", "0");
      } else if (TitlesData.SetupData.Type === "" && !args.length) {
        rust.SendChatMessage(player, "RankAndTitles", "please use /settitle finish to finish setup.", "0");
      } else {
        rust.SendChatMessage(player, "RankAndTitles", "You already have titles set! no need to set it again!", "0");
      }
      if (args.length && args[0] === "finish" && TitlesData.SetupData.Type != "ranks") {
        rust.SendChatMessage(player, "RankAndTitles", "Great! The plugin will now build the correct data and configurations.", "0");
        TitlesData.SetupData.Type = "titles";
        this.startPlugin();
        this.saveData();
      } else if (args.length && args[0] === "finish" && TitlesData.SetupData.Type == "ranks") {
        TitlesData.SetupData.Type = "titles";
        print("Converting player data from ranks, to titles.");
        rust.BroadcastChat('RanksAndTitles', "The Server Admin has switched to Titles, please use /rtconvert to reload your player ranks and titles data.", 0);
      }
    } else {
      rust.SendChatMessage(player, "RankAndTitles", "You do not have permission to use this command!", "0");
    }
  },

  /*-----------------------------------------------------------------
              Start Plugin if we should capture deaths
              This is skipped to after setup is finished
    ------------------------------------------------------------------*/

  startPlugin: function() {
    print("Plugin Successfully Setup!");
    if (TitlesData.SetupData.Type === "ranks") {
      print("Plugin Started in: Ranks");
      command.AddChatCommand("ranks", this.Plugin, "switchRankCmd");
      captureDeaths = true;
    } else if (TitlesData.SetupData.Type === "titles") {
      print("Plugin Started in: Titles");
      command.AddChatCommand("titles", this.Plugin, "switchTitleCmd");
      captureDeaths = false;
    } else {
      print("Something Didn't take, I think we hit an issue with Type in the Data file.");
    }
  },
  /*--------------------ranks System Setup----------------------------
    -----------------------------------------------------------------
                    Get our Counts and set Ranks
    ------------------------------------------------------------------*/

  setRank: function(killerID, kills, killer) {
      var ranks = this.Config.Ranks;
      var neededKills = ranks.killsNeeded;

      if (kills >= 0 && !GroupsAPI) {
        for (var i = 0; i < ranks.length; i++) {
          if (kills === ranks[i].killsNeeded) {
            killer.displayName = TitlesData.PlayerData[killerID].RealName + "[" + ranks[i].title + "]";
            TitlesData.PlayerData[killerID].Title = ranks[i].title;
            TitlesData.PlayerData[killerID].Rank = ranks[i].rank
          }
        }
        //If Groups is present we will use this instead so we don't clash with groups
      } else if (kills >= 0 && GroupsAPI) {
        for (var i = 0; i < ranks.length; i++) {
          if (kills === ranks[i].killsNeeded) {
            GroupData.PlayerData[steamID].RealName = TitlesData.PlayerData[steamID].RealName + "[" + ranks[i].title + "]"
            killer.DisplayName = TitlesData.PlayerData[steamID].RealName + "[" + ranks[i].title + "]"
            TitlesData.PlayerData[steamID].Title = ranks[i].title;
            TitlesData.PlayerData[steamID].Rank = ranks[i].rank
          }
        }
      }
      this.saveData();
  },

  updateKDR: function(kills, deaths, player) {

  },

  switchRankCmd: function(player, cmd, args) {
    var steamID = rust.UserIDFromPlayer(player);
    var authLvl = player.net.connection.authLevel;
    switch (args[0]) {
      case "stats":
        this.checkStats(player, cmd, args);
        break;
      case "wipe":
        if (authLvl >= this.Config.authLevel) {
          this.wipePlayer(player, cmd, args);
        } else {
          rust.SendChatMessage(player, "Ranks", "You do not have permission to use this command.", "0");
        }
        break;
      default:
        rust.SendChatMessage(player, "Ranks", "Your current rank is: " + TitlesData.PlayerData[steamID].Rank, "0");
    }
  },

  checkStats: function(player, cmd, args) {
    var steamID = rust.UserIDFromPlayer(player);
    rust.SendChatMessage(player, "Ranks", "Your Kill count is: " + TitlesData.PlayerData[steamID].Kills, "0");
    rust.SendChatMessage(player, "Ranks", "Your Death count is: " + TitlesData.PlayerData[steamID].Deaths, "0");
    rust.SendChatMessage(player, "Ranks", "Your KDR is: " + TitlesData.PlayerData[steamID].KDR, "0");
  },

  wipePlayer: function(player, cmd, args) {
    var target = this.findPlayerByName(args) || "";
    if (target[1].length) {
      TitlesData.PlayerData[target[1]].Kills = 0;
      TitlesData.PlayerData[target[1]].Deaths = 0;
      rust.SendChatMessage(player, "Ranks", "Player Wiped!", "0");
      this.saveData();
      this.setRank(steamID, TitlesData.PlayerData[target[1]].Kills, target[0]);
    } else if (!target[1].length) {
      rust.SendChatMessage(player, "Ranks", "Player Name not entered", "0");
    } else {
      rust.SendChatMessage(player, "Ranks", "Player not Found!", "0");
    }

  },

  /*-----------------------------------------------------------------
                    Check for Deaths
    ------------------------------------------------------------------*/

  OnEntityDeath: function(entity, hitinfo) {
      var victim = entity;
      var attacker = hitinfo.Initiator;
      if (victim.ToPlayer() && attacker.ToPlayer() && TitlesData.SetupData.Type === "ranks") {
        var killer = attacker.ToPlayer();
        var killerID = rust.UserIDFromPlayer(killer);
        var victimID = rust.UserIDFromPlayer(victim);
        TitlesData.PlayerData[killerID].Kills += 1;
        TitlesData.PlayerData[victimID].Deaths += 1;
        this.updateKDR(TitlesData.PlayerData[killerID].Kills, TitlesData.PlayerData[killerID].Deaths, killer);
        this.updateKDR(TitlesData.PlayerData[victimID].Kills, TitlesData.PlayerData[victimID].Deaths, victim.ToPlayer());
        this.setRank(killerID, TitlesData.PlayerData[killerID].Kills, killer);
        this.saveData();
      }
  },
  /*-------------------End of ranks System Setup----------------------
    -------------------Start titles System Setup---------------------*/

  switchTitleCmd: function(player, cmd, args) {
      var steamID = rust.UserIDFromPlayer(player);
      var authLvl = player.net.connection.authLevel;
      switch (args[0]) {
        case "set":
          if (authLvl >= this.Config.authLevel && args.length >= 2) {
            this.giveTitle(player, cmd, args);
          } else if (authLvl < this.Config.authLevel) {
            rust.SendChatMessage(player, "Titles", "You do not have permission to use this command.", "0");
          } else {
            rust.SendChatMessage(player, "Titles", "The command syntax was incorrect, please use /title set name title", "0");
          }
          break;
        case "show":
          rust.SendChatMessage(player, "Titles", "This command is currently unreleased. Please try again soon!", "0");
          //this.showPlayers(player, cmd, args);
          break;
        case "hide":
          if (authLvl >= this.Config.authLevel) {
            this.hideCmd(player, cmd, args);
          } else {
            rust.SendChatMessage(player, "Titles", "You do not have permission to use this command.", "0");
          }
          break;
        default:
          if (args.length < 1) {
            rust.SendChatMessage(player, "Titles", "Your current Title is: " + TitlesData.PlayerData[steamID].Title, "0");
          } else {
            rust.SendChatMessage(player, "Titles", "Command Unknown, please try again.", "0");
          }
      }
  },

  setTitles: function(steamID, player) {
      var getAuth = player.net.connection.authLevel;
      var getTitles = this.Config.Titles;
      var showPlayer = this.Config.Settings.showPlayer;

      if (showPlayer && !GroupsAPI && !this.Config.Settings.hideAllAdmins) {
        for (var i = 0; i < getTitles.length; i++) {
          if (getAuth == getTitles[i].authLvl && TitlesData.PlayerData[steamID].Title === getTitles[i].title) {
            TitlesData.PlayerData[steamID].Title = getTitles[i].title;
            player.displayName = TitlesData.PlayerData[steamID].RealName + "[" + TitlesData.PlayerData[steamID].Title + "]";
          }
        }
      } else if (showPlayer && GroupsAPI && !this.Config.Settings.hideAllAdmins && TitlesData.PlayerData[steamID].Title === getTitles[i].title) {
        for (var i = 0; i < getTitles.length; i++) {
          if (getTitles[i].authLvl === getAuth && !getTitles[i].Exclude) {
            TitlesData.PlayerData[steamID].Title = getTitles[i].title;
            GroupData.PlayerData[steamID].RealName = TitlesData.PlayerData[steamID].RealName + "[" + TitlesData.PlayerData[steamID].Title + "]";
          }
        }
      } else if (!showPlayer && getAuth === 0 && TitlesData.PlayerData[steamID].Title === getTitles[i].title) {
        for (var i = 0; i < getTitles.length; i++) {
          if (getTitles[i].authLvl === getAuth && !getTitles[i].Exclude) {
            player.displayName = TitlesData.PlayerData[steamID].RealName;
          }
        }
      } else if (this.Config.Settings.hideAllAdmins && getAuth === 2 && TitlesData.PlayerData[steamID].Title === getTitles[i].title) {
        for (var i = 0; i < getTitles.length; i++) {
          if (getTitles[i].authLvl === getAuth && !getTitles[i].Exclude) {
            player.displayName = TitlesData.PlayerData[steamID].RealName;
          }
        }
      }
      this.saveData();
  },

  showPlayers: function(player, cmd, args) {
    //TODO: Figure out why when we send player data to the findplayer function we get a null in return, need to get players back.
    var getAuth = player.net.connection.authLevel;
    if (getAuth >= 2) {
      if (this.Config.Settings.showPlayer) {
        this.Config.Settings.showPlayer = false;
        for (var key in TitlesData.PlayerData) {
          for (var i = 0, j = this.Config.Titles.length; i < j; i++) {
            print("Success");
            if (TitlesData.PlayerData[key].Title === this.Config.Titles[i].title && !this.Config.Titles[i].Exclude) {
              print("finding Player")
              var getPlayer = this.findPlayer(TitlesData.PlayerData[key].PlayerID);
              print(TitlesData.PlayerData[key].PlayerID + " " + getPlayer)
              this.setTitles(TitlesData.PlayerData[key].PlayerID, getPlayer);
            }
          }
          rust.SendChatMessage(player, "Titles", "Player Titles disabled", "0");
        }
      } else {
        this.Config.Settings.showPlayer = true;
        for (var key in TitlesData.PlayerData) {
          for (var i = 0, j = this.Config.Titles.length; i < j; i++) {
            print("Success");
            if (TitlesData.PlayerData[key].Title === this.Config.Titles[i].title && !this.Config.Titles[i].Exclude) {
              print("conditional")
              var getPlayer = this.findPlayer(TitlesData.PlayerData[key]);
              print(getPlayer)
              this.setTitles(TitlesData.PlayerData[key], getPlayer);
            }
          }
        }
        rust.SendChatMessage(player, "Titles", "Player Titles enabled", "0");
      }
    } else {
      rust.SendChatMessage(player, "Titles", "You do not have permission to use this command!", "0");
    }
    this.SaveConfig();
  },

  hideCmd: function(player, cmd, args) {
    var steamID = rust.UserIDFromPlayer(player);
    if (!TitlesData.PlayerData[steamID].hidden) {
      TitlesData.PlayerData[steamID].hidden = true;
      player.displayName = TitlesData.PlayerData[steamID].RealName;
      rust.SendChatMessage(player, "Titles", "Your tag is now hidden!", "0");
    } else {
      TitlesData.PlayerData[steamID].hidden = false;
      player.displayName = TitlesData.PlayerData[steamID].RealName + "[" + TitlesData.PlayerData[steamID].Title + "]";
      rust.SendChatMessage(player, "Titles", "Your tag is no longer hidden!", "0");
    }
  },

  giveTitle: function(player, cmd, args) {
      var getPlayer = this.findPlayerByName(args);
      var getPlayerData = TitlesData.PlayerData;
      if (args[2].length) {
        for (var i = 0; i < this.Config.Titles.length; i++) {
          if (args[2] === this.Config.Titles[i].title.toLowerCase()) {
            getPlayer[0].displayName = getPlayerData[getPlayer[1]].RealName + "[" + this.Config.Titles[i].title + "]";
            TitlesData.PlayerData[getPlayer[1]].Title = this.Config.Titles[i].title;
          }
        }
        this.saveData();
        rust.SendChatMessage(player, "Titles", "Player Title Set successfully!", "0");
      } else {
        rust.SendChatMessage(player, "Titles", "You need to enter a Title for the player", "0");
      }
  }
}
