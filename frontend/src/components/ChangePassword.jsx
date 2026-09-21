import { useState } from "react";
import { KeyRound } from "lucide-react";

// (3d) Forms again — a second, distinct form: setting a new password after
// the first login with the HOD-assigned default password.
function ChangePassword({ user, onPasswordChanged }) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e) {
    e.preventDefault();

    if (newPassword.length < 4) {
      setError("Password must be at least 4 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    setError("");
    onPasswordChanged(newPassword);
  }

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <div className="auth-icon">
          <KeyRound size={26} color="white" strokeWidth={2} />
        </div>
        <h1>Set a new password</h1>
        <p className="auth-subtitle">
          Welcome, {user.name}. This is your first login — choose a password
          only you know.
        </p>

        <form onSubmit={handleSubmit} className="auth-form">
          <label htmlFor="newPassword">New password</label>
          <input
            id="newPassword"
            type="password"
            placeholder="Enter a new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />

          <label htmlFor="confirmPassword">Confirm password</label>
          <input
            id="confirmPassword"
            type="password"
            placeholder="Re-enter the new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          {error && <p className="auth-error">{error}</p>}

          <button type="submit" className="auth-submit">
            Save and continue
          </button>
        </form>
      </div>
    </div>
  );
}

export default ChangePassword;
