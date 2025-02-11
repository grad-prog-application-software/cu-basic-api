const express = require("express");
const router = express.Router();
const passport = require("passport");

const { DatabaseSync } = require("node:sqlite")
const db = new DatabaseSync("./db/events.sqlite");

const data = require("../db/data-events");

// Get all events
router.get("/", function (req, res, next) {
    const query = db.prepare("SELECT * FROM events");
    const events = query.all();
    res.json(events);
});


// Get a single event by ID
router.get("/:id", function (req, res, next) {
    const query = db.prepare("SELECT * FROM events WHERE event_id = ?");
    const event = query.get(req.params.id);
    if (event) {

        res.json(event);
        return;
    }

    else {
        res.status(404).send("Event not found");
        return;
    }
});


// Create a new event
router.post("/", passport.authenticate("header", { session: false }),
    function (req, res, next) {
        const insert = db.prepare("INSERT INTO events (event_name, description, date, location, organizer) VALUES (?, ?, ?, ?, ?)");
        const result = insert.run(req.body.event_name, req.body.description, req.body.date, req.body.location, req.body.organizer);

        if (result.lastInsertRowid) {

            res.status(201).json(data.getEvent(result.lastInsertRowid));
            return;
        }
        else { res.status(500).send(); return; }

    });

// Update an event by ID
router.put("/:id", passport.authenticate("header", { session: false }),
    function (req, res, next) {
        const update = db.prepare("UPDATE events SET event_name = ?, description = ?, date = ?, location = ?, organizer = ? WHERE event_id = ?");
        const result = update.run(req.body.event_name, req.body.description, req.body.date, req.body.location, req.body.organizer, req.params.id);
        return res.status(200).send();
    });

// Delete an event by ID
router.delete("/:id", passport.authenticate("header", { session: false }),
    function (req, res, next) {
        const deleteEvent = db.prepare("DELETE FROM events WHERE event_id = ?");
        deleteEvent.run(req.params.id);
        res.status(204).send();
    });

// RSVP endpoint

// RSVP to an event
router.post("/:id/rsvps", function (req, res, next) {
    const create = db.prepare("INSERT INTO rsvps (event_id, user_name, response) VALUES (?, ?, ?)");
    const result = create.run(req.params.id, req.body.user_name, req.body.response);

    if (result.lastInsertRowid) {
        const query = db.prepare("SELECT * FROM rsvps WHERE rsvp_id = ?");
        return res.json(query.get(result.lastInsertRowid));
    }
    else {
        res.status(500).send();
        return;
    }
});

// Get RSVPs for an event
router.get("/:id/rsvps", passport.authenticate("header", { session: false }),
    function (req, res, next) {
        const query = db.prepare("SELECT * FROM rsvps WHERE event_id = ?");
        const rsvps = query.all(req.params.id);

        res.json(rsvps);
    });

module.exports = router;
