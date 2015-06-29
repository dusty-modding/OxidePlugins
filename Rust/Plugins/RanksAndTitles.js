/*
NOTES:
-Fixed case issue in /rt set
-Modified Config with new data handling
-Updated messages
-Removed obsolete messages
-Rewrote SetRanks function to handle fewer loops
-Rewrote getColor function to use single loops with new config
-Gave create prefix or rank function a failsafe
-Edited some functions to use proper globals
-Gave Permission Groups a set Rank instead of i to avoid overlap
-Built Auto Prefixes based on permissions groups system
-Updated promotion message and system to be smoother
-Removed some left over Try - Catches
-Added names to display when setting prefix
-Added "preup" command /rt preup
-Built Config Auto Update v1.6.6
-Built Console Commands ready for testing
 */
var RanksAndTitles = {
        Title: "RanksAndTitles",
        Author: "Killparadise",
        Version: V(1, 6, 6),
        ResourceId: 830,
        Init: function() {
            global = importNamespace("");
            this.updateConfig();
            this.getData();
            this.registerPermissions();
            msgs = this.Config.Messages;
            prefix = this.Config.Prefix;
            karmaOn = this.Config.Settings.useKarma;
            noAdmin = this.Config.Settings.noAdmin;
            command.AddChatCommand("rt", this.Plugin, "switchCmd");
            command.AddConsoleCommand("ranks.build", this.Plugin, "cBuild");
            command.AddConsoleCommand("ranks.delete", this.Plugin, "cDelete");
        },

        OnServerInitialized: function() {
            clansOn = plugins.Find('Clans');
            chatHandler = plugins.Find('chathandler');
        },

        /*-----------------------------------------------------
                            API
          -----------------------------------------------------*/
        /*-----------------------------------------------------------------
                grabPlayerData
                -- Can be called to certain player data
                - @steamID - Users Steam ID
                - @key - Object key to search for and value to return
         ------------------------------------------------------------------*/
        grabPlayerData: function(steamID, key) {
            return TitlesData.PlayerData[steamID][key];
        },

        /*-----------------------------------------------------------------
                grabPlayerPrefix
                -- Returns the sent players prefix as a string
                - @steamID - Users Steam ID
         ------------------------------------------------------------------*/
        grabPlayerPrefix: function(steamID) {
            return TitlesData.PlayerData[steamID].Prefix;
        },
        /*-----------------------------------------------------
                          END API
          -----------------------------------------------------*/

        /*-----------------------------------------------------------------
                updateConfig
                -- Smart update for config built each time
                -- by hand by me.
         ------------------------------------------------------------------*/
        updateConfig: function(player, cmd, args) {
            var counter = 0;

            if (this.Config.Version !== "1.6.6") {
                this.Config.Version = "1.6.6";
                print("New Config Version Found. Updating...");
                print("Grabbing all Ranks + Prefixes...")
                this.Config.Main.Prefixes = this.Config.prefixTitles;
                this.Config.Main.Ranks = this.Config.main;
                print("Moved all titles successfully...");
                print("Deleting Old Variables...");
                print("-----------------------------------");
                delete this.Config.main;
                print(">Deleted: Config main");
                delete this.Config.prefixTitles;
                print(">Deleted: Config prefixTitles");
                delete this.Config.Messages.broadcastpromo;
                print(">Deleted: Promo Broadcast Message");
                delete this.Config.Messages.broadcastdemote;
                print(">Deleted: Demote Broadcast Message");
                delete this.Config.Messages.suicide;
                print(">Deleted: Suicide Message");
                delete this.Config.Messages.Prmoted;
                print(">Deleted: Promoted Message");
                delete this.Config.Messages.Demoted;
                print(">Deleted: Demoted Message");
                delete this.Config.Messages.badSyntaxRt;
                delete this.Config.Messages.badSyntaxKarma;
                delete this.Config.Messages.badSyntaxRemove;
                print(">Deleted: Old Bad Syntax messages");
                delete this.Config.authLevel;
                print(">Deleted: Config Setting Auth Level");
                print("Deleted Old Variables: Complete...");
                print("--------------------------------------");
                print("Adding and Updating New Messages...");
                this.Config.Messages.rankChange = "Your rank has changed to: <color=lime>{rank}</color>";
                print(">Added: rankChange");
                this.Config.Messages.clearData = "RanksAndTitles Data Wiped...";
                print(">Updated: clearData");
                this.Config.Messages.reset = "'s prefix reset!";
                print(">Updated: reset");
                this.Config.Messages.setSuccs = "<color=lime>{player}'s</color> Prefix Set Successfully!";
                print(">Updated: setSuccs");
                this.Config.Messages.stats = ["<color=orange>Kills:</color> {kills}", "<color=orange>Deaths:</color> {deaths}", "<color=orange>KDR:</color> {kdr}", "<color=orange>Rank:</color> {rank}", "<color=orange>Karma:</color> {karma}"];
                print(">Updated: Stats");
                this.Config.Help.push("/rt preup - launches a prefix update check");
                print(">Added: preup message");
                print("Added & Updated Messages...");
                print("Moving Help Messages...");
                this.Config.rtHelp.Help.push(this.Config.Help);
                this.Config.rtHelp.AdminHelp.push(this.Config.AdminHelp);
                delete this.Config.Help;
                delete this.Config.AdminHelp;
                print("Merged Help Messages & Deleted old values.");
                this.LoadDefaultConfig();
                print("Loaded New Ranks variables...")
                print("Successfully updated Plugin Config: No Errors");
            } else {
                print("Config already at latest version: v" + this.Config.Version);
                return false;
            }
            this.SaveConfig();
        },

        LoadDefaultConfig: function() {
            this.Config.Version = this.Config.Version || "1.6.6";
            this.Config.Settings = this.Config.Settings || {
                "useKarma": true,
                "colorSupport": true,
                "noAdmin": false,
                "showPrefix": true,
                "AntiAbuseOn": true,
                "dropRank": false,
                "antiSleeper": false,
                "deathMsgs": true,
                "chatNameColor": "#1bd228",
                "staffchatNameColor": "#1bd228",
                "chatColor": "#FFFFFF"
            };
            this.Config.Main = this.Config.Main || {
                Prefixes: [{
                    "title": "Player",
                    "Color": "#FFFFFF",
                    "permission": "Player",
                }, {
                    "title": "Donor",
                    "Color": "#ffa500ff",
                    "permission": "Donor",
                }, {
                    "title": "Owner",
                    "Color": "#505886",
                    "permission": "Owner",
                }],
                Ranks: [{
                    "rank": 0,
                    "title": "Civilian",
                    "karma": 0,
                    "killsNeeded": 0,
                    "Color": "#FFFFFF",
                    "karmaModifier": 1
                }, {
                    "rank": 0.5,
                    "title": "Small Timer",
                    "karma": -1.0,
                    "killsNeeded": 1.0,
                    "Color": "#ff0000ff",
                    "karmaModifier": 1.0
                }, {
                    "rank": 0.5,
                    "title": "Wannabe",
                    "karma": 1.0,
                    "killsNeeded": 1.0,
                    "Color": "#0000a0ff",
                    "karmaModifier": 1.0
                }]
            };
            this.Config.Permissions = this.Config.Permissions || {
                "wipe": "canWipe",
                "set": "canSet",
                "remove": "canRemove",
                "noadmin": "canHide",
                "switch": "canSwitch",
                "kset": "canSetKarma",
                "kcheck": "canCheckKarma",
                "krem": "canRemKarma",
                "kadd": "canAddKarma",
                "clear": "canClear",
                "create": "canCreate",
                "delete": "canDelete",
                "staff": "isStaff"
            };
            this.Config.Prefix = this.Config.Prefix || "RanksAndTitles";
            this.Config.Messages = this.Config.Messages || {
                "NoPlyrs": "No Players Found...",
                "plyrWiped": "Player Wiped!",
                "dataRfrsh": "Data Refreshed!",
                "noPerms": "You do not have permission to use this command.",
                "setSuccs": "<color=lime>{player}'s</color> Prefix Set Successfully!",
                "needTitle": "You need to enter a title for the player!",
                "stats": ["<color=orange>Kills:</color> {kills}", "<color=orange>Deaths:</color> {deaths}", "<color=orange>KDR:</color> {kdr}", "<color=orange>Rank:</color> {rank}", "<color=orange>Karma:</color> {karma}"],
                "userprefix": "Your Prefix is: ",
                "errors": "Incorrect command structure, please try again.",
                "loseKarma": "<color=red>You've lost Karma!</color>",
                "gainKarma": "<color=green>You've gained Karma!</color>",
                "reset": "'s prefix reset!",
                "adminsOn": "Admins ranks turned on.",
                "adminsOff": "Admins rankings turned off.",
                "help": "/rt help - Get RanksAndTitles Command Help",
                "clearData": "RanksAndTitles Data Wiped...",
                "noData": "No Player Data Found... Attempting to Build.",
                "setKarma": "Karma successfully set!",
                "setKarma0": "You can only use numbers to set a players karma.",
                "plyrKarma": " Karma level is: ",
                "checkFailed": "Check failed..",
                "addKarma": "Karma added to player successfully",
                "removeKarma": "Karma removed from player successfully",
                "rankCreated": "<color=green>New Rank {rank} Created!</color>",
                "rankDel": "<color=green>{rank} has been deleted!</color>",
                "crtPrefix": "<color=green>{prefix} has been created!</color>",
                "offline": "<color=red>Karma given by sleepers is currently off</color>",
                "bdSyntax": "Incorrect Syntax please use {syntax}",
                "noPrefix": "You need to enter a prefix!",
                "slain": "<color=lime>{slayer}</color> the <color={slayerColor}>{title}</color> has slain <color=lime>{slain}</color> the <color={slainColor}>{stitle}</color>!",
                "rankChange": "Your rank has changed to: <color=lime>{rank}</color>"
            };
            this.Config.rtHelp = {
                Help: [
                    "/rt - display your rank or title",
                    "/rt preup - launches a prefix update check",
                    "/rt stats - get your current stats if in ranks mode",
                    "/rt refresh - refreshes your data file, recommended only used after system switch"
                ],
                AdminHelp: [
                    "<color=orange>/rt wipe playername</color> - Wipes the sleceted players Kills, Deaths, KDR, and Karma",
                    "<color=orange>/rt set playername title</color> - Sets a custom title to the selected player, this must be a title in config (NOT RANK)",
                    "<color=orange>/rt remove playername</color> - removes a given players custom title, and sets them back into the ransk tree",
                    "<color=orange>/rt showprefix</color> - switch prefixes on and off",
                    "<color=orange>/rt noadmin</color> - Removes admins (auth 2 or higher) from ranks system no kills, or ranks will be given.",
                    "<color=orange>/rt k set amt playername</color> - set a selected players karma level",
                    "<color=orange>/rt k playername</color> - check the selected players karma",
                    "<color=orange>/rt k add amt playername</color> - adds the entered amount of karma to the selected player",
                    "<color=orange>/rt k rem amt playername</color> - removes the entered amount of karma from the selected player",
                    "<color=orange>/rt create rankname rank karmaneeded killsneeded karmagiven color permissions</color> - create a new rank",
                    "<color=orange>/rt create prefixname color permission</color> - create a new prefix",
                    "<color=orange>/rt delete rankname</color> - delete a rank"
                ]
            }
        },

        /*-----------------------------------------------------------------
                String Builder
                -- Builds and returns a string based off array of values
                - @string - Sent string (Or array)
                - @values - array of values in order they appear in string
         ------------------------------------------------------------------*/
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

        /*-----------------------------------------------------------------
                OnPlayerInit
                -- Handles player login and initializes data
                - @player - Base Player Object
         ------------------------------------------------------------------*/
        OnPlayerInit: function(player) {
            var steamID = rust.UserIDFromPlayer(player);
            this.checkPlayerData(player, steamID);
        },

        /*-----------------------------------------------------------------
                registerPermissions
                -- Handles registering and building permissions
         ------------------------------------------------------------------*/
        registerPermissions: function() {
            var i = 0,
                j = this.Config.Main.Prefixes.length;
            //prefix permission groups
            for (i; i < j; i++) {
                if (!permission.GroupExists(this.Config.Main.Prefixes[i].permission)) {
                    permission.CreateGroup(this.Config.Main.Prefixes[i].permission, this.Config.Main.Prefixes[i].permission, 3);
                }
            }
            //single permissions
            for (var perm in this.Config.Permissions) {
                if (!permission.PermissionExists(this.Config.Permissions[perm])) {
                    permission.RegisterPermission(this.Config.Permissions[perm], this.Plugin);
                }
            }
        },

        /*-----------------------------------------------------------------
                hasPermission
                -- Handles checking permissions of a user
                - @player - Base Player Object
                - @perm - given permission to look up
         ------------------------------------------------------------------*/

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

        /*-----------------------------------------------------------------
                getData
                -- Handles building initial data system
         ------------------------------------------------------------------*/
        getData: function() {
            TitlesData = data.GetData('RanksandTitles');
            TitlesData = TitlesData || {};
            TitlesData.PlayerData = TitlesData.PlayerData || {};
            TitlesData.AntiAbuse = TitlesData.AntiAbuse || {};
        },

        /*-----------------------------------------------------------------
                checkPlayerData
                -- Handles building initial player data
                -- and setting proper values on login
                - @player - Base Player Object
                - @steamID - User steam ID
         ------------------------------------------------------------------*/
        checkPlayerData: function(player, steamID) {
            var authLvl = player.net.connection.authLevel;
            TitlesData.PlayerData[steamID] = TitlesData.PlayerData[steamID] || {};
            TitlesData.PlayerData[steamID].PlayerID = TitlesData.PlayerData[steamID].PlayerID || steamID;
            TitlesData.PlayerData[steamID].RealName = TitlesData.PlayerData[steamID].RealName || player.displayName;
            TitlesData.PlayerData[steamID].Title = TitlesData.PlayerData[steamID].Title || "";
            TitlesData.PlayerData[steamID].Prefix = TitlesData.PlayerData[steamID].Prefix || "";
            TitlesData.PlayerData[steamID].Rank = TitlesData.PlayerData[steamID].Rank || 0;
            TitlesData.PlayerData[steamID].Kills = TitlesData.PlayerData[steamID].Kills || 0;
            TitlesData.PlayerData[steamID].KDR = TitlesData.PlayerData[steamID].KDR || 0;
            TitlesData.PlayerData[steamID].Deaths = TitlesData.PlayerData[steamID].Deaths || 0;
            TitlesData.PlayerData[steamID].Karma = TitlesData.PlayerData[steamID].Karma || 0;
            TitlesData.PlayerData[steamID].isAdmin = TitlesData.PlayerData[steamID].isAdmin || (authLvl >= 2) || this.hasPermission(player, this.Config.Permissions.staff) || false;
            TitlesData.PlayerData[steamID].hidden = TitlesData.PlayerData[steamID].hidden || false;
            this.setTitles(steamID, player);
        },

        /*-----------------------------------------------------------------
                saveData
                -- Handles building initial player data
                -- and setting proper values on login
         ------------------------------------------------------------------*/
        saveData: function() {
            data.SaveData('RanksandTitles');
        },

        /*-----------------------------------------------------------------
                clearData
                -- Wipes The entire data file and then rebuilds it
                -- WARNING: CANNOT be undone
                - @player - object - Base Player Object
                - @cmd - Triggered Command
                - @args - array - Cmd arguments
         ------------------------------------------------------------------*/
        clearData: function(player, cmd, args) {
            delete TitlesData.PlayerData;
            rust.SendChatMessage(player, prefix, msgs.clearData, "0");
            TitlesData.PlayerData = TitlesData.PlayerData || {};
            this.saveData();
            this.getData();
        },

        /*-----------------------------------------------------------------
                refreshData
                -- Handles refreshing player data
                -- sends them through ranking process again
                - @player - object - Base Player Object
                - @cmd - Triggered Command
                - @args - array - Cmd arguments
         ------------------------------------------------------------------*/
        refreshData: function(player, cmd, args) {
            var steamID = rust.UserIDFromPlayer(player);
            if (TitlesData.PlayerData[steamID] === undefined) {
                rust.SendChatMessage(player, prefix, msgs.noData, "0");
            } else {
                rust.SendChatMessage(player, prefix, msgs.dataRfrsh, "0");
            }
            TitlesData.PlayerData[steamID].Title = "";
            this.checkPlayerData(player, steamID);
        },

        /*-----------------------------------------------------------------
                findPlayerByName
                -- Locates Base Player object using the users name
                - @playerName - String - of base player name
         ------------------------------------------------------------------*/
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
        /*-----------------------------------------------------------------
                switchCmd
                -- Handles all regular commands inside the plugin
                - @player - object - Base Player Object
                - @cmd - Triggered Command
                - @args - array - Cmd arguments
         ------------------------------------------------------------------*/
        switchCmd: function(player, cmd, args) {
            var steamID = rust.UserIDFromPlayer(player),
                authLvl = player.net.connection.authLevel,
                perms = this.Config.Permissions;
            if (!TitlesData.PlayerData[steamID]) {
                rust.SendChatMessage(player, prefix, msgs.noData, "0");
                this.checkPlayerData(player, steamID);
            }
            thisPerm = args[0];
            if (args.length > 1 && args[0] !== undefined) allowed = this.hasPermission(player, perms[thisPerm]);
            switch (args[0]) {
                case "stats":
                    player.ChatMessage(this.buildString(msgs.stats, [TitlesData.PlayerData[steamID].Kills, TitlesData.PlayerData[steamID].Deaths,
                        TitlesData.PlayerData[steamID].KDR, TitlesData.PlayerData[steamID].Rank, TitlesData.PlayerData[steamID].Karma
                    ]));
                    break;
                case "wipe":
                    if (allowed) this.wipePlayer(player, cmd, args);
                    break;
                case "set":
                    if (allowed && args.length === 3) {
                        this.givePrefix(player, cmd, args);
                    } else {
                        rust.SendChatMessage(player, prefix, msgs.bdSyntax.replace("{syntax}", "/rt set playername prefix"), "0");
                        return false;
                    }
                    break;
                case "showprefix":
                    if (allowed) {
                        if (!this.Config.Settings.showPrefix) {
                            this.Config.Settings.showPrefix = true;
                        } else {
                            this.Config.Settings.showPrefix = false;
                        }
                    }
                    this.SaveConfig();
                    break;
                case "k":
                    if (args.length >= 1 && allowed) {
                        this.karmaHandling(player, cmd, args);
                    } else if (args.length < 1) {
                        rust.SendChatMessage(player, prefix, "Improper Karma Command, use /rt help for more info.", "0");
                        return false;
                    }
                    break;
                case "remove":
                    if (allowed && args.length >= 1) {
                        this.removePrefix(player, cmd, args);
                    } else {
                        player.ChatMessage(msgs.bdSyntax.replace("{syntax}", "/rt remove playername"));
                        return false;
                    }
                    break;
                case "clear":
                    if (allowed) this.clearData(player, cmd, args);
                    break;
                case "refresh":
                    this.refreshData(player, cmd, args);
                    break;
                case "noadmin":
                    if (allowed) {
                        if (noAdmin) {
                            this.Config.Settings.noAdmin = false;
                            rust.SendChatMessage(player, prefix, msgs.adminsOn, "0");
                        } else {
                            this.Config.Settings.noAdmin = true;
                            rust.SendChatMessage(player, prefix, msgs.adminsOff, "0");
                        }
                        this.SaveConfig();
                    }
                    break;
                case "help":
                    var help = this.Config.rtHelp;
                    player.ChatMessage("--------------RanksAndTitles Commands------------");
                    for (var i = 0; i < help.Help.length; i++) {
                        player.ChatMessage(help.Help[i]);
                    }
                    if (this.hasPermission(player, "isStaff")) {
                        player.ChatMessage("<color=orange>--------------Admin Commands------------</color>");
                        for (var j = 0; j < help.AdminHelp.length; j++) {
                            player.ChatMessage(help.AdminHelp[j]);
                        }
                    }
                    break;
                case "create":
                    if (allowed) this.createRank(player, cmd, args);
                    break;
                case "delete":
                    if (allowed) this.deleteRank(player, cmd, args);
                    break;
                case "preup":
                    TitlesData.PlayerData[steamID].Prefix = "";
                    this.setTitles(player, steamID);
                    break;
                default:
                    rust.SendChatMessage(player, prefix, "Current Rank: " + TitlesData.PlayerData[steamID].Rank.toString() + " (" + TitlesData.PlayerData[steamID].Title + ")", "0");
                    rust.SendChatMessage(player, prefix, msgs.userprefix + TitlesData.PlayerData[steamID].Prefix, "0");
                    break;
            }
            return false;
        },

        /*-----------------------------------------------------------------
                getClosest
                -- Locates closes rank to current players karma
                - @arr - Array - empty array to gather data
                - @closestTo - the current karma of the player
         ------------------------------------------------------------------*/
        getClosest: function(closestTo) {
            var arr = this.getRanksArray();
            if (arr.length > 0) {

                for (var i = 0; i < arr.length; i++) {
                    if (closestTo >= 0) {
                        if (arr[i] <= closestTo && arr[i] >= 0) closest = arr[i];
                    } else if (closestTo <= 0) {
                        if (arr[i] >= closestTo && arr[i] <= 0) closest = arr[i];
                    }
                }
            }
            return closest;
        },

        /*-----------------------------------------------------------------
                getRanksArray
                -- Builds an array of karma values to compare
                -- against the players current karma
         ------------------------------------------------------------------*/
        getRanksArray: function() {
            var temp = [];

            for (var i = 0, len = this.Config.Main.Ranks.length; i < len; i++) {
                if (karmaOn) {
                    temp.push(this.Config.Main.Ranks[i].karma);
                } else {
                    if (this.Config.Main.Ranks[i].killsNeeded !== "disabled") {
                        temp.push(this.Config.Main.Ranks[i].killsNeeded);
                    }
                }
            }
            return temp;
        },

        /*-----------------------------------------------------------------
                setTitles
                -- Finds and sets a players Rank, Title & Prefix
                -- based on kills or karma
                - @playerID - Users Steam ID
                - @player - Base player Object
         ------------------------------------------------------------------*/
        setTitles: function(playerID, player) {
            var oldRank = TitlesData.PlayerData[playerID].Rank;
            var data = this.Config.Main;
            for (var param in data) {
                var q = 0,
                    len = data[param].length;
                for (q; q < len; q++) {
                    //prefix handler
                    if (param === "Prefixes") {
                        if (TitlesData.PlayerData[playerID].Prefix === "" && this.hasPermission(player, data[param][q].permission)) {
                            permission.AddUserGroup(playerID, data[param][q].permission);
                            TitlesData.PlayerData[playerID].Prefix = data[param][q].permission;
                        }
                        //Ranks Handler
                    } else if (param === "Ranks") {
                        if ((karmaOn && this.getClosest(TitlesData.PlayerData[playerID].Karma) === data[param][q].karma) ||
                            (!karmaOn && this.getClosest(TitlesData.PlayerData[playerID].Kills) === data[param][q].killsNeeded)) {
                            TitlesData.PlayerData[playerID].Title = data[param][q].title;
                            TitlesData.PlayerData[playerID].Rank = data[param][q].rank;
                        }
                    }
                }
            }

            if (TitlesData.PlayerData[playerID].Rank !== oldRank) {
                player.ChatMessage(msgs.rankChange.replace("{rank}", TitlesData.PlayerData[playerID].Title));
            }
        },

        /*--------------------------------------------------------------------
                handleStats
                -- Stats handler function, handles karma, kills, deaths, & KDR
                -- All in one go to speed up the process. Set regardless of
                -- Settings placed in the config.
                - @killer - Killer Base Player Object
                - @victim - Victim Base player Object
         ---------------------------------------------------------------------*/
        handleStats: function(killer, victim) {
            var killerID = rust.UserIDFromPlayer(killer);
            var victimID = rust.UserIDFromPlayer(victim);
            if (this.Config.Settings.AntiAbuseOn && this.antiAbuse(victim, killer)) {
                return false;
            }
            // Handle Data
            if (!TitlesData.PlayerData[killerID]) {
                this.checkPlayerData(killer, killerID);
            }
            if (!TitlesData.PlayerData[victimID] && victim.IsConnected()) {
                this.checkPlayerData(victim, victimID);
            }
            // /Handle Data

            if (this.Config.Settings.antiSleeper && victim.IsSleeping() && !TitlesData.PlayerData[victimID]) return false;

            if (killer.displayName !== victim.displayName) {
                var kGet = this.getKarma(victimID);
                if (karmaOn && TitlesData.PlayerData[victimID].Karma >= 0) {
                    TitlesData.PlayerData[killerID].Karma -= kGet;
                    rust.SendChatMessage(killer, prefix, msgs.loseKarma + " (" + kGet + ")", "0");
                } else if (karmaOn && TitlesData.PlayerData[victimID].Karma < 0) {
                    TitlesData.PlayerData[killerID].Karma += kGet;
                    rust.SendChatMessage(killer, prefix, msgs.gainKarma + " (" + kGet + ")", "0");
                }
                TitlesData.PlayerData[killerID].Kills += 1;
                TitlesData.PlayerData[victimID].Deaths += 1;
                if (this.Config.Settings.deathMsgs) this.buildDeathMsg([killer.displayName, victim.displayName], [killerID, victimID]);

            } else if (victim.displayName === killer.displayName) {
                TitlesData.PlayerData[victimID].Deaths += 1;
            } else {
                return false;
            }

            this.setTitles(killerID, killer);
            var ids = [victimID, killerID];
            var len = ids.length;
            for (var i = 0; i < len; i++) {
                k2d = TitlesData.PlayerData[ids[i]].Kills / TitlesData.PlayerData[ids[i]].Deaths;
                k2d = Math.ceil(k2d * 100) / 100;
                if (k2d !== "Infinity") {
                    TitlesData.PlayerData[ids[i]].KDR = k2d;
                } else {
                    TitlesData.PlayerData[ids[i]].KDR = TitlesData.PlayerData[ids[i]].Kills;
                }
            }
            this.saveData();
        },

        /*-----------------------------------------------------------------
                getKarma
                -- Grabs the victims title and locates the karmaModifier
                - @victimID - Victims Steam ID
         ------------------------------------------------------------------*/
        getKarma: function(victimID) {
            var i = 0,
                karma = 1,
                j = this.Config.Main.Ranks.length;
            for (i; i < j; i++) {
                if (this.Config.Main.Ranks[i].title === TitlesData.PlayerData[victimID].Title) {
                    karma = this.Config.Main.Ranks[i].karmaModifier;
                    break;
                }
            }
            return karma;
        },

        /*-----------------------------------------------------------------
                antiAbuse
                -- Handles clan mate killings
                -- karma system
                - @victimID - Victims Steam ID
                - @attackerID - Attacker Steam ID
         ------------------------------------------------------------------*/
        antiAbuse: function(victim, attacker) {
            if (clansOn) {
                attackerClan = clansOn.GetClanOf(attacker);
                victimClan = clansOn.GetClanOf(victim);
                if (attackerClan === victimClan) {
                    return true;
                }
            }
            return false;
        },
        /*-----------------------------------------------------------------
                OnEntityDeath
                -- Called when a player is killed handles how
                -- data is distributed correctly
                - @entity - Killed entity object
                - @hitinfo - Data of the last hit that caused death
         ------------------------------------------------------------------*/
        OnEntityDeath: function(entity, hitinfo) {
            if (!hitinfo || !entity) return false;
            var victim = entity,
                killer = hitinfo.Initiator;
            if (!killer.ToPlayer() || !victim.ToPlayer()) return false;
            this.handleStats(killer, victim);
        },

        /*-----------------------------------------------------------------
                buildDeathMsg
                -- Builds Broadcasted message on deaths
                - @users - array of player names
                - @ids - array of ids to be sent to the function
         ------------------------------------------------------------------*/
        buildDeathMsg: function(users, ids) {
            var slayerTitle = TitlesData.PlayerData[ids[0]].Title;
            var slainTitle = TitlesData.PlayerData[ids[1]].Title;

            for (var i = 0; i < this.Config.Main.Ranks.length; i++) {
                if (this.Config.Main.Ranks[i].title === slayerTitle) {
                    slayerColor = this.Config.Main.Ranks[i].Color;
                }
                if (this.Config.Main.Ranks[i].title === slainTitle) {
                    slainColor = this.Config.Main.Ranks[i].Color;
                }
            }
            rust.BroadcastChat(prefix, this.buildString(msgs.slain, [users[0], slayerColor, slayerTitle, users[1], slainColor, slainTitle]));
            return false;
        },
        /*-----------------------------------------------------------------
                karmaHandling
                -- Handles all the karma based commands
                - @player - object - Base Player Object
                - @cmd - Triggered Command
                - @args - array - Cmd arguments
         ------------------------------------------------------------------*/
        karmaHandling: function(player, cmd, args) {
            var getPlayer = "",
                karmaAmt = 0;
            if (args.length === 4) {
                getPlayer = this.findPlayerByName(args[3]);
                karmaAmt = Number(args[2]);
            }
            switch (args[1]) {
                case "add":
                    TitlesData.PlayerData[getPlayer[1]].Karma += karmaAmt;
                    rust.SendChatMessage(player, prefix, msgs.addKarma, "0");
                    break;
                case "set":
                    TitlesData.PlayerData[getPlayer[1]].Karma = karmaAmt;
                    rust.SendChatMessage(player, prefix, msgs.setKarma, "0");
                    break;
                case "rem":
                    TitlesData.PlayerData[getPlayer[1]].Karma -= karmaAmt;
                    rust.SendChatMessage(player, prefix, msgs.removeKarma, "0");
                    break;
                default:
                    getPlayer = this.findPlayerByName(args[1]);
                    rust.SendChatMessage(player, prefix, getPlayer[0].displayName + msgs.plyrKarma + TitlesData.PlayerData[getPlayer[1]].Karma, "0");
                    break;
            }
            this.saveData();
            this.checkPlayerData(getPlayer[0], getPlayer[1]);
        },

        /*-----------------------------------------------------------------
                wipePlayer
                -- Handles wipe of player or all
                -- players in the data file
                - @player - object - Base Player Object
                - @cmd - Triggered Command
                - @args - array - Cmd arguments
         ------------------------------------------------------------------*/
        wipePlayer: function(player, cmd, args) {
            var target;
            if (args[1] !== "all") {
                target = this.findPlayerByName(args[1]);
                if (target[1].length) {
                    TitlesData.PlayerData[target[1]].Kills = 0;
                    TitlesData.PlayerData[target[1]].Deaths = 0;
                    TitlesData.PlayerData[target[1]].KDR = 0;
                    if (this.Config.Settings.karma) TitlesData.PlayerData[target[1]].Karma = 0;
                    rust.SendChatMessage(player, prefix, msgs.plyrWiped, "0");
                    this.setTitles(target[1], target[0]);
                } else if (!target[1].length) {
                    rust.SendChatMessage(player, prefix, msgs.NoPlyrs, "0");
                    return false;
                } else {
                    rust.SendChatMessage(player, prefix, msgs.NoPlyrs, "0");
                    return false;
                }
            } else if (args[1] === "all") {
                for (target in TitlesData.PlayerData) {
                    TitlesData.PlayerData[target].Kills = 0;
                    TitlesData.PlayerData[target].Deaths = 0;
                    TitlesData.PlayerData[target].KDR = 0;
                    if (this.Config.Settings.karma) TitlesData.PlayerData[target].Karma = 0;
                    this.setTitles(target, rust.UserIDFromPlayer(target));
                }
            }
            this.saveData();
        },

        /*-----------------------------------------------------------------
                createRank
                -- Builds Rank or Prefix and adds it to the config
                - @player - object - Base Player Object
                - @cmd - Triggered Command
                - @args - array - Cmd arguments
         ------------------------------------------------------------------*/
        createRank: function(player, cmd, args) {
            var temp = {};

            if (args.length === 4) {
                temp = {
                    "title": args[1].toString() || "default",
                    "Color": args[2].toString() || "#FFFFFF",
                    "permission": args[3].toString() || "player"
                };
                this.Config.Main.Prefixes.push(temp);
                rust.SendChatMessage(player, prefix, msgs.crtPrefix.replace("{prefix}", temp.title), "0");
            } else if (args.length >= 6) {
                temp = {
                    "rank": Number(args[2]) || 1,
                    "title": args[1].toString() || "default",
                    "karma": Number(args[3]) || 1,
                    "killsNeeded": Number(args[4]) || 0,
                    "Color": args[6].toString() || "#FFFFFF",
                    "karmaModifier": Number(args[4]) || 1,
                    "permission": args[7].toString() || "player"
                };
                this.Config.Main.Ranks.push(temp);
                rust.SendChatMessage(player, prefix, msgs.rankCreated.replace("{rank}", temp.title), "0");
            } else {
                rust.SendChatMessage(player, prefix, msgs.bdSyntax.replace("{syntax}", "Check /rt help for more info."));
                return false;
            }
            this.SaveConfig();
        },

        /*-----------------------------------------------------------------
                deleteRank
                -- Deletes Rank or Prefix and removes it from the config
                - @player - object - Base Player Object
                - @cmd - Triggered Command
                - @args - array - Cmd arguments
         ------------------------------------------------------------------*/
        deleteRank: function(player, cmd, args) {
            var i = 0,
                j = this.Config.Main.Ranks.length,
                rank = args[1].toString();
            for (i; i < j; i++) {
                if (rank === this.Config.Main.Ranks[i].title) {
                    name = this.Config.Main.Ranks[i].title;
                    this.Config.Main.Ranks.splice(i, 1);
                    rust.SendChatMessage(player, prefix, msgs.rankDel.replace("{rank}", name), "0");
                }
            }
            return false;
        },

        /*-----------------------------------------------------------------
                removePrefix
                -- Removes a desired prefix from a target player
                - @player - object - Base Player Object
                - @cmd - Triggered Command
                - @args - array - Cmd arguments
         ------------------------------------------------------------------*/
        removePrefix: function(player, cmd, args) {
            var getPlayer = this.findPlayerByName(args[1]);
            for (var i = 0; i < this.Config.Main.Prefixes.length; i++) {
                if (this.Config.Main.Prefixes[i] === TitlesData.PlayerData[getPlayer[1]].Prefix) {
                    TitlesData.PlayerData[getPlayer[1]].Prefix = "";
                    permission.RemoveUserGroup(getPlayer[1], this.Config.Main.Prefixes[i].permission);
                }
            }
            this.saveData();
            this.setTitles(getPlayer[1], getPlayer[0]);
            rust.SendChatMessage(player, prefix, getPlayer[0].displayName + msgs.reset, "0");
        },

        /*-----------------------------------------------------------------
                givePrefix
                -- Gives a Prefix to the desired player
                - @player - object - Base Player Object
                - @cmd - Triggered Command
                - @args - array - Cmd arguments
         ------------------------------------------------------------------*/
        givePrefix: function(player, cmd, args) {

            var getPlayer = this.findPlayerByName(args[1]);
            var getPlayerData = TitlesData.PlayerData,
                j = this.Config.Main.Prefixes.length,
                i = 0;
            if (!getPlayer) {
                player.ChatMessage(msgs.NoPlyrs);
                return false;
            }
            if (args[2].length) {
                var prefix = args[2].toLowerCase();
                for (i; i < j; i++) {
                    if (prefix === this.Config.Main.Prefixes[i].title.toLowerCase()) {
                        TitlesData.PlayerData[getPlayer[1]].Prefix = this.Config.Main.Prefixes[i].title;
                        permission.AddUserGroup(getPlayer[1], this.Config.Main.Prefixes[i].permission);
                        rust.SendChatMessage(player, prefix, msgs.setSuccs.replace("{player}", getPlayer[0].displayName), "0");
                    }
                }
            } else {
                rust.SendChatMessage(player, prefix, msgs.needPrefix, "0");
                return false;
            }
            this.saveData();
        },

        cBuild: function(args) {
            var cRank = {},
                step = 0;
            print("Prepping Rank Build Process...");
            print("--------------------------------------");
            print("Are we building a Rank or Prefix?");
            var choice = readline();
            if (choice.toLowerCase() === "rank") {
                print("What will the Name of the Rank be?");
                cRank.title = readline();
                print("What will the Rank # be?");
                cRank.rank = readline();
                print("How much Karma is needed to get this rank?");
                cRank.karma = Number(readline());
                print("How many kills will be needed to get this rank? (if turned on)");
                cRank.killsNeeded = Number(readline());
                print("Whats the karma reward for killing this rank?");
                cRank.karmaModifier = Number(readline());
                print("Whats the color going to be for this rank? (Hex codes accepted)");
                cRank.Color = readline();
                print("What will the permission level be for this rank? (Default is player)");
                if (readline() === "") {
                    cRank.permission = "player";
                } else {
                    cRank.permission = readline();
                }
                print("The Rank " + cRank.title + " has the rank number of " + cRank.rank + ", requires " + cRank.karma + " karma or " + cRank.kills + " kills to be obtained it will give " + cRank.karmaModifier + " karma when slain, and uses the color: " + cRank.color + " with the permissions of: " + cRank.permission);
                print("Is this Correct? (Yes or No)");
                print("No will restart the process from the beginning.");
                choice = readline();
                if (choice.toLowerCase() === "yes" || choice.toLowerCase() === "y") {
                    this.Config.Main.Ranks.push(cRank);
                } else {
                    this.cBuild();
                }
            } else if (choice.toLowerCase() === "prefix") {
                print("What will the prefix name be?");
                cRank.prefix = readline();
                print("What will the prefix color be? (Hex codes accepted)");
                cRank.color = readline();
                print("What will the permission level be? (Default is player)");
                if (readline() === "") {
                    cRank.permission = "player";
                } else {
                    cRank.permission = readline();
                }
                print("The Prefix " + cRank.prefix + " uses the color " + cRank.color + " with permissions " + cRank.permission);
                print("Is this Correct? (Yes or No)");
                print("No will restart the process from the beginning.");
                choice = readline();
                if (choice.toLowerCase() === "yes" || choice.toLowerCase() === "y") {
                    this.Config.Main.Prefixes.push(cRank);
                } else {
                    this.cBuild();
                }
            } else {
                print("Incorrect Choice, please use rank or prefix");
            }
            return false;
        },
        cDelete: function(args) {
            var targetRank = args[1];
            for (var i = 0; i < this.Config.Main.Ranks.length; i++) {
                if (this.Config.Main.Ranks[i].title.toLowerCase() === targetRank.toLowerCase()) {
                    delete this.Config.Main.Ranks[i];
                    break;
                } else if (i >= this.Config.Main.Ranks.length && this.Config.Main.Ranks[i].title.toLowerCase() !== targetRank.toLowerCase()) {
                    print("Unable to find rank. Delete unsuccessful.");
                    return false;
                }
            }
            print("Rank " + targetRank + " found and successfully deleted.");
            this.SaveConfig();
            return false;
        }
    },

    SendHelpText: function(player) {
        rust.SendChatMessage(player, prefix, msgs.help, "0");
    },

    /*-----------------------------------------------------------------
            getColor
            -- Handles finding, and grabbing the
            -- current color of the player
            - @steamID - Current User id to grab the color for.
     ------------------------------------------------------------------*/
    getColor: function(steamID) {
        var i = 0,
            colorArr = [],
            j = 0;
        var data = this.Config.Main;
        for (var key in data) {
            var len = data[param].length;
            if (param === "Ranks") {
                for (i; i < len; i++) {
                    if (TitlesData.PlayerData[steamID].Title === data[param][i].title) {
                        if (chatHandler) return data[param][i].Color;
                        colorArr.push(data[param][i].Color);
                    }
                }
            } else if (param === "Prefixes") {
                for (j; j < len; j++) {
                    if (TitlesData.PlayerData[steamID].Title === data[param][j].title) {
                        colorArr.push(data[param][j].Color);
                    }
                }
            }
        }
        return colorArr;
    },

    /*-----------------------------------------------------------------
            OnPlayerChat
            -- Handles building chat string before
            -- sending it to the rust box will not build
            -- a string if chathandler is present
            - @arg - Paramater Array of arguments
     ------------------------------------------------------------------*/
    OnPlayerChat: function(arg) {

        var player = arg.connection.player,
            steamID = rust.UserIDFromPlayer(player);

        if (typeof TitlesData.PlayerData[steamID] === "undefined") {
            this.checkPlayerData(player, steamID);
        }
        if (chatHandler) return null;
        var isAdmin = false,
            titleColor = "",
            usePrefix = "",
            prefixColor = "",
            useTitle = "",
            chatColor = "<color=" + this.Config.Settings.chatColor + ">",
            useColor = "<color=" + this.Config.Settings.chatNameColor + ">",
            colorOn = this.Config.Settings.colorSupport,
            color = this.getColor(steamID),
            msg = arg.GetString(0, "text");
        if (msg.substring(1, 1) === "/" || msg === "") return null;

        if (colorOn && permission.UserHasPermission(steamID, "isStaff")) {
            useColor = "<color=" + this.Config.Settings.staffchatNameColor + ">";
            isAdmin = true;
        }

        if (colorOn && !this.Config.Settings.dropRank) {
            titleColor = "<color=" + color[0] + ">[";
        }

        if (!this.Config.Settings.dropRank) useTitle = TitlesData.PlayerData[steamID].Title + "]</color>: ";

        if (this.Config.Settings.showPrefix && TitlesData.PlayerData[steamID].Prefix !== "") {
            usePrefix = TitlesData.PlayerData[steamID].Prefix + "]</color> ";
            prefixColor = "<color=" + color[1] + ">[";
        }

        if (!this.Config.Settings.dropRank) useTitle = TitlesData.PlayerData[steamID].Title + "]</color>: ";

        formattedMsg = prefixColor + usePrefix + useColor + player.displayName + "</color> " + titleColor + useTitle + chatColor + msg + "</color>";
        global.ConsoleSystem.Broadcast("chat.add", steamID, formattedMsg);
        print(player.displayName + ": " + msg);
        return false;
    }
};