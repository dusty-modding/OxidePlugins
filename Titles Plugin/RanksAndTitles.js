var RanksAndTitles = {
    Title: "Ranks And Titles",
    Author: "Killparadise",
    Version: V(1, 1, 0),
    ResourceId: 830,
    Url: "http://oxidemod.org/resources/ranks-and-titles.830/",
    HasConfig: true,
    Init: function() {
        global = importNamespace("");
        UnityEngine = importNamespace("UnityEngine");
        HelpFound = plugins.Find("helptext");
        GroupsAPI = plugins.Find('RotAG-Groups');
        if (GroupsAPI) {
            GroupsAPI = true;
        } else {
            GroupsAPI = false;
        }
        this.loadTitleData();
        command.AddChatCommand("rt", this.Plugin, "switchCmd");
        command.AddChatCommand("rtdebug", this.Plugin, "debug");
    },

    OnServerInitialized: function() {
        msgs = this.Config.Messages;
        prefix = this.Config.Prefix;
        this.checkConfig();
    },

    checkConfig: function() {
        if (this.Config.version !== "1.2") {
            print("[RanksAndTitles] Config outdated... Now Updating...");
            this.LoadDefaultConfig();
            this.SaveConfig();
        }
    },

    LoadDefaultConfig: function() {
        this.Config.authLevel = 2;
        this.Config.version = "1.2";
        this.Config.Settings = {
            "showPlayer": true,
            "karma": true,
            "colorSupport": true,
            "useTitles": false,
            "noAdmin": false
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
            "title": "Civilian",
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
        this.Config.Prefix = {
            "ranks": "Ranks",
            "titles": "Titles",
            "ranksandtitles": "RanksAndTitles"
        }
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
            "badSyntaxRt": "The command syntax was incorrect, please use /rt set playername title",
            "infoRanks": "Ranks for players this is an automated system based on kills & karma; this also supports a Bandit Vs Hero Karma System.",
            "infoTitles": "Titles is a system for a community or calm server, allowing owners to set and create custom user titles.",
            "convert": "The Server Admin has switched to Ranks, please use /rtrefresh to reload your player ranks and titles data.",
            "finished": "Great! The plugin will now build the correct data and configurations.",
            "errors": "Incorrect command structure, please try again.",
            "customFnd": "Using Custom Title... Skipping Change...",
            "loseKarma": "You've lost Karma!",
            "gainKarma": "You've gained Karma!",
            "reset": "Player Reset back to Ranks Tree!",
            "cleardata": "Data has been fully cleared!",
            "titlesSet": "The Server is currently using Titles only. No stats avaliable!",
            "switchRanks": "Successfully turned titles only Off!",
            "switchTitles": "Successfully turned titles only On!",
            "broadcast": "The Admin has switched the Titles system, please use /rt refresh to reload player data!",
            "adminsOn": "Admins ranks turned on.",
            "adminsOff": "Admins rankings turned off.",
            "badSyntaxRemove": "Incorrect Syntax please use /rt remove playername",
            "help": "/rt help - Get RanksAndTitles Command Help",
            "badSyntaxFix": "Invalid syntax please use /rt fix playername",
            "clearData": "Server Data Wiped...",
            "noData": "No Player Data Found... Attempting to Build."
        };
        this.Config.Help = [
            "/rt - display your rank or title",
            "/rt stats - get your current stats if in ranks mode",
            "/rt refresh - refreshes your data file, recommended only used after system switch"
        ];
        this.Config.AdminHelp = [
            "/rt wipe playername - Wipes the sleceted players Kills, Deaths, KDR, and Karma",
            "/rt set playername title - Sets a custom title to the selected player, this must be a title in config (NOT RANK)",
            "/rt remove playername - removes a given players custom title, and sets them back into the ransk tree",
            "/rt switch - switch titles only mode on and off, this will use config title automatically without Ranks system",
            "/rt noadmin - Removes admins (auth 2 or higher) from ranks system no kills, or ranks will be given."
        ]
    },

    /*-----------------------------------------------------------------
	                When the Player finishes loading in
	------------------------------------------------------------------*/
    OnPlayerInit: function(player) {
        var steamID = rust.UserIDFromPlayer(player);
        this.checkPlayerData(player, steamID);
    },

    /*-----------------------------------------------------------------
	                Get all of our Data
	------------------------------------------------------------------*/
    loadTitleData: function() {
        //Lets get our own data and then check to see if theres a groups data file
        TitlesData = data.GetData('RanksandTitles');
        TitlesData = TitlesData || {};
        TitlesData.SetupData = TitlesData.SetupData || {};
        TitlesData.PlayerData = TitlesData.PlayerData || {};
        GroupData = data.GetData("Groups");
        GroupData = GroupData || {};
    },


    checkPlayerData: function(player, steamID) {
        //Okay lets check our data file for player data
        var authLvl = player.net.connection.authLevel;
        TitlesData.PlayerData[steamID] = TitlesData.PlayerData[steamID] || {};
        TitlesData.PlayerData[steamID].PlayerID = TitlesData.PlayerData[steamID].PlayerID || steamID;
        TitlesData.PlayerData[steamID].RealName = TitlesData.PlayerData[steamID].RealName || this.getName(steamID, player);
        TitlesData.PlayerData[steamID].Title = TitlesData.PlayerData[steamID].Title || "";
        TitlesData.PlayerData[steamID].Rank = TitlesData.PlayerData[steamID].Rank || 0;
        TitlesData.PlayerData[steamID].Kills = TitlesData.PlayerData[steamID].Kills || 0;
        TitlesData.PlayerData[steamID].KDR = TitlesData.PlayerData[steamID].KDR || 0;
        TitlesData.PlayerData[steamID].Deaths = TitlesData.PlayerData[steamID].Deaths || 0;
        TitlesData.PlayerData[steamID].Karma = TitlesData.PlayerData[steamID].Karma || 0;
        TitlesData.PlayerData[steamID].isAdmin = TitlesData.PlayerData[steamID].isAdmin || (authLvl >= 2) || false;
        TitlesData.PlayerData[steamID].hidden = TitlesData.PlayerData[steamID].hidden || false;
        print(steamID + " " + TitlesData.PlayerData[steamID].Kills+ " " + player.displayName);
        this.setRankOrTitle(steamID, TitlesData.PlayerData[steamID].Kills, player);
    },

    getName: function(steamID, player) {
        if (GroupsAPI) {
            realName = player.displayName.split("] ").pop();
            realName = realName.split(" <").shift();
        } else {
            realName = player.displayName;
        }
        return realName;
    },

    saveData: function() {
        //Save our data to our titles data file
        data.SaveData('RanksandTitles');

    },

    refreshData: function(player, cmd, args) {
        var steamID = rust.UserIDFromPlayer(player);
        var authLvl = player.net.connection.authLevel;
        if (TitlesData.PlayerData[steamID] != undefined && (!this.Config.Settings.noAdmin || !TitlesData.PlayerData[steamID].isAdmin)) {
        	TitlesData.PlayerData[steamID].Title = "";
        } else {
        	print("No Data found, Attempting to build Data");
        	rust.SendChatMessage(player, prefix.ranksandtitles, msgs.noData, "0");
        	this.checkPlayerData(player, steamID);
        }
        this.checkPlayerData(player, steamID);
        rust.SendChatMessage(player, prefix.ranksandtitles, msgs.dataRfrsh, "0");
    },

    debug: function(player, cmd, args) {
        var steamID = rust.UserIDFromPlayer(player);
        print("----Starting Debug-----");
        print("Groups Name: " + GroupData.PlayerData[steamID].RealName);
        print("Titles Real Name: " + TitlesData.PlayerData[steamID].RealName);
        print("Real name after adjustment: " + TitlesData.PlayerData[steamID].RealName.split("] ").pop())
        print("----End Debug----");
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
            	print("found match "+ displayName);
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
    } catch(e) {
    	print(e.message.toString());
    }
    },

    findPlayer: function(playerid) {
        var global = importNamespace("");
        targetPlayer = global.BasePlayer.Find(playerid);
        if (targetPlayer) {
            return targetPlayer;
        } else {
            rust.SendChatMessage(player, prefix.titles, msgs.NoPlyrs, "0");
            return false;
        }
    },

    clearData: function(player, cmd, args) {
    	try {
    	delete TitlesData.PlayerData;
    	rust.SendChatMessage(player, prefix.ranksandtitles, msgs.clearData, "0");
    	TitlesData.PlayerData = TitlesData.PlayerData || {};
    	this.saveData();
    	this.loadTitleData();
    } catch(e) {
    	print(e.message.toString())
    }
    },

    /*--------------------System Setup----------------------------*/

    switchCmd: function(player, cmd, args) {
    	try {
        var steamID = rust.UserIDFromPlayer(player),
            authLvl = player.net.connection.authLevel,
            useTitles = this.Config.Settings.useTitles;
        switch (args[0]) {
            case "stats":
                if (!useTitles) {
                    this.checkStats(player, cmd, args);
                } else {
                    rust.SendChatMessage(player, prefix.ranksandtitles, msgs.titlesSet, "0");
                    return false;
                }
                break;
            case "wipe":
                if (authLvl >= this.Config.authLevel) {
                    this.wipePlayer(player, cmd, args);
                } else {
                    rust.SendChatMessage(player, prefix.ranksandtitles, msgs.noPerms, "0");
                    return false;
                }
                break;
            case "set":
                if (authLvl >= this.Config.authLevel && args.length >= 2) {
                    this.giveTitle(player, cmd, args);
                } else if (authLvl < this.Config.authLevel) {
                    rust.SendChatMessage(player, prefix.ranksandtitles, msgs.noPerms, "0");
                    return false;
                } else {
                    rust.SendChatMessage(player, prefix.ranksandtitles, msgs.badSyntaxRt, "0");
                    return false;
                }
                break;
            case "karma":
                if (authLvl >= this.Config.authLevel && args.length >= 1 && !useTitles) {
                    rust.SendChatMessage(player, prefix.ranksandtitles, "Command currently disabled.", "0");
                    return false;
                    //this.setKarma(player, cmd, args);
                } else if (authLvl < this.Config.authLevel) {
                    rust.SendChatMessage(player, prefix.ranks, msgs.noPerms, "0");
                    return false;
                } else {
                    rust.SendChatMessage(player, prefix.ranks, msgs.badSyntaxRt, "0");
                    return false;
                }
                break;
            case "remove":
                if (authLvl >= this.Config.authLevel && args.length >= 1) {
                    this.removeTitle(player, cmd, args);
                } else if (authLvl < this.Config.authLevel) {
                    rust.SendChatMessage(player, prefix.ranksandtitles, msgs.noPerms, "0");
                    return false;
                } else {
                    rust.SendChatMessage(player, prefix.ranksandtitles, msgs.badSyntaxRemove, "0");
                    return false;
                }
                break;
                case "clear":
                if (authLvl >= this.Config.authLevel) {
                    this.clearData(player, cmd, args);
                } else {
                    rust.SendChatMessage(player, prefix.ranksandtitles, msgs.noPerms, "0");
                    return false;
                }
                break;
            case "refresh":
                this.refreshData(player, cmd, args);
                break;
            case "switch":
                if (useTitles && (authLvl >= this.Config.authLevel)) {
                    this.Config.Settings.useTitles = false;
                    rust.SendChatMessage(player, prefix.ranksandtitles, msgs.switchRanks, "0");
                    rust.BroadcastChat(prefix.ranksandtitles, "<color=red>" + msgs.broadcast + "</color>", "0");
                } else if ((authLvl >= this.Config.authLevel) && !useTitles) {
                    this.Config.Settings.useTitles = true;
                    rust.SendChatMessage(player, prefix.ranksandtitles, msgs.switchTitles, "0");
                    rust.BroadcastChat(prefix.ranksandtitles, "<color=red>" + msgs.broadcast + "</color>", "0");
                } else {
                    rust.SendChatMessage(player, prefix.ranksandtitles, msgs.noPerms, "0");
                    break;
                }
                this.SaveConfig();
                break;
            case "noadmin":
                if (authLvl >= this.Config.authLevel) {
                    this.noAdmin(player, cmd, args);
                } else {
                    rust.SendChatMessage(player, prefix.ranksandtitles, msgs.noPerms, "0");
                }
                break;
            case "help":
                this.rtHelp(player, cmd, args);
                break;
            default:
                if (!useTitles && TitlesData.PlayerData[steamID] != undefined) {
                    rust.SendChatMessage(player, prefix.ranks, msgs.rank + TitlesData.PlayerData[steamID].Rank + " (" + TitlesData.PlayerData[steamID].Title + ")", "0");
                } else if (useTitles && TitlesData.PlayerData[steamID] != undefined) {
                    rust.SendChatMessage(player, prefix.titles, msgs.title + " " + TitlesData.PlayerData[steamID].Title, "0");
                } else {
                  rust.SendChatMessage(player, prefix.ranksandtitles, msgs.noData, "0");
                  this.checkPlayerData(player, steamID);
                }
                break;
        }
    } catch(e) {
    	print(e.message.toString());
    }
    },

    /*-----------------------------------------------------------------
	                Get our Counts and set Ranks
	------------------------------------------------------------------*/

    setRankOrTitle: function(playerID, kills, player) {
        var q = this.Config.Titles.length,
            j = this.Config.Ranks.length,
            i = 0,
            customOn = false,
            getAuth = player.net.connection.authLevel,
            useTitles = this.Config.Settings.useTitles;
        var karmaOn = this.Config.Settings.karma,
            karma = TitlesData.PlayerData[playerID].Karma,
            colorOn = this.Config.Settings.colorSupport,
            noAdmin = this.Config.Settings.noAdmin;
        var oldRank = TitlesData.PlayerData[playerID].Rank;
        //Check if Karma, Color, and Groups are enabled

        for (var key in TitlesData.PlayerData) {
            if (noAdmin && TitlesData.PlayerData[key].isAdmin) {
                print("player is admin, skipping title/rank");
                return false;
            }
        }

        if (!useTitles) {
            for (i; i < j; i++) {
                if (!GroupsAPI && (TitlesData.PlayerData[playerID].Title === this.Config.Ranks[i].title || TitlesData.PlayerData[playerID].Title === "")) {
                    if (karmaOn && colorOn) {
                        if (karma === this.Config.Ranks[i].karma || TitlesData.PlayerData[playerID].Title === this.Config.Ranks[i].title) {
                            player.displayName = TitlesData.PlayerData[playerID].RealName + " <color=" + this.Config.Ranks[i].Color + ">[" + this.Config.Ranks[i].title + "]</color>";
                            TitlesData.PlayerData[playerID].Title = this.Config.Ranks[i].title;
                            TitlesData.PlayerData[playerID].Rank = this.Config.Ranks[i].rank
                        }
                    } else if (karmaOn && !colorOn) {
                        if (karma === this.Config.Ranks[i].karma || TitlesData.PlayerData[playerID].Title === this.Config.Ranks[i].title) {
                            player.displayName = TitlesData.PlayerData[playerID].RealName + " [" + this.Config.Ranks[i].title + "]";
                            TitlesData.PlayerData[playerID].Title = this.Config.Ranks[i].title;
                            TitlesData.PlayerData[playerID].Rank = this.Config.Ranks[i].rank
                        }
                    } else if (!karmaOn && colorOn) {
                        if (kills === this.Config.Ranks[i].killsNeeded || TitlesData.PlayerData[playerID].Title === this.Config.Ranks[i].title) {
                            player.displayName = TitlesData.PlayerData[playerID].RealName + " <color=" + this.Config.Ranks[i].Color + ">[" + this.Config.Ranks[i].title + "]</color>";
                            TitlesData.PlayerData[playerID].Title = this.Config.Ranks[i].title;
                            TitlesData.PlayerData[playerID].Rank = this.Config.Ranks[i].rank
                        }
                    } else if (!karmaOn && !colorOn) {
                        if (kills === this.Config.Ranks[i].killsNeeded || TitlesData.PlayerData[playerID].Title === this.Config.Ranks[i].title) {
                            player.displayName = TitlesData.PlayerData[playerID].RealName + " [" + this.Config.Ranks[i].title + "]";
                            TitlesData.PlayerData[playerID].Title = this.Config.Ranks[i].title;
                            TitlesData.PlayerData[playerID].Rank = this.Config.Ranks[i].rank
                        }
                    }

                } else if (GroupsAPI && (TitlesData.PlayerData[playerID].Title === this.Config.Ranks[i].title || TitlesData.PlayerData[playerID].Title === "")) {
                    if (karmaOn && colorOn) {
                        if (karma === this.Config.Ranks[i].karma || TitlesData.PlayerData[playerID].Title === this.Config.Ranks[i].title) {
                            GroupData.PlayerData[playerID].RealName = TitlesData.PlayerData[playerID].RealName + " <color=" + this.Config.Ranks[i].Color + ">[" + this.Config.Ranks[i].title + "]</color>";
                            TitlesData.PlayerData[playerID].Title = this.Config.Ranks[i].title;
                            TitlesData.PlayerData[playerID].Rank = this.Config.Ranks[i].rank
                        }
                    } else if (karmaOn && !colorOn) {
                        if (karma === this.Config.Ranks[i].karma || TitlesData.PlayerData[playerID].Title === this.Config.Ranks[i].title) {
                            GroupData.PlayerData[playerID].RealName = TitlesData.PlayerData[playerID].RealName + " [" + this.Config.Ranks[i].title + "]";
                            TitlesData.PlayerData[playerID].Title = this.Config.Ranks[i].title;
                            TitlesData.PlayerData[playerID].Rank = this.Config.Ranks[i].rank
                        }
                    } else if (!karmaOn && colorOn) {
                        if (kills === this.Config.Ranks[i].killsNeeded || TitlesData.PlayerData[playerID].Title === this.Config.Ranks[i].title) {
                            GroupData.PlayerData[playerID].RealName = TitlesData.PlayerData[playerID].RealName + " <color=" + this.Config.Ranks[i].Color + ">[" + this.Config.Ranks[i].title + "]</color>";
                            TitlesData.PlayerData[playerID].Title = this.Config.Ranks[i].title;
                            TitlesData.PlayerData[playerID].Rank = this.Config.Ranks[i].rank
                        }
                    } else if (!karmaOn && !colorOn) {
                        if (kills === this.Config.Ranks[i].killsNeeded || TitlesData.PlayerData[playerID].Title === this.Config.Ranks[i].title) {
                            GroupData.PlayerData[playerID].RealName = TitlesData.PlayerData[playerID].RealName + " [" + this.Config.Ranks[i].title + "]";
                            TitlesData.PlayerData[playerID].Title = this.Config.Ranks[i].title;
                            TitlesData.PlayerData[playerID].Rank = this.Config.Ranks[i].rank
                        }
                    }

                } else if (!GroupsAPI && TitlesData.PlayerData[playerID].Title !== this.Config.Ranks[i].title && (kills === this.Config.Ranks[i].killsNeeded || karma === this.Config.Ranks[i].karma)) {
                    var customOn = true;
                    if (colorOn) {
                        player.displayName = TitlesData.PlayerData[playerID].RealName + " <color=" + this.Config.Titles[i].Color + ">[" + TitlesData.PlayerData[playerID].Title + "]</color>";
                    } else {
                        player.displayName = TitlesData.PlayerData[playerID].RealName + " [" + TitlesData.PlayerData[playerID].Title + "]";
                    }
                    TitlesData.PlayerData[playerID].Rank = this.Config.Ranks[i].rank;
                } else if (GroupsAPI && TitlesData.PlayerData[playerID].Title !== this.Config.Ranks[i].title && (kills === this.Config.Ranks[i].killsNeeded || karma === this.Config.Ranks[i].karma)) {
                    var customOn = true;
                    if (colorOn && TitlesData.PlayerData[playerID].Title) {
                        GroupData.PlayerData[playerID].RealName = TitlesData.PlayerData[playerID].RealName + " <color=" + this.Config.Titles[i].Color + ">[" + TitlesData.PlayerData[playerID].Title + "]</color>";
                    } else {
                        GroupData.PlayerData[playerID].RealName = TitlesData.PlayerData[playerID].RealName + " [" + TitlesData.PlayerData[playerID].Title + "]"
                    }
                    TitlesData.PlayerData[playerID].Rank = this.Config.Ranks[i].rank;
                }
            }
        } else {
            for (var ii = 0; ii < q; ii++) {
                if (!GroupsAPI && useTitles) {
                    if (getAuth == this.Config.Titles[ii].authLvl && TitlesData.PlayerData[playerID].Title === this.Config.Titles[ii].title && colorOn) {
                        TitlesData.PlayerData[playerID].Title = this.Config.Titles[ii].title;
                        player.displayName = TitlesData.PlayerData[playerID].RealName + "<color=" + this.Config.Titles[ii].Color + ">[" + TitlesData.PlayerData[playerID].Title + "]</color>";
                    } else if (TitlesData.PlayerData[playerID].Title === "" && getAuth == this.Config.Titles[ii].authLvl && colorOn) {
                        TitlesData.PlayerData[playerID].Title = this.Config.Titles[ii].title;
                        player.displayName = TitlesData.PlayerData[playerID].RealName + "<color=" + this.Config.Titles[ii].Color + ">[" + TitlesData.PlayerData[playerID].Title + "]</color>";
                    } else if (TitlesData.PlayerData[playerID].Title === this.Config.Titles[ii].title && getAuth == this.Config.Titles[ii].authLvl && !colorOn) {
                        TitlesData.PlayerData[playerID].Title = this.Config.Titles[ii].title;
                        player.displayName = TitlesData.PlayerData[playerID].RealName + "[" + TitlesData.PlayerData[playerID].Title + "]";
                    } else if (TitlesData.PlayerData[playerID].Title === "" && getAuth == this.Config.Titles[ii].authLvl && !colorOn) {
                        TitlesData.PlayerData[playerID].Title = this.Config.Titles[ii].title;
                        player.displayName = TitlesData.PlayerData[playerID].RealName + "[" + TitlesData.PlayerData[playerID].Title + "]";
                    }
                } else if (GroupsAPI && useTitles) {
                    if (this.Config.Titles[ii].authLvl === getAuth && TitlesData.PlayerData[playerID].Title === this.Config.Titles[ii].title && colorOn) {
                        TitlesData.PlayerData[playerID].Title = this.Config.Titles[ii].title;
                        GroupData.PlayerData[playerID].RealName = TitlesData.PlayerData[playerID].RealName + "<color=" + this.Config.Titles[ii].Color + ">[" + TitlesData.PlayerData[playerID].Title + "]</color>";
                    } else if (TitlesData.PlayerData[playerID].Title === "" && getAuth == this.Config.Titles[ii].authLvl && colorOn) {
                        TitlesData.PlayerData[playerID].Title = this.Config.Titles[ii].title;
                        GroupData.PlayerData[playerID].RealName = TitlesData.PlayerData[playerID].RealName + "<color=" + this.Config.Titles[ii].Color + ">[" + TitlesData.PlayerData[playerID].Title + "]</color>";
                    } else if (this.Config.Titles[ii].authLvl === getAuth && TitlesData.PlayerData[playerID].Title === this.Config.Titles[ii].title && !colorOn) {
                        TitlesData.PlayerData[playerID].Title = this.Config.Titles[ii].title;
                        GroupData.PlayerData[playerID].RealName = TitlesData.PlayerData[playerID].RealName + "[" + TitlesData.PlayerData[playerID].Title + "]";
                    } else if (this.Config.Titles[ii].authLvl === getAuth && TitlesData.PlayerData[playerID].Title === "" && !colorOn) {
                        TitlesData.PlayerData[playerID].Title = this.Config.Titles[ii].title;
                        GroupData.PlayerData[playerID].RealName = TitlesData.PlayerData[playerID].RealName + "[" + TitlesData.PlayerData[playerID].Title + "]";
                    }
                }
            }
        }
        if (!useTitles) {
            this.checkPromo(oldRank, TitlesData.PlayerData[playerID].Rank, customOn, player);
        }
        this.saveData();
    },

    checkPromo: function(oldRank, currRank, custom, player) {
        if (currRank > oldRank) {
            rust.SendChatMessage(player, prefix.ranks, "<color=green>" + msgs.Promoted + "</color>", "0");
            if (custom) rust.SendChatMessage(player, prefix.ranks, "<color=red>" + msgs.customFnd + "</color>", "0");
        } else {
            return false;
        }

    },

    updateKDR: function(kills, deaths, player) {
        var steamID = rust.UserIDFromPlayer(player);
        var killsToDeaths = kills / deaths;
        killsToDeaths = Math.ceil(killsToDeaths * 100) / 100;
        TitlesData.PlayerData[steamID].KDR = killsToDeaths;
        this.saveData();
    },

    checkStats: function(player, cmd, args) {
        var steamID = rust.UserIDFromPlayer(player);
        rust.SendChatMessage(player, prefix.ranks, msgs.kills + TitlesData.PlayerData[steamID].Kills, "0");
        rust.SendChatMessage(player, prefix.ranks, msgs.deaths + TitlesData.PlayerData[steamID].Deaths, "0");
        rust.SendChatMessage(player, prefix.ranks, msgs.kdr + TitlesData.PlayerData[steamID].KDR, "0");
        if (this.Config.Settings.karma) rust.SendChatMessage(player, prefix.ranks, msgs.karma + TitlesData.PlayerData[steamID].Karma, "0");
    },

    wipePlayer: function(player, cmd, args) {
        var target = this.findPlayerByName(player, args) || "";
        if (target[1].length) {
            TitlesData.PlayerData[target[1]].Kills = 0;
            TitlesData.PlayerData[target[1]].Deaths = 0;
            TitlesData.PlayerData[target[1]].KDR = 0;
            if (this.Config.Settings.karma) TitlesData.PlayerData[target[1]].Karma = 0;
            rust.SendChatMessage(player, prefix.ranks, msgs.plyrWiped, "0");
            this.saveData();
            this.setRankOrTitle(target[1], TitlesData.PlayerData[target[1]].Kills, target[0]);
        } else if (!target[1].length) {
            rust.SendChatMessage(player, prefix.ranks, msgs.NoPlyrs, "0");
            return false;
        } else {
            rust.SendChatMessage(player, prefix.ranks, msgs.NoPlyrs, "0");
            return false;
        }
    },

    getKarma: function(playerID) {
        var i = 0,
            j = this.Config.Ranks.length;
        for (i; i < j; i++) {
            if (this.Config.Ranks[i].title === TitlesData.PlayerData[playerID].Title) {
                return this.Config.Ranks[i].karmaModifier;
            } else {
                return 1;
            }
        }
    },

    setKarma: function(player, cmd, args) {
        rust.SendChatMessage(player, prefix.ranks, "Command currently disabled.", "0");
        return false;
    },

    removeTitle: function(player, cmd, args) {
        try {
            var getPlayer = this.findPlayerByName(player, args);
            var getPlayerData = TitlesData.PlayerData;
            if (!getPlayer) {
            	print("getPlayer Failed");
                return false;
            }

            TitlesData.PlayerData[getPlayer[1]].Title = "";
            this.saveData();
            this.setRankOrTitle(getPlayer[1], TitlesData.PlayerData[getPlayer[1]].Kills, getPlayer[0]);
            rust.SendChatMessage(player, prefix.ranks, msgs.reset + " " + getPlayer[0].displayName, "0");
        } catch (e) {
            print(e.message.toString());
        }
    },

    /*-----------------------------------------------------------------
	                  Check for Deaths
	  ------------------------------------------------------------------*/

    OnEntityDeath: function(entity, hitinfo) {
    	try {
        var victim = entity,
            attacker = hitinfo.Initiator;
        var useTitles = this.Config.Settings.useTitles

        if (victim.ToPlayer() && attacker.ToPlayer() && !useTitles && victim.displayName !== attacker.displayName) {
            var killer = attacker.ToPlayer(),
                killerID = rust.UserIDFromPlayer(killer),
                victimID = rust.UserIDFromPlayer(victim);

            if (!TitlesData.PlayerData[killerID]) {
                print("Killer does not have registered Data in Data File.");
                print("Attempting to create killer Data file...");
                this.checkPlayerData(killer, killerID);
            } else if (!TitlesData.PlayerData[victimID]) {
                print("Victim does not have registered Data in Data File");
                print("Attempting to create Victim Data File...");
                this.checkPlayerData(victim, victimID);
            } else if (TitlesData.PlayerData[killerID] && TitlesData.PlayerData[killerID].Kills === NaN) {
            	print("Data is Corrupt, Please find: " + TitlesData.PlayerData[killerID] + " And reset his/her data.");
            } else if (TitlesData.PlayerData[victimID] && TitlesData.PlayerData[victimID].Deaths === NaN) {
            	print("Data is Corrupt, Please find: " + TitlesData.PlayerData[victimID] + " And reset his/her data.");
            }

            var karmaOn = this.Config.Settings.karma,
                karma = TitlesData.PlayerData[killerID].Karma;
            if (karmaOn && TitlesData.PlayerData[victimID].Karma >= 0) {
                TitlesData.PlayerData[killerID].Kills += 1;
                TitlesData.PlayerData[victimID].Deaths += 1;
                TitlesData.PlayerData[killerID].Karma -= this.getKarma(victimID);
                rust.SendChatMessage(killer, prefix.ranks, msgs.loseKarma + " (" + this.getKarma(victimID) + ")", "0");
            } else if (karmaOn && TitlesData.PlayerData[victimID].Karma < 0) {
                TitlesData.PlayerData[killerID].Kills += 1;
                TitlesData.PlayerData[victimID].Deaths += 1;
                TitlesData.PlayerData[killerID].Karma += this.getKarma(victimID);
                rust.SendChatMessage(killer, prefix.ranks, msgs.gainKarma + " (" + this.getKarma(victimID) + ")", "0");
            } else {
                TitlesData.PlayerData[killerID].Kills += 1;
                TitlesData.PlayerData[victimID].Deaths += 1;
            }
            this.setRankOrTitle(killerID, TitlesData.PlayerData[killerID].Kills, killer);
            this.updateKDR(TitlesData.PlayerData[victimID].Kills, TitlesData.PlayerData[victimID].Deaths, victim.ToPlayer());
            this.updateKDR(TitlesData.PlayerData[killerID].Kills, TitlesData.PlayerData[killerID].Deaths, killer);
        } else if (victim.ToPlayer() && victim.displayName === attacker.displayName && !useTitles) {
            var victimID = rust.UserIDFromPlayer(victim);
            TitlesData.PlayerData[victimID].Deaths += 1;
            this.updateKDR(TitlesData.PlayerData[victimID].Kills, TitlesData.PlayerData[victimID].Deaths, victim.ToPlayer());
        } else {
            return false;
                    }
                } catch(e) {
                	print(e.message.toString());
                }
    },

    /*-------------------Extra Commands----------------------*/

    showPlayers: function(player, cmd, args) {

    },

    hideCmd: function(player, cmd, args) {
        var steamID = rust.UserIDFromPlayer(player);
        if (!TitlesData.PlayerData[steamID].hidden) {
            TitlesData.PlayerData[steamID].hidden = true;
            player.displayName = TitlesData.PlayerData[steamID].RealName;
            rust.SendChatMessage(player, prefix.titles, "Your tag is now hidden!", "0");
        } else {
            TitlesData.PlayerData[steamID].hidden = false;
            player.displayName = TitlesData.PlayerData[steamID].RealName + "[" + TitlesData.PlayerData[steamID].Title + "]";
            rust.SendChatMessage(player, prefix.titles, "Your tag is no longer hidden!", "0");
        }
    },

    giveTitle: function(player, cmd, args) {
        var getPlayer = this.findPlayerByName(player, args);
        var getPlayerData = TitlesData.PlayerData,
            colorOn = this.Config.Settings.colorSupport,
            j = this.Config.Titles.length,
            i = 0;
        if (!getPlayer) {
            return false;
        }
        if (args[2].length) {
            for (i; i < j; i++) {
                var color = this.Config.Titles[i].Color;
                if (args[2] === this.Config.Titles[i].title.toLowerCase() && !GroupsAPI && colorOn) {
                    getPlayer[0].displayName = getPlayerData[getPlayer[1]].RealName + "<color=" + color + ">" + "[" + this.Config.Titles[i].title + "]" + "</color>";
                    TitlesData.PlayerData[getPlayer[1]].Title = this.Config.Titles[i].title;
                } else if (args[2] === this.Config.Titles[i].title.toLowerCase() && !GroupsAPI && !colorOn) {
                    getPlayer[0].displayName = getPlayerData[getPlayer[1]].RealName + "[" + this.Config.Titles[i].title + "]";
                    TitlesData.PlayerData[getPlayer[1]].Title = this.Config.Titles[i].title;
                } else if (args[2] === this.Config.Titles[i].title.toLowerCase() && GroupsAPI && colorOn) {
                    GroupData.PlayerData[getPlayer[1]].RealName = getPlayerData[getPlayer[1]].RealName + "<color=" + color + ">[" + this.Config.Titles[i].title + "]</color>";
                    TitlesData.PlayerData[getPlayer[1]].Title = this.Config.Titles[i].title;
                } else if (args[2] === this.Config.Titles[i].title.toLowerCase() && GroupsAPI && !colorOn) {
                    GroupData.PlayerData[getPlayer[1]].RealName = getPlayerData[getPlayer[1]].RealName + "[" + this.Config.Titles[i].title + "]";
                    TitlesData.PlayerData[getPlayer[1]].Title = this.Config.Titles[i].title;
                }
            }
            rust.SendChatMessage(player, prefix.ranksandtitles, msgs.setSuccs, "0");
        } else {
            rust.SendChatMessage(player, prefix.ranksandtitles, msgs.needTitle, "0");
            return false;
        }
        this.saveData();
    },

    noAdmin: function(player, cmd, args) {
        var noAdmin = this.Config.Settings.noAdmin;
        if (noAdmin) {
            this.Config.Settings.noAdmin = false;
            rust.SendChatMessage(player, prefix.ranksandtitles, msgs.adminsOn, "0")
        } else {
            this.Config.Settings.noAdmin = true;
            rust.SendChatMessage(player, prefix.ranksandtitles, msgs.adminsOff, "0")
        }
        this.SaveConfig();
    },

    rtHelp: function(player, cmd, args) {
        rust.SendChatMessage(player, null, "--------------RanksAndTitles Commands------------", "0");
        var authLvl = player.net.connection.authLevel;
        for (var i = 0; i < this.Config.Help.length; i++) {
            rust.SendChatMessage(player, null, this.Config.Help[i], "0");
        }
        if (authLvl >= 2) {
            rust.SendChatMessage(player, null, "<color=orange>--------------Admin Commands------------</color>", "0");
            for (var j = 0; j < this.Config.AdminHelp.length; j++) {
                rust.SendChatMessage(player, null, this.Config.AdminHelp[j], "0");
            }
        }
    },

    SendHelpText: function(player) {
        rust.SendChatMessage(player, prefix.ranksandtitles, msgs.help, "0");
    }

    /*---------------------------------------------------
              Build Our chat and lower annoying posts
    -----------------------------------------------------*/
    /*
      sendChat: function(player, msg, name) {
        try {
        var steamID = rust.UserIDFromPlayer(player);
        //Send in game chat
        //this.broadcastChat(player, name, msg);
        //send chat to console
        global.ServerConsole.PrintColoured(System.ConsoleColor.Cyan, name+": ", System.ConsoleColor.DarkGreen, msg);
        //Rusty Chat stream support
        //UnityEngine.Debug.Log.methodarray[0].Invoke(null, util.TableToArray({"[CHAT] " + name + ": " + msg}));
     } catch(e) {
       print(e.message.toString())
     }
      },

      broadcastChat: function(player, name, msg) {
        var steamID = rust.UserIDFromPlayer(player);

        //global.ConsoleSystem.Broadcast("chat.add", steamID, "<color="..color..">"..player.displayName.."</color> "..msg)
      },

      OnPlayerChat: function(arg) {
        try {
        var player = arg.connection.player
        var msg = arg.GetString(0, "text");
        if (msg.substring(1,1) === "/" || msg === "") return;
        var steamID = rust.UserIDFromPlayer(player);
        var username = player.displayName;
        this.sendChat(player, msg, username);
      } catch(e) {
        print(e.message.toString())
      }
      }
    */
}
