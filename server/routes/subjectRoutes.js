const express = require("express");
const router = express.Router();
const db = require("../db");

// GET all subjects, each with its list of teaching faculty — this is what
// powers the Student portal's "browse subjects, then pick a faculty" flow,
// and is always read live so a reassignment the HOD makes shows up
// immediately for students and in the Faculty Directory.
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

// (4d) UPDATE — replaces every subject a given faculty member is assigned
// to teach with the list the HOD submits. Faculty change subjects/batches
// every semester, so this is meant to be called with the faculty's
// *complete* new list each time (not an incremental add/remove) — simpler
// for the Admin portal's checkbox UI to reason about.
router.put("/faculty-assignments", async (req, res) => {
  try {
    const { facultyName, subjectIds } = req.body;
    if (!facultyName || !Array.isArray(subjectIds)) {
      return res.status(400).json({ error: "facultyName and subjectIds[] are required." });
    }

    await db.query("DELETE FROM subject_faculty WHERE faculty_name = ?", [facultyName]);

    if (subjectIds.length > 0) {
      const values = subjectIds.map((subjectId) => [subjectId, facultyName]);
      await db.query("INSERT INTO subject_faculty (subject_id, faculty_name) VALUES ?", [values]);
    }

    res.json({ message: "Subjects updated.", facultyName, subjectIds });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;