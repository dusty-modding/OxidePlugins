var SourceConfig = {
        Title: "Source Config",
        Author: "Killparadise",
        Version: V(1, 0, 0),
        ResourceId: 0,

        Init: function() {
            global = importNamespace("");
            this.LoadDefaultConfig();
            command.AddChatCommand("cSource", this.Plugin, "grabJSON");
            command.AddConsoleCommand("source.start", self.Object, "grabJSON");
        },

        OnServerInitialized: function() {
            this.msgs = this.Config.Messages;
            if (this.Config.AutoUpdate)
        },

        LoadDefaultConfig: function() {
            this.Config.Version = "1.0";
            this.Config.Plugins = this.Config.Plugins || ["RanksAndTitles", "BountyBoard"];
            this.Config.AutoUpdate = true;
            this.Config.Messages = this.Config.Messages || {
                "start": "Source Config Starting...",
                "auto": "Checking for updates...",
                "update": "Updating {comp}...",
                "fix": "Fixing {comp}...",
                "updated": "Updated: {comp}",
                "fixed": "Fixed: {comp}",
                "noPlugin": "Plugin names in config empty. No updates needed",
                "noFunc": "sourceUpdate Function not found in {plugin}",
                "noUpdate": "{plugin} Config already updated. No Update needed.",
                "finished": "Finished updateing {finished}"
            }
        },

        grabPlugins: function() {
            var i = 0,
                p = this.Config.Plugins.length,
                data = [];
            if (this.Config.Plugins > 0) {
                for (i; i < p; i++) {
                    var name = this.Config.Plugins[i];
                    var plugin = plugins.Find(this.Config.Plugins[i]);
                    var obj = {
                        PluginName: name,
                        PluginData: plugin
                    };
                    data.push(obj);
                }
                return obj;
            } else {
                print(this.msgs.noPlugin);
            }
            return false;
        },

        grabJSON: function() {
            for (var i = 0; i < this.Config.Plugins.length; i++) {
            	var path = "/json/"+this.Config.Plugins[i];
                var json = JSON.parse(path)
                this.startUpdate(json);
            }
        },

        startUpdate: function(data) {
            var pObj = this.grabPlugins();
            print(this.msgs.start);

            for (var key in pObj) {
                var temp = pObj.PluginData[key];

                var count = temp.Call("sourceUpdate");
                if (count === null || count === undefined) {
                    print(this.msgs.noFunc.replace("{plugin}", pObj.PluginName[key]));
                } else if (count >= 0) {
                    if (count > 1) print(this.msgs.finished.replace("{finished}", pObj.PluginName[key] + " there were " + count + " of changes."));
                    if (count === 1) print(this.msgs.finished.replace("{finished}", pObj.PluginName[key] + " there was " + count + " change."));
                } else {
                    print(this.msgs.noUpdate.replace("{plugin}", pObj.PluginName[key]));
                }
            }
        }

        if (data !== null) {
        	var config = data.config,
        		newLen = data.New.length,
        		updateLen = data.Updates.length,
        		fixLen = data.Fixes.length;

        		if (config)

        } else {
        	print(this.msgs.noUpdate.replace("{plugin}", pObj.PluginName));
        }

    },
    /*
        sourceUpdate: function() {
        	return "["..data.."]";
        },

        data array(lua):
        data = self:Config, 
    */
    callUpdate: function() {
        var pObj = this.grabPlugins();
        print(this.msgs.start);

        for (var key in pObj) {
            var temp = pObj.PluginData;
            var data = temp.Call("sourceUpdate");
            this.runUpdate(data);
        }



    },

    runUpdate: function(data) {

    }
}
