var titles = {
    Title: "Titles",
    Author: "Killparadise",
    Version: V(0, 1, 2),
    HasConfig: true,
    Init: function() {
        this.loadTitleData();
    },
    OnServerInitialized: function() {
        print(this.Title + " Is now loading, please wait...");
        //command.AddChatCommand("show", this.Plugin, "cmdShowPlayer");
        //command.AddChatCommand("secret", this.Plugin, "cmdSecret");
        //command.AddChatCommand("secretall", this.Plugin, "cmdSecretAll");
        //command.AddChatCommand("display", this.Plugin, "cmdDistplay");
        //command.AddChatCommand("title", this.Plugin, "cmdTitle");
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
        this.Config.Titles = {
            "Admin": "Admin",
            "Moderator": "Mod",
            "Player": "Player"
        };
    },
    cmdShowPlayer: function(player, cmd, args) {
        /*if (authLevel >= this.Config.authLevel) {
            if (!showPlayer) {
                showPlayer = true;
                for (var i = 0; i < authConfig.PlayerData.length; i++) {
                    if (authConfig.PlayerData[i].Title === this.Config.Titles.Player) {
                        player.displayName = authConfig.PlayerData[i].RealName + " " + "[" + authConfig.PlayerData[i].Title + "]";
                        rust.SendChatMessage(player, "TITLES", "Successfully turned on titles for Players", "0");
                        print("Returned Users with 'Player' " + authConfig.PlayerData[i]);
                    } else {
                        print("Returned No Users with 'Player' " + authConfig.PlayerData[i]);
                        return false;
                    }
                }
            } else {
                showPlayer = false;
                for (var ii = 0; ii < authConfig.PlayerData.length; ii++) {
                    if (authConfig.PlayerData[ii].Title === this.Config.Titles.Player) {
                        player.displayName = authConfig.PlayerData[ii].RealName;
                        rust.SendChatMessage(player, "TITLES", "Successfully turned off titles for Player", "0");
                        print("Returned Users with 'Player' " + authConfig.PlayerData[ii].Title);
                    } else {
                        print("Returned No Users with 'Player' " + authConfig.PlayerData[ii].Title);
                        return false;
                    }
                }
            }
        } else {
            rust.SendChatMessage(player, "TITLES", "You do not have permission to use this command!", "0");
        }*/
        if (authLevel >= this.Config.authLevel) {
            if (!showPlayer) {
                for (var key in authConfig.PlayerData) {
                    if (authConfig.PlayerData.hasOwnProperty(key) && authConfig.PlayerData[key] === 'Title' && authConfig.PlayerData[key].Title === this.Config.Titles.Player) {
                        showPlayer = true;
                        player.displayName = authConfig.PlayerData[key].RealName + " " + "[" + authConfig.PlayerData[key].Title + "]";
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
        var pID = rust.UserIDFromPlayer(player);
        var tempTitle = authConfig.PlayerData[pID].Title;
        rust.SendChatMessage(player, "TITLES", "Your title is: " + tempTitle, "0");
        tempTitle;
    },

    cmdSecret: function(player, cmd, args) {
        hideAdmin = this.Config.Settings.hideAdmin;
        var pID = rust.UserIDFromPlayer(player);
        if (authLevel >= this.Config.authLevel && !hideAdmin) {
            hideAdmin = true;
            player.displayName = authConfig.PlayerData[pID].RealName;
        } else if (authLevel >= this.Config.authLevel && hideAdmin) {
            hideAdmin = false;
            player.displayName = authConfig.PlayerData[pID].RealName + " " + "[" + authConfig.PlayerData[key].Title + "]";
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
        }
    },


    loadTitleData: function() {
        authConfig = data.GetData('Titles');
        authConfig = authConfig || {};
        authConfig.PlayerData = authConfig.PlayerData || {};
    },


    checkPlayerData: function(player) {
        authConfig.PlayerData[pID] = authConfig.PlayerData[pID] || {};
        authConfig.PlayerData[pID].RealName = authConfig.PlayerData[pID].RealName || player.displayName || "";
        authConfig.PlayerData[pID].Title = authConfig.PlayerData[pID].Title || "";
        authConfig.PlayerData[pID].authLvl = authConfig.PlayerData[pID].authLvl || authLevel || "";
        showPlayer = this.Config.Settings.showPlayer;
        //groupsSet = this.checkForGroups(player, pID) || false;
        this.setTitle(player, showPlayer, pID);
    },


    saveTitleData: function() {
        data.SaveData('Titles');
    },

    setTitle: function(player, showPlayer, pID) {
        //Get our title and name for our data
        authName = authConfig.PlayerData[pID].Title;
        realName = authConfig.PlayerData[pID].RealName;

        switch (authLevel) {
            case 0:
            if (authName === "") {
                authConfig.PlayerData[pID].Title = this.Config.Titles.Player;
            } else if (showPlayer) {
                    player.displayName = authConfig.PlayerData[pID].RealName + " " + "[" + authConfig.PlayerData[pID].Title + "]";
            } else {
                    player.displayName = authConfig.PlayerData[pID].RealName;
                    return false;
            }
                break;
            case 1:
            if (authName === "") {
                authConfig.PlayerData[pID].Title = this.Config.Titles.Moderator;
            } else {
                player.displayName = authConfig.PlayerData[pID].RealName + " " + "[" + authConfig.PlayerData[pID].Title + "]";
            }
                if (this.Config.Settings.displayLvl) rust.SendChatMessage(player, "Titles", "Your title is: " + this.Config.Titles.Moderator, "0");
                break;
            case 2:
            if (authName === "") {
                authConfig.PlayerData[pID].Title = this.Config.Titles.Admin;
            } else {
                player.displayName = authConfig.PlayerData[pID].RealName + " " + "[" + authConfig.PlayerData[pID].Title + "]";
            }
                if (this.Config.Settings.displayLvl) rust.SendChatMessage(player, "Titles", "Your title is: " + this.Config.Titles.Admin, "0");
                break;
            default:
                authConfig.PlayerData[pID].Title = "Not Found";
                player.displayName = authConfig.PlayerData[pID].RealName;
                break;
        }
        this.saveTitleData();
    },

    checkForGroups: function(player, pID) {
        var GroupsDataExists = data.GetData("Groups") ? true : false;

        if (GroupsDataExists) {
            GroupsData = data.GetData("Groups");
            pData = GroupsData.PlayerData[pID];
            gData = GroupsData.PlayerData[pID].Group;
            authConfig.PlayerData[pID].RealName = pData.RealName;
            groupsDisplayName = player.displayName;
            return true;
        } else {
            print("Groups Data not found, no need to grab anything.");
            return false;
        }
    },

    OnPlayerInit: function(player) {
        pID = rust.UserIDFromPlayer(player);
        authLevel = player.net.connection.authLevel;
        this.checkPlayerData(player);
    }

};
