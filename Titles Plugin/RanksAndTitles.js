var RanksAndTitles = {
    Title: "Ranks And Titles",
    Author: "Killparadise",
    Version: V(0, 2, 5),
    ResourceId: 830,
    Url: "http://oxidemod.org/resources/ranks-and-titles.830/",
    HasConfig: true,
    Init: function() {
        HelpFound = plugins.Find("helptext");
        GroupsAPI = plugins.Find('RotAG-Groups');
        if (GroupsAPI) {
            GroupsAPI = true;
            print('Groups Found. Loading...')
        } else {
            GroupsAPI = false;
        }
        if (HelpFound) {
            HelpFound = true;
        } else {
            HelpFound = false;
        }
        this.loadTitleData();
        this.buildSetupData();
        command.AddChatCommand("rtrefresh", this.Plugin, "resetData");
    },

    OnServerInitialized: function() {
        print(this.Title + " Is now loading, please wait...");
        msgs = this.Config.Messages;
        if (TitlesData.SetupData.Type && TitlesData.SetupData.Type != "") {
            this.startPlugin();
        } else {
            command.AddChatCommand("set", this.Plugin, "cmdStartSetup");
        }
        //if (!HelpFound) command.AddChatCommand("help", this.Plugin, "SendHelpText");

    },

    LoadDefaultConfig: function() {
        this.Config.authLevel = 2;
        this.Config.Settings = {
            "showPlayer": true,
            "hideAllAdmins": false,
            "karma": true,
            "colorSupport": true
        };
        this.Config.Titles = [{
            "authLvl": 0,
            "title": "Player",
            "Exclude": false,
            "Color": "#FFFFFF"
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
            "Color": "#FFFFFF",
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
            "killsNeeded": "disabled",
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
            "killsNeeded": "disabled",
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
            "killsNeeded": "disabled",
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
            "killsNeeded": "disabled",
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
            "killsNeeded": "disabled",
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
            "killsNeeded": "disabled",
            "Color": "#0000a0ff",
            "karmaModifier": 100
        }];
        this.Config.Messages = {
            "Promoted": "You've been Promoted!",
            "NoPlyrs": "No Players Found...",
            "plyrWiped": "Player Wiped!",
            "dataRfrsh": "Data Refreshed!",
            "noPerms": "You do not have permission to use this command.",
            "setSuccs": "Player Title Set Successfully!",
            "needTitle": "You need to enter a title for the player!",
            "kills": "Your Kill count is: ",
            "deaths": "Your Death count is: ",
            "kdr": "Your KDR is currently: ",
            "karma": "Your current Karma is: ",
            "rank": "Your current Rank is: ",
            "title": "Your current Title is: ",
            "badSyntaxRank": "The command syntax was incorrect, please use /ranks set name title",
            "badSyntaxTitle": "The command syntax was incorrect, please use /titles set name title",
            "set": "How do you want the system to run? Ranks or Titles? For more info do /set info",
            "infoRanks": "Ranks for players this is an automated system based on kills & karma; this also supports a Bandit Vs Hero Karma System.",
            "infoTitles": "Titles is a system for a community or calm server, allowing owners to set and create custom user titles.",
            "convert": "The Server Admin has switched to Ranks, please use /rtconvert to reload your player ranks and titles data.",
            "finished": "Great! The plugin will now build the correct data and configurations.",
            "errors": "Incorrect command structure, please try again.",
            "customFnd": "Using Custom Title... Skipping Change...",
            "loseKarma": "You've lost Karma!",
            "gainKarma": "You've gained Karma! "
        };
        this.Config.Help = {
            "playerHelp": {
                "cmdRanks": "/ranks - Displays your current Rank",
                "cmdStats": "/ranks stats - Displays your current stats",
                "cmdTitles": "/titles - Displays your current Titles",
                "cmdRfrsh": "/rtrefresh - Regreshes your player "
            },
            "adminHelp": {
                "cmdSetR": "/ranks set playername titlename - Sets the given title name to the player",
                "cmdWipe": "/ranks wipe playername - Wipes the rank stats of the provided player",
                "cmdSetT": "/titles set playername titlename - Sets the given title name to the player",
                "cmdHide": "/titles hide - Allows you to hide your user title"
            }


        };
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
        rust.SendChatMessage(player, "RanksAndTitles", msgs.dataRfrsh, "0");
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
            rust.SendChatMessage(player, "Titles", msgs.NoPlyrs, "0");
            return false;
        }
    },

    findPlayer: function(playerid) {
        var global = importNamespace("");
        targetPlayer = global.BasePlayer.Find(playerid);
        if (targetPlayer != null) {
            return targetPlayer;
        } else {
            rust.SendChatMessage(player, "Titles", msgs.NoPlyrs, "0");
            return false;
        }
    },

    /*-----------------------------------------------------------------
                      Run Setup
      ------------------------------------------------------------------*/

    cmdStartSetup: function(player, cmd, args) {
        var authLvl = player.net.connection.authLevel;
        if (authLvl >= 2 && args.length < 1) {
            rust.SendChatMessage(player, "RankAndTitles", msgs.set, "0");
        } else if (authLvl >= 2 && args.length >= 1) {
            switch (args[0]) {
                case "info":
                    rust.SendChatMessage(player, "RankAndTitles", msgs.infoRanks, "0");
                    rust.SendChatMessage(player, "RankAndTitles", msgs.infoTitle, "0");
                    break;
                case "ranks":
                    if (TitlesData.SetupData.Type == "titles") {
                        TitlesData.SetupData.Type = "ranks";
                        print("Converting player data from titles, to ranks.");
                        this.startPlugin();
                        this.saveData();
                        rust.BroadcastChat('RanksAndTitles', msgs.convert, 0);
                    } else if (TitlesData.SetupData.Type == "") {
                        TitlesData.SetupData.Type = "ranks";
                        print("Setting Up Ranks.");
                        this.startPlugin();
                        this.saveData();
                        rust.SendChatMessage(player, "RankAndTitles", msgs.finished, "0")
                    }
                    break;
                case "titles":
                    if (TitlesData.SetupData.Type == "ranks") {
                        TitlesData.SetupData.Type = "titles";
                        this.saveData();
                        print("Converting player data from ranks, to titles.");
                        rust.BroadcastChat('RanksAndTitles', msgs.convert, 0);
                    } else if (TitlesData.SetupData.Type == "") {
                        TitlesData.SetupData.Type = "titles";
                        print("Converting player data from titles, to ranks.");
                        this.startPlugin();
                        this.saveData();
                        rust.SendChatMessage(player, "RankAndTitles", msgs.finished, "0")
                    }
                    break;
                default:
                    rust.SendChatMessage(player, "RankAndTitles", msgs.errors, "0");
                    break;
            }
        } else {
            rust.SendChatMessage(player, "RankAndTitles", msgs.noPerms, "0");
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
        colorOn = this.Config.Settings.colorSupport;
        //Check if Karma, Color, and Groups are enabled
        for (i; i < j; i++) {
            if (!GroupsAPI && TitlesData.PlayerData[killerID].Title === this.Config.Ranks[i].title || TitlesData.PlayerData[killerID].Title === "") {
                if (karmaOn && colorOn) {
                    if (karma === this.Config.Ranks[i].karma) {
                        killer.displayName = TitlesData.PlayerData[killerID].RealName + " <color=" + this.Config.Ranks[i].Color + ">[" + this.Config.Ranks[i].title + "]</color>";
                        TitlesData.PlayerData[killerID].Title = this.Config.Ranks[i].title;
                        TitlesData.PlayerData[killerID].Rank = this.Config.Ranks[i].rank
                        rust.SendChatMessage(killer, "Ranks", "<color=green>" + msgs.Promoted + "</color>", "0");
                    }
                } else if (karmaOn && !colorOn) {
                    if (karma === this.Config.Ranks[i].karma) {
                        killer.displayName = TitlesData.PlayerData[killerID].RealName + " [" + this.Config.Ranks[i].title + "]";
                        TitlesData.PlayerData[killerID].Title = this.Config.Ranks[i].title;
                        TitlesData.PlayerData[killerID].Rank = this.Config.Ranks[i].rank
                        rust.SendChatMessage(killer, "Ranks", "<color=green>" + msgs.Promoted + "</color>", "0");
                    }
                } else if (!karmaOn && colorOn) {
                    if (kills === this.Config.Ranks[i].killsNeeded) {
                        killer.displayName = TitlesData.PlayerData[killerID].RealName + " <color=" + this.Config.Ranks[i].Color + ">[" + this.Config.Ranks[i].title + "]</color>";
                        TitlesData.PlayerData[killerID].Title = this.Config.Ranks[i].title;
                        TitlesData.PlayerData[killerID].Rank = this.Config.Ranks[i].rank
                        rust.SendChatMessage(killer, "Ranks", "<color=green>" + msgs.Promoted + "</color>", "0");
                    }
                } else if (!karmaOn && !colorOn) {
                    if (kills === this.Config.Ranks[i].killsNeeded) {
                        killer.displayName = TitlesData.PlayerData[killerID].RealName + " [" + this.Config.Ranks[i].title + "]";
                        TitlesData.PlayerData[killerID].Title = this.Config.Ranks[i].title;
                        TitlesData.PlayerData[killerID].Rank = this.Config.Ranks[i].rank
                        rust.SendChatMessage(killer, "Ranks", "<color=green>" + msgs.Promoted + "</color>", "0");
                    }
                } else if (TitlesData.PlayerData[killerID].Title !== this.Config.Ranks[i].title && (kills === this.Config.Ranks[i].killsNeeded || karma === this.Config.Ranks[i].karma)) {
                    TitlesData.PlayerData[killerID].Rank = this.Config.Ranks[i].rank;
                    rust.SendChatMessage(killer, "Ranks", "<color=green>" + msgs.Promoted + "</color>", "0");
                    rust.SendChatMessage(killer, "Ranks", "<color=red>" + msgs.customFnd + "</color>", "0");
                }

            } else if (GroupsAPI && TitlesData.PlayerData[killerID].Title === this.Config.Ranks[i].title || TitlesData.PlayerData[killerID].Title === "") {
                if (karmaOn && colorOn) {
                    if (karma === this.Config.Ranks[i].karma) {
                        GroupData.PlayerData[steamID].RealName = TitlesData.PlayerData[killerID].RealName + " <color=" + this.Config.Ranks[i].Color + ">[" + this.Config.Ranks[i].title + "]</color>";
                        TitlesData.PlayerData[killerID].Title = this.Config.Ranks[i].title;
                        TitlesData.PlayerData[killerID].Rank = this.Config.Ranks[i].rank
                        rust.SendChatMessage(killer, "Ranks", "<color=green>" + msgs.Promoted + "</color>", "0");
                    }
                } else if (karmaOn && !colorOn) {
                    if (karma === this.Config.Ranks[i].karma) {
                        GroupData.PlayerData[steamID].RealName = TitlesData.PlayerData[killerID].RealName + " [" + this.Config.Ranks[i].title + "]";
                        TitlesData.PlayerData[killerID].Title = this.Config.Ranks[i].title;
                        TitlesData.PlayerData[killerID].Rank = this.Config.Ranks[i].rank
                        rust.SendChatMessage(killer, "Ranks", "<color=green>" + msgs.Promoted + "</color>", "0");
                    }
                } else if (!karmaOn && colorOn) {
                    if (kills === this.Config.Ranks[i].killsNeeded) {
                        GroupData.PlayerData[steamID].RealName = TitlesData.PlayerData[killerID].RealName + " <color=" + this.Config.Ranks[i].Color + ">[" + this.Config.Ranks[i].title + "]</color>";
                        TitlesData.PlayerData[killerID].Title = this.Config.Ranks[i].title;
                        TitlesData.PlayerData[killerID].Rank = this.Config.Ranks[i].rank
                        rust.SendChatMessage(killer, "Ranks", "<color=green>" + msgs.Promoted + "</color>", "0");
                    }
                } else if (!karmaOn && !colorOn) {
                    if (kills === this.Config.Ranks[i].killsNeeded) {
                        GroupData.PlayerData[steamID].RealName = TitlesData.PlayerData[killerID].RealName + " [" + this.Config.Ranks[i].title + "]";
                        TitlesData.PlayerData[killerID].Title = this.Config.Ranks[i].title;
                        TitlesData.PlayerData[killerID].Rank = this.Config.Ranks[i].rank
                        rust.SendChatMessage(killer, "Ranks", "<color=green>" + msgs.Promoted + "</color>", "0");
                    }
                }

            } else if (!GroupsAPI && TitlesData.PlayerData[killerID].Title !== this.Config.Ranks[i].title && kills === this.Config.Ranks[i].killsNeeded || karma === this.Config.Ranks[i].karma) {
                if (colorOn) {
                    killer.displayName = TitlesData.PlayerData[killerID].RealName + " <color=" + this.Config.Ranks[i].Color + ">[" + TitlesData.PlayerData[killerID].Title + "]</color>";
                } else {
                    killer.displayName = TitlesData.PlayerData[killerID].RealName + " [" + TitlesData.PlayerData[killerID].Title + "]";
                }
                TitlesData.PlayerData[killerID].Rank = this.Config.Ranks[i].rank;
                rust.SendChatMessage(killer, "Ranks", "<color=green>" + msgs.Promoted + "</color>", "0");
                rust.SendChatMessage(killer, "Ranks", "<color=red>" + msgs.customFnd + "</color>", "0");
            } else if (GroupsAPI && TitlesData.PlayerData[killerID].Title !== this.Config.Ranks[i].title && kills === this.Config.Ranks[i].killsNeeded || karma === this.Config.Ranks[i].karma) {
                if (colorOn) {
                    GroupData.PlayerData[steamID].RealName = TitlesData.PlayerData[killerID].RealName + " <color=" + this.Config.Ranks[i].Color + ">[" + TitlesData.PlayerData[killerID].Title + "]</color>";
                } else {
                    GroupData.PlayerData[steamID].RealName = TitlesData.PlayerData[killerID].RealName + " [" + TitlesData.PlayerData[killerID].Title + "]"
                }
                TitlesData.PlayerData[killerID].Rank = this.Config.Ranks[i].rank;
                rust.SendChatMessage(killer, "Ranks", "<color=green>" + msgs.Promoted + "</color>", "0");
                rust.SendChatMessage(killer, "Ranks", "<color=red>" + msgs.customFnd + "</color>", "0");
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
                    rust.SendChatMessage(player, "Ranks", msgs.noPerms, "0");
                    return false;
                }
                break;
            case "set":
                if (authLvl >= this.Config.authLevel && args.length >= 2) {
                    this.giveTitle(player, cmd, args);
                } else if (authLvl < this.Config.authLevel) {
                    rust.SendChatMessage(player, "Titles", msgs.noPerms, "0");
                    return false;
                } else {
                    rust.SendChatMessage(player, "Titles", msgs.badSyntaxRank, "0");
                    return false;
                }
                break;
            case "karma":
                if (authLvl >= this.Config.authLevel && args.length >= 2) {
                    this.setKarma(player, cmd, args);
                } else if (authLvl < this.Config.authLevel) {
                    rust.SendChatMessage(player, "Titles", msgs.noPerms, "0");
                    return false;
                } else {
                    rust.SendChatMessage(player, "Titles", msgs.badSyntaxRank, "0");
                    return false;
                }
            default:
                rust.SendChatMessage(player, "Ranks", msgs.rank + TitlesData.PlayerData[steamID].Rank + " (" + TitlesData.PlayerData[steamID].Title + ")", "0");
                break;
        }
    },

    checkStats: function(player, cmd, args) {
        var steamID = rust.UserIDFromPlayer(player);
        rust.SendChatMessage(player, "Ranks", msgs.kills + TitlesData.PlayerData[steamID].Kills, "0");
        rust.SendChatMessage(player, "Ranks", msgs.deaths + TitlesData.PlayerData[steamID].Deaths, "0");
        rust.SendChatMessage(player, "Ranks", msgs.kdr + TitlesData.PlayerData[steamID].KDR, "0");
        if (this.Config.Settings.karma) rust.SendChatMessage(player, "Ranks", msgs.karma + TitlesData.PlayerData[steamID].Karma, "0");
    },

    wipePlayer: function(player, cmd, args) {
            var target = this.findPlayerByName(player, args) || "";
            if (target[1].length) {
                TitlesData.PlayerData[target[1]].Kills = 0;
                TitlesData.PlayerData[target[1]].Deaths = 0;
                TitlesData.PlayerData[target[1]].KDR = 0;
                if (this.Config.Settings.karma) TitlesData.PlayerData[target[1]].Karma = 0;
                rust.SendChatMessage(player, "Ranks", msgs.plyrWiped, "0");
                this.saveData();
                this.setRank(steamID, TitlesData.PlayerData[target[1]].Kills, target[0]);
            } else if (!target[1].length) {
                rust.SendChatMessage(player, "Ranks", msgs.NoPlyrs, "0");
                return false;
            } else {
                rust.SendChatMessage(player, "Ranks", msgs.NoPlyrs, "0");
                return false;
            }
    },

    getKarma: function(playerID) {
        var i = 0,
            j = this.Config.Ranks.length;
        for (i; i < j; i++) {
            if (this.Config.Ranks[i].title === TitlesData.PlayerData[playerID].Title) {
                return this.Config.Ranks[i].karmaModifier;
            }
        }
    },

    setKarma: function(player, cmd, args) {
        rust.SendChatMessage(player, "Titles", "Command currently disabled.", "0");
    },

    /*-----------------------------------------------------------------
                      Check for Deaths
      ------------------------------------------------------------------*/

    OnEntityDeath: function(entity, hitinfo) {
        var victim = entity,
            attacker = hitinfo.Initiator;
        if (victim.ToPlayer() && attacker.ToPlayer() && TitlesData.SetupData.Type === "ranks" && victim.displayName !== attacker.displayName) {
            var killer = attacker.ToPlayer(),
                killerID = rust.UserIDFromPlayer(killer),
                victimID = rust.UserIDFromPlayer(victim);
            var karmaOn = this.Config.Settings.karma,
                karma = TitlesData.PlayerData[killerID].Karma;
            if (karmaOn && TitlesData.PlayerData[victimID].Karma >= 0) {
                TitlesData.PlayerData[killerID].Kills += 1;
                TitlesData.PlayerData[victimID].Deaths += 1;
                TitlesData.PlayerData[killerID].Karma -= this.getKarma(victimID);
                rust.SendChatMessage(player, "Ranks", msgs.loseKarma + " (" + this.getKarma(victimID) + ")", "0");
            } else if (karmaOn && TitlesData.PlayerData[victimID].Karma < 0) {
                TitlesData.PlayerData[killerID].Kills += 1;
                TitlesData.PlayerData[victimID].Deaths += 1;
                TitlesData.PlayerData[killerID].Karma += this.getKarma(victimID);
                rust.SendChatMessage(player, "Ranks", msgs.gainKarma + " (" + this.getKarma(victimID) + ")", "0");
            } else {
                TitlesData.PlayerData[killerID].Kills += 1;
                TitlesData.PlayerData[victimID].Deaths += 1;
            }
            this.setRank(killerID, TitlesData.PlayerData[killerID].Kills, killer);
            this.updateKDR(TitlesData.PlayerData[victimID].Kills, TitlesData.PlayerData[victimID].Deaths, victim.ToPlayer());
            this.updateKDR(TitlesData.PlayerData[killerID].Kills, TitlesData.PlayerData[killerID].Deaths, killer);
        } else if (victim.ToPlayer() && victim.displayName === attacker.displayName) {
            var victimID = rust.UserIDFromPlayer(victim);
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
                    rust.SendChatMessage(player, "Titles", msgs.noPerms, "0");
                    return false;
                } else {
                    rust.SendChatMessage(player, "Titles", msgs.badSyntaxTitle, "0");
                }
                break;
            case "show":
                rust.SendChatMessage(player, "Titles", "This command is currently unreleased. Please try again soon!", "0");
                return false;
                //this.showPlayers(player, cmd, args);
                break;
            case "hide":
                if (authLvl >= this.Config.authLevel) {
                    this.hideCmd(player, cmd, args);
                } else {
                    rust.SendChatMessage(player, "Titles", msgs.noPerms, "0");
                    return false;
                }
                break;
            default:
                if (args.length < 1) {
                    rust.SendChatMessage(player, "Titles", msgs.title + TitlesData.PlayerData[steamID].Title, "0");
                } else {
                    rust.SendChatMessage(player, "Titles", msgs.errors, "0");
                    return false;
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
                if (getAuth == this.Config.Titles[i].authLvl && TitlesData.PlayerData[steamID].Title === this.Config.Titles[i].title && this.Config.Settings.colorSupport) {
                    TitlesData.PlayerData[steamID].Title = this.Config.Titles[i].title;
                    player.displayName = TitlesData.PlayerData[steamID].RealName + "<color=" + this.Config.Titles[i].Color + ">[" + TitlesData.PlayerData[steamID].Title + "]</color>";
                } else if (TitlesData.PlayerData[steamID].Title === "" && getAuth == this.Config.Titles[i].authLvl && this.Config.Settings.colorSupport) {
                    TitlesData.PlayerData[steamID].Title = this.Config.Titles[i].title;
                    player.displayName = TitlesData.PlayerData[steamID].RealName + "<color=" + this.Config.Titles[i].Color + ">[" + TitlesData.PlayerData[steamID].Title + "]</color>";
                } else if (TitlesData.PlayerData[steamID].Title === this.Config.Titles[i].title && getAuth == this.Config.Titles[i].authLvl && !this.Config.Settings.colorSupport) {
                    TitlesData.PlayerData[steamID].Title = this.Config.Titles[i].title;
                    player.displayName = TitlesData.PlayerData[steamID].RealName + "[" + TitlesData.PlayerData[steamID].Title + "]";
                } else if (TitlesData.PlayerData[steamID].Title === "" && getAuth == this.Config.Titles[i].authLvl && !this.Config.Settings.colorSupport) {
                    TitlesData.PlayerData[steamID].Title = this.Config.Titles[i].title;
                    player.displayName = TitlesData.PlayerData[steamID].RealName + "[" + TitlesData.PlayerData[steamID].Title + "]";
                }
            } else {
                if (this.Config.Titles[i].authLvl === getAuth && TitlesData.PlayerData[steamID].Title === this.Config.Titles[i].title && this.Config.Settings.colorSupport) {
                    TitlesData.PlayerData[steamID].Title = this.Config.Titles[i].title;
                    GroupData.PlayerData[steamID].RealName = TitlesData.PlayerData[steamID].RealName + "<color=" + this.Config.Titles[i].Color + ">[" + TitlesData.PlayerData[steamID].Title + "]</color>";
                } else if (TitlesData.PlayerData[steamID].Title === "" && getAuth == this.Config.Titles[i].authLvl && this.Config.Settings.colorSupport) {
                    TitlesData.PlayerData[steamID].Title = this.Config.Titles[i].title;
                    GroupData.PlayerData[steamID].RealName = TitlesData.PlayerData[steamID].RealName + "<color=" + this.Config.Titles[i].Color + ">[" + TitlesData.PlayerData[steamID].Title + "]</color>";
                } else if (this.Config.Titles[i].authLvl === getAuth && TitlesData.PlayerData[steamID].Title === this.Config.Titles[i].title && !this.Config.Settings.colorSupport) {
                    TitlesData.PlayerData[steamID].Title = this.Config.Titles[i].title;
                    GroupData.PlayerData[steamID].RealName = TitlesData.PlayerData[steamID].RealName + "[" + TitlesData.PlayerData[steamID].Title + "]";
                } else if (this.Config.Titles[i].authLvl === getAuth && TitlesData.PlayerData[steamID].Title === "" && !this.Config.Settings.colorSupport) {
                    TitlesData.PlayerData[steamID].Title = this.Config.Titles[i].title;
                    GroupData.PlayerData[steamID].RealName = TitlesData.PlayerData[steamID].RealName + "[" + TitlesData.PlayerData[steamID].Title + "]";
                }
            }
        }
        this.saveData();
    },

    showPlayers: function(player, cmd, args) {

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
                var color = this.Config.Titles[i].Color;
                if (args[2] === this.Config.Titles[i].title.toLowerCase() && !GroupsAPI && this.Config.Settings.colorSupport) {
                    getPlayer[0].displayName = getPlayerData[getPlayer[1]].RealName + "<color=" + color + ">" + "[" + this.Config.Titles[i].title + "]" + "</color>";
                    TitlesData.PlayerData[getPlayer[1]].Title = this.Config.Titles[i].title;
                } else if (args[2] === this.Config.Titles[i].title.toLowerCase() && !GroupsAPI && !this.Config.Settings.colorSupport) {
                    print("running other logic " + this.Config.Settings.colorSupport);
                    getPlayer[0].displayName = getPlayerData[getPlayer[1]].RealName + "[" + this.Config.Titles[i].title + "]";
                    TitlesData.PlayerData[getPlayer[1]].Title = this.Config.Titles[i].title;
                } else if (args[2] === this.Config.Titles[i].title.toLowerCase() && GroupsAPI && this.Config.Settings.colorSupport) {
                    GroupData.PlayerData[getPlayer[1]].RealName = getPlayerData[getPlayer[1]].RealName + "<color=" + this.Config.Titles[i].Color + ">[" + this.Config.Titles[i].title + "]</color>";
                    TitlesData.PlayerData[getPlayer[1]].Title = this.Config.Titles[i].title;
                } else if (args[2] === this.Config.Titles[i].title.toLowerCase() && GroupsAPI && !this.Config.Settings.colorSupport) {
                    print("Hit correct logic");
                    GroupData.PlayerData[getPlayer[1]].RealName = getPlayerData[getPlayer[1]].RealName + "[" + this.Config.Titles[i].title + "]";
                    TitlesData.PlayerData[getPlayer[1]].Title = this.Config.Titles[i].title;
                }
            }
            rust.SendChatMessage(player, "Titles", msgs.setSuccs, "0");
        } else {
            rust.SendChatMessage(player, "Titles", msgs.needTitle, "0");
            return false;
        }
        this.saveData();
    },

    SendHelpText: function(player) {
        var authLvl = player.net.connection.authLevel;
        for (var key in this.Config.Help) {
          var obj = this.Config.Help[key];
            for (var prop in obj) {
              if (authLevel <= 1 && obj === "playerHelp") {
                rust.SendChatMessage(player, "RanksAndTitles", obj[prop]., "0");
                } else {
                    rust.SendChatMessage(player, "RanksAndTitles", obj[prop], "0");
                }
            }
        }
    }
}
