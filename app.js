'use strict'
const PAGE_ACCESS_TOKEN =
  "EAADpaZAvQkBEBAOLm1UegMEaNdkoaeIzrY6LRsca8vzPM5bgQfdttEcIAnF1AVDRPEqHEqTv8rbYy9GWl6w4yEHAEdfStEJHlxa1wrX9HoGL8svewHZCU2s47tGwIdLK3dimeKpSzSGrcSNwyx4KVqaZAYGKB0K9hEKrAAzxgZDZD";

var port = process.env.PORT || 3000;

const express = require('express');
const path = require("path");
const bodyparser = require('body-parser');
const request = require('request');
const apiai = require('apiai');
var hbs = require("handlebars");

const app = express();
const apiaiapp = apiai("6ed416310a72408095ddd4bae851de2a");

app.listen(port, () => {
    console.log(`running on port no. ${port}`);
})

const publicPath = path.join(__dirname, "/public");
app.use(express.static(publicPath));
app.set("viewengine", "hbs");

app.get('/', (req,res) => {
    res.sendFile(path.join(publicPath + '/index.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(publicPath + '/admin.html'));
});

app.get('/fbwebhook', (req, res) => {
    console.log(req.body);
    if (req.query['hub.mode'] && req.query['hub.verify_token'] === 'VERIFY_TOKEN') {
        res.status(200).send(req.query['hub.challenge']);
    } else {
        res.status(403).end();
    }
});

app.post('/fbwebhook', (req, res) => {
    console.log(req.body);
    if (req.body.object === 'page') {
        req.body.entry.forEach((entry) => {
            entry.messaging.forEach((event) => {
                if (event.message && event.message.text) {
                    processMessage(event);
                }
            });
        });
        res.status(200).end();
    }
});

function processMessage(event) {
    let sender = event.sender.id;
    let text = event.message.text;

    let apiai = apiaiApp.textRequest(text, {
        sessionId: 'broadcastbot'
    });


        apiai.on('response', (response) => {
            console.log(response);
            let aiText = response.result.fulfillment.speech;
            request({
                url: 'https://graph.facebook.com/v2.6/me/messages',
                qs: { access_token: PAGE_ACCESS_TOKEN },
                method: 'POST',
                json: {
                    recipient: { id: sender },
                    message: { text: aiText }
                    }
                }, (error, response) => {
                    if (error) {
                        console.log('Error sending message: ', error);
                    } else if (response.body.error) {
                        console.log('Error: ', response.body.error);
                    }
            });
        });

        apiai.on('error', (error) => {
            console.log(error);
        });

    apiai.end();

}




app.post('/fordf', (req, res) => {
    console.log(req.body);

    console.log('*** Call from DialogFlow ***');

    if (req.body.result.action === 'broadcast_message') {

        // Extract the parameter : BusStop
        msg = "hello there";

        res.json({
            speech: msg,
            displayText: msg,
            source: 'institutebroadcast'
        });
    }
});




