const express = require("express");
const cors = require("cors");
const feedbackRoutes = require("./routes/feedbackRoutes");

const app = express();
app.use(cors());
app.use(express.json());

// (4a) Hello world message on the root route
app.get("/", (req, res) => {
  res.send("Hello world from the FacultyPulse API!");
});

// (4b) A small website with multiple routes
app.get("/about", (req, res) => {
  res.send("FacultyPulse: a feedback platform connecting students and faculty.");
});

app.get("/health", (req, res) => {
  res.json({ status: "ok", uptime: process.uptime() });
});

// (4d)/(4e) CRUD routes backed by the MySQL connection in db.js
app.use("/api/feedback", feedbackRoutes);

// (4c) Print hello world in the browser console (client-side) and here
// on the server console at startup
console.log("Hello world — FacultyPulse server module loaded");

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`FacultyPulse server running on http://localhost:${PORT}`);
});
