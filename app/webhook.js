'use strict'

const websocket = require('ws');
const request = require('request');
const mysql = require('mysql');
const uuid = require('uuid');
var findToken = require('../config/database.js').findToken;

const postMessageUrl = 'https://slack.com/api/chat.postMessage';

var formData = {
    'token': '',
    'channel': '',
    'text': '',
    'username': 'Fresh Menu Bot',
    'as_user': true
};

var lamboData = {
    'track_id': '',
    'client_message_unique_id': null,
    'user_id': 'user_id sent by slack',
    'group_id': null,
    'message_type': '',
    'page_id': '722210391265203',
    'message': '',
    'client_type': 'slack'
}

var lamboEndPoints = {
    'url': 'https://lamborghini-dev.herokuapp.com/api/v1/query/',
    requestData: function (userName, text, postBack) {
        if(postBack){
            lamboData.message_type = 'postback';
            lamboData.message = text;
        }else{
            lamboData.message_type = 'text';
            lamboData.message = text;
        }
        lamboData.user_id = 'slack-' + userName;
        lamboData.track_id = uuid();
        request.post(lamboEndPoints.url, { form: lamboData }, function (error, httpRes, body) {
            if (error) console.error(error);

            if (httpRes.statusCode === 200) {
                //console.log(body);
                //console.log(JSON.stringify(lamboData));
                console.log("**********data sent to lambo**********");
            }
        });
    }
}

function sendMessage(teamName, channelName, message) {

    formData.token = findToken(teamName);
    formData.channel = channelName;
    formData.text = message;

    //create a function here which will send data to lambo. Then use data. Beautify it and then send it back.

    request.post('https://slack.com/api/chat.postMessage', { form: formData }, function (error, httpRes, body) {
        if (error) console.error(error);

        if (httpRes.statusCode === 200) {
            //console.log(body);
        }
    });
};

function startSession(rtmUrl, botToken) {
    var slackWebSocket = new websocket(rtmUrl);
    slackWebSocket.on('message', function (data) {
        data = JSON.parse(data);
        //catch different events like team joined to save info in db.
        if (data.type == 'message') {
            //console.log(data);
            if (data.text && !data.bot_id) {
                lamboEndPoints.requestData(data.user, data.text);//data going to lambo search engine
            }
        }
    });
}

exports.lamboEndPoint = function(userName, payload){
    
    lamboEndPoints.requestData(userName, payload, 1);
}

exports.webhook = function (botToken) {
    //get rtm session url first, then connect webhook to given url and write test cases.

    request.post({ "url": "https://slack.com/api/rtm.start", form: { 'token': botToken } }, function (err, httpRes, body) {

        if (err) console.log(err);

        if (httpRes.statusCode === 200) {
            //call function here that would take rtm url and start it.
            startSession(JSON.parse(body).url, botToken);
        }
    });
};