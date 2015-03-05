var RanksAndTitles = {
    Title: "Ranks And Titles",
    Author: "Killparadise",
    Version: V(0, 2, 0),
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
            command.AddChatCommand("set", this.Plugin, "cmdStartSetup");
        }
    },

    LoadDefaultConfig: function() {
        this.Config.authLevel = 2;
        this.Config.Settings = {
            "showPlayer": true,
            "hideAllAdmins": false,
            "karma": true,
            "karmaModifier": 1,
            "colorSupport": true
        };
        this.Config.Titles = [{
            "authLvl": 0,
            "title": "Player",
            "Exclude": false,
            "Color": "none"
        }, {
            "authLvl": 0,
            "title": "Donor",
            "Exclude": true,
            "Color": "#ffa500ff"
        }, {
            "authLvl": 1,
            "title": "Mod",
            "Exclude": true,
            "Color": "#add8e6ff"
        }, {
            "authLvl": 2,
            "title": "Admin",
            "Exclude": true,
            "Color": "#800000ff"
        }, {
            "authLvl": 2,
            "title": "Owner",
            "Exclude": true,
            "Color": "#800080ff"
        }];
        this.Config.Ranks = [{
            "rank": 0,
            "title": "New Guy",
            "karma": 0,
            "killsNeeded": 0,
            "Color": "None",
            "karmaModifier": 1
        }, {
            "rank": 1,
            "title": "Murderer",
            "karma": -10,
            "killsNeeded": 10,
            "Color": "#ff0000ff",
            "karmaModifier": 5
        }, {
            "rank": 1,
            "title": "Recruit",
            "karma": 10,
            "Color": "#0000a0ff",
            "karmaModifier": 5
        }, {
            "rank": 2,
            "title": "Serial Killer",
            "karma": -20,
            "killsNeeded": 20,
            "Color": "#ff0000ff",
            "karmaModifier": 15
        }, {
            "rank": 2,
            "title": "Soldier",
            "karma": 20,
            "Color": "#0000a0ff",
            "karmaModifier": 15
        }, {
            "rank": 3,
            "title": "Bandit",
            "karma": -25,
            "killsNeeded": 25,
            "Color": "#ff0000ff",
            "karmaModifier": 30
        }, {
            "rank": 3,
            "title": "General",
            "karma": 25,
            "Color": "#0000a0ff",
            "karmaModifier": 30
        }, {
            "rank": 4,
            "title": "Captain",
            "karma": -35,
            "killsNeeded": 35,
            "Color": "#ff0000ff",
            "karmaModifier": 40
        }, {
            "rank": 4,
            "title": "Icon",
            "karma": 35,
            "Color": "#0000a0ff",
            "karmaModifier": 40
        }, {
            "rank": 5,
            "title": "Bandit Lord",
            "karma": -50,
            "killsNeeded": 50,
            "Color": "#ff0000ff",
            "karmaModifier": 50
        }, {
            "rank": 5,
            "title": "Hero",
            "karma": 50,
            "Color": "#0000a0ff",
            "karmaModifier": 50
        }, {
            "rank": 6,
            "title": "Badass",
            "karma": -100,
            "killsNeeded": 100,
            "Color": "#ff0000ff",
            "karmaModifier": 100
        }, {
            "rank": 6,
            "title": "Legend",
            "karma": 100,
            "Color": "#0000a0ff",
            "karmaModifier": 100
        }]
    },

    /*-----------------------------------------------------------------
                    When the Player finishes loading in
    ------------------------------------------------------------------*/
    OnPlayerInit: function(player) {
        this.checkPlayerData(player);
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
        TitlesData.PlayerData[steamID].Title = TitlesData.PlayerData[steamID].Title || "";
        TitlesData.PlayerData[steamID].Rank = TitlesData.PlayerData[steamID].Rank || 0;
        TitlesData.PlayerData[steamID].Kills = TitlesData.PlayerData[steamID].Kills || 0;
        TitlesData.PlayerData[steamID].KDR = TitlesData.PlayerData[steamID].KDR || 0;
        TitlesData.PlayerData[steamID].Deaths = TitlesData.PlayerData[steamID].Deaths || 0;
        TitlesData.PlayerData[steamID].Karma = TitlesData.PlayerData[steamID].Karma || 0;
        TitlesData.PlayerData[steamID].isAdmin = TitlesData.PlayerData[steamID].isAdmin || (authLvl >= 2) || false;
        TitlesData.PlayerData[steamID].hidden = TitlesData.PlayerData[steamID].hidden || false;
        showPlayer = this.Config.Settings.showPlayer;
        if (TitlesData.SetupData.Type === "ranks") {
            this.setRank(steamID, TitlesData.PlayerData[steamID].Kills, player);
        } else if (TitlesData.SetupData.Type === "titles") {
            print("Titles")
            if (TitlesData.PlayerData[steamID].Title === "") {
                TitlesData.PlayerData[steamID].Title = this.Config.Titles[0].title;
                this.saveData();
            }
            this.setTitles(steamID, player);
        }
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
        var steamID = rust.UserIDFromPlayer(player);
        rust.SendChatMessage(player, "RanksAndTitles", "Data Reset", "0");
        this.checkPlayerData(player);
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
            rust.SendChatMessage(player, "RankAndTitles", "For info type /set info", "0");
        } else if (authLvl >= 2 && args.length >= 1) {
            switch (args[0]) {
                case "info":
                    rust.SendChatMessage(player, "RankAndTitles", "Ranks for players this is an automated system based on kills later this may be used with my bounty board plugin", "0");
                    rust.SendChatMessage(player, "RankAndTitles", "Titles works for if you want to create and assign your own titles", "0");
                    break;
                case "ranks":
                    if (TitlesData.SetupData.Type == "titles") {
                        TitlesData.SetupData.Type = "ranks";
                        print("Converting player data from titles, to ranks.");
                        this.startPlugin();
                        this.saveData();
                        rust.BroadcastChat('RanksAndTitles', "The Server Admin has switched to Ranks, please use /rtconvert to reload your player ranks and titles data.", 0);
                    } else if (TitlesData.SetupData.Type == "") {
                        TitlesData.SetupData.Type = "ranks";
                        print("Setting Up Ranks.");
                        this.startPlugin();
                        this.saveData();
                        rust.SendChatMessage(player, "RankAndTitles", "Great! The plugin will now build the correct data and configurations.", "0")
                    }
                    break;
                case "titles":
                    if (TitlesData.SetupData.Type == "ranks") {
                        TitlesData.SetupData.Type = "titles";
                        this.saveData();
                        print("Converting player data from ranks, to titles.");
                        rust.BroadcastChat('RanksAndTitles', "The Server Admin has switched to Titles, please use /rtconvert to reload your player ranks and titles data.", 0);
                    } else if (TitlesData.SetupData.Type == "") {
                        TitlesData.SetupData.Type = "titles";
                        print("Converting player data from titles, to ranks.");
                        this.startPlugin();
                        this.saveData();
                        rust.SendChatMessage(player, "RankAndTitles", "Great! The plugin will now build the correct data and configurations.", "0")
                    }
                    break;
                default:
                    rust.SendChatMessage(player, "RankAndTitles", "Incorrect command structure, please try again.", "0");
                    break;
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
        var j = this.Config.Ranks.length,
            i = 0;
        var karmaOn = this.Config.Settings.karma,
            karma = TitlesData.PlayerData[killerID].Karma
        colorOn = this.Config.Settings.Color
            //Check if Karma, Color, and Groups are enabled
        for (i; i < j; i++) {
            if (!GroupsAPI) {
                if (karmaOn && colorOn) {
                    if (karma === this.Config.Ranks[i].karma) {
                        killer.displayName = TitlesData.PlayerData[killerID].RealName + " <color="
                        this.Config.Ranks[i].Color ">[" + this.Config.Ranks[i].title + "]</color>";
                        TitlesData.PlayerData[killerID].Title = this.Config.Ranks[i].title;
                        TitlesData.PlayerData[killerID].Rank = this.Config.Ranks[i].rank
                    }
                } else if (karmaOn && !colorOn) {
                    if (karma === this.Config.Ranks[i].karma) {
                        killer.displayName = TitlesData.PlayerData[killerID].RealName + " [" + this.Config.Ranks[i].title + "]";
                        TitlesData.PlayerData[killerID].Title = this.Config.Ranks[i].title;
                        TitlesData.PlayerData[killerID].Rank = this.Config.Ranks[i].rank
                    }
                } else if (!karmaOn && colorOn) {
                    if (kills === this.Config.Ranks[i].Kills) {
                        killer.displayName = TitlesData.PlayerData[killerID].RealName + " <color="
                        this.Config.Ranks[i].Color ">[" + this.Config.Ranks[i].title + "]</color>";
                        TitlesData.PlayerData[killerID].Title = this.Config.Ranks[i].title;
                        TitlesData.PlayerData[killerID].Rank = this.Config.Ranks[i].rank
                    }
                } else {
                    if (kills === this.Config.Ranks[i].Kills) {
                        killer.displayName = TitlesData.PlayerData[killerID].RealName + " [" + this.Config.Ranks[i].title + "]";
                        TitlesData.PlayerData[killerID].Title = this.Config.Ranks[i].title;
                        TitlesData.PlayerData[killerID].Rank = this.Config.Ranks[i].rank
                    }
                }

            } else {
                if (karmaOn && colorOn) {
                    if (karma === this.Config.Ranks[i].karma) {
                        GroupData.PlayerData[steamID].RealName = TitlesData.PlayerData[killerID].RealName + " <color="
                        this.Config.Ranks[i].Color ">[" + this.Config.Ranks[i].title + "]</color>";
                        TitlesData.PlayerData[killerID].Title = this.Config.Ranks[i].title;
                        TitlesData.PlayerData[killerID].Rank = this.Config.Ranks[i].rank
                    }
                } else if (karmaOn && !colorOn) {
                    if (karma === this.Config.Ranks[i].karma) {
                        killer.displayName = TitlesData.PlayerData[killerID].RealName + " [" + this.Config.Ranks[i].title + "]";
                        TitlesData.PlayerData[killerID].Title = this.Config.Ranks[i].title;
                        TitlesData.PlayerData[killerID].Rank = this.Config.Ranks[i].rank
                    }
                } else if (!karmaOn && colorOn) {
                    if (kills === this.Config.Ranks[i].Kills) {
                        killer.displayName = TitlesData.PlayerData[killerID].RealName + " <color="
                        this.Config.Ranks[i].Color ">[" + this.Config.Ranks[i].title + "]</color>";
                        TitlesData.PlayerData[killerID].Title = this.Config.Ranks[i].title;
                        TitlesData.PlayerData[killerID].Rank = this.Config.Ranks[i].rank
                    }
                } else {
                    if (kills === this.Config.Ranks[i].Kills) {
                        killer.displayName = TitlesData.PlayerData[killerID].RealName + " [" + this.Config.Ranks[i].title + "]";
                        TitlesData.PlayerData[killerID].Title = this.Config.Ranks[i].title;
                        TitlesData.PlayerData[killerID].Rank = this.Config.Ranks[i].rank
                    }
                }

            }
        }
        this.saveData();
    },

    updateKDR: function(kills, deaths, player) {
        var steamID = rust.UserIDFromPlayer(player);
        var killsToDeaths = kills / deaths;
        killsToDeaths = Math.ceil(killsToDeaths * 100) / 100;
        TitlesData.PlayerData[steamID].KDR = killsToDeaths;
        this.saveData();
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
                break;
        }
    },

    checkStats: function(player, cmd, args) {
        var steamID = rust.UserIDFromPlayer(player);
        rust.SendChatMessage(player, "Ranks", "Your Kill count is: " + TitlesData.PlayerData[steamID].Kills, "0");
        rust.SendChatMessage(player, "Ranks", "Your Death count is: " + TitlesData.PlayerData[steamID].Deaths, "0");
        rust.SendChatMessage(player, "Ranks", "Your KDR is: " + TitlesData.PlayerData[steamID].KDR, "0");
        if (karmaOn) rust.SendChatMessage(player, "Ranks", "Your current Karma is: " + TitlesData.PlayerData[steamID].Karma, "0");
    },

    wipePlayer: function(player, cmd, args) {
        var target = this.findPlayerByName(args) || "";
        if (target[1].length) {
            TitlesData.PlayerData[target[1]].Kills = 0;
            TitlesData.PlayerData[target[1]].Deaths = 0;
            TitlesData.PlayerData[target[1]].KDR = 0;
            rust.SendChatMessage(player, "Ranks", "Player Wiped!", "0");
            this.saveData();
            this.setRank(steamID, TitlesData.PlayerData[target[1]].Kills, target[0]);
        } else if (!target[1].length) {
            rust.SendChatMessage(player, "Ranks", "Player Name not entered", "0");
        } else {
            rust.SendChatMessage(player, "Ranks", "Player not Found!", "0");
        }

    },

    getKarma: function(playerID) {
      var i = 0, j = this.Config.Ranks.length;
      for (i; i < j; i++) {
        if (this.Config.Ranks[i].title === TitlesData.PlayerData[playerID].Title) {
          return this.Config.Ranks[i].karmaModifier;
        }
      }
    },

    /*-----------------------------------------------------------------
                      Check for Deaths
      ------------------------------------------------------------------*/

    OnEntityDeath: function(entity, hitinfo) {
        var victim = entity, attacker = hitinfo.Initiator;
        if (victim.ToPlayer() && attacker.ToPlayer() && TitlesData.SetupData.Type === "ranks" && victim.displayName !== attacker.displayName) {
            var killer = attacker.ToPlayer(), killerID = rust.UserIDFromPlayer(killer), victimID = rust.UserIDFromPlayer(victim); 
            var karmaOn = this.Config.Settings.karma, karma = TitlesData.PlayerData[killerID].Karma;
            if (karmaOn && TitlesData.PlayerData[victimID].Karma >= 0) {
                TitlesData.PlayerData[killerID].Kills += 1;
                TitlesData.PlayerData[victimID].Deaths += 1;
                TitlesData.PlayerData[killerID].Karma -= this.getKarma(victimID);
            } else if (karmaOn && TitlesData.PlayerData[victimID].Karma < 0) {
                TitlesData.PlayerData[killerID].Kills += 1;
                TitlesData.PlayerData[victimID].Deaths += 1;
                TitlesData.PlayerData[killerID].Karma += this.getKarma(victimID);
            } else {
                TitlesData.PlayerData[killerID].Kills += 1;
                TitlesData.PlayerData[victimID].Deaths += 1;
            }
            this.setRank(killerID, TitlesData.PlayerData[killerID].Kills, killer);
            this.updateKDR(TitlesData.PlayerData[victimID].Kills, TitlesData.PlayerData[victimID].Deaths, victim.ToPlayer());
            this.updateKDR(TitlesData.PlayerData[killerID].Kills, TitlesData.PlayerData[killerID].Deaths, killer);
        } else if (victim.ToPlayer() && victim.displayName === attacker.displayName) {
            TitlesData.PlayerData[victimID].Deaths += 1;
            this.updateKDR(TitlesData.PlayerData[victimID].Kills, TitlesData.PlayerData[victimID].Deaths, victim.ToPlayer());
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
                break;
        }
    },

    setTitles: function(steamID, player) {
        var getAuth = player.net.connection.authLevel;
        var j = this.Config.Titles.length,
            i = 0;
        var showPlayer = this.Config.Settings.showPlayer;

        for (i; i < j; i++) {
            if (!GroupsAPI) {
                if (getAuth == this.Config.Titles[i].authLvl && TitlesData.PlayerData[steamID].Title === this.Config.Titles[i].title) {
                    TitlesData.PlayerData[steamID].Title = this.Config.Titles[i].title;
                    player.displayName = TitlesData.PlayerData[steamID].RealName + "[" + TitlesData.PlayerData[steamID].Title + "]";
                }
            } else {
                if (this.Config.Titles[i].authLvl === getAuth && TitlesData.PlayerData[steamID].Title === this.Config.Titles[i].title) {
                    TitlesData.PlayerData[steamID].Title = this.Config.Titles[i].title;
                    GroupData.PlayerData[steamID].RealName = TitlesData.PlayerData[steamID].RealName + "[" + TitlesData.PlayerData[steamID].Title + "]";
                    //player.displayName = TitlesData.PlayerData[steamID].RealName + "[" + TitlesData.PlayerData[steamID].Title + "]";
                    print(GroupData.PlayerData[steamID].RealName);
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
                        if (TitlesData.PlayerData[key].Title === this.Config.Titles[i].title && !this.Config.Titles[i].Exclude) {
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
                        if (TitlesData.PlayerData[key].Title === this.Config.Titles[i].title && !this.Config.Titles[i].Exclude) {
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
        var getPlayer = this.findPlayerByName(player, args);
        var getPlayerData = TitlesData.PlayerData;
        if (!getPlayer) {
            return false;
        }
        if (args[2].length) {
            for (var i = 0; i < this.Config.Titles.length; i++) {
                if (args[2] === this.Config.Titles[i].title.toLowerCase() && !GroupsAPI) {
                    getPlayer[0].displayName = getPlayerData[getPlayer[1]].RealName + "[" + this.Config.Titles[i].title + "]";
                    TitlesData.PlayerData[getPlayer[1]].Title = this.Config.Titles[i].title;
                } else if (args[2] === this.Config.Titles[i].title.toLowerCase() && GroupsAPI) {
                    GroupData.PlayerData[getPlayer[1]].RealName = getPlayerData[getPlayer[1]].RealName + "[" + this.Config.Titles[i].title + "]";
                    TitlesData.PlayerData[getPlayer[1]].Title = this.Config.Titles[i].title;
                    print(TitlesData.PlayerData[getPlayer[1]].Title);
                }
            }
            rust.SendChatMessage(player, "Titles", "Player Title Set successfully!", "0");
        } else {
            rust.SendChatMessage(player, "Titles", "You need to enter a Title for the player", "0");
        }
        this.saveData();
    }
}
