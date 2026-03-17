const express = require("express");
const router = express.Router();
const { getQuestion } = require("../db/data");
const { DatabaseSync } = require("node:sqlite");
const db = new DatabaseSync("./db/questions.sqlite");
const dbEvents = new DatabaseSync("./db/events.sqlite");
const {sendUpdate} = require("../db/data-webhooks");
const data = require("../db/data-events");

/* GET questions listing. */
router.get("/",
    function (req, res, next) {
        return res.render("index")
    });

/* CREATE a new question. */
router.post("/questions", (req, res, next) => {
    const { tags, title } = req.body;

    if (!tags || !title) {
        return res.render("index", { error: "All fields are required" });
    }

    const query = db.prepare("INSERT INTO questions (tags, view_count, creation_date, title, is_answered) VALUES (?, ?, ?, ?, ?)");
    const result = query.run(tags, 0, new Date().toISOString(), title, false.toString());

    if (result.lastInsertRowid) {
        const question = getQuestion(result.lastInsertRowid);
        sendUpdate("question", question);
        return res.render("index", { success: "vraag goed toegevoegd" });
    }
    return res.render("index", { error: "Something wrong happened" });

});

/* CREATE a new event. */
router.post("/events", (req, res, next) => {
    const insert = dbEvents.prepare("INSERT INTO events (event_name, description, date, location, organizer) VALUES (?, ?, ?, ?, ?)");
    const result = insert.run(req.body.event_name, req.body.description, req.body.date, req.body.location, req.body.organizer);

    if (result.lastInsertRowid) {
        const event = data.getEvent(result.lastInsertRowid);
        sendUpdate("event", event);
        return res.render("index", { success: "evenement goed toegevoegd" });
    }
    return res.render("index", { error: "Something wrong happened" });

});

router.get("/docs", (req, res, next) => {
    return res.render("docs");
})


module.exports = router;