var titles = {
        Title: "Titles",
        Author: "Killparadise",
        Version: V(0, 1, 2),
        HasConfig: true,
        Init: function() {
            if (GroupsAPI) {
                GroupsAPI = true;
            }
            this.loadTitleData();
        },
        OnServerInitialized: function() {
            print(this.Title + " Is now loading, please wait...");
            command.AddChatCommand("show", this.Plugin, "cmdShowPlayer");
            command.AddChatCommand("secret", this.Plugin, "cmdSecret");
            command.AddChatCommand("secretall", this.Plugin, "cmdSecretAll");
            command.AddChatCommand("display", this.Plugin, "cmdDistplay");
            command.AddChatCommand("title", this.Plugin, "cmdTitle");
        },

        LoadDefaultConfig: function() {
            this.Config.authLevel = 2;
            this.Config.Settings = {
                "showPlayer": true,
                "groupsSet": false,
                "displayLvl": true,
                "hideAdmin": false,
                "hideAllAdmins": false
            };
            this.Config.Info = [{
                "authLvl": 0,
                "title": "Player"
            }, {
                "authLvl": 1,
                "title": "Mod"
            }, {
                "authLvl": 2,
                "title": "Admin"
            }, {
                "authLvl": 3,
                "title": "Owner"
            }];
        },
        cmdShowPlayer: function(player, cmd, args) {
            if (authLevel >= this.Config.authLevel) {
                if (!showPlayer) {
                    for (var key in authConfig.PlayerData) {
                        if (authConfig.PlayerData.hasOwnProperty(key) && authConfig.PlayerData[key] === 'Title' && authConfig.PlayerData[key].Title === this.Config.Info[0].title) {
                            showPlayer = true;
                            player.displayName = authConfig.PlayerData[key].RealName + " " + "[" + this.Config.Info[0].title + "]";
                            rust.SendChatMessage(player, "TITLES", "Successfully turned on titles for Players", "0");
                        } else {
                            showPlayer = false;
                            player.displayName = authConfig.PlayerData[key].RealName;
                            rust.SendChatMessage(player, "TITLES", "Successfully turned off titles for Players", "0");
                        }
                    }
                }
            } else {
                rust.SendChatMessage(player, "TITLES", "You do not have permission to use this command!", "0");
            }
        },

        cmdTitle: function(player, cmd, args) {
            var steamID = rust.UserIDFromPlayer(player);
            var tempTitle = authConfig.PlayerData[steamID].Title;
            rust.SendChatMessage(player, "TITLES", "Your title is: " + tempTitle, "0");
        },

        cmdSecret: function(player, cmd, args) {
            hideAdmin = this.Config.Settings.hideAdmin;
            var steamID = rust.UserIDFromPlayer(player);
            if (authLevel >= this.Config.authLevel && !hideAdmin) {
                hideAdmin = true;
                player.displayName = authConfig.PlayerData[steamID].RealName;
            } else if (authLevel >= this.Config.authLevel && hideAdmin) {
                hideAdmin = false;
                player.displayName = authConfig.PlayerData[steamID].RealName + " " + "[" + authConfig.PlayerData[key].Title + "]";
            } else {
                rust.SendChatMessage(player, "TITLES", "You do not have permission to use this command!", "0");
            }
        },

        cmdSecretAll: function(player, cmd, args) {
            var hideAllAdmins = this.Config.Settings.hideAllAdmins;
            if (authLevel >= this.Config.authLevel) {
                for (var akey in authConfig.PlayerData) {
                    if (authConfig.PlayerData.hasOwnProperty(akey) && authConfig.PlayerData[akey] === 'Title' && authConfig.PlayerData[akey].Title === this.Config.Titles.Admin) {
                        if (!hideAllAdmins) {
                            hideAllAdmins = true;
                            player.displayName = authConfig.PlayerData[akey].RealName;
                            rust.SendChatMessage(player, "TITLES", "All Admins Hidden", "0");
                        } else {
                            hideAllAdmins = false;
                            player.displayName = authConfig.PlayerData[akey].RealName + " " + "[" + authConfig.PlayerData[akey].Title + "]";
                            rust.SendChatMessage(player, "TITLES", "All Admins Revealed", "0");
                        }
                    } else {
                        rust.SendChatMessage(player, "TITLES", "No Admins Located on the Server.", "0");
                        return [];
                    }
                }
            } else {
                rust.SendChatMessage(player, "TITLES", "You do not have permission to use this command!", "0");
            }
        },

        cmdDisplay: function(player, cmd, args) {
            var displayLvl = this.Config.Settings.displayLvl;
            if (displayLvl) {
                displayLvl = false;
            } else {
                displayLvl = true;
            }
        },

        SendHelpText: function(player) {
        if (authLevel >= this.Config.authLevel) {
            rust.SendChatMessage(player, "TITLES", "/show - Turn on and off the [Player] Tag for Players", "0");
            rust.SendChatMessage(player, "TITLES", "/secret - Turn on and off the [Admin] Tag for yourself", "0");
            rust.SendChatMessage(player, "TITLES", "/secretall - Turn on and off the [Admin] Tag for all admins", "0");
            rust.SendChatMessage(player, "TITLES", "/display - Turn on and off the title login message", "0");
        }
            rust.SendChatMessage(player, "TITLES", "/title - Displays your current title", "0");
    },


    loadTitleData: function() {
        //Lets get our own data and then check to see if theres a groups data file
        authConfig = data.GetData('Titles');
        authConfig = authConfig || {};
        authConfig.PlayerData = authConfig.PlayerData || {};
        GroupData = datafile.GetData("Groups");
        GroupData = GroupData || {};
    },


    checkPlayerData: function(player, authLevel) {
        //Okay lets check our data file for player data 
        authConfig.PlayerData[steamID] = authConfig.PlayerData[steamID] || {};
        authConfig.PlayerData[steamID].RealName = authConfig.PlayerData[steamID].RealName || player.displayName || "";
        authConfig.PlayerData[steamID].Title = authConfig.PlayerData[steamID].Title || "";
        authConfig.PlayerData[steamID].authLvl = authConfig.PlayerData[steamID].authLvl || authLevel || "";
        showPlayer = this.Config.Settings.showPlayer;
        this.setTitle(player, showPlayer, steamID);
    },


    saveTitleData: function() {
        //Save our data to our titles data file
        data.SaveData('Titles');
    },

    setTitle: function(player, showPlayer, steamID) {
        //Get our title and name for our data
        authName = authConfig.PlayerData[steamID].Title;
        realName = authConfig.PlayerData[steamID].RealName;
        //run the the auth level for the incoming player and set his title correctly
        if (authName !== "") {
            if (groupsExists) {
                GroupData.PlayerData[steamID].RealName = authConfig.PlayerData[steamID].RealName + " " + "[" + authConfig.PlayerData[steamID].Title + "]";
                if (this.Config.Settings.displayLvl) rust.SendChatMessage(player, "Titles", "Your title is: " + authName, "0");
            } else {
                player.displayName = authConfig.PlayerData[steamID].RealName + " " + "[" + authConfig.PlayerData[steamID].Title + "]";
                if (this.Config.Settings.displayLvl) rust.SendChatMessage(player, "Titles", "Your title is: " + authName, "0");
            }
        } else {
            if (groupsExists) {
                for (var i = 0; i < this.Config.Info.length; i++) {
                    if (this.Config.info[i].authLvl === authLevel) {
                        GroupData.PlayerData[steamID].RealName = realName + " " + "[" + this.Config.Info[i].title + "]";
                        authConfig.PlayerData[steamID].Title = this.Config.Info[i].title;
                        if (this.Config.Settings.displayLvl) rust.SendChatMessage(player, "Titles", "Your title is: " + this.Config.info[i].title, "0");
                    }
                }
            } else {
                for (var i = 0; i < this.Config.Info.length; i++) {
                    if (this.Config.info[i].authLvl === authLevel) {
                        player.displayName = realName + " " + "[" + this.Config.Info[i].title + "]";
                        authConfig.PlayerData[steamID].Title = this.Config.Info[i].title;
                        if (this.Config.Settings.displayLvl) rust.SendChatMessage(player, "Titles", "Your title is: " + this.Config.info[i].title, "0");
                    }
                }
            }
        }

        this.saveTitleData();
    },

    checkForGroups: function(player, steamID) {
        //We need to find out if groups exists, if it does, lets tell our title function that.
        if (GroupsAPI) {
            groupsExists = true;
        } else {
            print("Groups Data not found, no need to grab anything.");
            groupsExists = false;
        }
    },

    OnPlayerInit: function(player) {
        steamID = rust.UserIDFromPlayer(player);
        authLevel = player.net.connection.authLevel;
        this.checkPlayerData(player, authLevel);
    }

};
