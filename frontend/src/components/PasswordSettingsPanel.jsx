import { useState } from "react";
import { KeyRound } from "lucide-react";
import { api } from "../api";
import PasswordInput from "./PasswordInput";

// Available any time from Settings in every portal (Student, Faculty,
// Admin). The current password must be entered before a new one is saved.
function PasswordSettingsPanel({ user }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (currentPassword === "") {
      setError("Enter your current password.");
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

    setSaving(true);
    try {
      await api.changePassword(user.id, currentPassword, newPassword);
      setSuccess("Password updated successfully.");
      setCurrentPassword("");
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
        <label htmlFor="settingsCurrentPassword">Current password</label>
        <PasswordInput
          id="settingsCurrentPassword"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          autoComplete="current-password"
        />

        <label htmlFor="settingsNewPassword">New password</label>
        <PasswordInput
          id="settingsNewPassword"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          autoComplete="new-password"
        />

        <label htmlFor="settingsConfirmPassword">Confirm new password</label>
        <PasswordInput
          id="settingsConfirmPassword"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          autoComplete="new-password"
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