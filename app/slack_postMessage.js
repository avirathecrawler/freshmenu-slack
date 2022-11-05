//here we will have a function along with data from lambo. Now here send back data to slack after beautifying it.
'use strict';
const request = require('request');
const mysql = require('mysql');

module.exports = function (jsonData) {

    //console.log(jsonData);

    //slack request functions

    let formData = {
        'token': '',
        'text': '',
        'attachments': '',
        'channel': '',
<<<<<<< HEAD
        'replace_original' : false,
=======
>>>>>>> 12414adbbb348b371ccbc8b4b7078a10b6110f04
        'as_user': true
    };

    let attachments = [], actions = [], actionsNode = [];

    let getSlackData = {
        'getIm': function (userName, callback) {
            request.post('https://slack.com/api/im.open', { form: { 'token': formData.token, 'user': userName } }, function (error, httpRes, body) {
                if (error) console.error(error);

                if (httpRes.statusCode === 200) {
                    formData.channel = JSON.parse(body).channel.id;
                    callback();
                }
            });
        },
        'postSlack': function () {
            //console.log(formData);
            request.post('https://slack.com/api/chat.postMessage', { form: formData }, function (error, httpRes, body) {
                if (error) console.error(error);
                //console.log(body);
                if (httpRes.statusCode === 200) {
                    //console.log("data sent back to slack");
                    formData.token = '';
                    formData.text = '';
                    formData.channel = '';
                    formData.attachments = '';
                }
            });
        }
    }

    function makeReplies(buttonArray) {

        //console.log("length of button array is " + buttonArray.length);
        for (let i = 0; i < buttonArray.length; i++) {
            actions.push({
                "name": buttonArray[i].title,
                "text": buttonArray[i].title,
                "type": "button",
                "value": buttonArray[i].payload
            });
        }
    };

    function generateActions(keyboardOptions) {
        for (let i = 0; i < keyboardOptions.length; i++) {
            actionsNode.push({
                "name": keyboardOptions[i].display_text,
                "text": keyboardOptions[i].display_text,
                "type": "button",
<<<<<<< HEAD
                "value": keyboardOptions[i].response_text,
                "replace_original" : false
=======
                "value": keyboardOptions[i].response_text
>>>>>>> 12414adbbb348b371ccbc8b4b7078a10b6110f04
            });
        }
    };

    function generateReceiptElements(receiptElements) {
        for (let i = 0; i < receiptElements.length; i++) {
            attachments.push({
                "title": receiptElements[i].title,
                "thumb_url": receiptElements[i].image_url,
                "fields": [{
                    "title": receiptElements[i].subtitle,
                    "value": receiptElements[i].quantity,
<<<<<<< HEAD
                    "short": true,
                    "replace_original" : false
=======
                    "short": true
>>>>>>> 12414adbbb348b371ccbc8b4b7078a10b6110f04
                }]
            });
        }
    };

    function checkAddress(address) {
        if (address) {
            return address;
        } else {
            return "Not given.\n we will take your address in next step."
        }
    }

    if (jsonData.title) {
        formData.text = jsonData.title;
    } else {
        formData.text = " ";
    }

    if (jsonData.nodes) {
        //console.log("length of node is " + jsonData.nodes.length);
        for (let i = 0; i < jsonData.nodes.length; i++) {
            //console.log(jsonData.nodes[i].keyboard.options.length);
            generateActions(jsonData.nodes[i].keyboard.options);
<<<<<<< HEAD
            attachments.push({ "title": jsonData.nodes[i].title, "image_url": jsonData.nodes[i].images[0], "text": jsonData.nodes[i].details, "callback_id": 'show-menu', "actions": actionsNode });
=======
            attachments.push({ 'title': jsonData.nodes[i].title, 'image_url': jsonData.nodes[i].images[0], 'text': jsonData.nodes[i].details, 'callback_id': 'show-menu', "actions": actionsNode });
>>>>>>> 12414adbbb348b371ccbc8b4b7078a10b6110f04
            //feeling so good after initializing array to null here :)
            actionsNode = [];
        }
    }

    if (jsonData.receipt) {
        //console.log("inside receipt condition");
        formData.text = "Order receipt";
        generateReceiptElements(jsonData.receipt.elements);
        attachments.push({
            "fields": [{
                "title": "Address",
                "value": checkAddress(jsonData.receipt.address),
<<<<<<< HEAD
                "short": false,
                "replace_original" : false
=======
                "short": false
>>>>>>> 12414adbbb348b371ccbc8b4b7078a10b6110f04
            }]
        });
        attachments.push(
            {
                "fields": [{
                    "title": "Payment method",
                    "value": jsonData.receipt.payment_method,
<<<<<<< HEAD
                    "short": false,
                    "replace_original" : false
=======
                    "short": false
>>>>>>> 12414adbbb348b371ccbc8b4b7078a10b6110f04
                }]
            });
        attachments.push({
            "fields": [{
                "title": "Total Cost",
                "value": String.fromCharCode(8377) + jsonData.receipt.summary.total_cost,
<<<<<<< HEAD
                "short": false,
                "replace_original" : false
=======
                "short": false
>>>>>>> 12414adbbb348b371ccbc8b4b7078a10b6110f04
            }]
        });
        //formData.attachments = JSON.stringify(attachments);
        //console.log(jsonData.receipt.elements[0]);
    }

    if (jsonData.quick_replies) {
        makeReplies(jsonData.quick_replies.buttons);
        attachments.push({ "text": "Please choose any button blow.", "callback_id": "quick-replies", "actions": actions });
        //formData.attachments = JSON.stringify(attachments);
    }

    formData.attachments = JSON.stringify(attachments);

    //initializing array values to null
    attachments = [], actions = [], actionsNode = [];

    let connection = mysql.createConnection({
        host: '217.199.187.199',
        user: 'cl56-freshmenu',
        password: 'freshmenu',
        database: 'cl56-freshmenu'
    });
    connection.query('SELECT `teamId` FROM `user-team` WHERE `userId` = ?', [jsonData.user_id.slice(6)], function (error, results, fields) {
        if (error) console.error(error);
        //results[0].teamId;
        if (results) {
            connection.query('SELECT `slack_bot_token` FROM `usersdb` WHERE `teamid` = ?', [results[0].teamId], function (error, results, fields) {
                if (error) console.error(error);
                //results[0].slack_bot_token;
                if (results) {
                    formData.token = results[0].slack_bot_token;
                    getSlackData.getIm(jsonData.user_id.slice(6), getSlackData.postSlack);
                }
            });
        }
        connection.end();
    });
};