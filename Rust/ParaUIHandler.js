var ParaUIHandler = {
	Title: "Para UI Handler",
	Author: "Killparadise",
	Version: V(1, 0, 0),
	Description : "Handles GUI throughtout the API",

	Init: function() {
		this.CUI = importNamespace("Oxide.Game.Rust.Cui");
		this.parent = 'parauihandler.main';
	},

	OnServerInitialized: function() {
		command.AddChatCommand("parahide", this.Plugin, "destroyGUI");
		command.AddChatCommand("parashow", this.Plugin, "createGUI");
	},

	createGUI: function(player, cmd, args) {
		var steamID = rust.UserIDFromPlayer(player);
		for(var n in this.Config.UIs) {
			this.buildUI(player, this.Config.UIs[n], APIData.PlayerData[steamID].Rankings);
		}
	},

	LoadDefaultConfig: function() {
		this.Config = {
			"Version": "1.0.0",
			"AnchorMin": "1 1",
			"AnchorMax": "1 1",
			"Color": "0.1 0.1 0.1 0.75",
			"UIs": {}
		};
	},

	Unload: function() {
		for (var player in global.BasePlayer) {
			destroyGUI(global.BasePlayer[player]);
		}
	},

	OnPlayerDisconnected: function(player) {
		this.destroyGUI(player);
	},

	attachToUI: function(gui) {

	},

	updateUI: function(data, player, plugin) {
			this.destroyGUI(player);
			this.buildUI(player, this.Config.UIs[plugin], data);
	},

	buildUI: function(player, gui, data) {
		var container = new this.CUI.CuiElementContainer(),
		label = new this.CUI.CuiLabel(),
		button = new this.CUI.CuiButton(),
		statsLabel;
		//Required Items
			var panel = new this.CUI.CuiPanel();
			panel.Image.Color = this.Config.Color;
			panel.RectTransform.AnchorMin = gui.panelPoints.min;
			panel.RectTransform.AnchorMax = gui.panelPoints.max;
			panel.RectTransform.CursorEnabled = false;

		container.Add(panel, 'HUD/Overlay', this.parent);

		label.Text.text = gui.label;
		label.Text.fontSize = gui.labelFontSize;
		label.Text.color = gui.labelColor;
		label.RectTransform.AnchorMin = gui.labelMin;
		label.RectTransform.AnchorMax = gui.labelMax;
		container.Add(label, this.parent);

		//Data Items
		for (var i=0; i<gui.data.length;i++) {
			statsLabel = new this.CUI.CuiLabel();
			statsLabel.Text.text = gui.data[i].toUpperCase()+': ' + data[gui.data[i]];
			statsLabel.Text.fontSize = gui.dataFontSize;
			statsLabel.Text.color = gui.dataColor;
			statsLabel.RectTransform.AnchorMin = gui.dataPoints[i].min;
			statsLabel.RectTransform.AnchorMax = gui.dataPoints[i].max;
			container.Add(statsLabel, this.parent);
		}
		this.CUI.CuiHelper.AddUi(player, container);
	},

	destroyGUI: function(player) {
			this.CUI.CuiHelper.DestroyUi(player, 'parauihandler.main');
	}
};
