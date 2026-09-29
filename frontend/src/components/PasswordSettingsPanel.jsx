import { useState } from "react";
import { KeyRound } from "lucide-react";
import { api } from "../api";

// Available any time from Settings in every portal — not just forced on
// first login. Same API call as ChangePassword.jsx, different context.
function PasswordSettingsPanel({ user }) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword.length < 4) {
      setError("Password must be at least 4 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    setSaving(true);
    try {
      await api.changePassword(user.id, newPassword);
      setSuccess("Password updated successfully.");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="panel">
      <h3>
        <KeyRound size={16} style={{ verticalAlign: "-3px", marginRight: 6 }} />
        Change password
      </h3>
      <form onSubmit={handleSubmit} className="feedback-form">
        <label htmlFor="settingsNewPassword">New password</label>
        <input
          id="settingsNewPassword"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />

        <label htmlFor="settingsConfirmPassword">Confirm password</label>
        <input
          id="settingsConfirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        {error && <p className="form-error">{error}</p>}
        {success && <p className="form-success">{success}</p>}

        <div className="button-row">
          <button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Update password"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default PasswordSettingsPanel;
