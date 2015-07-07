function API(title, author, version) {
    this.Title = title;
    this.Author = author;
    this.Version = version;
}

API.prototype = {
    Init: function() {
        global = importNamespace("");
        this.LoadDefaultConfig();
        this.getData();
        this.registerPermissions();

    },

    /*-----------------------------------------------------------------
            grabPlayerData
            -- Can be called to certain player data
            - @steamID - Users Steam ID
            - @key - Object key to search for and value to return
     ------------------------------------------------------------------*/
    grabPlayerData: function(steamID, key) {
        return APIData.PlayerData[steamID][key];
    },

    OnServerInitialized: function() {
        clansOn = plugins.Find('Clans');
        ch = plugins.Find('chathandler');
    },

    /*-----------------------------------------------------------------
            moduleHandler
            -- Locates Modules and Builds new modules as needed
            -- builds the files based on the data/config file of
            -- this API's file system. 
     ------------------------------------------------------------------*/
    moduleHandler: function() {
        var modules = {};
        modules = {
            PrefixHandler: new PrefixHandler(this.Title, this.Author, V(1, 0, 0), [APIData, this.Config]),
            PunishmentSystem: new PunishmentSystem(this.Title, this.Author, V(1, 0, 0), [APIData, this.Config]),
            Ranks: new RanksSystem(this.Title, this.Author, V(1, 0, 0), [APIData, this.Config]),
            Achievements: new Achievements(this.Title, this.Author, V(1, 0, 0), [APIData, this.Config])
        };
        print("Modules");
        print("----------------------------------");
        if (modules.length) {
            if (modules.PrefixHandler) {
                print("[Modules]: Located Prefix Handler Module.");
                print("[PrefixHandler]: Loaded Successfully");
            }
            if (modules.PunishmentSystem) {
                print("[Modules]: Located Punishment Module.");
                print("[Punishment]: Loaded Successfully");
            }
            if (modules.Achievements) {
                print("[Modules]: Located Achievements Module.");
                print("[Achievements]: Loaded Successfully");
            }
            if (modules.Ranks) {
                print("[Modules]: Located Ranks Module.");
                print("[Ranks]: Loaded Successfully");
            }
        } else {
            print("[Modules]: No Modules Located");
        }
        print("----------------------------------");
        this.SaveConfig();
    },

    LoadDefaultConfig: function() {
        this.Config.Info = "Welcome to ParaAPI, this config is the hub of all Module Plugins designed by KillParadise. This setup is the same with the Data file, Think of this as a central 'Hub' for the data";
        this.Config.Settings = {
            AntiAbuseOn: true,
            ChatColor: "#FFFFFF",
            ChatNameColor: "#6699FF",
            StaffChatNameColor: "#009900",
            AllowColor: true
        }
        this.Config.Modules = this.Config.Modules || {};
        this.Config.Permissions = this.Config.Permissions || {
            "staff": "isStaff"
        };

    },

    /*-----------------------------------------------------------------
            OnPlayerInit
            -- Handles player login and initializes data
            - @player - Base Player Object
     ------------------------------------------------------------------*/
    OnPlayerInit: function(player) {
        var steamID = rust.UserIDFromPlayer(player);
        this.buildPlayerData(player, steamID);
    },


    /*-----------------------------------------------------------------
            getData
            -- Handles building initial data system
     ------------------------------------------------------------------*/
    getData: function() {
        APIData = data.GetData("ParaAPI");
        APIData = APIData || {};
        APIData.PlayerData = APIData.PlayerData || {};
    },

    /*-----------------------------------------------------------------
            buildPlayerData
            -- Handles building initial player data
            -- and setting proper values on login
            - @player - Base Player Object
            - @steamID - User steam ID
     ------------------------------------------------------------------*/
    buildPlayerData: function(player, steamID) {
        APIData.PlayerData[steamID] = APIData.PlayerData[steamID] || {};
        APIData.PlayerData[steamID].Name = APIData.PlayerData[steamID].Name || player.displayName;
        APIData.PlayerData[steamID].IsStaff = APIData.PlayerData[steamID].IsStaff || this.hasPermission(player, "isStaff");
    },

    /*-----------------------------------------------------------------
            saveData
            -- Handles building initial player data
            -- and setting proper values on login
     ------------------------------------------------------------------*/
    saveData: function() {
        data.SaveData('ParaAPI');
    },

    /*-----------------------------------------------------------------
            clearData
            -- Wipes The entire data file and then rebuilds it
            -- WARNING: CANNOT be undone
            - @data - object - data object
     ------------------------------------------------------------------*/
    clearData: function(data) {
        delete data;
    },

    /*-----------------------------------------------------------------
            refreshData
            -- Handles refreshing player data
            -- sends them through ranking process again
            - @steamID - String - SteamID of the triggering player
            - @data - 
     ------------------------------------------------------------------*/
    refreshData: function(steamID, data, value) {
        if (data.PlayerData[steamID] === undefined) {
            print("No Data found, Attempting to build Data");
        }
        data[steamID][value] = "";
        //this.checkPlayerData(player, steamID);
        //Will need to write a function to handle reloading a players data
    },

    /*-----------------------------------------------------------------
            registerPermissions
            -- Handles registering and building permissions
     ------------------------------------------------------------------*/
    registerPermissions: function() {
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
        if (player.net.connection.authLevel === 2) {
            return true;
        }

        if (permission.UserHasPermission(steamID, perm)) {
            return true;
        }
        rust.SendChatMessage(player, prefix, msgs.noPerms, "0");
        return false;
    },

    /*-----------------------------------------------------------------
            getDataSet
            -- Builds an array of karma values to compare
            -- against the players current karma
            - @data - object - object to build the data set from
            - @value - String/Number - value to build the data set off of
     ------------------------------------------------------------------*/
    getDataSet: function(data, value) {
        var temp = [];
        for (var i = 0, len = data.length; i < len; i++) {
            temp.push(data[i][value]);
        }
        return temp;
    },

    /*-----------------------------------------------------------------
            getValue
            -- Grabs the victims title and locates the karmaModifier
            - @array - Array - array to find value from
            - @param - String - parameter to search for in an object
            - @data - String/Number - Data to compare value too
     ------------------------------------------------------------------*/
    getValue: function(array, param, data) {
        var i = 0,
            value = 0,
            j = array.length;
        for (i; i < j; i++) {
            if (array[i][param] === data) {
                value = array[i][param];
                break;
            } else {
                value = 1;
            }
        }
        return value;
    },

    /*-----------------------------------------------------------------
            getColor
            -- Handles finding, and grabbing the
            -- current color of the player
            - @steamID - Current User id to grab the color for.
     ------------------------------------------------------------------*/
    getColor: function(data) {
        var color = "",
            colorArr = [];
        if (data.array) {
            for (var i = 0, len = data.array.length; i < len; i++) {
                if (APIData.PlayerData[data.steamID][data.value] === data.array[i][data.value]) {
                    color = data.array[i][data.value];
                }
            }
        } else {
            for (var key in data.obj) {
                if (key === data.compare) {
                    color = data[key].color;
                }
            }
        }
        return color;
    },

    /*-----------------------------------------------------------------
            getClosest
            -- Locates closes rank to current players karma
            - @closestTo - the current karma of the player
            - @data - object - an object to search
            - @value - Number/String - value to search through the object for
     ------------------------------------------------------------------*/
    getClosest: function(closestTo, data, value) {
        var arr = this.getDataSet(data, value);
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
            antiAbuse
            -- Handles clan mate killings
            -- karma system
            - @victimID - Victims Steam ID
            - @attackerID - Attacker Steam ID
     ------------------------------------------------------------------*/
    antiAbuse: function(user, user2) {
        if (clansOn) {
            Clan1 = clansOn.GetClanOf(user);
            Clan2 = clansOn.GetClanOf(user2);
            if (Clan1 === Clan2) {
                return true;
            } else {
                return false;
            }
        }
        return false;
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
                print("found match " + displayName);
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
            deathHandler
            -- Triggers a new death instance and builds a new object with given data
            - @data - Object - A data object containing chat data
     ------------------------------------------------------------------*/
    deathHandler: function(data) {
        if (data.killer === null || data.victim === null || !data.killer.ToPlayer() || !data.victim.ToPlayer()) return false;
        if (this.Config.Settings.AntiAbuseOn && this.antiAbuse(data.killer, data.victim)) return false;
        var cbObj = {
            killer: data.killer,
            victim: data.victim,
            killerID: rust.UserIDFromPlayer(data.killer),
            victimID: rust.UserIDFromPlayer(data.victim)
        }
        return cbObj;
    }

};

var ParaAPI = new API("ParaAPI", "KillParadise", V(1, 0, 0));

/**
 * Handles Chat calls from outside modules to build and return messages
 * @method   chatHandler
 * @memberOf ParaAPI
 * @param    {Object}          data   An Object of values sent to the instance upon creation
 * @return   {String}                 Returns a concatinated and formatted String
 */
function chatHandler(data) {
    if (ch) return null;
    var newMsg = "";
    newMsg = this.init(data);
    return newMsg;
};

chatHandler.prototype = {

    /*-----------------------------------------------------------------
            init
            -- chatHandlers Initializer grabs color from the data
            - @data - Object - A data object containing chat data
     ------------------------------------------------------------------*/
    init: function(data) {
        if (data.msg.substring(1, 1) === "/" || data.msg === "") return null;
        data.color = API.getColor({
            obj: data.config,
            compare: APIData.PlayerData[data.steamID][data.useTitle]
        });
        var formattedMsg = this.buildMsg(data);
        return formattedMsg;
    },

    /*-----------------------------------------------------------------
            buildMsg
            -- chatHandlers actual message builder, grabs module data
            -- if not present to build a full string
            - @data - Object - A data object containing chat data
     ------------------------------------------------------------------*/
    buildMsg: function(data) {
        var formattedMsg = ""
        var msg = data.msg;
        var useColor = ""
        if (this.Config.Settings.AllowColor && permission.UserHasPermission(data.steamID, "isStaff")) {
            useColor = "<color=" + this.Config.Settings.StaffChatNameColor + ">";
        } else {
            useColor = "<color=" + this.Config.Settings.ChatNameColor + ">";
        }
        if (modules.Ranks) var ranks = this.buildRanksPortion(data, data.steamID);
        if (modules.PrefixHandler) var prefixes = this.buildPrefixPortion(data, data.steamID);
        formattedMsg = prefixes + useColor + player.displayName + "</color> " + ranks + msg + "</color>";
        return formattedMsg;
    },

    /*-----------------------------------------------------------------
            buildRanksPortion
            -- Builds the Ranks Portion of our string
            - @data - Object - A data object containing chat data
            - @steamID - String - Contains a user Steam ID
     ------------------------------------------------------------------*/
    buildRanksPortion: function(data, steamID) {
        var ranksSetup = "",
            ranksColor = "",
            chatColor = "";
        if (this.Config.Prefixes === data.config) {
            if (this.Config.Settings.AllowColor) {
                data.titleColor = "<color=" + data.color + ">[";
                data.chatColor = this.Config.Settings.ChatColor;
            }
            ranksSetup = data.titleColor + data.useTitle + data.chatColor;
        } else if (this.Config.Ranks) {
            for (var key in this.Config.Ranks.Main) {
                if (this.Config.Prefixes.Main[key] === APIData.PlayerData[steamID].Title) {
                    if (this.Config.Settings.AllowColor) {
                        ranksColor = this.Config.Ranks.Main[key].color,
                            chatColor = this.Config.Settings.ChatColor;
                    }
                    ranksSetup = ranksColor + this.Config.Ranks.Main[key].title + chatColor;
                }
            }
        } else {
            ranksSetup = "";
        }
        return ranksSetup;
    },

    /*-----------------------------------------------------------------
            buildPrefixPortion
            -- Builds the Prefix Portion of our string
            - @data - Object - A data object containing chat data
            - @steamID - String - Contains a user Steam ID
     ------------------------------------------------------------------*/
    buildPrefixPortion: function(data, steamID) {
        var prefixSetup = "",
            prefixColor = "";
        if (this.Config.Prefixes === data.config) {
            if (data.colorOn) {
                data.prefixColor = "<color=" + data.color + ">[";
            }
            prefixSetup = data.prefixColor + data.usePrefix;
        } else if (this.Config.Prefixes) {
            for (var key in this.Config.Prefixes.Main) {
                if (this.Config.Prefixes.Main[key] === APIData.PlayerData[steamID].Prefix) {
                    if (this.Config.Settings.AllowColor) {
                        var prefixColor = this.Config.Ranks.Main[key].color;
                    }
                    prefixSetup = prefixColor + this.Config.Prefixes.Main[key].Prefix;
                }
            }
        } else {
            prefixSetup = "";
        }
        return prefixSetup;
    }
};
