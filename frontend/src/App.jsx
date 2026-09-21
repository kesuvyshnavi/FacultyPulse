import { useState } from "react";
import { SEED_USERS } from "./data";
import Login from "./components/Login";
import ChangePassword from "./components/ChangePassword";
import StudentPortal from "./components/StudentPortal";
import FacultyPortal from "./components/FacultyPortal";
import AdminPortal from "./components/AdminPortal";

function App() {
  const [users, setUsers] = useState(SEED_USERS);
  const [currentUser, setCurrentUser] = useState(null);
  const [stage, setStage] = useState("login"); // "login" | "changePassword" | "app"

  // Single source of truth for every feedback submission across the whole
  // app. StudentPortal writes to it, FacultyPortal and AdminPortal both
  // read from it — this is what actually connects the three portals
  // instead of each one showing isolated mock numbers.
  const [submissions, setSubmissions] = useState([]);

  function handleLoginSuccess(user) {
    setCurrentUser(user);
    setStage(user.mustChangePassword ? "changePassword" : "app");
  }

  function handlePasswordChanged(newPassword) {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === currentUser.id ? { ...u, password: newPassword, mustChangePassword: false } : u
      )
    );
    setCurrentUser((prev) => ({ ...prev, password: newPassword, mustChangePassword: false }));
    setStage("app");
  }

  function handleLogout() {
    setCurrentUser(null);
    setStage("login");
  }

  // (3c) Props — new users registered by the HOD are lifted here in App.jsx
  // and passed down to AdminPortal and Login, so both stay in sync.
  function handleRegisterUser(newUser) {
    setUsers((prev) => [...prev, newUser]);
  }

  function handleSubmitFeedback(entry) {
    setSubmissions((prev) => [...prev, entry]);
  }

  if (stage === "login") {
    return <Login users={users} onLoginSuccess={handleLoginSuccess} />;
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

  return (
    <AdminPortal
      user={currentUser}
      onLogout={handleLogout}
      users={users}
      onRegisterUser={handleRegisterUser}
      submissions={submissions}
    />
  );
}

export default App;
