function setter(playerID) {
    var oldRank = TitlesData.PlayerData[playerID].Rank;

    for (i; i < j; i++) {
        if (karmaOn && this.getClosest(karma) === this.Config.main[i].karma) {
            TitlesData.PlayerData[playerID].Title = "[" + this.Config.main[i].title + "]";
            TitlesData.PlayerData[playerID].Rank = this.Config.main[i].rank;
            TitlesData.PlayerData[playerID].Color[Title] = this.Config.main[i].Color;
        } else if (!karmaOn && this.getClosest(kills) === this.Config.main[i].killsNeeded) {
            TitlesData.PlayerData[playerID].Title = "[" + this.Config.main[i].title + "]";
            TitlesData.PlayerData[playerID].Rank = this.Config.main[i].rank;
            TitlesData.PlayerData[playerID].Color[Title] = this.Config.main[i].Color;
        }
    }

    if (settings.useBoth) {
        for (var t = 0; t < this.Config.prefixTitles.length; t++) {
            if (TitlesData.PlayerData[playerID].Prefix === "" && this.Config.prefixTitles[t].default) {
                TitlesData.PlayerData[playerID].Prefix = "[" + this.Config.prefixTitles[t].title + "]";
                TitlesData.PlayerData[playerID].Color[Prefix] = this.Config.prefixTitles[i].Color;
            }

        }
    }
    if (TitlesData.PlayerData[playerID].Rank > oldRank) {
        player.ChatMessage("<color=green>" + msgs.Promoted + "</color> " + TitlesData.PlayerData[playerID].Title);
        if (settings.broadcastPromotions) rust.BroadcastChat(this.buildString(msgs.broadcastpromo, [player.displayName, TitlesData.PlayerData[playerID].Title]));
    } else if (TitlesData.PlayerData[playerID].Rank < oldRank) {
        player.ChatMessage("<color=red>" + msgs.Demoted.replace("{rank}", TitlesData.PlayerData[playerID].Title) + "</color>");
        if (settings.broadcastPromotions) rust.BroadcastChat(this.buildString(msgs.broadcastdemote, [player.displayName, TitlesData.PlayerData[playerID].Title]));
    }
    return false;
}

setter.prototype.getDetails = function(playerID) {
    var playerObj = {};
    playerObj.prefix = TitlesData.PlayerData[playerID].Prefix;
    playerObj.title = TitlesData.PlayerData[playerID].Title;
    playerObj.rank = TitlesData.PlayerData[playerID].Rank;
    return playerObj;
};

function buildString(string, value) {
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
            if (i === temp.length) {
                re += temp[i];
            } else {
                re += temp[i] + "|";
            }
        }
        //re = re.substring("|", re.length - 1);
        var expression = new RegExp(re, "g");
        sb = string.replace(expression, function(match) {
            return regObj[match];
        });
    }
    return sb;
}

function RanksAndTitles(author, title, version) {
    this.Title = title;
    this.Author = autor;
    this.Version = version;
    msgs = this.Config.Messages;
    prefix = this.Config.Messages;
    settings = this.Config.Settings;
    set = new setter();
    sb = new buildString();
}

