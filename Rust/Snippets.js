var Snippets = {

    /**
     * Used to build proper strings with replaced values searches for words in {} tags
     * @method   buildString
     * @memberOf Snippets
     * @param    {String/Array}          string [String or Array of Strings which contain replaceable values]
     * @param    {Array}          values [Array of values to replace in the string(s) MUST be in order]
     * @return   {String}                 [Returns the newly Built String]
     * @example this.buildString("{player} went skipping to the {location} with {player2}", [playerName, locationName, playerName2]);
     */
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

    /**
     * Locates Base Player object using the users name
     * @method   findPlayerByName
     * @memberOf Snippets
     * @param    {String}          playerName [Name for the desired player]
     * @return   {Array}                     [Array containing the found player Object AND steamID]
     * @example this.findPlayerByName("KillParadise");
     */
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

    /**
     * Locate a player using their steamID
     * @method   findPlayerByID
     * @memberOf Snippets
     * @param    {String}          playerid [String of the desired players steam id]
     * @return   {Object}                   [Returns the Rust Base Player Object]
     */
    findPlayerByID: function(playerid) {
        var global = importNamespace("");
        var targetPlayer = global.BasePlayer.Find(playerid);
        if (targetPlayer) {
            return targetPlayer;
        } else {
            return false;
        }
    },

    /**
     * Resets data accordingly when called usually called from a command handling switch
     * @method   resetData
     * @memberOf Snippets
     * @param    {Object}          player [The Rust Base Player Object]
     * @param    {String}          cmd    [String that contains the used command]
     * @param    {Array}          args   [Array of arguments sent with the command]
     * @example this.resetData(player, cmd, args)
     */
    resetData: function(player, cmd, args) {
        delete DataObject;
        data.SaveData("DataFile"); // NOTE: "DataFile" is a filler name, you can name this whatever you want your data file to be.
        data.DetData("DataFile");
        player.CharMessage("Successfully Reset Data File");
    },

    /**
     * Grabs the Plugin JSON Data file from the data folder then builds default data or loads existing data
     * @method   getData
     * @memberOf Snippets
     * @example this.getData();
     */
    getData: function() {
        DataFile = data.GetData('MyPluginsDataFileName');
        DataFile = MyPluginData || {}; //looks for MyPluginData object or builds a new one if not found
        MyPluginData.PlayerData = MyPluginData.PlayerData || {}; //Looks for PlayerData inside MyPluginData or builds a new object if not found.
    },

    /**
     * Saves the JSON data file to the oxide data folder when called
     * @method   saveData
     * @memberOf Snippets
     * @example this.saveData();
     *
     */
    saveData: function() {
        data.SaveData('MyPluginsDataFileName');
    },

    /**
     * Locates closest value to sent number in a array of values
     * @method   getClosest
     * @memberOf Snippets
     * @param    {Integer}          closestTo [The Number to search the array for to find closest]
     * @param    {Array}          arr       [Array containing values to search (optional)]
     * @return   {Integer}                    [Found Closest value]
     * @example this.getClosest(5, [1, 4, 7, 9]);
     */
    getClosest: function(closestTo, arr) {
        arr = [] //if arr is not sent build an array here
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

    /**
     * Builds an array of values to compare
     * @method   getBuildArray
     * @memberOf Snippets
     * @return   {Array}          [A Built Array from Config]
     */
    getBuildArray: function() {
        var temp = [];

        for (var i = 0; i < this.Config.main.length; i++) {
            if (this.Config.Settings.karma) {
                temp.push(this.Config.main[i].karma);
            }
        }
        return temp;
    },

    /**
     * Handles registering and building permissions
     * @method   registerPermissions
     * @memberOf Snippets
     */
    registerPermissions: function() {
        var i = 0,
            j = permissionObject.length;
        //group build permissions
        for (i; i < j; i++) {
            if (!permission.GroupExists(permissionObject[i].permission)) {
                permission.CreateGroup(this.Config.permissionObject[i].permission, this.Config.permissionObject[i].permission, i);
            }
        }
        //single permissions
        for (var perm in this.Config.Permissions) {
            if (!permission.PermissionExists(Permissions[perm])) {
                permission.RegisterPermission(Permissions[perm], this.Plugin);
            }
        }
    },

    /**
     * Handles checking permissions of a user
     * @method   hasPermission
     * @memberOf Snippets
     * @param    {Object}          player [The Rust Base Player Object]
     * @param    {String}          perm   [String of the desired perm to check]
     * @return   {Boolean}                [Boolean if the user has permission or not]
     * @example this.hasPermission("KillParadise", "canBan");
     */
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

    /**
     * Handles KDR changes as a player progresses, takes basic kills and deaths of player to build
     * @method   updateKDR
     * @memberOf RanksAndTitles
     * @param    {Array}          ids [Array of ids to be sent to the function]
     * @example this.updateKDR([id1, id2]);
     */
    updateKDR: function(ids) {
        var len = ids.length,
            k2d;
        if (len === 0) return false;
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

    /**
     * Handles adding user to a permissions group
     * @method   setPermGroup
     * @memberOf Snippets
     * @param    {Object}          player  [The Rust Base Player Object]
     * @param    {String}          steamID [Steam ID of the chosen player (not the same as the base player)]
     * @param    {String}          group   [Permission Group Name to add player too]
     * @example this.setPermGroup(player, "id", "Admin");
     */
    setPermGroup: function(player, steamID, group) {
        if (permission.GroupExists(group)) {
            permission.AddUserGroup(steamID, group);
        } else {
            player.ChatMessage("This group does not exist.");
        }
        return false;
    },

    /**
     * Handles removing user from a permissions group
     * @method   remPermGroup
     * @memberOf Snippets
     * @param    {Object}          player  [The Rust Base Player Object]
     * @param    {String}          steamID [Steam ID of the chosen player (not the same as the base player)]
     * @param    {String}          group   [Permission Group Name to add player too]
     * @example this.remPermGroup(player, "id", "Admin");
     */
    remPermGroup: function(player, steamID, group) {
        if (permission.GroupExists(group)) {
            permission.RemoveUserGroup(steamID, group);
        } else {
            player.ChatMessage("This group does not exist.");
        }
        return false;
    },

    /**
     * Checks the FriendsAPI plugin and Clans Plugin for friends Data
     * @method   checkForFriends
     * @memberOf BountyBoard
     * @param    {String}          steamID   [First players steamID]
     * @param    {String}          steamID2  [Second Players steamID]
     * @return   {Boolean}                     [Returns Boolean if the players are friends or clan mates]
     */
    checkForFriends: function(steamID, steamID2) {
        if (this.Config.Settings.antiFriend) {
            if (friendsAPI && friendsAPI.Call("HasFriend", steamID, steamID2)) {
                return true;
            } else if (clansOn && !clansOn.Call("HasFriend", steamID, steamID2)) {
                attackerClan = clansOn.Call("FindClanByUser", steamID);
                victimClan = clansOn.Call("FindClanByUser", steamID2);
                if (attackerClan === victimClan) {
                    return true;
                } else {
                    return false;
                }
            } else {
                return true;
            }
        }
        return false;
    },

    /**
     * Gives an item automatically attached to a victim when called
     * @method   giveItem
     * @memberOf BountyBoard
     * @param    {Object}          player   [Rust Base Player Object]
     * @param    {String}          victimID [Steam Id of the killed user]
     * @param    {String}          itemName [The item name of the rewarded item]
     * @param    {Integer}          amount   [Amount of said item to be rewarded]
     * @example this.giveItem(player, "id", "stones", 1000);
     */
    giveItem: function(player, victimID, itemName, amount) {
        itemName = itemName.toLowerCase();
        if (itemName === this.Config.Settings.currency) {
            var econData = econAPI.Call("GetUserDataFromPlayer", player);
            econData.Call("Deposit", amount);
        } else if (itemName !== this.Config.Settings.currency) {
            var definition = global.ItemManager.FindItemDefinition(itemName);
            if (definition === null) return print("Unable to Find an Item.");
            print("Giving Item: " + definition.itemid);
            player.inventory.GiveItem(global.ItemManager.CreateByItemID(Number(definition.itemid), Number(amount), false), player.inventory.containerMain);
        }
        this.saveData();
    },

    /**
     * Checks a player if he has an item of the same type already in plce on him
     * @method   checkForDupes
     * @memberOf BountyBoard
     * @param    {String}          targetID [Steam ID of the targeted player]
     * @param    {String}          itemName [Set Item Name]
     * @param    {Integer}          amt      [Number designated to be the amount of the item]
     * @return   {Boolean}                   [Returns true or false after removing duplicate items]
     * @example this.checkForDupes("ID", "wood", 500);
     */
    checkForDupes: function(targetID, itemName, amt) {
        var boardData = BountyData.Board[targetID];
        var playerData = BountyData.PlayerData[targetID];
        var i = 0;
        if (boardData === undefined) return false;

        for (i; i < boardData.Amount.length; i++) {
            var itemTypeName = boardData.Amount[i].split(" ").pop();
            if (itemName === itemTypeName) {
                var storedAmt = boardData.Amount[i].split(" ").shift();
                var newAmt = Number(storedAmt) + Number(amt);
                boardData.Amount[i] = newAmt + " " + itemName;
                boardData.ItemType[i] = itemName;
                playerData.Bounty[i] = newAmt + " " + itemName;
                playerData.BountyType[i] = itemName;
                return true;
            }
        }
        return false;
    },

    //--------------------------------------------------
    // There are three types of ways to update a Config
    // 1. The Standard Way this.LoadDefaultConfig(); Call
    // 2. The Only check if theres a version change call
    // 3. The Smart Updater Config Way
    //--------------------------------------------------

    /**
     * This is Method 2, check for a version and then update if its not up to date.
     * Make sure you change the version number in your function!
     * @method   updateConfig
     * @memberOf Snippets
     * @return   {Boolean}          [Default Boolean return to end the function]
     */
    updateConfig: function() {
        if (this.Config.Version !== "1.0") {
            print("[MyPlugin] Updating Config, to latest version.");
            this.LoadDefaultConfig();
            this.SaveConfig();
        }
        return false;
    },

    /**
     * This is Method 3, it takes a bit more work but it's accurate, and will not erase
     * a users existing settings or translations. (Makes server owners lives easier) plus
     * You handle the update and what goes inside the config and how.
     * @method   smartUpdateConfig
     * @memberOf Snippets
     */
    smartUpdateConfig: function() {
        var counter = 0;
        var step, steps = [];
        if (this.Config.Version !== "1.0.0") {
            print("Updating Config to v1.0.0");
            this.Config.Version = "1.0.0";
            print("Updating Settings...");
            this.Config.newSetting = "New String Setting!";
            counter++;
            print("Adding New Setting");
            this.Config.Test.newTest = "Adding New String to a existing object";
            counter++;
            print("Adding New String to Test...");
            print("---------------------------------------")
            print("Config Successfully Updated to v1.0.0");

            print("Number of changes: " + counter);
        } else {
            print("Config already at latest version: v" + this.Config.Version);
            return false;
        }
        this.SaveConfig();
    },
}
