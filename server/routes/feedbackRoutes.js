// (4d) CRUD operations for the feedback resource, using the MySQL pool.
const express = require("express");
const router = express.Router();
const db = require("../db");

// CREATE
router.post("/", async (req, res) => {
  try {
    const { faculty_id, student_name, rating, comments } = req.body;
    const [result] = await db.query(
      "INSERT INTO feedback (faculty_id, student_name, rating, comments) VALUES (?, ?, ?, ?)",
      [faculty_id, student_name, rating, comments]
    );
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ all
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM feedback");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ one
router.get("/:id", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM feedback WHERE id = ?", [
      req.params.id,
    ]);
    if (rows.length === 0) return res.status(404).json({ error: "Not found" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE
router.put("/:id", async (req, res) => {
  try {
    const { rating, comments } = req.body;
    await db.query("UPDATE feedback SET rating = ?, comments = ? WHERE id = ?", [
      rating,
      comments,
      req.params.id,
    ]);
    res.json({ message: "Feedback updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE
router.delete("/:id", async (req, res) => {
  try {
    await db.query("DELETE FROM feedback WHERE id = ?", [req.params.id]);
    res.json({ message: "Feedback deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
