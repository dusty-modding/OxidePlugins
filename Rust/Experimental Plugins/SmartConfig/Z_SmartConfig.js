var Z_SmartConfig = {
    Title: "SmartConfig",
    Author: "Killparadise",
    Version: V(1, 0, 0),
    HasConfig: true,
    Init: function() {
        var RandT = plugins.Find("RanksAndTitles");
        var BBoard = plugins.Find("BountyBoard");
        RanksAndTitles = RandT.Object;
        BountyBoard = BBoard.Object;
        this.loadData();
        this.buildConfigData
    },

    saveData: function() {
        //Save our data to our titles data file
        data.SaveData('SmartConfig');
    },

    LoadDefaultConfig: function() {
        this.Config.Load = [
            "RanksAndTitles",
            "BountyBoard"
        ];
    },

    loadData: function() {
        SmartConfig = data.GetData('SmartConfig');
        SmartConfig = SmartConfig || {};
        SmartConfig.Configs = SmartConfig.Configs || {};
    }

        buildConfigData: function() {
        for (var i = 0; i < this.Config.Load.length; i++) {
            var plugin = this.Config.Load[i];
            this.LoadSmartConfig(plugin);
        }
    },

    saveConfig: function() {

    },

    LoadSmartConfig: function(data, plugin) {
        var getPlugin = plugins.Find(plugin);
        var getConfig = getPlugin.Object.Config;

        if (data !== null && (getConfig === undefined || getConfig === null)) {
            this.buildJSON(getPlugin, getConfig, data);
            return false;
        }

        if (!SmartConfig.Configs[plugin]) {
            SmartConfig.Configs[plugin] = getConfig;
            this.saveData();
        } else {
            this.updateConfig(data, plugin, getConfig);
        }
    },

    updateConfig: function(data, plugin, config) {
        for (var key in SmartConfig.Configs[plugin]) {
            if (config[key] != SmartConfig.Configs[plugin][key] && data !== null) {
                //update data

                if (SmartConfig.Configs[plugin][key] === config[key] && config[key].smartConfig) {
                    SmartConfig.Configs[plugin][key] = config[key];
                } else {

                }
            }
        }
    },

    buildJSON: function(plugin, config, data) {
    	var config = JSON.parse(data)
    },

    C_update: function(arg) {

    }

}
