const { error } = require("console");
const express = require("express");
const router = express.Router();
const { DatabaseSync } = require("node:sqlite");
const db = new DatabaseSync("./db/webhooks.sqlite");

router.get("/", function (req, res, next) {
    const query = db.prepare("SELECT * FROM webhooks");
    const webhooks = query.all()
    return res.render("settings", {
        webhooks,
        noWebhooks: webhooks.length <= 0
    });
});

router.post("/", function (req, res, next) {
    const { url, type } = req.body;
    const webhookQuery = db.prepare("SELECT * FROM webhooks");
    let webhooks; 
    if (!url || !type) {
        webhooks = webhookQuery.all();
        return res.render("settings", { error: "Please provide the url and type field - Your fault", webhooks});
    }

    if (type !== "event" && type !== "question") {
        webhooks = webhookQuery.all();
        return res.render("settings", { error: "the only valid values for type are 'event' or 'question'  - Your fault", webhooks});
    }

    const query = db.prepare("INSERT INTO webhooks (type, url) VALUES (?,?)");
    const result = query.run(type, url);
    if(result.lastInsertRowid) {
        webhooks = webhookQuery.all();
        return res.render("settings", {success: "Webhook goed toegevoegd", webhooks});
    }
});

router.post("/delete", (req,res, next) => {
    const { id } = req.body;

    const query = db.prepare("DELETE from webhooks where id = ?");
    const result = query.run(id);
    
    return res.redirect("/settings");
});

module.exports = router;