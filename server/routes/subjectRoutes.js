const express = require("express");
const router = express.Router();
const db = require("../db");

// GET all subjects, each with its list of teaching faculty — this is what
// powers the Student portal's "browse subjects, then pick a faculty" flow.
router.get("/", async (req, res) => {
  try {
    const [subjects] = await db.query("SELECT id, name FROM subjects");
    const [links] = await db.query("SELECT subject_id, faculty_name FROM subject_faculty");

    const result = subjects.map((s) => ({
      id: s.id,
      name: s.name,
      faculty: links.filter((l) => l.subject_id === s.id).map((l) => l.faculty_name),
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
