const express = require("express");
const router = express.Router();
const db = require("../db");

// GET all feedback. The frontend filters this down per-faculty or
// per-student — a small enough dataset for a mini-project that a separate
// query-param filter isn't necessary, and it keeps one code path for
// Faculty and Admin portals to both consume.
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT subject_id AS subjectId, subject_name AS subject, faculty_name AS faculty,
              student_id AS studentId, student_name AS studentName,
              rating, comments, submitted_at AS submittedAt
       FROM feedback
       ORDER BY submitted_at DESC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// (4d) CREATE — one submission per student per subject. The database's
// UNIQUE KEY also enforces this, but checking first gives a clean error
// message instead of a raw SQL constraint error reaching the client.
router.post("/", async (req, res) => {
  try {
    const { subjectId, subject, faculty, studentId, studentName, rating, comments } = req.body;

    if (!subjectId || !faculty || !studentId || !rating || !comments) {
      return res.status(400).json({ error: "Missing required feedback fields." });
    }

    const [existing] = await db.query(
      "SELECT id FROM feedback WHERE student_id = ? AND subject_id = ?",
      [studentId, subjectId]
    );
    if (existing.length > 0) {
      return res.status(409).json({ error: "Feedback already submitted for this subject." });
    }

    await db.query(
      `INSERT INTO feedback (subject_id, subject_name, faculty_name, student_id, student_name, rating, comments)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [subjectId, subject, faculty, studentId, studentName, rating, comments]
    );

    res.status(201).json({ message: "Feedback submitted." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
