PLUGIN.Title        = "Lua Tests"
PLUGIN.Author       = "KillParadise"
PLUGIN.Version      = V(1, 0, 0)

function PLUGIN:Init()
command.AddChatCommand("lua", this.Plugin, "runTest");
end
function PLUGIN:OnServerInitialized()
    phAPI = plugins.Find("PermissionHandler") or false
end

function PLUGIN:LoadDefaultConfig() 
    self.Config.Version = "1.0.0";
end

local function runTests(player, cmd, args)
	print(API:test(true));
end