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
              answers, rating AS overallRating,
              strengths, improvements, suggestions,
              submitted_at AS submittedAt
       FROM feedback
       ORDER BY submitted_at DESC`
    );

    // mysql2 returns JSON columns already parsed, but guard against string
    // form too (e.g. if the driver/config ever changes).
    const parsed = rows.map((row) => ({
      ...row,
      answers: typeof row.answers === "string" ? JSON.parse(row.answers) : row.answers,
    }));

    res.json(parsed);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// (4d) CREATE — one submission per student, per subject, per faculty (a
// subject can have more than one faculty, reviewed separately). The
// database's UNIQUE KEY also enforces this, but checking first gives a
// clean error message instead of a raw SQL constraint error reaching the
// client.
router.post("/", async (req, res) => {
  try {
    const {
      subjectId,
      subject,
      faculty,
      studentId,
      studentName,
      answers,
      overallRating,
      strengths,
      improvements,
      suggestions,
    } = req.body;

    if (!subjectId || !faculty || !studentId || !answers || !overallRating) {
      return res.status(400).json({ error: "Missing required feedback fields." });
    }

    // Every category must have every question answered (1-5) before this
    // counts as a valid submission — mirrors the frontend's own check.
    const allAnswered = Object.values(answers).every(
      (list) => Array.isArray(list) && list.length > 0 && list.every((v) => v >= 1 && v <= 5)
    );
    if (!allAnswered) {
      return res.status(400).json({ error: "All rating questions must be answered." });
    }

    const [existing] = await db.query(
      "SELECT id FROM feedback WHERE student_id = ? AND subject_id = ? AND faculty_name = ?",
      [studentId, subjectId, faculty]
    );
    if (existing.length > 0) {
      return res.status(409).json({ error: "Feedback already submitted for this faculty." });
    }

    await db.query(
      `INSERT INTO feedback
         (subject_id, subject_name, faculty_name, student_id, student_name,
          answers, rating, strengths, improvements, suggestions)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        subjectId,
        subject,
        faculty,
        studentId,
        studentName,
        JSON.stringify(answers),
        overallRating,
        strengths || null,
        improvements || null,
        suggestions || null,
      ]
    );

    res.status(201).json({ message: "Feedback submitted." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;