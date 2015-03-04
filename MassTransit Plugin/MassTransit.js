var MassTransit = {
    Title: "Mass Transit",
    Author: "Killparadise",
    Version: V(0, 1, 0),
    HasConfig: true,
    Init: function() {
        print('Loaded Rules from Config: ' + this.Config.setRules.length);
        this.loadSetupData();
        command.AddChatCommand("mtran", this.Plugin, "cmdSwitch");
    },

    LoadDefaultConfig: function() {
        this.Config.Settings = {
            authLvl = 2,
                playersCanUse = true,
                useEconomics = true,
                transitPerms = true
        }
        this.Config.Perms = [{
            "name": "lvl 1",
            "playeruse": true,
            "playerCost": true,
            "adminCost": false
        }]
    },

    loadSetupData: function() {
        TransitData = data.GetData("MassTransit");
        TransitData = TransitData || {};
        TransitData.Transits = TransitData.Transits || {};
        TransitData.Transits[name] = TransitData.Transits[name] || {};
        TransitData.Transits[name].Cost = TransitData.Transits[name].Cost || 0;
        TransitData.Transits[name].Perms = TransitData.Transits[name].Perms || {};
        TransitData.Transits[name].Active = TransitData.Transits[name].Active || true;
        TransitData.Transits[name].CountDown = TransitData.Transits[name].CountDown || 0;
        TransitData.Transits[name].Start = TransitData.Transits[name].Start || {};
        TransitData.Transits[name].End = TransitData.Transits[name].End || {};
    },

    saveData: function() {
        //Save our data to our titles data file
        data.SaveData('RanksandTitles');

    },

    cmdSwitch: function(player, cmd, args) {
        var authLvl = player.net.connection.authLevel;
        switch (args[0]) {
            case "set":
                if (authLvl >= this.Config.Settings.authLvl) {
                    this.setTransit(player, cmd, args);
                } else {
                    rust.SendChatMessage(player, "Transit", "You do not have permission to do that.", "0");
                }
                break;
            case "del":
                if (authLvl >= this.Config.Settings.authLvl) {
                    this.delTransit(player, cmd, args);
                } else {
                    rust.SendChatMessage(player, "Transit", "You do not have permission to do that.", "0");
                }
                break;
            case "use":
                if (playersCanUse) {
                    this.travelTransit(player, cmd, args);
                } else {
                    rust.SendChatMessage(player, "Transit", "Player Transit is unavaliable right now.", "0");
                }
                break;
            case "check":
                this.checkTransits(player, cmd, args);
                break;
            default:
                this.checkOnline(player, cmd, args);
                break;
        }
    },

    setTransit: function(player, cmd, args) {
        //Command looks like: 
        // /mtran set transitname countdown transitcost transitperms
        var position = player.transform.position
        if (position) {
            position.y = position.y + 2
        }
        var start = null,
            end = null;
            var name = args[1];
        if (args.length >= 2) {
            var countDown = args[2];
            var cost = args[3] || "";
            var perms = args[4] || "";
        }
        //Let's get the start and end positions for the transit
        if (TransitData.Transits[name] == null && start = null) {
            TransitData.Transits[name].Start = {
                x1 = position.x, y1 = position.y, z1 = position.z
            };
            start = TransitData.Transits[name].Start
        } else if (start !== null && end = null) {
            TransitData.Transits[name].End = {
                x2 = position.x, y2 = position.y, z2 = position.z
            };
            end = TransitData.Transits[name].End;
        } else {
            rust.SendChatMessage(player, "Transit", "That name is already in use!", "0");
        }

        //Check if a countDown is set and add it to our Transit
        if (Number(countDown) > 0) {
            TransitData.Transits[name].CountDown = Number(countDown);
        }

        //Now we need to set the cost of our transit if a value is set.
        if (Number(cost) > 0) {
            TransitData.Transits[name].Cost = Number(cost);
        }

        //Next we will set persm if needed
        if (perms) {
            TransitData.Transits[name].Perms = perms;
        }

        if(TransitData.Transits[name]) {
            rust.SendChatMessage(player, "Transit", "Transit Setup Finished with the Values of:", "0");
            rust.SendChatMessage(player, "Transit", "Start: " +"X: " +ransitData.Transits[name].Start.x1+" Y: "+ransitData.Transits[name].Start.y1+" Z: "+ransitData.Transits[name].Start.z1 , "0");
            rust.SendChatMessage(player, "Transit", "End: " +"X: " +ransitData.Transits[name].End.x2+" Y: "+ransitData.Transits[name].End.y2+" Z: "+ransitData.Transits[name].End.z2 , "0");
            rust.SendChatMessage(player, "Transit", "Named: "+TransitData.Transits[name], "0");
            rust.SendChatMessage(player, "Transit", "Countdown: "+TransitData.Transits[name].CountDown, "0");
            rust.SendChatMessage(player, "Transit", "Cost: "+TransitData.Transits[name].Cost, "0");
            rust.SendChatMessage(player, "Transit", "Perms: "+TransitData.Transits[name].Perms, "0");
            rust.SendChatMessage(player, "Transit", "-------------------End-------------------", "0");
        } else {
            rust.SendChatMessage(player, "Transit", "Setup Failed to build new Transit", "0");
        }

        this.saveData();

    },

    travelTransit: function(player, cmd, args) {

    },

    checkTransits: function(player, cmd, args) {

    },

    checkOnline: function(player, cmd, args) {

    }
}
