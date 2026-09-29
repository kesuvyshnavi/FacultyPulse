require("dotenv").config();
const bcrypt = require("bcryptjs");
const db = require("./db");
const { defaultPasswordFor } = require("./passwordUtil");

// The starting accounts the HOD has "already registered." Run this once
// after schema.sql, before starting the server.
const SEED_USERS = [
  { id: "21A91A0501", name: "Vyshnavi", role: "student" },
  { id: "FAC101", name: "Dr. Ramesh", role: "faculty" },
  { id: "FAC102", name: "Dr. Priya Menon", role: "faculty" },
  { id: "FAC103", name: "Dr. Suresh Kumar", role: "faculty" },
  { id: "FAC104", name: "Dr. Anitha Rao", role: "faculty" },
  { id: "HOD001", name: "HOD Admin", role: "admin" },
];

async function seed() {
  for (const u of SEED_USERS) {
    const [existing] = await db.query("SELECT id FROM users WHERE id = ?", [u.id]);
    if (existing.length > 0) {
      console.log(`Skipped ${u.id} — already exists.`);
      continue;
    }

    const defaultPassword = defaultPasswordFor(u.name);
    const hash = await bcrypt.hash(defaultPassword, 10);

    await db.query(
      "INSERT INTO users (id, name, role, password_hash, must_change_password) VALUES (?, ?, ?, ?, TRUE)",
      [u.id, u.name, u.role, hash]
    );

    console.log(`Created ${u.role} ${u.name} (${u.id}) — default password: ${defaultPassword}`);
  }

  console.log("\nSeeding complete.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seeding failed:", err.message);
  process.exit(1);
});
