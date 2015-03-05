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
            "authLvl": 2,
            "playersCanUse": true,
            "useEconomics": true,
            "transitPerms": true
        }
        this.Config.Terms = {
            "Transit": "Transit",
            "Currency": "Dollars"
        }
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
            var cost = args[3] || 0;
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

        if (TransitData.Transits[name]) {
            rust.SendChatMessage(player, "Transit", this.Config.Terms.Transit + " Setup Finished with the Values of:", "0");
            rust.SendChatMessage(player, "Transit", "Start: " + "X: " + ransitData.Transits[name].Start.x1 + " Y: " + ransitData.Transits[name].Start.y1 + " Z: " + ransitData.Transits[name].Start.z1, "0");
            rust.SendChatMessage(player, "Transit", "End: " + "X: " + ransitData.Transits[name].End.x2 + " Y: " + ransitData.Transits[name].End.y2 + " Z: " + ransitData.Transits[name].End.z2, "0");
            rust.SendChatMessage(player, "Transit", "Named: " + TransitData.Transits[name], "0");
            rust.SendChatMessage(player, "Transit", "Countdown: " + TransitData.Transits[name].CountDown, "0");
            rust.SendChatMessage(player, "Transit", "Cost: " + TransitData.Transits[name].Cost, "0");
            rust.SendChatMessage(player, "Transit", "Perms: " + TransitData.Transits[name].Perms, "0");
            rust.SendChatMessage(player, "Transit", "-------------------End-------------------", "0");
        } else {
            rust.SendChatMessage(player, "Transit", "Setup Failed to build new " + this.Config.Terms.Transit, "0");
        }

        this.saveData();

    },

    delTransit: function(player, cmd, args) {
        // cmd setup: /mtran del transitname
        var temp = [];
        if (args.length == 2 && arg[0] === "del") {
            var transit = arg[1];
        } else {
            rust.SendChatMessage(player, "Transit", "Delete Command invalid please use /mtran del transitname", "0");
        }

        for (var key in TransitData.Transits) {
            if (transit === TransitData.Transits[key]) {
                delete TransitData.Transits[key];
            }
        }
        rust.SendChatMessage(player, "Transit", "Successfully deleted " + this.Config.Terms.Transit + ": " + TransitData.Transits[key], "0");
        this.saveData();
    },

    travelTransit: function(player, cmd, args) {
        //TODO: write check to make sure traveller is in the transit region, 
        //write checks for cost, and perms
        //write checks for the status of the desired transit system
        var currPos = player.transform.position;
        var distanceCheck = this.getDistance(player, currPos)
        for (var key in TransitData.Transits) {
            var start = TransitData.Transits[key].Start;
            var end = TransitData.Transits[key].End;
            if (distanceCheck[1] === "Start") {
                print("Found Start Pos");
                rust.ForcePlayerPosition(player, start.x1, start.y1, start.z1);
            } else if (distanceCheck[1] === "End") {
                print("Found End Pos");
                ust.ForcePlayerPosition(player, start.x2, start.y2, start.z2);
            } else {
                rust.SendChatMessage(player, "Transit", "No " + this.Config.Terms.Transit + " Found!", "0");
            }
        }
    },

    checkTransits: function(player, cmd, args) {
        //cmd setup: /mtran check transitname
        if (args.length == 2 && arg[0] === "check") {
            var transit = arg[1];
        } else {
            rust.SendChatMessage(player, "Transit", "Check command invalid please use /mtran check transitname", "0");
        }

        if (TransitData.Transits[transit]) {
            rust.SendChatMessage(player, "Transit", this.Config.Terms.Transit + " Cost: " + TransitData.Transits[transit].Cost + " " + this.Config.Terms.Currency, "0");
            rust.SendChatMessage(player, "Transit", this.Config.Terms.Transit + " CountDown: " + TransitData.Transits[transit].CountDown, "0");
            rust.SendChatMessage(player, "Transit", this.Config.Terms.Transit + " Status: " +
                if (TransitData.Transits[transit].Active) "Online": "Offline", "0");
        } else {
            rust.SendChatMessage(player, "Transit", this.Config.Terms.Transit + " not found!", "0");
        }

    },

    checkOnline: function(player, cmd, args) {
        var count = 0,
            offCount = 0;
        rust.SendChatMessage(player, "Transit", "-------------Online " + this.Config.Terms.Transit + "-------------", "0");
        for (var key in TransitData.Transits) {
            if (TransitData.Transits[key].Active) {
                count++
                rust.SendChatMessage(player, "", TransitData.Transits[key], "0");
            } else {
                offCount++
                rust.SendChatMessage(player, "", TransitData.Transits[key], "0");
            }
        }
        rust.SendChatMessage(player, "Transit", this.Config.Terms.Transit + " Online: " + count, "0");
        rust.SendChatMessage(player, "Transit", this.Config.Terms.Transit + " Offline: " + offCount, "0");
        rust.SendChatMessage(player, "Transit", "----------------------------------------" + offCount, "0");
    },

    getDistance: function(player, playerPos) {
        var xs = 0;
        var ys = 0;
        var temp = [];

        for (var key in TransitData.Transits) {
            var startLoc = TransitData.Transits[key].Start;
            var endLoc = TransitData.Transits[key].End;
            //Starter Locations for Transits
            xs = startLoc.x1 - playerPos.x;
            xs = xs * xs;

            zs = startLoc.z1 - playerPos.z;
            zs = zs * zs;

            //End Locations for Transits
            Endxs = endLoc.x2 - playerPos.x;
            Endxs = Endxs * Endxs;

            Endzs = endLoc.z2 - playerPos.z;
            Endzs = Endzs * Endzs;

            var dist = Math.sqrt(xs + zs);
            var endDist = Math.sqrt(Endxs + Endzs);
            if (dist <= 10) {
                print("Found Closest Point!(Start)");
                temp.push(dist, "Start");
                return temp;
            } else if (endDist <= 10) {
                print("Found Closest Point!(End)");
                temp.push(endDist, "End");
                return temp;
            }
        }
    }
}
