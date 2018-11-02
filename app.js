'use strict'
const PAGE_ACCESS_TOKEN =
  "EAADpaZAvQkBEBAOLm1UegMEaNdkoaeIzrY6LRsca8vzPM5bgQfdttEcIAnF1AVDRPEqHEqTv8rbYy9GWl6w4yEHAEdfStEJHlxa1wrX9HoGL8svewHZCU2s47tGwIdLK3dimeKpSzSGrcSNwyx4KVqaZAYGKB0K9hEKrAAzxgZDZD";

var port = process.env.PORT || 3000;

const express = require('express');
const path = require("path");
const bodyParser = require('body-parser');
const request = require('request');
const apiai = require('apiai');
var hbs = require("handlebars");
const cors = require("cors");
const mongoose = require("mongoose");
const errorHandler = require("errorhandler");
const session = require("express-session");

const app = express();
const apiaiapp = apiai("6ed416310a72408095ddd4bae851de2a");




mongoose.promise = global.Promise;

//Configure isProduction variable
const isProduction = process.env.NODE_ENV === 'production';

//Configure our app
app.use(cors());
app.use(require('morgan')('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({ secret: 'passport-tutorial', cookie: { maxAge: 60000 }, resave: false, saveUninitialized: false }));



if (!isProduction) {
    app.use(errorHandler());
}

//Configure Mongoose
mongoose.connect('mongodb://localhost/passport-tutorial');
mongoose.set('debug', true);

// models and routes
require("./models/Users");
require("./config/passport");
app.use(require("./routes"));

//Error handlers & middlewares
if (!isProduction) {
    app.use((err, req, res, next) => {
        res.status(err.status || 500);

        res.json({
            errors: {
                message: err.message,
                error: err,
            },
        });
        next()
    });
}

app.use((err, req, res, next) => {
    res.status(err.status || 500);

    res.json({
        errors: {
            message: err.message,
            error: {},
        },
    });
    next()
});




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

app.post("/admin", (req, res) => {
  res.sendFile(path.join(publicPath + "/user.html"));
});

app.get("/register", (req, res) => {
    return text.toUpperCase();
});

app.use((req, res, next) => {
    res.sendFile(path.join(publicPath + "/register.html"));
});

app.get('/fbwebhook', (req, res) => {
    console.log(req);
    if (req.query['hub.mode'] && req.query['hub.verify_token'] === 'VERIFY_TOKEN') {
        res.status(200).send(req.query['hub.challenge']);
    } else {
        res.status(403).end();
    }
});

app.post('/fbwebhook', (req, res) => {
    console.log(req);
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




