/* Magic Mirror
 * Node Helper: {{MODULE_NAME}}
 *
 * By {{AUTHOR_NAME}}
 * {{LICENSE}} Licensed.
 */

var NodeHelper = require("node_helper");
var request = require('request');
var counter = 0;
module.exports = NodeHelper.create({
    start: function function_name () {
        console.log("Starting module helper FN: " + this.name);
    },
	
	extractStats: function(json) {
		console.log("Extract Stats");
		let rank 	= 0;
		let rating 	= 0;
		let highestRating = 0;
		let player_name = "no name";
		
		if(json.leaderboard[0].name != null) player_name =  json.leaderboard[0].name;
		if(json.leaderboard[0].rank != null) rank +=  json.leaderboard[0].rank;
		if(json.leaderboard[0].rating != null) rating += json.leaderboard[0].rating;
		if(json.leaderboard[0].highest_rating != null) highestRating += json.leaderboard[0].highest_rating;
		
		//creating the result
		const stats = { name: player_name,
						ranking: rank,
						elo: rating,
						high_elo: highestRating,
		};
		return stats;	//return the result back
	},
	
	// Override socketNotificationReceived method.
	/* socketNotificationReceived(notification, payload)
	 * This method is called when a socket notification arrives.
	 *
	 * argument notification string - The identifier of the noitication.
	 * argument payload mixed - The payload of the notification.
	 */
	socketNotificationReceived: function(notification, payload) {
		if (notification === "MMM-AOE2-STATS-NOTIFICATION_TEST") {
			//console.log("Working notification system. Notification:", notification, "payload: ", payload);
			// Send notification
			//this.sendNotificationTest(this.anotherFunction()); //Is possible send objects :)
		}
		if (notification === "MMM-AOE2-STATS-REQUEST") {
			console.log("MMM-AOE2-STATS-REQUEST", payload, "Payload length:", payload.length, "Counter:", counter);
			counter = 0;
			let stats = [];
			var self = this;
			
			if(payload.length != undefined){
				for (let i = 0; i < payload.length; ++i) {
					let user_url = 'https://aoe2.net/api/leaderboard?game=aoe2de&leaderboard_id=3&profile_id='+payload[i];
					console.log("URL:" + user_url);
					
					request({
					url: user_url,
					method: 'GET'
						}, function(error, response, body) {
							var json = JSON.parse(body);
							const stat = self.extractStats(json);
							stats.push(stat);
							if (!error && response.statusCode == 200) {
								console.log("MMM-AOE2-STATS [ok]");	
								counter += 1;
								self.isResponseReady(payload.length, stats);
							}
						});
				}
			}		
			
		}
	},
	
	isResponseReady: function(num, pstats){
		var self = this;
		console.log("Counter:", counter);
		if(counter == num){
			self.sendNotificationAOE({data: pstats} );
		}
	},
	
		// Example function send notification test
	sendNotificationAOE: function(payload) {
		this.sendSocketNotification("MMM-AOE2-STATS_RESPONSE", payload);
	},

	// Example function send notification test
	sendNotificationTest: function(payload) {
		this.sendSocketNotification("MMM-AOE2-STATS-NOTIFICATION_TEST", payload);
	},

	// this you can create extra routes for your module
	extraRoutes: function() {
		var self = this;
		this.expressApp.get("/MMM-AOE2-STATS/extra_route", function(req, res) {
			// call another function
			values = self.anotherFunction();
			res.send(values);
		});
	},

	// Test another function
	anotherFunction: function() {
		return {date: new Date()};
	}
});
