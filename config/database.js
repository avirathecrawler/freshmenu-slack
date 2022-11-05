'use strict';

var mysql = require('mysql');
var webhook = require('../app/webhook.js').webhook;
const request = require('request');

var connection = mysql.createConnection({
    host: '217.199.187.199',
    user: 'cl56-freshmenu',
    password: 'freshmenu',
    database: 'cl56-freshmenu'
});

//also span rtm for all the webhooks
function webhooks() {
    //connection.connect();
    connection.query('SELECT `slack_bot_token` FROM `usersdb`', function (error, results, fields) {
        for (var i = 0; i < results.length; i++) {

            webhook(results[i].slack_bot_token);
        }
    });
    //connection.end();
}

function getTeamDetails(teamDetails){
    //connection.connect();
    //console.log(teamDetails);
    for(var i=0; i<teamDetails.length; i++){
        connection.query('INSERT INTO `user-team` (`userId`, `teamId`, `firstName`,`lastName`) VALUES (?,?,?,?)', [teamDetails[i].id, teamDetails[i].team_id, teamDetails[i].profile.first_name, teamDetails[i].last_name], function (error, results, fields) {
        if (error) console.error(error);
    });
    }
    //connection.end();
}

webhooks();

exports.savetoDb = function (teamId, teamName, accessToken, botToken) {
    //connection.connect();
    connection.query('INSERT INTO `usersdb` (`teamid`, `team_name`, `slack_access_token`,`slack_bot_token`) VALUES (?,?,?,?)', [teamId, teamName, accessToken, botToken], function (error, results, fields) {
        if (error) console.error(error);
    });
    //connection.end();
    //again have bot token as user, then have api call to get team details, then insert info in db.
    request.post('https://slack.com/api/users.list',{form:{'token':accessToken}}, function(error, httpRes, body){
        if(httpRes.statusCode === 200){
            //pass body of this function to other function to save info to db
            getTeamDetails(JSON.parse(body).members); 
        }
    });
}

exports.findToken = function(teamName){
    //console.log(teamName);
    connection.query('SELECT `slack_bot_token` FROM `usersdb` WHERE `teamid` = ?', [teamName], function (error, results, fields) {
        if (error) console.error(error);
        //console.log(results[0]);
        return results[0].slack_bot_token;
    });
}

exports.findTeamId = function(userId){
    //use different table here in this case.
    connection.query('SELECT `teamId` FROM `user-team` WHERE `userId` = ?', [userId], function(error, results, fields){
        if(error) console.error(error);
        return results[0].teamId;
    });
}