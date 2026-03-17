const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const passport = require("passport");
const cors = require("cors");
const {Strategy} = require("passport-http-header-strategy");

const home = require("./routes/index.js");
const settings = require("./routes/settings.js");
const questions = require("./routes/questions");
const events = require("./routes/events");
const tools = require("./routes/tools");
const webhooks = require("./routes/webhooks.js");

const app = express();
// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");

// app.use(express.static(path.join(__dirname, "public")));
app.use(cors());
app.use(passport.initialize());
passport.use(new Strategy({ header: "X-API-KEY", passReqToCallback: true },
    function (req, token, done) {
        if( token === "letmein"){
            done(null, true);
        }else {
            done(null, false);
        }
    }
));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser())

app.use("/", home);
app.use("/settings", settings);
app.use("/api/questions", questions);
app.use("/api/events", events);
app.use("/api/tools", tools);
app.use("/api/webhooks", webhooks);

module.exports = app;
