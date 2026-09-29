const express = require("express");
const bcrypt = require("bcryptjs");
const router = express.Router();
const db = require("../db");
const { defaultPasswordFor } = require("../passwordUtil");

// GET all users — password hashes are never included in the response.
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT id, name, role, must_change_password AS mustChangePassword
       FROM users ORDER BY role, name`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// (4d) CREATE — this is where the HOD registers a student, faculty, or
// another admin/HOD account. The ID is generated, and the password is set
// to the default rule automatically, then returned once so the HOD can
// hand it to that person.
router.post("/register", async (req, res) => {
  try {
    const { name, role } = req.body;
    if (!name || !role) {
      return res.status(400).json({ error: "Name and role are required." });
    }

    const prefix = role === "student" ? "STU" : role === "faculty" ? "FAC" : "HOD";
    const [[{ count }]] = await db.query("SELECT COUNT(*) AS count FROM users WHERE role = ?", [role]);
    const id = `${prefix}${String(200 + count + 1).padStart(3, "0")}`;

    const defaultPassword = defaultPasswordFor(name);
    const hash = await bcrypt.hash(defaultPassword, 10);

    await db.query(
      "INSERT INTO users (id, name, role, password_hash, must_change_password) VALUES (?, ?, ?, ?, TRUE)",
      [id, name, role, hash]
    );

    res.status(201).json({ id, name, role, password: defaultPassword, mustChangePassword: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
