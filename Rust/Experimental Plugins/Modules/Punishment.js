function Punishment(title, author, version, args) {
  this.Title = title;
  this.Author = author;
  this.Version = version;
  this.moduleData = args[0];
  this.moduleConfig = args[1];
  this.moduleConfig.punishments = this.moduleConfig.punishments || {
    message: "You killed a fellow <color={color}>{tree}</color> You've lost an additonal <color=orange>{karma}</color>",
    rates: [{
      "rank": 0,
      "multiplier": 2
    }, {
      "rank": 0.5,
      "multiplier": 2.5
    }, {
      "rank": 1,
      "multiplier": 3
    }, {
      "rank": 2,
      "multiplier": 4
    }, {
      "rank": 3,
      "multiplier": 5
    }, {
      "rank": 4,
      "multiplier": 6
    }, {
      "rank": 5,
      "multiplier": 7
    }, {
      "rank": 6,
      "multiplier": 8
    }]
  };
}

Punishment.prototype = {
  punishHandler: function(killer, victimID, killerID) {
    var punish = this.moduleConfig.punishments.rates;
    var karma = 0;
    var replace = {
      color: "lime",
      tree: "Hero",
      karma: modifier
    };
    for (var i = 0; i < punish.length; i++) {
      if (this.moduleData.PlayerData[killerID].Rank === punish[i].rank) {
        karma = this.moduleConfig.main[i].karmaModifier * punish[i].multiplier;
        modifier = karma - this.moduleConfig.main[i].karmaModifier;
      } else {
        modifier = Math.floor((Math.random() * 40) + 1);
      }
    }

    if (this.moduleData.PlayerData[victimID].Karma >= 0 && this.moduleData.PlayerData[killerID].Karma > 0) {

      this.moduleData.PlayerData[killerID].Karma -= modifier;
      killer.SendChatMessage(this.moduleConfig.punishments.message.replace(/\{color\}|\{tree\}|\{karma\}/gi, function(x){return replace[x];}));
    } else if (this.moduleData.PlayerData[victimID].Karma < 0 && this.moduleData.PlayerData[killerID].Karma < 0) {
      replace.color = "red";
      replace.tree = "Bandit";

      this.moduleData.PlayerData[killerID].Karma += modifier;
      killer.SendChatMessage(this.moduleConfig.punishments.message.replace(/\{color\}|\{tree\}|\{karma\}/gi, function(x){return replace[x];}));
    }
    RanksAndTitles.saveData();
  },

  OnEntityDeath: function(entity, hitinfo) {

    var dh = API.deathHandler({victim: entity, killer: hitinfo.Initiator});
    if (dh) this.punishHandler(dh.killer, dh.victimID, dh.killerID);
    return false;
    // this.moduleData = data.GetData("RanksandTitles");
    // var killer = hitinfo.Initiator,
    //   victim = entity;
    // if (killer === null || victim === null || !killer.ToPlayer() || !victim.ToPlayer()) return false;
    // var killerID = rust.UserIDFromPlayer(killer),
    //   victimID = rust.UserIDFromPlayer(victim);
    // this.punishHandler(killer, victimID, killerID);
  }
};
