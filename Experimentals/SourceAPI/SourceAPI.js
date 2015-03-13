var SourceAPI = {
    Title: "Source API",
    Author: "Killparadise",
    Version: V(1, 0, 0),
    HasConfig: true,
    Init: function() {
        global = importNamespace("");
        this.getData();
        var j = 0
        for (var key in SourceData.Plugins) {
            j++;
            loadedPlugins[j] = SourceData.Plugins[key];
            if (loadedPlugins) {
                print(loadedPlugins + " Grabbed and Added...");
            }
        }
        msgs = this.Config.Messages;
        command.AddConsoleCommand("source.get", this.Plugin, "getPlugin");
    },

    OnServerInitialized: function() {

    },

    LoadDefaultConfig: function() {
        this.Config.Settings = {};

        this.Config.Messages = {}
    },

    getData: function() {
        SourceData = data.GetData("Source");
        SourceData = SourceData || {};
        SourceData.Plugins = SourceData.Plugins || {};
        this.saveData();
    },

    getDetailsData: function(plugin) {
        SourceData.Plugins[plugin] = SourceData.Plugins[plugin] || {};
        SourceData.Plugins[plugin].Name = SourceData.Plugins[plugin].Name || ""
        SourceData.Plugins[plugin].Functions = SourceData.Plugins[plugin].Functions || {};
    },

    getPlugin: function(plugin) {
        var grabPlugin = plugins.Find(plugin);
        return grabPlugin;
    },

    getExtention: function(file) {
        var ext = file.split('.').pop();
        var pluginName = file.split('.').shift();
        var plugin = [];
        switch (ext) {
            case "js":
                plugin.push(pluginName, "javascript");
                return plugin;
                break;
            case "py":
                plugin.push(pluginName, "python");
                return plugin;
                break;
            case "lua":
                plugin.push(pluginName, "lua");
                return plugin;
                break;
            case "cs":
                plugin.push(pluginName, "csharp");
                return plugin;
                break;
            default:
                return "Error";
                break;
        }
    },

    grabData: function(player, pluginName, funct) {
        //Layout: SourceAPI.grabData(player, "00-Economics.lua", "GetEconomyAPI()");
        if (player && pluginName) {
            var lang = this.getExtention(pluginName);
            var plugin = this.getPlugin(lang[0]);
        } else {
            print("Error - Failed to Resolve plugin Info");
            return false;
        }

        this.makeCall(player, plugin, funct, lang[1]);
    },

    makeCall: function(player, plugin, funct, lang) {

        if (lang === "lua") {
            var getCall = plugin.Call('self:'+funct);
            this.setupJSON(getCall);
        } else if (lang === "csharp") {
            var getCall = plugin.Call(funct);
            this.setupJSON(getCall);
        } else if (lang === "python") {
            var getCall = plugin.Call('self.'+funct);
            this.setupJSON(getCall);
        } else if (lang === "javascript") {
            var getCall = plugin.Call('this.'+funct);
            this.setupJSON(getCall);
        } else {
            print("Failed to make call");
            return false;
        }
    },

    setupJSON: function(data) {
        if (data) {
        return data;
        } else {
            print("failed to build JSON");
            return false;
        }
    },

}
