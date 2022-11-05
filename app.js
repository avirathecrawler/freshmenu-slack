'use strict';

const express = require('express');
const fs = require('fs');
const request = require('request');
//const webhook = require('./webhook.js');
var bodyParser = require('body-parser');
//var slackpost = require('./slack_postMessage.js');
var morgan = require('morgan');

const app = express();

//this function is starting rtm in slack. Need to work on if new user getts added to db, kind of appending data.
//getsqlData.getbotUrl();

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
app.use(morgan());
app.use('/', express.static(__dirname + '/html'));
require('./app/routes.js')(app);

app.listen(8080);