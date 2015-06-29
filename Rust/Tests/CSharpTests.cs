
using System.Collections.Generic;
using System;
using System.Reflection;
using System.Data;
using UnityEngine;
using Oxide.Core;
using Oxide.Core.Configuration;
using Oxide.Core.Logging;
using Oxide.Core.Plugins;

namespace Oxide.Plugins
{
[Info("CSharpTests", "KillParadise", "1.0.0")]
    class CSharpTests : RustPlugin
    {
    

    void OnServerInitialized()
        {
            command.AddChatCommand("cs", this.Plugin, "runTest");
        }
    void LoadDefaultConfig() { 
    		
}
}