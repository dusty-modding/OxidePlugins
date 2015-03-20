var LeaderBoards = {
        Title: "Leaderboards",
        Author: "Killparadise",
        Version: V(1, 0, 0),
        HasConfig: true,
        Init: function() {
            global = importNamespace("");
            RanksAPI = plugins.Find("RanksAndTitles");
            this.boardData();
            msgs = this.Config.Messages;
            prefix = this.Config.Prefix;
            command.AddChatCommand("lb", this.Plugin, "switchCmd");
        },

        OnServerInitialized: function() {
            msgs = this.Config.Messages;
            prefix = this.Config.Prefix;
            this.updateConfig();
        },

        updateConfig: function() {
            if (this.Config.Version !== 1.0) {
                this.LoadDefaultConfig();
                print("Config outdated... Updating.")
            } else {
                return false;
            }
        },

        LoadDefaultConfig: function() {
            this.Config.Version = 1.0;
            this.Config.Settings = {
                "countPvE": true,
                "countPvP": true,
                "useRanksAndTitles": false,
                "countGather": true,
                "pointsName": "Points"
            };
            this.Config.Connect = {
                "host": "localHost",
                "port": 3306,
                "database": "rust",
                "username": "root",
                "password": ""
            };
            this.Config.Points = [{
                "Wolf": 5,
                "Bear": 10,
                "Deer": 3,
                "Boar": 2,
                "Chicken": 1,
                "Player": 15,
                "Trees": 1,
                "Stones": 1,
                "Metal Ore": 1,
                "Sulfer Ore": 1,
                "AirDrop": 25,
                "Death": -10,
                "Suicide": -15
            }];
            this.Config.Prefix = "LeaderBoards"
            this.Config.Messages = {
                "setup": "Setup has run check console to make sure the database ran successfully.",
                "noPerms": "You do not have permission to do this.",
                "top10": "Top Ten",
                "refresh": "Refreshed and sent data to LeaderBoards"
            }
        },

        OnPlayerInit: function(player) {
            var steamID = rust.UserIDFromPlayer(player);
            this.getPlayerData(steamID);
            this.checkTable(player);
        }

            getData: function() {
            LeaderBoard = data.GetData("LeaderBoard");
            LeaderBoard = LeaderBoard || {};
            LeaderBoard.PlayerData = LeaderBoard.PlayerData || {};
            LeaderBoard.TopTen = LeaderBoard.TopTen || {};
        },

        getPlayerData: function(steamID) {
            LeaderBoard.PlayerData[steamID] = LeaderBoard.PlayerData[steamID] || {};
            LeaderBoard.PlayerData[steamID].RealName = LeaderBoard.PlayerData[steamID].RealName || player.displayName
            LeaderBoard.PlayerData[steamID].Points = LeaderBoard.PlayerData[steamID].Points || 0;
            LeaderBoard.PlayerData[steamID].Kills = LeaderBoard.PlayerData[steamID].Kills || 0;
            LeaderBoard.PlayerData[steamID].Deaths = LeaderBoard.PlayerData[steamID].Deaths || 0;
            LeaderBoard.PlayerData[steamID].KDR = LeaderBoard.PlayerData[steamID].KDR || 0;
            LeaderBoard.PlayerData[steamID].Suicides = LeaderBoard.PlayerData[steamID].Suicides || 0;
            if (RanksAPI) {
                LeaderBoard.PlayerData[steamID].Rank = LeaderBoard.PlayerData[steamID].Rank || null;
                this.checkForRanksData(steamID);
            }
        },

        checkForRanksData: function(steamID) {
            TitlesData = data.GetData("RanksandTitles");
            if (TitlesData) {
                LeaderBoard.PlayerData[steamID].Kills = TitlesData.PlayerData[steamID].Kills;
                LeaderBoard.PlayerData[steamID].Deaths = TitlesData.PlayerData[steamID].Deaths;
                LeaderBoard.PlayerData[steamID].KDR = TitlesData.PlayerData[steamID].KDR;
                LeaderBoard.PlayerData[steamID].RealName = TitlesData.PlayerData[steamID].RealName;
                LeaderBoard.PlayerData[steamID].Rank = TitlesData.PlayerData[steamID].Rank;
            } else {
                print("No Ranks Data Found");
                return false;
            }
        },

        checkTable: function(player) {

        },

        buildTable: function() {
                var database = mysql.OpenDb(this.Config.Connect.host, this.Config.Connect.port, this.Config.Connect.database, this.Config.Connect.username, this.Config.Connect.password);
                var sql = mysql.NewSql();
                sql.Append("CREATE TABLE IF NOT EXISTS LeaderBoards(
                        'id'
                        int(11) NOT NULL AUTO_INCREMENT,
                        'name'
                        text NOT NULL,
                        'rank'
                        text NOT NULL,
                        'kills'
                        INT NOT NULL,
                        'deaths'
                        INT NOT NULL,
                        'kdr'
                        INT NOT NULL,
                        'suicides'
                        INT NOT NULL,
                        'points'
                        INT NOT NULL,
                        'total'
                        INT NOT NULL");
                        print("Feedback: " + sql); print("If the plugin has run successfully you do NOT need to use run again.");
                    },

                    sendData: function(steamID, player) {
                        var database = mysql.OpenDb(this.Config.Connect.host, this.Config.Connect.port, this.Config.Connect.database, this.Config.Connect.username, this.Config.Connect.password);
                        var sql = mysql.NewSql();
                        sql.Append("INSERT INTO LeaderBoards(name, kills, deaths, kdr, suicides, points, rank)
                            VALUES(LeaderBoard.PlayerData[steamID].RealName,
                                LeaderBoard.PlayerData[steamID].Kills,
                                LeaderBoard.PlayerData[steamID].Deaths,
                                LeaderBoard.PlayerData[steamID].KDR,
                                LeaderBoard.PlayerData[steamID].Suicides,
                                LeaderBoard.PlayerData[steamID].Points,
                                LeaderBoard.PlayerData[steamID].Rank)");
                            },

                            switchCmd: function(player, cmd, args) {
                                var authLevel = player.net.connection.authLevel,
                                    steamID = rust.UserIDFromPlayer(player);

                                switch (args[0]) {
                                    case "run":
                                        if (authLevel >= 2) {
                                            this.buildTable();
                                            rust.SendChatMessage(player, prefix, msgs.setup, "0");
                                        } else {
                                            rust.SendChatMessage(player, prefix, msgs.noPerms, "0");
                                            return false;
                                        }
                                        break;
                                    case "refresh":
                                        if (authLevel >= 1) {
                                            this.refreshTable();
                                            rust.SendChatMessage(player, prefix, msgs.refresh, "0");
                                        } else {
                                            rust.SendChatMessage(player, prefix, msgs.noPerms, "0");
                                            return false;
                                        }
                                    default:
                                        this.runDefault(player);
                                        break;
                                }
                            },

                            runDefault: function(player) {
                                rust.SendChatMessage(player, prefix, "----------" + msgs.top10 + "-----------", "0");
                                for (var key in LeaderBoard.TopTen) {
                                    rust.SendChatMessage(player, null, key + ": " + LeaderBoard.TopTen[key], "0");
                                }
                            },

                            buildTopTen: function(player, points) {
                                //TODO: Figure out method to build a top ten list to add to data. and keep it refreshed
                                //so new players can move up in rank and etc.
                            },

                            OnEntityDeath: function(entity, hitinfo) {
                                var countPvE = this.Config.Settings.countPvE,
                                    countPvP = this.Config.Settings.countPvP,
                                    countGather = this.Config.Settings.countGather,
                                    var victim = entity,
                                        attacker = hitinfo.Initiator;

                                if (countPVP && victim.ToPlayer() && attacker.ToPlayer() && attacker.displayName !== victim.displayName) {
                                    this.getKillPoints(attacker, victim);
                                    LeaderBoard.PlayerData[victimID].Deaths += 1;
                                    LeaderBoard.PlayerData[attackerID].Kills += 1;
                                } else if (countPvE && attacker.ToPlayer() && !victim.ToPlayer()) {
                                    LeaderBoard.PlayerData[attackerID].Kills += 1;
                                    this.getKillPoints(attacker, victim);
                                } else if (countPvE && victim.ToPlayer() && !attacker.ToPlayer()) {
                                    LeaderBoard.PlayerData[victimID].Deaths += 1;
                                    this.updatePoints(this.Config.Points[0].Death, victim);
                                } else if (victim.displayName === attacker.displayName && entity.lastDamage.toString().toLowerCase() === "suicide") {
                                    LeaderBoard.PlayerData[victimID].Deaths += 1;
                                    LeaderBoard.PlayerData[victimID].Suicides += 1;
                                    this.updatePoints(this.Config.Poitns[0].Suicide, victim);
                                }
                            },

                            OnGather: function(dispenser, entity, item) {

                                if (this.Config.Settings.countGather) {
                                    for (var key in this.Config.Points[0]) {
                                        if (item.info.displayname === this.Config.Points.hasOwnProperty(key)) {
                                            this.updatePoints(this.Config.Points[key], entity);
                                            this.buildTopTen(entity, this.Config.Points[key]);
                                        }
                                    }
                                } else {
                                    return false;
                                }
                            },

                            OnPlayerLoot: function(inventory, entity) {
                                if (entity.name.toString() === "supply_drop") {
                                    var player = inventory.GetComponent("BasePlayer");
                                    this.updatePoints(this.Config.Points[0].AirDrop, player);
                                    this.buildTopTen(player, this.Config.Points[0].AirDrop)
                                }
                            },

                            getKillPoints: function(attacker, victim) {
                                var victimID = rust.UserIDFromPlayer(victim),
                                    attackerID = rust.UserIDFromPlayer(attacker);
                                if (attacker.ToPlayer() && victim.ToPlayer()) {
                                    var points = [this.Config.Points[0].Player, this.Config.Points[0].Death];
                                    var players = [attacker, victim];
                                    this.buildTopTen(this.Config.Points[0].Player, attacker);
                                    this.buildTopTen(this.Config.Points[0].Death, victim);
                                    this.updatePoints(this.Config.Points[0].Death, victim);
                                    this.updatePoints(this.Config.Points[0].Player, attacker);
                                } else {
                                    var animal = victim.LookupPrefrabName().toString().split('/').toLowerCase();
                                    for (var key in this.Config.Points[0]) {
                                        if (animal === key.toLowerCase()) {
                                            this.buildTopTen(this.Config.Points[0][key], attacker);
                                            this.updatePoints(this.Config.Points[0][key], attacker);
                                        }
                                    }
                                }
                            },

                            updatePoints: function(points, player) {
                                var useRanks = this.Config.Settings.useRanksAndTitles;
                                var steamID = rust.UserIDFromPlayer(player);
                                LeaderBoard.PlayerData[steamID].Points += points;
                                this.sendData(steamID, player);
                            }
                        }
