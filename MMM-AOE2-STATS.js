/* global Module */

/* Magic Mirror
 * Module: MMM-AOE2-STATS
 *
 * By {{AUTHOR_NAME}}
 * {{LICENSE}} Licensed.
 */

Module.register("MMM-AOE2-STATS", {
	defaults: {
		players: ['912329','196240', '2118083', '878854',  ], //Players that will be shown in the given order default Fabsch user ID
		updateInterval: 20*60*1000,
		retryDelay: 20*60*1000
	},

	requiresVersion: "2.1.0", // Required version of MagicMirror

	start: function() {
		Log.log("Starting module FN: " + this.name);
		var self = this;
		this.testString = 'EMPTY';
		this.stats = null;
		
		var dataRequest = null;
		var dataNotification = null;

		//Flag for check if module is loaded
		this.loaded = false;

		// Schedule update timer.
		this.getData();
		
		setInterval(function() {
			self.updateDom();
		}, this.config.updateInterval);
	},

	/*
	 * getData
	 * function example return data and show it in the module wrapper
	 * get a URL request
	 *
	 */
	getData: function() {
		var self = this;
		var retry = true;
		
		if (retry) {
			self.scheduleUpdate((self.loaded) ? -1 : self.config.retryDelay);
		}
		
		this.sendSocketNotification('MMM-AOE2-STATS-REQUEST', this.config.players);
	},
	

	/* scheduleUpdate()
	 * Schedule next update.
	 *
	 * argument delay number - Milliseconds before next update.
	 *  If empty, this.config.updateInterval is used.
	 */
	scheduleUpdate: function(delay) {
		var nextLoad = this.config.updateInterval;
		if (typeof delay !== "undefined" && delay >= 0) {
			nextLoad = delay;
		}
		nextLoad = nextLoad ;
		var self = this;
		setTimeout(function() {
			self.getData();
		}, nextLoad);
	},

	getDom: function() {
		var self = this;
		console.log(this.stats);
		if (null == this.stats) {
		var wrapper = document.createElement("div");
		var labelDataRequest = document.createElement("label");
			labelDataRequest.innerHTML = 'Loading stats...';//this.translate("TITLE");
			wrapper.appendChild(labelDataRequest);
		}else {
			var wrapper = document.createElement('table');
			wrapper.className = 'bright xsmall';

			let headerRow = document.createElement('tr');
			headerRow.className = 'normal header-row';
			this.createTableCell(headerRow, "Name", true, 'username-header', true); 	//this.translate('USER_NAME'), true, 'username-header', true);
			this.createTableCell(headerRow, "Ranking",true, 'ranking-header');		//this.translate('SCORE'), this.config.showScore, 'score-header');
			this.createTableCell(headerRow, "ELO",true, 'elo-header');			//this.translate('MATCHES_PLAYED'), this.config.showMatchesPlayed, 'matches-played-header');
			this.createTableCell(headerRow, "Highest ELO",true, 'helo-header');	//this.translate('KILLS'), this.config.showKills, 'kills-header');
			
			wrapper.appendChild(headerRow);

			for (let i = 0; i < this.stats.length; ++i) {
				let row = document.createElement('tr');
				row.className = 'normal bright stats-row';

				const stat = this.stats[i];
				console.log("Stat:", stat);
				this.createTableCell(row, stat.name, true, 'username', true);
				this.createNumberTableCell(row, stat.ranking, true, 'ranking');
				this.createNumberTableCell(row, stat.elo, true, 'ELO');
				this.createNumberTableCell(row, stat.high_elo, true, 'Max. ELO');

				wrapper.appendChild(row);
			}
		}
		return wrapper;
	},

	getStyles: function () {
		return [
			"MMM-AOE2-STATS.css",
		];
	},
	
	// Creates a table row cell.
	// @param row - The table row to add cell to.
	// @param number - The number to show.
	// @param show - Whether to actually show.
	createNumberTableCell: function(row, number, show, className)
	{
		if (!show)
			return;

		const text = new Intl.NumberFormat().format(number);
		this.createTableCell(row, text, show, className);
	},

	// Creates a table row cell.
	// @param row - The table row to add cell to.
	// @param text - The text to show.
	// @param show - Whether to actually show.
	// @param leftAlign - True to left align text. False to center align.
	createTableCell: function(row, text, show, className, leftAlign = false)
	{
		if (!show)
			return;

		let cell = document.createElement('td');
		cell.innerHTML = text;
		cell.className = className;
		
		if (leftAlign)
			cell.style.cssText = 'text-align: left;';
		else
			cell.style.cssText = 'text-align: right;';

		row.appendChild(cell);
	},


	// socketNotificationReceived from helper
	socketNotificationReceived: function (notification, payload) {
		console.log("Working notification system. Notification:", notification, "payload: ", payload);
		if(notification === "MMM-AOE2-STATS-NOTIFICATION_TEST") {
			// set dataNotification
			this.dataNotification = payload;
			this.updateDom();
		}
		if(notification === "MMM-AOE2-STATS_RESPONSE"){
			this.stats = payload.data;
		}
	}
});
