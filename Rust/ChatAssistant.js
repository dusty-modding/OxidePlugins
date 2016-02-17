var ChatAssistant = {
	Title: 'Chat Assistant',
	Author: 'Killparadise',
	Version: V(1, 0, 0),
	Description : "Handles Placing prefixes in chat, coloring chat, etc.",

	init: function() {

	},

	OnServerInitialized: function() {
		print('ChatAssistant: Locating ParaAPI...');
		if(!ParaAPI) {
			print('ChatAssistant: CRITICAL ERROR: ParaAPI NOT FOUND, now exiting...');
			Unload();
			return false;
		} else {
			print('ChatAssistant: ParaAPI located, Installing.');
			if(ParaAPI) {
				print('ChatAssistant: Successfully Installed ParaAPI Instance.');
			}
		}
		this.setupPlugin();
	},
}