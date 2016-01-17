Slack = {};

Slack.sendToChannel = function(video) {

	let teams = Slackteams.find({}).fetch(),
			botName = "TheFamily",
			botIcon = "https://yt3.ggpht.com/-OHMegElwYDQ/AAAAAAAAAAI/AAAAAAAAAAA/Z0W66g-RchI/s100-c-k-no/photo.jpg",
			syncSlackPostMessage = Meteor.wrapAsync(SlackAPI.chat.postMessage);

	_.each(teams, function(team) {
		console.log('posting to channel '+ team.channel);
		try {
			let result = syncSlackPostMessage(
				team.accessToken,
				team.channel,
				":coffee::wave: Direct link of our newest video: https://www.youtube.com/watch?v="+ video.youtubeId+" :heart::tv:",
				{
					username: botName,
					as_user: false,
					// attachment to complete the video message
					attachments: [
						{
							"fallback": "New Startupfood video online - "+ video.title,
							"title": "Become a better entrepreneur watching TheFamily's videos on YouTube ! :muscle: :tv:",
							"title_link": "https://www.youtube.com/user/Startupfood",
							// push any special content there
							"text": "This new video "+ video.title +" is about:\n"+ video.description,
							"image_url": "http://static1.squarespace.com/static/54c94daae4b0f2976a2f5ee8/t/55a681d9e4b06c464d359cc0/1436975585059/?format=1000w",
							// you can specify as much as you want attachments
							"fields": [
								{
									"title": "Online videos",
									"value": video.totalVideosResults +" :tv:",
									"short": true
								},
								{
									"title": "Want more? :rocket:",
									"value": "<http://www.koudetatondemand.co/|Watch KOUDETAT for free! :tada:>",
									"short": true
								}
							],
							"color": "#10102A"
						}
					],
					unfurl_text: false,
					unfurl_media: true, // allow the the embed video to be shown (cf. direct link to youtube video)
					icon_url: botIcon
				}
			);

			// log content send to the team
			team.messages.push({
				video: video.youtubeId,
				ts: result.ts
			});

			// update the collection
			Slackteams.update({accessToken: team.accessToken}, {$set: {messages: team.messages}}, function(err, res) {
				console.log('logged post '+ post._id +' sent to '+ result.channel +' at '+ result.ts);
			});

		} catch(error) {
			// error handling: somebody has revoked the Startupfood app access to their team
			if (!error.ok && error.error === 'token_revoked') {
				Slackteams.remove({_id: team._id});
				console.log('token revoked by user -> team removed from the collection!');
			}
		}
	});
}