var NewHelp = {
    Title: "Help",
    Author: "Killparadise",
    Version: V(1, 0, 0),
    Init: function() {
        command.AddChatCommand("help", this.Plugin, "runHelpText");
    },

    OnServerInitialized: function() {
        this.msgs = this.Config.Messages;
        this.timerHolder;
        this.prefix = this.Config.Prefix;
    },

    LoadDefaultConfig: function() {
        this.Config.authLevel = 2;
        this.Config.Settings = {
           
        };
        this.Config.help = {
        "custom": ["HelpMessage"],
        }
    },

    buildHelpText: function(name, helpText) {
    	this.Config.help[name] = {};
    	this.Config.help[name] = helpText;
    },

    runHelpText: function(player, cmd, args) {
    	rust.SendChatMessage(player, "", "----------------------HELP-------------------", "0");
    	for(var key in this.Config.help) {
    	rust.SendChatMessage(player, this.Config.help.key, this.Config.help[key], "0");
    }
    	rust.SendChatMessage(player, "", "---------------------END HELP-----------------", "0");
    }