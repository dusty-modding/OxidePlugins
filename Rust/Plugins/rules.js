var rules = {
    Title: "Rules",
    Author: "Killparadise",
    Version: V(1, 3, 1),
    HasConfig: true,
    Init: function() {
        print('Loaded Rules from Config: ' + this.Config.setRules.length);
        command.AddChatCommand("rules", this.Plugin, "switchRules");
    },

    LoadDefaultConfig: function() {
        print("Config Changes with new update, Updating Config file.");
        this.Config.setRules = [
            "1. No Cheating!",
            "2. No Abusing broken mechanics!",
            "3. Respect thy fellow players"
        ];
        this.Config.Messages = {
            "AddBadSyntax": ['Incorrect Syntax, please use: /rules add "rule here" Example: /rules add "Example Rule Here"'],
            "DelBadSyntax": ["Incorrect Syntax, please use:", "/rules del ruleNumber", "Example: /rules del 1"],
            "Default": ["No Permissions to use this command."]
        };
    },

    /*-----------------------------------------------------------------
                     Commands for Rules
    ------------------------------------------------------------------*/

    switchRules: function(player, cmd, args) {
        try {
            if (args[0] === "add") {
                this.cmdAddRule(player, cmd, args);
            } else if (args[0] === "del") {
                this.cmdDelRule(player, cmd, args);
            } else {
                this.cmdShowRules(player);
            }
        } catch (e) {
            print(e.message.toString());
        }
    },

    cmdShowRules: function(player) {
        var rules = this.Config.setRules;
        for (var i = 0; i < rules.length; i++) {
            rust.SendChatMessage(player, "RULES", rules[i], "0");
        }
    },

    cmdAddRule: function(player, cmd, args) {
        var authLvl = player.net.connection.authLevel;
        var rules = this.Config.setRules;
        var rulLen = rules.length + 1;

        if (args.length < 2) {
            for (var j = 0; j < this.Config.Messages.AddBadSyntax.length; j++) {
                rust.SendChatMessage(player, "RULES", this.Config.Messages.AddBadSyntax[j], "0");
                return;
            }
        } else {

            if (authLvl >= 2 && args[1].length) {
                rules.push(rulLen + "." + " " + args[1]);
                rust.SendChatMessage(player, "RULES", "Rule added successfully.", "0");
                this.SaveConfig();
            } else if (authLvl <= 1) {
                rust.SendChatMessage(player, "RULES", "No Permissions to use this command.", "0");
            }
        }
    },

cmdDelRule: function(player, cmd, args) {
        var authLvl = player.net.connection.authLevel;
        var rules = this.Config.setRules;
        var tempSave = [];
        if (authLvl >= 2 && args.length < 2) {
            for (var j = 0; j < this.Config.Messages.DelBadSyntax.length; j++) {
                rust.SendChatMessage(player, "RULES", this.Config.Messages.DelBadSyntax[j], "0");
                return;
            }
        } else if (authLvl >= 2 && args.length >= 2) {
            for (var i = 0; i < rules.length; i++) {
                try {
                    if (rules.indexOf(rules[i]) != (args[1] - 1)) {
                        tempSave.push(rules[i]);
                    } else {
                        continue;
                    }
                } catch (e) {
                    print(e.message.toString());
                }
            }
            this.Config.setRules = [];
            for (var ii = 0; ii < tempSave.length; ii++) {
                this.Config.setRules.push(tempSave[ii]);
            }
            rust.SendChatMessage(player, "RULES", "Rule Deleted Successfully", "0");
            this.SaveConfig();
            return;
        } else {
            rust.SendChatMessage(player, "RULES", "No Permissions to use this command.", "0");
        }
    },

    SendHelpText: function(player) {
        var authLvl = player.net.connection.authLevel;
        rust.SendChatMessage(player, "RULES", "/rules - Show the list of server rules", "0");
        if (authLvl >= 2) {
            rust.SendChatMessage(player, "RULES", '/rules add "Rule in quotes here" - Add a new rule to the list', "0");
            rust.SendChatMessage(player, "RULES", "/rules del # - removes the rule listed with given number", "0");
        }
    }
};