RanksAndTitles.prototype = {
    Init: function() {
        dataHandler = new dataHandler();
        helper = new helpers();
        this.registerPermissions();
    },

    OnServerInitialized: function() {
        callCmd = new commandHandler();
        command.AddChatCommand("rt", this.Plugin, "this.callCmd.switch");
    },

    OnPlayerInit: function(player) {
        var userObj = "";
        userObj = {
            steamID: rust.UserIDFromPlayer(player),
            player: player,
            username: player.displayName
        };
        this.dataHandler.checkPlayerData(userObj);
    },

    OnPlayerChat: function(arg) {
        var callChat = new OnPlayerChat();
        callChat.init(arg);
        return false;
    },

    OnEntityDeath: function(entity, hitinfo) {
        if (hitinfo !== null) {
            var callDeath = new OnEntityDeath();
            callDeath.init(entity, hitinfo);
        }
        return false;
    },

    registerPermissions: function() {
        var i = 0,
            j = this.Config.prefixTitles.length;
        //prefix permissions
        for (i; i < j; i++) {
            if (!permission.GroupExists(this.Config.prefixTitles[i].permission)) {
                permission.CreateGroup(this.Config.prefixTitles[i].permission, this.Config.prefixTitles[i].permission, i);
            }
        }
        //single permissions
        for (var perm in this.Config.Permissions) {
            if (!permission.PermissionExists(this.Config.Permissions[perm])) {
                permission.RegisterPermission(this.Config.Permissions[perm], this.Plugin);
            }
        }
    },

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

    LoadDefaultConfig: function() {
        this.Config.authLevel = 2;
        this.Config.Version = this.Config.Version || "1.6.4";
        this.Config.Settings = this.Config.Settings || {
            "karma": true,
            "colorSupport": true,
            "noAdmin": false,
            "useBoth": true,
            "dropRank": false,
            "antiSleeper": false,
            "useKDR": false,
            "deathMsgs": true,
            "broadcastPromotions": true,
            "chatNameColor": "#1bd228",
            "staffchatNameColor": "#1bd228",
            "chatColor": "#FFFFFF"
        };
        this.Config.prefixTitles = this.Config.prefixTitles || [{
            "title": "Player",
            "Color": "#FFFFFF",
            "permission": "player",
        }, {
            "title": "Donor",
            "Color": "#ffa500ff",
            "permission": "donor",
        }, {
            "title": "Owner",
            "Color": "#505886",
            "permission": "owner",
        }];
        this.Config.main = this.Config.main || [{
            "rank": 0,
            "title": "Civilian",
            "karma": 0,
            "killsNeeded": 0,
            "Color": "#FFFFFF",
            "karmaModifier": 1,
            "permission": "player"
        }, {
            "rank": 0.5,
            "title": "Small Timer",
            "karma": -1.0,
            "killsNeeded": 1.0,
            "Color": "#ff0000ff",
            "karmaModifier": 1.0,
            "permission": "player"
        }, {
            "rank": 0.5,
            "title": "Wannabe",
            "karma": 1.0,
            "killsNeeded": 1.0,
            "Color": "#0000a0ff",
            "karmaModifier": 1.0,
            "permission": "player"
        }];
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
            "hide": "canHideSelf",
            "create": "canCreate",
            "delete": "canDelete",
            "staff": "isStaff",
        };
        this.Config.Prefix = this.Config.Prefix || "RanksAndTitles";
        this.Config.Messages = this.Config.Messages || {
            "Promoted": "You've been Promoted to: ",
            "NoPlyrs": "No Players Found...",
            "plyrWiped": "Player Wiped!",
            "dataRfrsh": "Data Refreshed!",
            "noPerms": "You do not have permission to use this command.",
            "setSuccs": "Player Prefix Set Successfully!",
            "needTitle": "You need to enter a title for the player!",
            "stats": ["<color=orange>Your Kill count is:</color> {kills}", "<color=orange>Your Death count is:</color> {deaths}", "<color=orange>Your KDR is currently:</color> {kdr}", "<color=orange>Your current Rank is:</color> {rank}", "<color=orange>Your current Karma is:</color> {karma}"],
            "userprefix": "Your Prefix is: ",
            "badSyntaxRt": "The command syntax was incorrect, please use /rt set playername title",
            "errors": "Incorrect command structure, please try again.",
            "loseKarma": "<color=red>You've lost Karma!</color>",
            "gainKarma": "<color=green>You've gained Karma!</color>",
            "reset": "Player prefix reset!",
            "adminsOn": "Admins ranks turned on.",
            "adminsOff": "Admins rankings turned off.",
            "badSyntaxRemove": "Incorrect Syntax please use /rt remove playername",
            "help": "/rt help - Get RanksAndTitles Command Help",
            "badSyntaxKarma": "Invalid syntax please use /rt karma",
            "clearData": "Server Data Wiped...",
            "noData": "No Player Data Found... Attempting to Build.",
            "Demoted": "You've been demoted to: <color=lime>{rank}</color>",
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
            "suicide": "{slain} Managed to kill themselves... Nice one.",
            "broadcastpromo": "<color=lime>{player} has promoted to:</color> {rank}",
            "broadcastdemote": "<color=lime>{player} has demoted to:</color> {rank}"
        };

        this.Config.deathMsgs = this.Config.deathMsgs || [
            "<color=lime>{slayer}</color> the <color={slayerColor}>{title}</color> has slain <color=lime>{slain}</color> the <color={slainColor}>{stitle}</color>!",
            "<color=lime>{slayer}</color> the <color={slayerColor}>{title}</color> dismantled the way of life for <color=lime>{slain}</color> the <color=slainColor}>{stitle}</color>"
        ];

        this.Config.Help = this.Config.Help || [

            "/rt - display your rank or title",
            "/rt stats - get your current stats if in ranks mode",
            "/rt refresh - refreshes your data file, recommended only used after system switch"
        ];
        this.Config.AdminHelp = this.Config.AdminHelp || [

            "<color=orange>/rt wipe playername</color> - Wipes the sleceted players Kills, Deaths, KDR, and Karma",
            "<color=orange>/rt set playername title</color> - Sets a custom title to the selected player, this must be a title in config (NOT RANK)",
            "<color=orange>/rt remove playername</color> - removes a given players custom title, and sets them back into the ransk tree",
            "<color=orange>/rt useboth</color> - switch prefixes on and off",
            "<color=orange>/rt noadmin</color> - Removes admins (auth 2 or higher) from ranks system no kills, or ranks will be given.",
            "<color=orange>/rt kset playername karma</color> - set a selected players karma level",
            "<color=orange>/rt kcheck playername</color> - check the selected players karma",
            "<color=orange>/rt kadd playername karma</color> - adds the entered amount of karma to the selected player",
            "<color=orange>/rt krem playername karma</color> - removes the entered amount of karma from the selected player",
            "<color=orange>/rt create rankname rank karmaneeded killsneeded karmagiven color permissions</color> - create a new rank",
            "<color=orange>/rt create prefixname color permission</color> - create a new prefix",
            "<color=orange>/rt delete rankname</color> - delete a rank"
        ];
    }
};

