const { DatabaseSync } = require("node:sqlite");
const db = new DatabaseSync("./db/events.sqlite");

function getEvent(id) {
    const query = db.prepare("SELECT * FROM events WHERE event_id = ?");
    return query.get(id);
}



module.exports = { getEvent }