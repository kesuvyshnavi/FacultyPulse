const express = require("express");
const bcrypt = require("bcryptjs");
const router = express.Router();
const db = require("../db");
const { defaultPasswordFor } = require("../passwordUtil");
const { CURRENT_ADMISSION_YEAR_BASE, COLLEGE_CODE, ENTRY_CODES, BRANCH_CODES } = require("../academicConfig");

// GET all users — password hashes are never included in the response.
// department/program/year are only meaningful for students, but the
// columns are nullable so faculty/admin rows just come back null.
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT id, name, role, must_change_password AS mustChangePassword,
              department, program, year
       FROM users ORDER BY role, name`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Builds a roll-number style ID (e.g. 24001A0501) for a B.Tech student in a
// department that has a branch code configured. A student's year of study
// changes every year, but their admission year — encoded in the ID —
// never does, which is why the ID is only ever set once at registration
// and the editable "year" field is a separate column entirely.
// entryType is "regular" (1A, joined in 1st year) or "lateral" (5A,
// diploma holders who join directly into 2nd year).
async function generateRollNumberId(department, yearOfStudy, entryType) {
  const branchCode = BRANCH_CODES[department];
  const entryCode = ENTRY_CODES[entryType] || ENTRY_CODES.regular;
  if (!branchCode) return null; // no roll-number scheme defined for this department yet

  const admissionYear = CURRENT_ADMISSION_YEAR_BASE - (Number(yearOfStudy) - 1);
  const admissionYY = String(((admissionYear % 100) + 100) % 100).padStart(2, "0");
  const prefix = `${admissionYY}${COLLEGE_CODE}${entryCode}${branchCode}`; // e.g. "24001A05"

  const [[{ count }]] = await db.query("SELECT COUNT(*) AS count FROM users WHERE id LIKE ?", [
    `${prefix}%`,
  ]);
  const serial = String(count + 1).padStart(2, "0");
  return `${prefix}${serial}`;
}

// (4d) CREATE — this is where the HOD registers a student, faculty, or
// another admin/HOD account. The password is set to the default rule
// automatically, then returned once so the HOD can hand it to that
// person. department/program/year/entryType are only used for students.
router.post("/register", async (req, res) => {
  try {
    const { name, role } = req.body;
    let { department, program, year, entryType } = req.body;

    if (!name || !role) {
      return res.status(400).json({ error: "Name and role are required." });
    }
    if (role === "student" && (!department || !department.trim())) {
      return res.status(400).json({ error: "Department is required for a student account." });
    }

    // MCA is administered under the CSE department.
    if (role === "student" && program === "MCA") {
      department = "CSE";
    }

    entryType = entryType === "lateral" ? "lateral" : "regular";
    if (role === "student" && entryType === "lateral" && Number(year) < 2) {
      return res.status(400).json({ error: "Lateral entry students join directly into Year 2 or later." });
    }

    const studentDepartment = role === "student" ? department.trim() : null;
    const studentProgram = role === "student" ? program || null : null;
    const studentYear = role === "student" ? Number(year) || null : null;

    // B.Tech students in a department with a configured branch code get a
    // real roll-number ID; everyone else falls back to the generic scheme.
    let id = null;
    if (role === "student" && studentProgram === "B.Tech" && studentYear) {
      id = await generateRollNumberId(studentDepartment, studentYear, entryType);
    }
    if (!id) {
      const prefix = role === "student" ? "STU" : role === "faculty" ? "FAC" : "HOD";
      const [[{ count }]] = await db.query("SELECT COUNT(*) AS count FROM users WHERE role = ?", [role]);
      id = `${prefix}${String(200 + count + 1).padStart(3, "0")}`;
    }

    const defaultPassword = defaultPasswordFor(name);
    const hash = await bcrypt.hash(defaultPassword, 10);

    await db.query(
      `INSERT INTO users
         (id, name, role, password_hash, must_change_password, department, program, year)
       VALUES (?, ?, ?, ?, TRUE, ?, ?, ?)`,
      [id, name, role, hash, studentDepartment, studentProgram, studentYear]
    );

    res.status(201).json({
      id,
      name,
      role,
      password: defaultPassword,
      mustChangePassword: true,
      department: studentDepartment,
      program: studentProgram,
      year: studentYear,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// (4d) UPDATE — the HOD edits an existing student's department/program/
// year. This is the main thing that needs touching every year: a
// student's "year" moves from 1 -> 2 -> 3 -> 4 as they're promoted, while
// their ID (which encodes their admission year and entry type) stays
// fixed. Only whichever fields are sent in the body get changed.
router.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [[existing]] = await db.query("SELECT id, role FROM users WHERE id = ?", [id]);
    if (!existing) {
      return res.status(404).json({ error: "User not found." });
    }
    if (existing.role !== "student") {
      return res.status(400).json({ error: "Only student accounts can be edited here." });
    }

    let { department, program, year } = req.body;
    if (program === "MCA") {
      department = "CSE"; // MCA is administered under the CSE department
    }

    const fields = [];
    const values = [];
    if (department !== undefined) {
      fields.push("department = ?");
      values.push(department || null);
    }
    if (program !== undefined) {
      fields.push("program = ?");
      values.push(program || null);
    }
    if (year !== undefined) {
      fields.push("year = ?");
      values.push(Number(year) || null);
    }

    if (fields.length === 0) {
      return res.status(400).json({ error: "Nothing to update." });
    }

    values.push(id);
    await db.query(`UPDATE users SET ${fields.join(", ")} WHERE id = ?`, values);

    const [[updated]] = await db.query(
      `SELECT id, name, role, must_change_password AS mustChangePassword, department, program, year
       FROM users WHERE id = ?`,
      [id]
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// (4d) DELETE — the HOD removes a faculty or student account. A student's
// own feedback rows are removed first (feedback.student_id has a foreign
// key to users.id, so they'd otherwise block the delete); a removed
// faculty member's historical feedback is left in place since
// feedback.faculty_name is just a text column, not a foreign key — it
// still counts toward department reports. The last remaining Admin/HOD
// account can't be removed, so there's always someone who can log in and
// manage the system.
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [[user]] = await db.query("SELECT id, role FROM users WHERE id = ?", [id]);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    if (user.role === "admin") {
      const [[{ count }]] = await db.query("SELECT COUNT(*) AS count FROM users WHERE role = 'admin'");
      if (count <= 1) {
        return res.status(400).json({ error: "Cannot remove the only Admin/HOD account." });
      }
    }

    if (user.role === "student") {
      await db.query("DELETE FROM feedback WHERE student_id = ?", [id]);
    }

    await db.query("DELETE FROM users WHERE id = ?", [id]);
    res.json({ message: "User removed.", id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;