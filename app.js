'use strict'
const PAGE_ACCESS_TOKEN =
  "EAADpaZAvQkBEBAJnWM1nbDcjCT0bm61wzMwNNZCcoL35eSIA3DvbqSgyYNEKxxAFZB0tUgdhXZBEgtVVcDbVC9msmKMxaXDaQf5U2Wu3lk5vZBDUwDHsz5PUEKzy5VqbbBldNAsKIusxmNpTrNXuwdQil71eUdGsUOhMNhc7KrQZDZD";

var port = process.env.PORT || 3000;

const express = require('express');
const bodyparser = require('body-parser');
const request = require('request');
const apiai = require('apiai');

const app = express();
const apiaiapp = apiai("6ed416310a72408095ddd4bae851de2a");

app.listen(port, () => {
    console.log(`running on port no. ${port}`);
})

app.get('/', (req,res) => {
    res.send('webhook working in the background');
})

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




