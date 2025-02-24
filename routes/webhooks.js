const express = require("express");
const router = express.Router();
const passport = require("passport");

const { DatabaseSync } = require("node:sqlite");
const db = new DatabaseSync("./db/webhooks.sqlite");

/* GET questions listing. */
router.get("/",
    passport.authenticate("header", { session: false }),
    function (req, res, next) {
        const query = db.prepare("SELECT * FROM webhooks");
        return res.json(query.all());
    });

/* CREATE a new question. */
router.post("/",
    passport.authenticate("header", { session: false }),
    function (req, res, next) {
        const { url, type } = req.body;

        if (!url || !type) {
            res.status(400).json({ error: "Please provide the url and type field - Your fault" });
            return;
        }
        
        if (type !== "event" && type !== "question") {
            res.status(400).json({ error: "the only valid values for type are 'event' or 'question'  - Your fault" });
            return;
        }

        const query = db.prepare("INSERT INTO webhooks (type, url) VALUES (?,?)");
        const result = query.run(type, url);

        if (result.lastInsertRowid) {

            res.status(201).json({id: result.lastInsertRowid });
            return;
        }
        res.status(500).json({ error: "Something wrong happened on our side - My Fault" });

    });


module.exports = router;