'use strict'

const request = require('request');
var dbInsert = require('../config/database.js').savetoDb;
var webhook = require('./webhook.js').webhook;
var slackpost = require('../app/slack_postMessage.js');
var lamboData = require('./webhook.js').lamboEndPoint;
const mysql = require('mysql');

var requestFunctions = {
    oauth: function (tokenData, callback, res) {
        request.post('https://slack.com/api/oauth.access', tokenData, function (error, httpResponse, body) {
            if (error) console.error(error);

            if (httpResponse.statusCode === 200) {

                callback(JSON.parse(body).access_token, JSON.parse(body).bot.bot_access_token, res);
                //to enable bot when user adds slack app
                webhook(JSON.parse(body).bot.bot_access_token);
            }
        });
    },
    getTeamDetails: function (accessToken, botToken, res) {
        request.post('https://slack.com/api/team.info', { form: { token: accessToken } }, function (error, httpResponse, body) {
            if (error) console.error(error);

            if (httpResponse.statusCode === 200) {
                //inserting information in database.
                dbInsert(JSON.parse(body).team.id, JSON.parse(body).team.name, accessToken, botToken);
                res.redirect('http://' + JSON.parse(body).team.domain + '.slack.com');
            }
        });
    }
}

module.exports = function (app) {

    app.get('/slack/oauth', function (req, res) {
        let data = {
            form: {
                'client_id': '80031789600.108061704017',
                'client_secret': '82390d3e2efaaa699173c519a2a095a0',
                'code': req.query.code
            }
        };

        requestFunctions.oauth(data, requestFunctions.getTeamDetails, res);
    });

    app.post('/api/v1/intent', function (req, res) {
        console.log("***********data came from lambo.*************");
        //function here will take data and send back to slack.
        slackpost(req.body);
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify({ "status": "OK" }));
    });

    app.post('/api/slack/buttons', function (req, res) {
        //console.log("ok console logging it!");
        //console.log(req.body);
        let buttonData = JSON.parse(req.body.payload);
        //console.log(buttonData);
        lamboData(buttonData.user.id, buttonData.actions[0].value);
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify({ "text":"Please wait","replace_original": false }));
    });

    app.get('/api/v1/profile', function (req, res) {
        //req.query.user_id
        //console.log("checking request in profile");
        //console.log(req.query.user_id);
        let connection = mysql.createConnection({
            host: '217.199.187.199',
            user: 'cl56-freshmenu',
            password: 'freshmenu',
            database: 'cl56-freshmenu'
        });
        connection.query('SELECT * FROM `user-team` WHERE `userId` = ?', [req.query.user_id.slice(6)], function (error, results, fields) {
            if (error) console.error(error);
            //console.log(results[0].firstName);
            if (results) {
                res.setHeader('Content-Type', 'application/json');
                res.send(JSON.stringify({ 'first_name': results[0].firstName, 'last_name': results[0].lastName, 'profile_pic': '', 'locale': 'EN_IN', 'timezone': '0530', 'gender': 'male' }));
            }
        });
    });
}