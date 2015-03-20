var SourceAPI = {
    Title: "Source API",
    Author: "Killparadise",
    Version: V(1, 0, 0),
    HasConfig: false,
    Init: function() {
        global = importNamespace("");
        this.getData();
        command.AddConsoleCommand("source.get", this.Plugin, "getPlugin");
    },

    OnServerInitialized: function() {
        print("SourceAPI Setup. Locating Plugins");
    },

    //-------------------------------------------
    //          Handle incoming calls
    //-------------------------------------------
    //  Calls a function using the .Call method
    //       handles 1 argument/parameter
    //-------------------------------------------
    handleCall: function(name, func, data) {
        try {
                var temp = name.Call(func, data);

            return temp;
        } catch (e) {
            this.errorHandler(e);
        }
    },

    //--------------------------------------------------
    //    Grabs plugins using names (Case sensative)
    //--------------------------------------------------
    //    takes an array to search for and find all 
    //    given plugins via their name (in the array)
    //          and returns the plugin.
    //--------------------------------------------------
    grabPlugin: function(plugins) {
        try {

            plugins.forEach(function(element, index) {
                if (element !== null) return plugins.Find(element);
            });

        } catch (e) {
            this.errorHandler(e);
        }

    },

    //----------------------------------------------------------------------
    //            Call Functions only to return the function
    // ---------------------------------------------------------------------
    //              This will call a function and return 
    //              that function without executing data
    // ---------------------------------------------------------------------
    getFunction: function(name, func, data) {
        var plugin = this.grabPlugin(name);
        var temp = plugin.Object.func
        return temp;
    },

    //--------------------------------------------------------
    //            Call Functions only to return data
    // -------------------------------------------------------
    //           This will call a function and return 
    //           data from that functions execution
    //              take a single argument
    // -------------------------------------------------------
    getFunctionData: function(name, func, data) {
        var plugin = this.grabPlugin(name);
        var temp = plugin.Object.func(data);
        return temp;
    },

    //--------------------------------------------------------
    //            Call Functions only to return data
    // -------------------------------------------------------
    //           This will call a function with 
    //           two parameters and return the executed
    //              data from that function.
    // -------------------------------------------------------
    getFunctionDataTwo: function(name, func, arg1, arg2) {
        var plugin = this.grabPlugin(name);
        var temp = plugin.Object.func(arg1, arg2);
        return temp;
    },

    //--------------------------------------------------------
    //                 Error Handling
    // -------------------------------------------------------
    //           Handle any errors and display them 
    //           accross the console to be reported
    //                  and for debugging.
    // -------------------------------------------------------
    errorHandler: function(err) {
        print("Error Handler Debugging...");
        for (var key in err) {
            print(key + " " + err[key])
        }
        print("Please send this to Killparadise if issue persists");
    }
}
