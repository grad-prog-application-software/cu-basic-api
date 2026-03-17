const express = require("express");
const router = express.Router();
const { DatabaseSync } = require("node:sqlite");
const db = new DatabaseSync("./db/webhooks.sqlite");

router.get("/", function (req, res, next) {
    const query = db.prepare("SELECT * FROM webhooks");
    const webhooks = query.all()
    return res.render("index", {
        webhooks, 
        noWebhooks: webhooks.length <= 0
    });
});

router.post("/", function (req, res, next) {
    return {}
});


module.exports = router;