import { useState } from "react";
import { KeyRound, ArrowLeft } from "lucide-react";
import { api } from "../api";
import PasswordInput from "./PasswordInput";

// (3d) Forms — a second, distinct form: setting a new password after the
// first login with the HOD-assigned default password. The current
// (default) password must be entered again to confirm it's really you.
function ChangePassword({ user, onPasswordChanged, onCancel }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    if (currentPassword === "") {
      setError("Enter your current (default) password.");
      return;
    }
    if (newPassword.length < 4) {
      setError("New password must be at least 4 characters.");
      return;
    }
    if (newPassword === currentPassword) {
      setError("New password must be different from the current one.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New passwords don't match.");
      return;
    }

    setError("");
    setSaving(true);
    try {
      await api.changePassword(user.id, currentPassword, newPassword);
      onPasswordChanged();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <div className="auth-icon">
          <KeyRound size={26} color="white" strokeWidth={2} />
        </div>
        <h1>Set a new password</h1>
        <p className="auth-subtitle">
          Welcome, {user.name}. This is your first login — enter the password
          you just signed in with, then choose one only you know.
        </p>

        <form onSubmit={handleSubmit} className="auth-form">
          <label htmlFor="currentPassword">Current password</label>
          <PasswordInput
            id="currentPassword"
            placeholder="The password you just used to log in"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            autoComplete="current-password"
          />

          <label htmlFor="newPassword">New password</label>
          <PasswordInput
            id="newPassword"
            placeholder="Enter a new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            autoComplete="new-password"
          />

          <label htmlFor="confirmPassword">Confirm new password</label>
          <PasswordInput
            id="confirmPassword"
            placeholder="Re-enter the new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
          />

          {error && <p className="auth-error">{error}</p>}

          <button type="submit" className="auth-submit" disabled={saving}>
            {saving ? "Saving..." : "Save and continue"}
          </button>
        </form>

        <button type="button" className="auth-back-link" onClick={onCancel}>
          <ArrowLeft size={14} /> Wrong account? Back to login
        </button>
      </div>
    </div>
  );
}

export default ChangePassword;