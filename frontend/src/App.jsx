import { useState, useEffect } from "react";
import { api } from "./api";
import Login from "./components/Login";
import ChangePassword from "./components/ChangePassword";
import StudentPortal from "./components/StudentPortal";
import FacultyPortal from "./components/FacultyPortal";
import AdminPortal from "./components/AdminPortal";

// The portals read camelCase fields (studentId, subjectId, faculty, subject,
// rating, comments). If the API returns snake_case column names, this maps
// them so the portals never see undefined values.
function normalizeFeedback(row) {
  return {
    ...row,
    subjectId: row.subjectId ?? row.subject_id,
    subject: row.subject ?? row.subject_name,
    faculty: row.faculty ?? row.faculty_name,
    studentId: row.studentId ?? row.student_id,
    studentName: row.studentName ?? row.student_name,
    rating: Number(row.rating),
    comments: row.comments ?? "",
    submittedAt: row.submittedAt ?? row.submitted_at,
  };
}

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [stage, setStage] = useState("login"); // "login" | "changePassword" | "app"

  // Always an array, so portals can safely call .filter/.map on it.
  const [submissions, setSubmissions] = useState([]);

  // Load feedback once the user is inside the app. (AdminPortal loads its
  // own users/subjects/feedback, so it doesn't depend on this.)
  useEffect(() => {
    if (stage !== "app" || !currentUser) return;

    api
      .fetchFeedback()
      .then((rows) => setSubmissions(Array.isArray(rows) ? rows.map(normalizeFeedback) : []))
      .catch((err) => console.error("Could not load feedback:", err));
  }, [stage, currentUser]);

  function handleLoginSuccess(user) {
    setCurrentUser(user);
    setStage(user.mustChangePassword ? "changePassword" : "app");
  }

  // The new password is saved to the database by ChangePassword.jsx
  // (via api.changePassword). Here we only update local state and continue.
  function handlePasswordChanged() {
    setCurrentUser((prev) => ({ ...prev, mustChangePassword: false }));
    setStage("app");
  }

  function handleLogout() {
    setCurrentUser(null);
    setSubmissions([]);
    setStage("login");
  }

  // Saves to the database first, then adds to local state so the portals
  // update immediately. Uses whichever save function your api.js exports.
  async function handleSubmitFeedback(entry) {
    const save = api.submitFeedback || api.createFeedback || api.postFeedback;
    if (!save) {
      alert("api.js has no function for saving feedback (expected submitFeedback).");
      return;
    }
    try {
      const saved = await save(entry);
      setSubmissions((prev) => [...prev, normalizeFeedback({ ...entry, ...(saved || {}) })]);
    } catch (err) {
      console.error("Could not save feedback:", err);
      alert("Could not save your feedback: " + err.message);
    }
  }

  if (stage === "login" || !currentUser) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  if (stage === "changePassword") {
    return <ChangePassword user={currentUser} onPasswordChanged={handlePasswordChanged} />;
  }

  if (currentUser.role === "student") {
    return (
      <StudentPortal
        user={currentUser}
        onLogout={handleLogout}
        submissions={submissions}
        onSubmitFeedback={handleSubmitFeedback}
      />
    );
  }

  if (currentUser.role === "faculty") {
    return <FacultyPortal user={currentUser} onLogout={handleLogout} submissions={submissions} />;
  }

  return <AdminPortal user={currentUser} onLogout={handleLogout} />;
}

export default App;