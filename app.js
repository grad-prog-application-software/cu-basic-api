const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const passport = require("passport");
const {Strategy} = require("passport-http-header-strategy");

const questions = require("./routes/questions");


const app = express();
app.use(passport.initialize());
passport.use(new Strategy({ header: "X-API-KEY", param: "app_token", passReqToCallback: true },
    function (req, token, done) {
        console.log(token, done);
        if( token === "blablabla"){
            done();
        }
    }
));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser())

app.use("/api/questions", questions);

module.exports = app;
