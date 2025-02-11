const express = require("express");
const router = express.Router();

const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./db/events.sqlite");

// Get all events
router.get("/events", function (req, res, next) {
    const query = "SELECT * FROM events";
    db.all(query, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// Get a single event by ID
router.get("/events/:id", function (req, res, next) {
    const query = "SELECT * FROM events WHERE event_id = ?";
    db.get(query, [req.params.id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (row) {
            res.json(row);
        } else {
            res.status(404).send("Event not found");
        }
    });
});

// Create a new event
router.post("/events", function (req, res, next) {
    const query = "INSERT INTO events (event_name, description, date, location, organizer) VALUES (?, ?, ?, ?, ?)";
    const params = [req.body.event_name, req.body.description, req.body.date, req.body.location, req.body.organizer];
    db.run(query, params, function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        db.get("SELECT * FROM events WHERE event_id = ?", [this.lastID], (err, row) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.status(201).json(row);
        });
    });
});

// Update an event by ID
router.put("/events/:id", function (req, res, next) {
    const query = "UPDATE events SET event_name = ?, description = ?, date = ?, location = ?, organizer = ? WHERE event_id = ?";
    const params = [req.body.event_name, req.body.description, req.body.date, req.body.location, req.body.organizer, req.params.id];
    db.run(query, params, function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (this.changes > 0) {
            db.get("SELECT * FROM events WHERE event_id = ?", [req.params.id], (err, row) => {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }
                res.json(row);
            });
        } else {
            res.status(404).send("Event not found");
        }
    });
});

// Delete an event by ID
router.delete("/events/:id", function (req, res, next) {
    const query = "DELETE FROM events WHERE event_id = ?";
    db.run(query, [req.params.id], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (this.changes > 0) {
            res.status(204).send();
        } else {
            res.status(404).send("Event not found");
        }
    });
});

// RSVP endpoints

// RSVP to an event
router.post("/events/:id/rsvp", function (req, res, next) {
    const query = "INSERT INTO rsvps (event_id, user_name, response) VALUES (?, ?, ?)";
    const params = [req.params.id, req.body.user_id, req.body.response];
    db.run(query, params, function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        db.get("SELECT * FROM rsvps WHERE rsvp_id = ?", [this.lastID], (err, row) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.status(201).json(row);
        });
    });
});

// Get RSVPs for an event
router.get("/events/:id/rsvps", function (req, res, next) {
    const query = "SELECT * FROM rsvps WHERE event_id = ?";
    db.all(query, [req.params.id], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

module.exports = router;
