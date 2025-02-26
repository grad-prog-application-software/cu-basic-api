const { DatabaseSync } = require("node:sqlite");
const db = new DatabaseSync("./db/webhooks.sqlite");

async function sendUpdate(type, payload) {
    const query = db.prepare("SELECT * FROM webhooks where type = ?");
    const webhooks = query.all(type);

    for (const webhook of webhooks) {
        try {
            const response = await fetch(webhook.url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload)
            });

            if(!response.ok) {
                throw new Error(`not a success response code: ${error.status}`);
            }
        } catch (e) {
            console.log(e);
        }
    }
}

module.exports = { sendUpdate }