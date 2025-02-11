const { DatabaseSync } = require("node:sqlite");
const db = new DatabaseSync("./db/questions.sqlite");

function getQuestion(id) {
    const query = db.prepare("SELECT * FROM questions WHERE id = ?");
    return query.get(id);
}



module.exports = { getQuestion }