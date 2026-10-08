import { useState } from "react";
import { LogIn, ShieldCheck } from "lucide-react";
import { api } from "../api";
import PasswordInput from "./PasswordInput";

// (3d) Forms — the login form, with a controlled submit handler that now
// calls the real backend instead of checking an in-memory array.
function Login({ onLoginSuccess }) {
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await api.login(id.trim(), password);
      onLoginSuccess(user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
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
            placeholder="e.g. 24001A0501"
            value={id}
            onChange={(e) => setId(e.target.value)}
          />

          <label htmlFor="password">Password</label>
          <PasswordInput
            id="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />

          {error && <p className="auth-error">{error}</p>}

          <button type="submit" className="auth-submit" disabled={loading}>
            <LogIn size={16} />
            {loading ? "Signing in..." : "Log in"}
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