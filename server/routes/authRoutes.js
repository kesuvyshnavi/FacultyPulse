const express = require("express");
const bcrypt = require("bcryptjs");
const router = express.Router();
const db = require("../db");

// (4d-adjacent) Auth "read" — verifies credentials against the hash stored
// in MySQL. Never sends the hash (or the password) back to the client.
router.post("/login", async (req, res) => {
  try {
    const { id, password } = req.body;
    const [rows] = await db.query("SELECT * FROM users WHERE id = ?", [id]);
    const user = rows[0];

    if (!user) {
      return res.status(401).json({ error: "Incorrect ID or password." });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: "Incorrect ID or password." });
    }

    res.json({
      id: user.id,
      name: user.name,
      role: user.role,
      mustChangePassword: !!user.must_change_password,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Used both by the forced first-login flow and by the optional "Change
// password" panel available any time from inside the app.
router.post("/change-password", async (req, res) => {
  try {
    const { id, newPassword } = req.body;
    if (!newPassword || newPassword.length < 4) {
      return res.status(400).json({ error: "Password must be at least 4 characters." });
    }

    const hash = await bcrypt.hash(newPassword, 10);
    await db.query(
      "UPDATE users SET password_hash = ?, must_change_password = FALSE WHERE id = ?",
      [hash, id]
    );

    res.json({ message: "Password updated." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
