var RanksandTitles = {
    Title: "Ranks and Titles",
    Author: "Killparadise",
    Version: V(0, 1, 0),
    HasConfig: true,
    Init: function() {
        GroupsAPI = plugins.Find('RotAG-Groups');
        if (GroupsAPI) {
            GroupsAPI = true;
        } else {
            GroupsAPI = false;
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
            "displayLvl": true,
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
        }];
    },

    /*-----------------------------------------------------------------
                     Commands for Titles
    ------------------------------------------------------------------*/
    cmdShowPlayer: function(player, cmd, args) {
        if (authLevel >= this.Config.authLevel) {
            if (!showPlayer) {
                for (var key in TitlesData.PlayerData) {
                    if (TitlesData.PlayerData.hasOwnProperty(key) && TitlesData.PlayerData[key] === 'Title' && TitlesData.PlayerData[key].Title === this.Config.Info[0].title) {
                        showPlayer = true;
                        player.displayName = TitlesData.PlayerData[key].RealName + " " + "[" + this.Config.Info[0].title + "]";
                        rust.SendChatMessage(player, "TITLES", "Successfully turned on titles for Players", "0");
                    } else {
                        showPlayer = false;
                        player.displayName = TitlesData.PlayerData[key].RealName;
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
        var tempTitle = TitlesData.PlayerData[steamID].Title;
        rust.SendChatMessage(player, "TITLES", "Your title is: " + tempTitle, "0");
    },

    cmdSecret: function(player, cmd, args) {
        var steamID = rust.UserIDFromPlayer(player);
        var hideAdmin = TitlesData.PlayerData[steamID].hidden;
        if (authLevel >= this.Config.authLevel && !hideAdmin) {
            hideAdmin = true;
            player.displayName = TitlesData.PlayerData[steamID].RealName;
            this.saveTitleData();
        } else if (authLevel >= this.Config.authLevel && hideAdmin) {
            hideAdmin = false;
            player.displayName = TitlesData.PlayerData[steamID].RealName + " " + "[" + TitlesData.PlayerData[key].Title + "]";
            this.saveTitleData();
        } else {
            rust.SendChatMessage(player, "TITLES", "You do not have permission to use this command!", "0");
        }
    },

    cmdSecretAll: function(player, cmd, args) {
        var hideAllAdmins = this.Config.Settings.hideAllAdmins;
        if (authLevel >= this.Config.authLevel) {
            for (var akey in TitlesData.PlayerData) {
                if (TitlesData.PlayerData.hasOwnProperty(akey) && TitlesData.PlayerData[akey] === 'Title' && TitlesData.PlayerData[akey].Title === this.Config.Titles.Admin) {
                    if (!hideAllAdmins) {
                        hideAllAdmins = true;
                        player.displayName = TitlesData.PlayerData[akey].RealName;
                        rust.SendChatMessage(player, "TITLES", "All Admins Hidden", "0");
                    } else {
                        hideAllAdmins = false;
                        player.displayName = TitlesData.PlayerData[akey].RealName + " " + "[" + TitlesData.PlayerData[akey].Title + "]";
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

    /*-----------------------------------------------------------------
                    Setup our help text
    ------------------------------------------------------------------*/
    SendHelpText: function(player) {
        if (authLevel >= this.Config.authLevel) {
            rust.SendChatMessage(player, "TITLES", "/show - Turn on and off the [Player] Tag for Players", "0");
            rust.SendChatMessage(player, "TITLES", "/secret - Turn on and off the [Admin] Tag for yourself", "0");
            rust.SendChatMessage(player, "TITLES", "/secretall - Turn on and off the [Admin] Tag for all admins", "0");
            rust.SendChatMessage(player, "TITLES", "/display - Turn on and off the title login message", "0");
        }
        rust.SendChatMessage(player, "TITLES", "/title - Displays your current title", "0");
    },

    /*-----------------------------------------------------------------
                    Get all of our Data
    ------------------------------------------------------------------*/
    loadTitleData: function() {
        //Lets get our own data and then check to see if theres a groups data file
        TitlesData = data.GetData('Titles');
        TitlesData = TitlesData || {};
        TitlesData.PlayerData = TitlesData.PlayerData || {};
        GroupData = data.GetData("Groups");
        GroupData = GroupData || {};
    },


    checkPlayerData: function(player) {
        //Okay lets check our data file for player data 
        authLevel = player.net.connection.authLevel;
        TitlesData.PlayerData[steamID] = TitlesData.PlayerData[steamID] || {};
        TitlesData.PlayerData[steamID].RealName = TitlesData.PlayerData[steamID].RealName || GroupData.PlayerData[steamID].RealName || player.displayName || "";
        TitlesData.PlayerData[steamID].Title = TitlesData.PlayerData[steamID].Title || "";
        TitlesData.PlayerData[steamID].authLvl = TitlesData.PlayerData[steamID].authLvl || authLevel || "";
        TitlesData.PlayerData[steamID].isAdmin = TitlesData.playerData[steamID].isAdmin || (authLevel >= 2) || false;
        TitlesData.PlayerData[steamID].hidden = TitlesData.playerData[steamID].hidden || false;
        showPlayer = this.Config.Settings.showPlayer;
        this.setTitle(player, showPlayer, steamID);
    },


    saveTitleData: function() {
        //Save our data to our titles data file
        data.SaveData('Titles');
    },

    /*-----------------------------------------------------------------
                    Set Our title for the player
    ------------------------------------------------------------------*/
    setTitle: function(player, showPlayer, steamID) {
        //Get our title and name for our data
        var authName = TitlesData.PlayerData[steamID].Title;
        var realName = TitlesData.PlayerData[steamID].RealName;
        //run the the auth level for the incoming player and set his/her title correctly
        if (authName !== "") {
            if (GroupsAPI) {
                if (checkIfShow(steamID, TitlesData.PlayerData[steamID].authLvl)) {
                    GroupData.PlayerData[steamID].RealName = TitlesData.PlayerData[steamID].RealName + " " + "[" + authName + "]";
                }
                if (this.Config.Settings.displayLvl) rust.SendChatMessage(player, "Titles", "Your title is: " + authName, "0");
            } else {
                if (checkIfShow(steamID, TitlesData.PlayerData[steamID].authLvl)) {
                    player.displayName = TitlesData.PlayerData[steamID].RealName + " " + "[" + authName + "]";
                }
                if (this.Config.Settings.displayLvl) rust.SendChatMessage(player, "Titles", "Your title is: " + authName, "0");
            }
        } else if (authName === "" && TitlesData.PlayerData[steamID].authLvl !== "") {
            if (GroupsAPI) {
                for (var i = 0; i < this.Config.Info.length; i++) {
                    if (this.Config.info[i].authLvl === TitlesData.PlayerData[steamID].authLvl) {
                        if (checkIfShow(steamID, TitlesData.PlayerData[steamID].authLvl)) {
                            GroupData.PlayerData[steamID].RealName = realName + " " + "[" + this.Config.Info[i].title + "]";
                        }
                        TitlesData.PlayerData[steamID].Title = this.Config.Info[i].title;
                        if (this.Config.Settings.displayLvl) rust.SendChatMessage(player, "Titles", "Your title is: " + this.Config.info[i].title, "0");
                    }
                }
            } else {
                for (var i = 0; i < this.Config.Info.length; i++) {
                    if (this.Config.info[i].authLvl === TitlesData.PlayerData[steamID].authLvl) {
                        if (checkIfShow(steamID, TitlesData.PlayerData[steamID].authLvl)) {
                            player.displayName = realName + " " + "[" + this.Config.Info[i].title + "]";
                        }
                        TitlesData.PlayerData[steamID].Title = this.Config.Info[i].title;
                        if (this.Config.Settings.displayLvl) rust.SendChatMessage(player, "Titles", "Your title is: " + this.Config.info[i].title, "0");
                    }
                }
            }
        } else {
            print("Something went wrong when trying to set Titles: " + authName + " " + authLevel);
        }

        this.saveTitleData();
    },
    /*-----------------------------------------------------------------
                     Check if we should Show the title
     ------------------------------------------------------------------*/
    checkIfShow: function(steamID, authLvl) {
        //load in our settings from Config
        var settings = this.Config.Settings;
        //Check if our current user is an admin
        var isAdmin = TitlesData.playerData[steamID].isAdmin;
        //lets check out settings, and our player data and see if we should show the title
        if (isAdmin && !settings.hideAllAdmins && !TitlesData.playerData[steamID].hidden) {
            return true;
        } else if (showPlayer || authLvl === 1) {
            return true;
        } else if (isAdmin && TitlesData.playerData[steamID].hidden) {
            return false;
        } else {
            return false;
        }
    },

    /*-----------------------------------------------------------------
                    When the Player finishes loading in
    ------------------------------------------------------------------*/
    OnPlayerInit: function(player) {
        steamID = rust.UserIDFromPlayer(player);
        this.checkPlayerData(player);
    }

};
