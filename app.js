const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const passport = require("passport");
const cors = require("cors");
const { Strategy } = require("passport-http-header-strategy");

const { buildSchema } = require('graphql');
const { createHandler } = require('graphql-http/lib/use/express');



const questions = require("./routes/questions");
const events = require("./routes/events");
const tools = require("./routes/tools");
const webhooks = require("./routes/webhooks.js");

const app = express();
app.use(cors());
app.use(passport.initialize());
passport.use(new Strategy({ header: "X-API-KEY", passReqToCallback: true },
    function (req, token, done) {
        if (token === "letmein") {
            done(null, true);
        } else {
            done(null, false);
        }
    }
));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser())

app.use("/api/questions", questions);
app.use("/api/events", events);
app.use("/api/tools", tools);
app.use("/api/webhooks", webhooks);


// Construct a schema, using GraphQL schema language
const schema = buildSchema(`
  type Question {
    id: ID!
    tags: String
    view_count: Int
    creation_date: String
    title: String
    is_answered: String
  }

  type Query {
    getQuestion(id: ID!): Question
    getQuestions(tag: String): [Question]
  }

  type Mutation {
    createQuestion(tags: String!, title: String!): Question
    updateQuestion(id: ID!, tags: String!, is_answered: String!, title: String!): Question
    partialUpdateQuestion(id: ID!, tags: String, is_answered: String, title: String): Question
    deleteQuestion(id: ID!): Boolean
  }
`);

const { DatabaseSync } = require("node:sqlite");
const db = new DatabaseSync("./db/questions.sqlite");
const { getQuestion } = require("./db/data");
// The rootValue provides a resolver function for each API endpoint
const root = {
    getQuestions({ tag }) {
        if (tag) {
            const query = db.prepare(
                "SELECT * FROM questions WHERE tags LIKE '%, ' || ? || ', %' OR tags LIKE ? || ', %' OR tags LIKE '%, ' || ? OR tags = ?"
            );
            return query.all(tag, tag, tag, tag);
        }
        const query = db.prepare("SELECT * FROM questions");
        return query.all();
    },
    getQuestion({ id }) {
        const question = getQuestion(id);
        if (!question) {
            throw new Error("Question not found");
        }
        const update = db.prepare(
            "update questions set view_count = view_count + 1 where id = ?"
        );
        update.run(id);
        question.view_count = question.view_count + 1;
        return question;
    },
    createQuestion({ tags, title }) {
        const query = db.prepare(
            "INSERT INTO questions (tags, view_count, creation_date, title, is_answered) VALUES (?, ?, ?, ?, ?)"
        );
        const result = query.run(tags, 0, new Date().toISOString(), title, "false");
        if (result.lastInsertRowid) {
            const question = getQuestion(result.lastInsertRowid);
            return question;
        }
        throw new Error("Something wrong happened on our side");
    },
    updateQuestion({ id, tags, is_answered, title }) {
        const query = db.prepare(
            "UPDATE questions SET tags = ?, is_answered = ?, title = ? WHERE id = ?"
        );
        const result = query.run(tags, is_answered, title, id);
        if (result.changes === 0) {
            throw new Error("Question not found");
        }
        return getQuestion(id);
    },
    patchQuestion({ id, tags, is_answered, title }) {
        const fields = { tags, is_answered, title };
        const queryParts = [];
        const values = [];
        for (const [key, value] of Object.entries(fields)) {
            if (value !== undefined) {
                queryParts.push(`${key} = ?`);
                values.push(value);
            }
        }
        if (queryParts.length === 0) {
            throw new Error("At least one field is required");
        }
        values.push(id);
        const query = db.prepare(
            `UPDATE questions SET ${queryParts.join(", ")} WHERE id = ?`
        );
        const result = query.run(...values);
        if (result.changes === 0) {
            throw new Error("Question not found");
        }
        return getQuestion(id);
    },
    deleteQuestion({ id }) {
        const query = db.prepare("DELETE FROM questions WHERE id = ?");
        const result = query.run(id);
        if (result.changes === 0) {
            throw new Error("Question not found");
        }
        return true;
    },
};
// Create and use the GraphQL handler.
app.all(
    "/graphql",
    createHandler({
        schema: schema,
        rootValue: root,
    }),
);

module.exports = app;