RanksAndTitles.helpers.prototype = {

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

    getKarma: function(playerID) {
        var i = 0,
            karma,
            j = this.Config.main.length;
        for (i; i < j; i++) {
            if (this.Config.main[i].title === TitlesData.PlayerData[victimID].Title) {
                karma = this.Config.main[i].karmaModifier;
                break;
            } else {
                karma = 1;
            }
        }
        return karma;
    },
    getClosest: function(closestTo) {
        var arr = this.buildRanksArr();
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
    buildRanksArr: function() {
        var temp = [];

        for (var i = 0; i < this.Config.main.length; i++) {
            if (settings.karma) {
                temp.push(this.Config.main[i].karma);
            } else {
                if (this.Config.main[i].killsNeeded !== "disabled") {
                    temp.push(this.Config.main[i].killsNeeded);
                }
            }
        }
        return temp;
    },
    getcolor: function(playerID) {
        if (!chatHandler) {
            var colorArr = [TitlesData.PlayerData[steamID].Colors[Prefix], TitlesData.PlayerData[steamID].Colors[Title]];
            return colorArr;
        }
        var titleColor = TitlesData.PlayerData[steamID].Colors[Title];
        return titleColor;
    },
};

RanksAndTitles.OnEntityDeath.prototype = {

    init: function(entity, hitinfo) {
        var victim = entity,
            attacker = hitinfo.Initiator,
            victimID,
            attackerID,
            karmaOn = settings.karma;
        if (attacker === null || !attacker.ToPlayer() || !victim.ToPlayer()) return false;
        if (settings.antiSleeper && victim.IsSleeping()) return false;
        if (attacker.displayName !== victim.displayName) {
            attackerID = rust.UserIDFromPlayer(killer);
            victimID = rust.UserIDFromPlayer(victim);
        }
        if (karmaOn) {
            this.trackKarma(attacker, attackerID, victim, victimID);
        } else {
            this.trackKill(attackerID, victimID);
        }
    },

    trackKarma: function(attacker, attackerID, victim, victimID) {
        if (victim.displayName !== attacker.displayName) {

            if (TitlesData.PlayerData[victimID].Karma >= 0) {
                TitlesData.PlayerData[attackerID].Karma -= this.getKarma(victimID);
                rust.SendChatMessage(killer, prefix.ranks, msgs.loseKarma + " (" + this.getKarma(victimID) + ")", "0");
            } else {
                TitlesData.PlayerData[attackerID].Karma += this.getKarma(victimID);
                rust.SendChatMessage(killer, prefix.ranks, msgs.gainKarma + " (" + this.getKarma(victimID) + ")", "0");
            }
        }
        this.trackKill(attackerID, victimID);
        if (settings.deathMsgs) this.deathMsg([killer.displayName, victim.displayName], [attackerID, victimID]);
        return false;
    },

    trackKill: function(attackerID, victimID) {
        if (victim.displayName === attacker.displayName) {
            TitlesData.PlayerData[victimID].Deaths += 1;
        }

        TitlesData.PlayerData[attackerID].Kills += 1;
        TitlesData.PlayerData[victimID].Deaths += 1;
        this.set(attackerID);
        this.updateKDR([victimID, attackerID]);
    },

    updateKDR: function(ids) {
        var len = ids.length,
            k2d;
        if (len === 0) return false;
        if (ids[0] === ids[1]) len -= 1;
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

    deathMsg: function(users, ids) {
        var slayerTitle = TitlesData.PlayerData[ids[0]].Title;
        var slainTitle = TitlesData.PlayerData[ids[1]].Title;
        for (var i = 0; i < this.Config.main.length; i++) {
            if (this.Config.main[i].title === slayerTitle) {
                slayerColor = this.Config.main[i].Color;
            }
            if (this.Config.main[i].title === slainTitle) {
                slainColor = this.Config.main[i].Color;
            }
        }
        rust.BroadcastChat(prefix, this.buildString(this.Config.deathMsgs[Math.floor(Math.random() * this.Config.deathMsgs.length)], [users[0], slayerColor, slayerTitle, users[1], slainColor, slainTitle]));
    }
};

RanksAndTitles.dataHandler.prototype = {
    checkData: function(player, steamID) {
        if (!TitlesData.PlayerData[steamID]) {
            print("Data Not Present");
            this.checkPlayerData(player, steamID);
        }
    },

    saveData: function() {
        data.SaveData("RanksandTitles");
    },

    getData: function() {
        TitlesData = data.GetData('RanksandTitles');
        TitlesData = TitlesData || {};
        TitlesData.PlayerData = TitlesData.PlayerData || {};
        TitlesData.AntiAbuse = TitlesData.AntiAbuse || {};
    },

    checkPlayerData: function(user) {
        var authLvl = user.player.net.connection.authLevel;
        TitlesData.PlayerData[user.steamID] = TitlesData.PlayerData[user.steamID] || {};
        TitlesData.PlayerData[user.steamID].PlayerID = TitlesData.PlayerData[user.steamID].PlayerID || user.steamID;
        TitlesData.PlayerData[user.steamID].RealName = TitlesData.PlayerData[user.steamID].RealName || user.username;
        TitlesData.PlayerData[user.steamID].Title = TitlesData.PlayerData[user.steamID].Title || "";
        TitlesData.PlayerData[user.steamID].Prefix = TitlesData.PlayerData[user.steamID].Prefix || "";
        TitlesData.PlayerData[user.steamID].Colors = TitlesData.PlayerData[user.steamID].Colors || {
            Prefix: "",
            Title: ""
        };
        TitlesData.PlayerData[user.steamID].Rank = TitlesData.PlayerData[user.steamID].Rank || 0;
        TitlesData.PlayerData[user.steamID].Kills = TitlesData.PlayerData[user.steamID].Kills || 0;
        TitlesData.PlayerData[user.steamID].KDR = TitlesData.PlayerData[user.steamID].KDR || 0;
        TitlesData.PlayerData[user.steamID].Deaths = TitlesData.PlayerData[user.steamID].Deaths || 0;
        TitlesData.PlayerData[user.steamID].Karma = TitlesData.PlayerData[user.steamID].Karma || 0;
        TitlesData.PlayerData[user.steamID].isAdmin = TitlesData.PlayerData[user.steamID].isAdmin || (authLvl >= 2) || this.hasPermission(player, this.Config.Permissions.staff) || false;
        TitlesData.PlayerData[user.steamID].hidden = TitlesData.PlayerData[user.steamID].hidden || false;
        this.setRankTitle(user.steamID, user.player);
    }
};

RanksAndTitles.OnPlayerchat.prototype = {

    init: function(arg) {
        if (chatHandler) return null;
        var player = arg.connection.player,
            steamID = rust.UserIDFromPlayer(player);
        var options = {
            username: player.displayName,
            displayColor: this.displayColor(steamID),
            useTitle: TitlesData.PlayerData[steamID].Title || "",
            usePrefix: TitlesData.PlayerData[steamID].Prefix || "",
            msg: arg.GetString(0, "text")
        };
        if (msg.substring(1, 1) === "/" || msg === "") return null;
        if (TitlesData.PlayerData[steamID] === undefined) {
            this.checkPlayerData(player, steamID);
            print("Building Player Data");
        }
        this.buildChat(options);
    },

    displayColor: function(steamID) {
        var color = {};
        var colorArr = this.helpers.getColor(steamID);
        if (settings.colorSupport && this.hasPermission(player, this.Config.Permissions.isStaff)) {
            color.name = "<color=" + settings.chatNameColor + ">" || "";
        } else {
            color.name = "<color=" + settings.staffchatNameColor + ">" || "";
        }
        color.title = "<color=" + colorArr[1] + ">[" || "";
        color.prefix = "<color=" + colorArr[0] + ">[" || "";
        color.chat = settings.chatColor;
        return color;
    },

    buildChat: function(c) {
        var formatted = c.displayColor[prefix] + c.usePrefix + "</color> " + c.displayColor[name] + c.username + "</color> " + c.displayColor[title] +
            c.useTitle + "</color>: " + c.displayColor[chat] + c.msg + "</color>";
        global.ConsoleSystem.Broadcast("chat.add", steamID, formattedMsg);

        print(player.displayName + ": " + msg);
        return false;
    }
};

RanksAndTitles.commandHandler.prototype = {
    switch: function(player, cmd, args) {
        var steamID = rust.UserIDFromPlayer(player),
            authLvl = player.net.connection.authLevel,
            perms = this.Config.Permissions;
        thisPerm = args[0];
        if (args.length > 1 && args[0] !== undefined) allowed = this.hasPermission(player, perms[thisPerm]);
        switch (args[0]) {
            case "stats":
                this.checkStats(player, cmd, args);
                break;
            case "hide":
                if (allowed) this.hideCmd(player, cmd, args);
                break;
            case "wipe":
                if (allowed) this.wipePlayer(player, cmd, args);
                break;
            case "set":
                if (allowed && args.length === 3) {
                    this.giveTitle(player, cmd, args);
                } else {
                    rust.SendChatMessage(player, prefix, msgs.badSyntaxRt, "0");
                    return false;
                }
                break;
            case "useboth":
                if (allowed) {
                    if (!settings.useBoth) {
                        settings.useBoth = true;
                    } else {
                        settings.useBoth = false;
                    }
                }
                this.SaveConfig();
                break;
            case "kset":
                if (args.length >= 1 && allowed) {
                    this.setKarma(player, cmd, args);
                } else {
                    player.ChatMessage(msgs.bdSyntax.replace("{syntax}", "/rt kset playername amt"));
                    return false;
                }
                break;
            case "kcheck":
                if (args.length >= 1 && allowed) {
                    this.checkKarma(player, cmd, args);
                } else {
                    player.ChatMessage(msgs.bdSyntax.replace("{syntax}", "/rt kcheck playername"));
                    return false;
                }
                break;
            case "kadd":
                if (args.length >= 1 && allowed) {
                    this.addKarma(player, cmd, args);
                } else {
                    player.ChatMessage(msgs.bdSyntax.replace("{syntax}", "/rt kadd playername amt"));
                    return false;
                }
                break;
            case "krem":
                if (args.length >= 1 && allowed) {
                    this.removeKarma(player, cmd, args);
                } else {
                    player.ChatMessage(msgs.bdSyntax.replace("{syntax}", "/rt krem playername amt"));
                    return false;
                }
                break;
            case "remove":
                if (allowed && args.length >= 1) {
                    this.removeTitle(player, cmd, args);
                } else {
                    rust.SendChatMessage(player, prefix, msgs.badSyntaxRemove, "0");
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
                if (allowed) this.noAdmin(player, cmd, args);
                break;
            case "help":
                this.rtHelp(player, cmd, args);
                break;
            case "create":
                if (allowed) this.createRank(player, cmd, args);
                break;
            case "delete":
                if (allowed) this.deleteRank(player, cmd, args);
                break;
            default:
                if (TitlesData.PlayerData[steamID] !== undefined) {
                    rust.SendChatMessage(player, prefix, "Current Rank: " + TitlesData.PlayerData[steamID].Rank.toString() + " (" + TitlesData.PlayerData[steamID].Title + ")", "0");
                    rust.SendChatMessage(player, prefix, msgs.userprefix + TitlesData.PlayerData[steamID].Prefix, "0");
                } else {
                    rust.SendChatMessage(player, prefix, msgs.noData, "0");
                    this.checkPlayerData(player, steamID);
                }
                break;
        }
    },

    checkStats: function(player, cmd, args) {
        var steamID = rust.UserIDFromPlayer(player);

        player.ChatMessage(this.buildString(msgs.stats, [TitlesData.PlayerData[steamID].Kills, TitlesData.PlayerData[steamID].Deaths,
            TitlesData.PlayerData[steamID].KDR, TitlesData.PlayerData[steamID].Rank, TitlesData.PlayerData[steamID].Karma
        ]));
    },


    setKarma: function(player, cmd, args) {
        if (args.length === 3) {
            var getPlayer = this.helpers.findPlayerByName(args[1]);
            var karmaAmt = Number(args[2]);
            if (getPlayer && typeof(karmaAmt) === "number") {
                TitlesData.PlayerData[getPlayer[1]].Karma = karmaAmt;
                this.saveData();
                rust.SendChatMessage(player, prefix, msgs.setKarma, "0");
            } else {
                rust.SendChatMessage(player, prefix, msgs.setKarma0, "0");
                return false;
            }
            this.checkPlayerData(getPlayer[0], getPlayer[1]);
        } else {
            player.ChatMessage(msgs.bdSyntax.replace("{syntax}", "/rt kset playername amt"));
        }
    },

    checkKarma: function(player, cmd, args) {
        var getPlayer = this.helpers.findPlayerByName(args[1]);
        if (getPlayer) {
            rust.SendChatMessage(player, prefix, getPlayer[0].displayName + msgs.plyrKarma + TitlesData.PlayerData[getPlayer[1]].Karma, "0");
        } else {
            rust.SendChatMessage(player, prefix, msgs.checkFailed, "0");
        }
    },

    addKarma: function(player, cmd, args) {
        if (args.length === 3) {
            var getPlayer = this.helpers.findPlayerByName(args[1]);
            var karmaAmt = Number(args[2]);
            if (typeof(karmaAmt) === "number") {
                TitlesData.PlayerData[getPlayer[1]].Karma += karmaAmt;
                this.saveData();
                rust.SendChatMessage(player, prefix, msgs.addKarma, "0");
            }
            this.checkPlayerData(getPlayer[0], getPlayer[1]);
        } else {
            player.ChatMessage(msgs.bdSyntax.replace("{syntax}", "/rt kadd playername amt"));
        }
    },

    removeKarma: function(player, cmd, args) {
        if (args.length === 3) {
            var getPlayer = this.helpers.findPlayerByName(args[1]);
            var karmaAmt = Number(args[2]);
            if (typeof(karmaAmt) === "number") {
                TitlesData.PlayerData[getPlayer[1]].Karma -= karmaAmt;
                this.saveData();
                rust.SendChatMessage(player, prefix, msgs.removeKarma, "0");
            }
            this.checkPlayerData(getPlayer[0], getPlayer[1]);
        } else {
            player.ChatMessage(msgs.bdSyntax.replace("{syntax}", "/rt krem playername amt"));
        }
    },

    wipePlayer: function(player, cmd, args) {
        var target;
        if (args[1] !== "all") {
            target = this.helpers.findPlayerByName(args[1]);
            if (target[1].length) {
                TitlesData.PlayerData[target[1]].Kills = 0;
                TitlesData.PlayerData[target[1]].Deaths = 0;
                TitlesData.PlayerData[target[1]].KDR = 0;
                if (settings.karma) TitlesData.PlayerData[target[1]].Karma = 0;
                rust.SendChatMessage(player, prefix, msgs.plyrWiped, "0");
                this.setRankTitle(target[1], target[0]);
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
                if (settings.karma) TitlesData.PlayerData[target].Karma = 0;
                this.setRankTitle(target, rust.UserIDFromPlayer(target));
            }
        }
        this.saveData();
    },

    createRank: function(player, cmd, args) {
        var temp = {};

        if (args.length === 4) {
            temp = {
                "title": args[1].toString() || "default",
                "Color": args[2].toString() || "#FFFFFF",
                "permission": args[3].toString() || "player"
            };
            this.Config.prefixTitles.push(temp);
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
            this.Config.main.push(temp);
            rust.SendChatMessage(player, prefix, msgs.rankCreated.replace("{rank}", temp.title), "0");
        } else {
            player.ChatMessage(msgs.bdSyntax.replace("{syntax}", "/rt create args use /rt help for more info."));
        }
        this.SaveConfig();
    },

    deleteRank: function(player, cmd, args) {
        var i = 0,
            j = this.Config.main.length,
            rank = args[1].toString();
        for (i; i < j; i++) {
            if (rank === this.Config.main[i].title) {
                name = this.Config.main[i].title;
                this.Config.main.splice(i, 1);
                rust.SendChatMessage(player, prefix, msgs.rankDel.replace("{rank}", name), "0");
            }
        }
        return false;
    },

    removeTitle: function(player, cmd, args) {
        try {
            var getPlayer = this.helpers.findPlayerByName(args[1]);
            for (var i = 0; i < this.Config.prefixTitles.length; i++) {
                if (this.Config.prefixTitles[i] === TitlesData.PlayerData[getPlayer[1]].Prefix) {
                    TitlesData.PlayerData[getPlayer[1]].Prefix = "";
                    permission.RemoveUserGroup(getPlayer[1], this.Config.prefixTitles[i].permission);
                }
            }
            this.saveData();
            this.setRankTitle(getPlayer[1], getPlayer[0]);
            rust.SendChatMessage(player, prefix, msgs.reset + " " + getPlayer[0].displayName, "0");
        } catch (e) {
            print(e.message.toString());
        }
    },

    hideCmd: function(player, cmd, args) {
        var steamID = rust.UserIDFromPlayer(player);
        if (!TitlesData.PlayerData[steamID].hidden) {
            TitlesData.PlayerData[steamID].hidden = true;
            rust.SendChatMessage(player, prefix, "Your tag is now hidden!", "0");
        } else {
            TitlesData.PlayerData[steamID].hidden = false;
            rust.SendChatMessage(player, prefix, "Your tag is no longer hidden!", "0");
        }
        this.saveData();
    },

    giveTitle: function(player, cmd, args) {

        var getPlayer = this.helpers.findPlayerByName(args[1]);
        var getPlayerData = TitlesData.PlayerData,
            j = this.Config.prefixTitles.length,
            i = 0;
        if (!getPlayer) {
            player.ChatMessage(msgs.NoPlyrs);
            return false;
        }
        if (args[2].length) {
            for (i; i < j; i++) {
                if (args[2].toLowerCase() === this.Config.prefixTitles[i].title.toLowerCase()) {
                    print(getPlayer[1]);
                    TitlesData.PlayerData[getPlayer[1]].Prefix = this.Config.prefixTitles[i].title;
                    permission.AddUserGroup(getPlayer[1], this.Config.prefixTitles[i].permission);
                    rust.SendChatMessage(player, prefix, msgs.setSuccs, "0");
                }
            }
        } else {
            rust.SendChatMessage(player, prefix, msgs.needPrefix, "0");
            return false;
        }
        this.saveData();
    },

    noAdmin: function(player, cmd, args) {
        var noAdmin = settings.noAdmin;
        if (noAdmin) {
            settings.noAdmin = false;
            rust.SendChatMessage(player, prefix, msgs.adminsOn, "0");
        } else {
            settings.noAdmin = true;
            rust.SendChatMessage(player, prefix, msgs.adminsOff, "0");
        }
        this.SaveConfig();
    },

    rtHelp: function(player, cmd, args) {
        rust.SendChatMessage(player, null, "--------------RanksAndTitles Commands------------", "0");
        var authLvl = player.net.connection.authLevel;
        for (var i = 0; i < this.Config.Help.length; i++) {
            player.ChatMessage(this.Config.Help[i]);
        }
        if (authLvl >= 2) {
            rust.SendChatMessage(player, null, "<color=orange>--------------Admin Commands------------</color>", "0");
            for (var j = 0; j < this.Config.AdminHelp.length; j++) {
                player.ChatMessage(this.Config.AdminHelp[j]);
            }
        }
    },

    clearData: function(player, cmd, args) {
        delete TitlesData.PlayerData;
        rust.SendChatMessage(player, prefix, msgs.clearData, "0");
        TitlesData.PlayerData = TitlesData.PlayerData || {};
        this.saveData();
        this.getData();
    },

    refreshData: function(player, cmd, args) {
        var steamID = rust.UserIDFromPlayer(player);
        if (TitlesData.PlayerData[steamID] === undefined) {
            TitlesData.PlayerData[steamID].Title = "";
            rust.SendChatMessage(player, prefix, msgs.noData, "0");
        } else {
            rust.SendChatMessage(player, prefix, msgs.dataRfrsh, "0");
        }
        this.checkPlayerData(player, steamID);
    },

    SendHelpText: function(player) {
        rust.SendChatMessage(player, prefix, msgs.help, "0");
    }
};

var RanksAndTitles = new RanksAndTitles("KillParadise", "RanksAndTitles", V(2, 0, 0));
