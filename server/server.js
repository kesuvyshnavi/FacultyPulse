require("dotenv").config();
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const subjectRoutes = require("./routes/subjectRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes");

const app = express();
app.use(cors());
app.use(express.json());

// (4a) Hello world message on the root route
app.get("/", (req, res) => {
  res.send("Hello world from the FacultyPulse API!");
});

// (4b) A small site with multiple routes
app.get("/health", (req, res) => {
  res.json({ status: "ok", uptime: process.uptime() });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/feedback", feedbackRoutes);

// (4c) Print hello world to the server console at startup
console.log("Hello world — FacultyPulse server module loaded");

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`FacultyPulse server running on http://localhost:${PORT}`);
});
