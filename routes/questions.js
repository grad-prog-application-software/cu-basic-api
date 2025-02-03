const express = require("express");
const router = express.Router();
const { getQuestion } = require("../db/data");

const { DatabaseSync } = require("node:sqlite");
const db = new DatabaseSync("./db/questions.sqlite");

/* GET questions listing. */
router.get("/", function (req, res, next) {
  const filter = req.query.tag;

  if (filter) {
    const query = db.prepare("SELECT * FROM questions WHERE tags LIKE '%, ' || ? || ', %' OR tags LIKE ? || ', %' OR tags LIKE '%, ' || ? OR tags = ?");
    return res.json(query.all(filter, filter, filter, filter));
  }

  const query = db.prepare("SELECT * FROM questions");
  res.json(query.all());
});

/* GET a single question by id. */
router.get("/:id", function (req, res, next) {
  const id = req.params.id;
  const question = getQuestion(id);

  if (!question) {
    return res.status(404).json({ error: "Question not found" });
  }
  else {
    const update = db.prepare("update questions set view_count = view_count + 1 where id = ?");
    update.run(id);
    question.view_count = question.view_count + 1;
  }

  res.json(question);
});

/* CREATE a new question. */
router.post("/",
  function (req, res, next) {
    const { tags, title } = req.body;

    if (!tags || !title) {
      res.status(400).json({ error: "All fields are required - Your fault" });
      return;
    }

    const query = db.prepare("INSERT INTO questions (tags, view_count, creation_date, title, is_answered) VALUES (?, ?, ?, ?, ?)");
    const result = query.run(tags, 0, new Date().toISOString(), title, false.toString());

    if (result.lastInsertRowid) {
      res.status(201).json(getQuestion(result.lastInsertRowid));
      return;
    }
    res.status(500).json({ error: "Something wrong happened on our side - My Fault" });

  });

/* UPDATE a question by id. */
router.put("/:id", function (req, res, next) {
  const id = req.params.id;
  const { tags, is_answered, title } = req.body;

  if (!tags || !is_answered || !title) {
    if (is_answered === false) {
      return res.status(400).json({ error: "Please pass false as a string - Your fault RTFM" });
    }
    return res.status(400).json({ error: "All fields are required - Your fault" });
  }

  const query = db.prepare("UPDATE questions SET tags = ?, is_answered = ?, title = ? WHERE id = ?");
  const result = query.run(tags, is_answered, title, id);

  if (result.changes === 0) {
    return res.status(404);
  }

  res.json(getQuestion(id));
});

/* PATCH (partial update) a question by id. */
router.patch("/:id", function (req, res, next) {
  const id = req.params.id;
  const fields = req.body;
  const queryParts = [];
  const values = [];

  for (const [key, value] of Object.entries(fields)) {
    queryParts.push(`${key} = ?`);
    values.push(value);
  }

  if (queryParts.length === 0) {
    return res.status(400).json({ error: "At least one field is required - Your fault" });
  }

  values.push(id);
  const query = db.prepare(`UPDATE questions SET ${queryParts.join(', ')} WHERE id = ?`);
  const result = query.run(...values);

  if (result.changes === 0) {
    return res.status(404).json({ error: "Question not found - Your fault" });
  }

  res.json(getQuestion(id));
});

/* DELETE a question by id. */
router.delete("/:id", function (req, res, next) {
  const id = req.params.id;
  const query = db.prepare("DELETE FROM questions WHERE id = ?");
  const result = query.run(id);

  if (result.changes === 0) {
    return res.status(404).json({ error: "Question not found - Your fault" });
  }

  res.status(204).json();
});

module.exports = router;
