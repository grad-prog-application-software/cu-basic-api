const express = require("express");
const router = express.Router();

router.get("/long-wait", function (req, res, next) {
    const wait = getRandomInt(3000, 7000);
    console.log("Received the long waiting call ! ");
    setTimeout(function() {
        res.json({ message: `You've waited ${wait} msec.`});
    }, wait);

  });

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports = router;