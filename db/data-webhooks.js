const { DatabaseSync } = require("node:sqlite");
const db = new DatabaseSync("./db/webhooks.sqlite");

async function sendUpdate(type, payload) {
    const query = db.prepare("SELECT * FROM webhooks where type = ?");
    const webhooks = query.get(type);

    for (const webhook of webhooks) {
        try {
            const response = await fetch(webhook.url, {
                method: "POST",
                body: JSON.stringify(payload)
            });

            if(!response.ok) {
                throw new Exception(await response.data());
            }
        } catch (e) {
            console.log(e);
        }
    }
}

module.exports = { sendUpdate }