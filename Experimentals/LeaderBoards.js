var LeaderBoards = {
    Title: "Leaderboards",
    Author: "Killparadise",
    Version: V(1, 0, 0),
    HasConfig: true,
    Init: function() {
        global = importNamespace("");
        RanksAPI = plugins.Find("RanksAndTitles");
        this.boardData();
        command.AddChatCommand("lb", this.Plugin, "switchCmd");
    },

    OnServerInitialized: function() {
        msgs = this.Config.Messages;
        prefix = this.Config.Prefix;
        this.updateConfig();
    },

    updateConfig: function() {
        if (this.Config.Version !== 1.0) {
            this.LoadDefaultConfig();
            print("Config outdated... Updating.")
        } else {
            return false;
        }
    },

    LoadDefaultConfig: function() {
        this.Config.Version = 1.0;
        this.Config.Settings = {
            "countPvE": true,
            "countPvP": true,
            "useRanksAndTitles": false,
            "countGather": true
        };
        this.Config.Connect = {
            "host": "localHost",
            "port": 3306,
            "database": "rust",
            "username": "root",
            "password": ""
        };
        this.Config.Points = [{
            "Wolf": 5,
            "Bear": 10,
            "Deer": 3,
            "Board": 2,
            "Chicken": 1,
            "Player": 15,
            "Trees": 1,
            "Stones": 1,
            "Metal Ore": 1,
            "Sulfer Ore": 1,
            "AirDrop": 25
        }];
    },

    buildTable: function(playerData) {
        var database = mysql.OpenDb(this.Config.Connect.host, this.Config.Connect.port, this.Config.Connect.database, this.Config.Connect.username, this.Config.Connect.password);
        var sql = mysql.NewSql();
        /*----------------------------------
                    Ranks API
        ------------------------------------*/
        if (RanksAPI && this.Config.Settings.useRanksAndTitles) {
            for (var key in playerData) {
                if (playerData.hasOwnProperty(key)) {
                    sql.Append("CREATE TABLE IF NOT EXISTS LeaderBoards");
                    sql.Append("INSERT INTO LeaderBoards key VALUES playerData[key]");
                    mysql.ExecuteNonQuery(sql, database);
                }
            }
            /*---------------------END------------------*/
        } else {

        }


    },

    sendData: function(data) {
        var sql = mysql.NewSql();
        sql.Append()
    },

    switchCmd: function(player, cmd, args) {

    },

    OnEntityDeath: function(entity, hitinfo) {
        var countPvE = this.Config.Settings.countPvE,
            countPvP = this.Config.Settings.countPvP,
            countGather = this.Config.Settings.countGather,
            useRanks = this.Config.Settings.useRanksAndTitles;
        var victim = entity,
            attacker = hitinfo.Initiator;

            if (useRanks && attacker.ToPlayer() && victim.ToPlayer() && attacker.displayName !== victim.displayName) {
                this.useRanks(attacker, victim);
            }

            if (countPVP && victim.ToPlayer() && attacker.ToPlayer() && attacker.displayName !== victim.displayName) {
                this.pvpKill(attacker, victim);
            } else if (countPvE && attacker.ToPlayer() && !victim.ToPlayer()) {
                this.pveKill(attacker, victim);
            }
    },

    OnGather: function(dispenser, entity, item) {
        if (dispenser === "rock") {

        } else if (dispenser === "tree") {

        }
    }

}
