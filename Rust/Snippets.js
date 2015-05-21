
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
     * @memberOf Snippets
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
    }
}
