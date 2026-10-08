import { useState, useEffect } from "react";
import { api } from "./api";
import Login from "./components/Login";
import ChangePassword from "./components/ChangePassword";
import StudentPortal from "./components/StudentPortal";
import FacultyPortal from "./components/FacultyPortal";
import AdminPortal from "./components/AdminPortal";

const SESSION_KEY = "facultypulse-session";

// Restores the logged-in user after a page refresh. sessionStorage lasts
// until the browser tab is closed (swap to localStorage if you want it to
// survive closing the browser).
function loadSession() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const { user, stage } = JSON.parse(raw);
    if (user && (stage === "app" || stage === "changePassword")) {
      return { user, stage };
    }
  } catch {
    /* corrupted / unavailable — treat as logged out */
  }
  return null;
}

// The portals read camelCase fields (studentId, subjectId, faculty, subject,
// answers, overallRating, strengths/improvements/suggestions). If the API
// returns snake_case column names, this maps them so the portals never see
// undefined values.
function normalizeFeedback(row) {
  return {
    ...row,
    subjectId: row.subjectId ?? row.subject_id,
    subject: row.subject ?? row.subject_name,
    faculty: row.faculty ?? row.faculty_name,
    studentId: row.studentId ?? row.student_id,
    studentName: row.studentName ?? row.student_name,
    answers: typeof row.answers === "string" ? JSON.parse(row.answers) : row.answers ?? {},
    overallRating: Number(row.overallRating ?? row.rating),
    strengths: row.strengths ?? "",
    improvements: row.improvements ?? "",
    suggestions: row.suggestions ?? "",
    submittedAt: row.submittedAt ?? row.submitted_at,
  };
}

function App() {
  const [currentUser, setCurrentUser] = useState(() => loadSession()?.user ?? null);
  const [stage, setStage] = useState(() => loadSession()?.stage ?? "login"); // "login" | "changePassword" | "app"

  // Always arrays, so portals can safely call .filter/.map on them.
  const [submissions, setSubmissions] = useState([]);
  const [subjects, setSubjects] = useState([]);

  // Keep the saved session in sync with login state.
  useEffect(() => {
    try {
      if (currentUser && stage !== "login") {
        sessionStorage.setItem(SESSION_KEY, JSON.stringify({ user: currentUser, stage }));
      } else {
        sessionStorage.removeItem(SESSION_KEY);
      }
    } catch {
      /* ignore */
    }
  }, [currentUser, stage]);

  // Load feedback + the live subject/faculty list once the user is inside
  // the app (also runs again after a refresh, since the session is restored).
  useEffect(() => {
    if (stage !== "app" || !currentUser) return;

    Promise.all([api.fetchFeedback(), api.fetchSubjects()])
      .then(([feedbackRows, subjectRows]) => {
        setSubmissions(Array.isArray(feedbackRows) ? feedbackRows.map(normalizeFeedback) : []);
        setSubjects(Array.isArray(subjectRows) ? subjectRows : []);
      })
      .catch((err) => console.error("Could not load data:", err));
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
    // Forget the remembered tab of every portal so the next login starts
    // on the Dashboard.
    try {
      Object.keys(sessionStorage)
        .filter((k) => k.startsWith("fp-tab-"))
        .forEach((k) => sessionStorage.removeItem(k));
    } catch {
      /* ignore */
    }
    setCurrentUser(null);
    setSubmissions([]);
    setSubjects([]);
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
    return (
      <ChangePassword
        user={currentUser}
        onPasswordChanged={handlePasswordChanged}
        onCancel={handleLogout}
      />
    );
  }

  if (currentUser.role === "student") {
    return (
      <StudentPortal
        user={currentUser}
        onLogout={handleLogout}
        submissions={submissions}
        subjects={subjects}
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