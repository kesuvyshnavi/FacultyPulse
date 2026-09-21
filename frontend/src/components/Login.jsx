import { useState } from "react";
import { LogIn, ShieldCheck } from "lucide-react";

// (3d) Forms — the login form itself, with a controlled submit handler.
function Login({ users, onLoginSuccess }) {
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    const match = users.find(
      (u) => u.id.toLowerCase() === id.trim().toLowerCase() && u.password === password
    );

    if (!match) {
      setError("Incorrect ID or password. Check with the HOD if you're unsure.");
      return;
    }

    setError("");
    onLoginSuccess(match);
  }

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <div className="auth-icon">
          <ShieldCheck size={26} color="white" strokeWidth={2} />
        </div>
        <h1>FacultyPulse</h1>
        <p className="auth-subtitle">Sign in to continue</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <label htmlFor="userId">User ID</label>
          <input
            id="userId"
            type="text"
            placeholder="e.g. 21A91A0501"
            value={id}
            onChange={(e) => setId(e.target.value)}
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && <p className="auth-error">{error}</p>}

          <button type="submit" className="auth-submit">
            <LogIn size={16} />
            Log in
          </button>
        </form>

        <p className="auth-hint">
          First time logging in? Your password is the one the HOD set when
          registering you — your name, lowercase, no spaces.
        </p>
      </div>
    </div>
  );
}

export default Login;
