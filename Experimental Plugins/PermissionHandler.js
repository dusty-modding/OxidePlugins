/*
Basic setup in config will look like:
PermHandle: {
    options: {},
    groupPerms: {groupName: {perms}}
    perms: {},
    groups: {},
}
possible options: 
    autoAssign - boolean
    default - default permission group
 */

var PermissionHandler = {
        Title: "Permissions Handler",
        Author: "Killparadise",
        Version: V(1, 0, 0),
        Init: function() {
            global = importNamespace("");
            pluginList = plugins.GetAll();
            command.AddChatCommand("ph", this.Plugin, "cmdSwitch");
            command.AddConsoleCommand("ph.start", this.Plugin, "ccmdStart");
        },

        OnServerInitialized: function() {
            this.msgs = this.Config.Messages;
            this.prefix = this.Config.Prefix;
            this.getPluginData();
        },

        LoadDefaultConfig: function() {
            this.Config = {
                "Version": "1.0",
                "Permissions": {
                    "PermHandle": {
                        "permissions": {
                            "canSetStaff",
                            "canRemStaff"
                        },
                        "groups": {
                            "default": {
                                "permission": "default"
                            },
                            "donor": {
                                "permission": "donor"
                            },
                            "mod": {
                                "permission": "moderator"
                            },
                            "admin": {
                                "permission": "admin"
                            },
                            "owner": {
                                "permission": "owner"
                            }
                        }
                    },
                },
                "Prefix": "PermissionHandler"
                "Messages": {
                    "shortArgs": "Not enough values passed",
                    "noGroup": "Could not find the group {group}",
                    "noPlayer": "Could not find the Player {player}",
                    "noPermission": "You do not have permission to do this.",
                    "success": "Successfully {SetOrRem} player!"
                },
            };
        },

        /*-----------------------------------------------------------------
                When the Player finishes loading in
         ------------------------------------------------------------------*/
        OnPlayerInit: function(player) {
            var steamID = rust.UserIDFromPlayer(player);
            this.giveDefault(player, steamID);
        },

        /*-----------------------------------------------------------------
                  Our functions to find players
        ------------------------------------------------------------------*/

        //Find player by name this supports partial names, full names, and steamIDs its also case-insensitive
        findPlayerByName: function(player, args) {
            try {
                var found = [],
                    foundID;
                var playerName = args[1].toLowerCase();
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
                    rust.SendChatMessage(player, prefix.PermissionHandler, msgs.noPlayer.replace("{player}", playername), "0");
                    return false;
                }
            } catch (e) {
                print(e.message.toString());
            }
        },

        //Find a user based solely on their steamID
        findPlayer: function(playerid) {
            var global = importNamespace("");
            var targetPlayer = global.BasePlayer.Find(playerid);
            if (targetPlayer) {
                return targetPlayer;
            } else {
                return false;
            }
        },

        getPluginData: function() {
            var pObj = {},
                temp = [];
            for (var i = 0; i < pluginList.length; i++) {
                name = pluginList[i].Title;
                if (name.Config.PermHandle) {
                    perms = name.Config.PermHandle.perms;
                    options = name.Config.PermHandle.options;
                    groups = this.formatGroups(name.Config.PermHandle.groups, options);
                    this.Config.Permissions[name] = {
                        permissions: perms,
                        groups: groups
                    };
                    this.runOptions(pluginList[i], options);
                }
            }
            this.SaveConfig();
        },

        hasPermission: function(player, perm) {
            var steamID = rust.UserIDFromPlayer(player);
            if (player.net.connection.authLevel === 2) {
                return true;
            }

            if (permission.UserHasPermission(steamID, perm)) {
                return true;
            }

            return false;
        },

        registerPermissions: function() {
            var i = 0,
                ii = 0;
            //register perms for groups and regular permissions
            for (var key in this.Config.Permissions) {
                for (var perm in this.Config.Permissions[key].permissions) {
                    if (!permission.PermissionExists(this.Config.Permissions[key].permissions[perm])) {
                        permission.RegisterPermission(this.Config.Permissions[key].permissions[perm], this.Plugin);
                    }
                }
                for (var group in this.Config.Permissions[key].groups) {
                    if (!permission.GroupExists(this.Config.Permissions[key].groups[group])) {
                        permission.CreateGroup(this.Config.Permissions[key].groups[group], this.Config.Permissions[key].groups[group], i);
                        i++;
                    }
                }
            }
        },

        formatGroups: function(groups, options) {
            var temp = [];
            for (var key in groups) {
                if (groups[key] !== "owner" || groups[key] !== "admin" || groups[key] !== "mod" || groups[key] !== "donor" || groups[key] !== "default") {
                    groups[key] = groups[key];
                    groups[key].permission = groups[key].permission;
                    groups[key].default = groups[key].default || false;
                }
            }
            return groups[key];
        },

        runOptions: function(plugin, options) {
            var perms = options.groupPerms.perms;
            if (options.setupGroups && options.groupPerms) {
                for (var i = 0; i < perms.length; i++) {
                    for (var key in options.GroupPerms.group) {
                        permission.GrantGroupPermission(options.groupPerms.group[key], perms[i], this.Plugin);
                    }
                }
            }
            return false;
        },

        giveDefault: function(player, steamID) {
            if (!permission.UserHasPermission(steamID, "default")) {
                permission.AddUserGroup(steamID, "default");
            }
        },

        setGroup: function(player, cmd, args) {
            var getPlayer = this.findPlayerByName(args[1].toString());
            var steamID = rust.UserIDFromPlayer(getPlayer[0]);
            var pos = args[2].toString();
            if (args.length === 3 && permission.GroupExists(pos)) {
                permission.AddUserGroup(steamID, pos);
                rust.SendChatMessage(player, prefix.PermissionHandler, msgs.success.replace("{SetOrRem}", "added"), "0");
            } else if (args.length !== 3) {
                rust.SendChatMessage(player, prefix.PermissionHandler, msgs.shortArgs, "0");
            } else {
                rust.SendChatMessage(player, prefix.PermissionHandler, msgs.noGroup.replace("{group}", pos), "0");
            }

        },

        remGroup: function(player, cmd, args) {
            var getPlayer = this.findPlayerByName(args[1].toString());
            var steamID = rust.UserIDFromPlayer(getPlayer[0]);
            var pos = args[2].toString();
            if (args.length === 3 && permission.GroupExists(pos)) {
                permission.RemoveUserGroup(steamID, pos);
                rust.SendChatMessage(player, prefix.PermissionHandler, msgs.success.replace("{SetOrRem}", "removed"), "0");
            } else if (args.length !== 3) {
                rust.SendChatMessage(player, prefix.PermissionHandler, msgs.shortArgs, "0");
            } else {
                rust.SendChatMessage(player, prefix.PermissionHandler, msgs.PlayerNotFound.replace("{player}", args[1]), "0");
            }
        },

        cmdSwitch: function(player, cmd, args) {
            var steamID = rust.UserIDFromPlayer(player);
            switch (args[0]) {
                case "group":
                    if (this.hasPermission(player, this.Config.Permissions.PermHandle.canSetStaff)) {
                        this.setGroup(player, cmd, args);
                    } else {
                        rust.SendChatMessage(player, prefix.PermissionHandler, msgs.noPermission, "0");
                    }
                    break;
                case "rgroup":
                    if (this.hasPermission(player, this.Config.Permissions.PermHandle.canRemStaff)) {
                        this.remGroup(player, cmd, args);
                    } else {
                        rust.SendChatMessage(player, prefix.PermissionHandler, msgs.noPermission, "0");
                    }
                    break;
                default:
                    rust.SendChatMessage(player, prefix.PermissionHandler, msgs.shortArgs, "0");
                    break;
            }

        },

        ccmdStart: function(player, cmd, args) {
            var steamID = rust.UserIDFromPlayer(player);
            switch (args[0]) {
                case "group":
                    if (this.hasPermission(player, this.Config.Permissions.PermHandle.canSetStaff)) {
                        this.setGroup(player, cmd, args);
                    } else {
                        print(msgs.noPermission);
                    }
                    break;
                case "rgroup":
                    if (this.hasPermission(player, this.Config.Permissions.PermHandle.canRemStaff)) {
                        this.remGroup(player, cmd, args);
                    } else {
                        print(msgs.noPermission);
                    }
                    break;
                default:
                    print(msgs.shortArgs);
                    break;
            }
        },

        finished: function(plugin) {
            print("Finished grabbing data from config and storing it on local config. Removing JSON object.");
            delete plugin.Config.PermHandle;
            this.SaveConfig();
            return false;
        }
    },
