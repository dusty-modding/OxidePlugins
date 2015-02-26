var RanksAndTitles = {
    Title: "Ranks And Titles",
    Author: "Killparadise",
    Version: V(1, 0, 0),
    ResourceId: 6874,
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
        command.AddChatCommand("dedata", this.Plugin, "cmddebugdata");
    },

    OnServerInitialized: function() {
        print(this.Title + " Is now loading, please wait...");
        command.AddChatCommand("setup", this.Plugin, "cmdStartSetup");
        if (TitlesData.SetupData.Type && TitlesData.SetupData.Type != "") {
            this.startPlugin();
        }
    },

    LoadDefaultConfig: function() {
        this.Config.authLevel = 2;
        this.Config.Settings = {
            "showPlayer": true,
            "displayLvl": true,
            "hideAllAdmins": false,
            "automated": false
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
        try{
        var authLvl = player.net.connection.authLevel;
        var steamID = rust.UserIDFromPlayer(player);
        TitlesData.PlayerData[steamID] = TitlesData.PlayerData[steamID] || {};
        TitlesData.PlayerData[steamID].RealName = TitlesData.PlayerData[steamID].RealName || player.displayName || "";
        TitlesData.PlayerData[steamID].Title = TitlesData.PlayerData[steamID].Title || "Player";
        TitlesData.PlayerData[steamID].Rank = TitlesData.PlayerData[steamID].Rank || "";
        TitlesData.PlayerData[steamID].Kills = TitlesData.PlayerData[steamID].Kills || 0;
        TitlesData.PlayerData[steamID].Deaths = TitlesData.PlayerData[steamID].Deaths || 0;
        TitlesData.PlayerData[steamID].isAdmin = TitlesData.PlayerData[steamID].isAdmin || (authLvl >= 2) || false;
        TitlesData.PlayerData[steamID].hidden = TitlesData.PlayerData[steamID].hidden || false;
        showPlayer = this.Config.Settings.showPlayer;
        if (TitlesData.SetupData.Type === "auto") {
            this.setRank(steamID, TitlesData.PlayerData[steamID].Kills, player)
        }
        this.saveTitleData();
    } catch(e) {
        print(e.message.toString());
    }
    },

    buildSetupData: function() {
        TitlesData.SetupData.Type = TitlesData.SetupData.Type || "";

    },
    saveTitleData: function() {
        //Save our data to our titles data file
        data.SaveData('RanksandTitles');
        if (GroupsAPI) {
            data.SaveData('Groups');
        }
    },

    cmddebugdata: function(player, cmd, args) {
        print("Data Re ran")
        this.checkPlayerData(player);
    },

    /*-----------------------------------------------------------------
                      Run Setup
      ------------------------------------------------------------------*/

    cmdStartSetup: function(player, cmd, args) {
        var authLvl = player.net.connection.authLevel;
        if (authLvl >= 2 && args.length < 1) {
            rust.SendChatMessage(player, "RankAndTitles", "How do you want titles to run? Automated(Ranks) or Custom", "0");
            rust.SendChatMessage(player, "RankAndTitles", "For info type /setup info auto or custom", "0");
        } else if (authLvl >= 2 && args.length >= 1) {
            switch (args[0]) {
                case "info":
                    print(args[1]);
                    if (args[1] === "auto") {
                        rust.SendChatMessage(player, "RankAndTitles", "Auto messages work as a Ranking system for players this is an automated system based on kills later this may be used with my bounty board plugin", "0");
                    } else if (args[1] === "custom") {
                        rust.SendChatMessage(player, "RankAndTitles", "Custom titles works for if you want to create and assign your own custom titles", "0");
                    } else {
                        rust.SendChatMessage(player, "RankAndTitles", "You didn't use auto or custom in the command for info.", "0");
                    }
                    break;
                case "auto":
                    rust.SendChatMessage(player, "RankAndTitles", "You've chosen auto! Great! Now you can use /autitle finish to finish setup.", "0");
                    try {
                    command.AddChatCommand("autitle", this.Plugin, "setupAuto");
                } catch(e) {
                    print(e.messages.toString());
                }
                    break;
                case "custom":
                    rust.SendChatMessage(player, "RankAndTitles", "You've chosen custom! Great! Now you can use /cutitle finish to finish setup.", "0");
                    command.AddChatCommand("cutitle", this.Plugin, "sutpCustom");
                    break;
                default:
                    rust.SendChatMessage(player, "RankAndTitles", "Incorrect command structure, please try again.", "0");
                    break;
            }
        } else {
            rust.SendChatMessage(player, "RankAndTitles", "You do not have permission to use this command!", "0");
        }
    },

    setupAuto: function(player, cmd, args) {
        try {
        var authLvl = player.net.connection.authLevel;
        if (authLvl >= 2) {
            if (TitlesData.SetupData.Type == "custom" && !args.length) {
                rust.SendChatMessage(player, "RankAndTitles", "WARNING: Your current type is" + TitlesData.SetupData.Type + "changing this will reset your data files! Recommend Backing them up!", "0");
            } else if (TitlesData.SetupData.Type === "" && !args.length) {
                rust.SendChatMessage(player, "RankAndTitles", "please use /autitle finish to finish setup.", "0")
            } else {
                rust.SendChatMessage(player, "RankAndTitles", "You already have auto set! no need to set it again!", "0");
            }
            if (args.length && args[0] === "finish") {
                rust.SendChatMessage(player, "RankAndTitles", "Great! The plugin will now build the correct data and configurations.", "0");
                TitlesData.SetupData.Type = "auto";
                this.startPlugin();
                this.saveTitleData();
            }
        } else {
            rust.SendChatMessage(player, "RankAndTitles", "You do not have permission to use this command!", "0");
        }

    } catch(e) {
        print(e.message.toString());
    }
    },

    setupCustom: function(player, cmd, args) {
        var authLvl = player.net.connection.authLevel;
        if (authLvl >= 2) {
            if (TitlesData.SetupData.Type == "auto" && !args.length) {
                rust.SendChatMessage(player, "RankAndTitles", "WARNING: Your current type is" + TitlesData.SetupData.Type + "changing this will reset your data files! Recommend Backing them up!", "0");
            } else if (TitlesData.SetupData.Type === "" && !args.length) {
                rust.SendChatMessage(player, "RankAndTitles", "please use /cutitle finish to finish setup.", "0");
            } else {
                rust.SendChatMessage(player, "RankAndTitles", "You already have custom set! no need to set it again!", "0");
            }
            if (args.length && args[0] === "finish") {
                rust.SendChatMessage(player, "RankAndTitles", "Great! The plugin will now build the correct data and configurations.", "0");
                TitlesData.SetupData.Type = "custom";
                this.startPlugin();
                this.saveTitleData();
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
        if (TitlesData.SetupData.Type === "auto") {
            print("Plugin Started in: Auto");
            command.AddChatCommand("kcheck", this.Plugin, "checkKills");
            command.AddChatCommand("dcheck", this.Plugin, "checkDeaths");
            captureDeaths = true;
        } else if (TitlesData.SetupData.Type === "custom") {
            print("Plugin Started in: Custom");
            command.AddChatCommand("title", this.Plugin, "giveTitle");
            command.AddChatCommand("shp", this.Plugin, "showPlayers");
            command.AddChatCommand("hide", this.Plugin, "hideAllAdmins");
            captureDeaths = false;
        } else {
            print("Something Didn't take, I think we hit an issue with Type in the Data file.");
        }
    },
    /*--------------------Auto System Setup----------------------------
      -----------------------------------------------------------------
                      Get our Counts and set Ranks
      ------------------------------------------------------------------*/

    setRank: function(steamID, kills, killer) {
        try {
        print("Hit SetRank");
        var ranks = this.Config.Ranks;
        print(ranks);
        neededKills = ranks.killsNeeded;

        if (kills >= 0 && !GroupsAPI) {
            for (var i = 0; i < ranks.length; i++) {
                if (kills === ranks[i].killsNeeded) {
                    killer.DisplayName = TitlesData.PlayerData[steamID].RealName + "[" + ranks[i].title + "]";
                    TitlesData.PlayerData[steamID].Title = ranks[i].title;
                }
            }
            //If Groups is present we will use this instead so we don't clash with groups
        } else if (kills >= 0 && GroupsAPI) {
            print("Setting Rank Debug...")
            print(kills);
            for (var i = 0; i < ranks.length; i++) {
                print(ranks[i].killsNeeded);
                if (kills === ranks[i].killsNeeded) {
                    GroupData.PlayerData[steamID].RealName = TitlesData.PlayerData[steamID].RealName + "[" + ranks[i].title + "]"
                    TitlesData.PlayerData[steamID].Title = ranks[i].title;
                }
            }
        }
            this.saveTitleData();

    } catch(e) {
        print(e.message.toString());
    }
    },

    checkKills: function(player, cmd, args) {
        var steamID = rust.UserIDFromPlayer(player);
        rust.SendChatMessage(player, "Ranks", "Your Kill count is: " + TitlesData.PlayerData[steamID].Kills, "0");
    },

    checkDeaths: function(player, cmd, args) {
        var steamID = rust.UserIDFromPlayer(player);
        rust.SendChatMessage(player, "Ranks", "Your Death count is: " + TitlesData.PlayerData[steamID].Deaths, "0");
    },

    /*-----------------------------------------------------------------
                      Check for Deaths
      ------------------------------------------------------------------*/

    OnEntityDeath: function(self, entity, hitinfo) {
        if (captureDeaths) {
            var victim = entity;
            var attacker = hitinfo.Initiator;
            print(attacker);
            if (victim == 'BasePlayer' && attacker.ToPlayer()) {
                var killer = attacker.ToPlayer();
                var steamID = rust.UserIDFromPlayer(killer)
                TitlesData.PlayerData[steamID].Kills + 1
                this.setRank(steamID, TitlesData.PlayerData[steamID].Kills, killer);
            }
        }
    },
    /*-------------------End of Auto System Setup----------------------
      -------------------Start Custom System Setup---------------------*/
    setCustom: function(steamID, player) {
        var getAuth = player.net.connection.authLevel;
        var getTitles = this.Config.Titles;
        var getSettings = this.Config.Settings;
        if (GroupsAPI && showPlayer) {
            for (var j = 0; j < getTitles.length; j++) {
                if (getTitle[j].Exclude && getAuth > 0 && getAuth === getTitles[j].authLvl) {
                    if (TitlesData.PlayerData[steamID].Title === "") {
                        TitlesData.PlayerData[steamID].Title = getTitles[j].title
                    };
                    GroupData.PlayerData[steamID].RealName = TitlesData.PlayerData[steamID].RealName + "[" + TitlesData.PlayerData[steamID].Title + "]";
                } else if (getTitle[j].Exclude && getAuth === 0 && TitlesData.PlayerData[steamID].Title === getTitles[j].title) {
                    if (TitlesData.PlayerData[steamID].Title === "") {
                        TitlesData.PlayerData[steamID].Title = getTitles[j].title
                    };
                    GroupData.PlayerData[steamID].RealName = TitlesData.PlayerData[steamID].RealName + "[" + TitlesData.PlayerData[steamID].Title + "]";
                } else {
                    GroupData.PlayerData[steamID].RealName = TitlesData.PlayerData[steamID].RealName;
                }
            }
        } else if (!GroupsAPI && showPlayer) {
            for (var j = 0; j < getTitles.length; j++) {
                if (getTitle[j].Exclude && getAuth > 0 && getAuth === getTitles[j].authLvl) {
                    if (TitlesData.PlayerData[steamID].Title === "") {
                        TitlesData.PlayerData[steamID].Title = getTitles[j].title
                    };
                    player.DisplayName = TitlesData.PlayerData[steamID].RealName + "[" + TitlesData.PlayerData[steamID].Title + "]";
                } else if (getTitle[j].Exclude && getAuth === 0 && TitlesData.PlayerData[steamID].Title === getTitles[j].title) {
                    if (TitlesData.PlayerData[steamID].Title === "") {
                        TitlesData.PlayerData[steamID].Title = getTitles[j].title
                    };
                    player.DisplayName = TitlesData.PlayerData[steamID].RealName + "[" + TitlesData.PlayerData[steamID].Title + "]";
                } else {
                    player.DisplayName = TitlesData.PlayerData[steamID].RealName;
                }
            }
        } else {
            player.DisplayName = TitlesData.PlayerData[steamID].RealName;
        }
        this.saveTitleData();
    },

    showPlayers: function(player, cmd, args) {
        if (authLvl >= 2) {
            if (showPlayer) {
                showPlayer = false;
                this.SaveConfig();
                rust.SendChatMessage(player, "RankAndTitles", "Player Titles disabled", "0");
            } else {
                showPlayer = true;
                this.SaveConfig();
                rust.SendChatMessage(player, "RankAndTitles", "Player Titles enabled", "0");
            }
        } else {
            rust.SendChatMessage(player, "RankAndTitles", "You do not have permission to use this command!", "0");
        }
    },

    hideAllAdmins: function(player, cmd, args) {
        //TODO: write command function to hide admin titles from chat
    },

    giveTitle: function(player, cmd, args) {
        //TODO: write command function so admin can give users custom titles
    }

}
