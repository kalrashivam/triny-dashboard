'use strict'
const PAGE_ACCESS_TOKEN ='';

var port = process.env.port || 3000;

const express = require('express');
const bodyparser = require('body-parser');
const request = require('request');
const apiai = require('apiai');

app = express();
const apiaiapp = apiai("");

app.listen(port, () => {
    console.log(`running on port no. ${port}`);
})

app.get('/', (req,res) => {
    res.send('webhook working in the background');
})

app.get('/fbwebhook', (req, res) => {
    if (req.query['hub.mode'] && req.query['hub.verify_token'] === 'VERIFY_TOKEN') {
        res.status(200).send(req.query['hub.challenge']);
    } else {
        res.status(403).end();
    }
});

app.post('/fbwebhook', (req,res) => {
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
        sessionId: 'institutebot'
});

}




