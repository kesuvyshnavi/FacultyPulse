import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { LogOut } from "lucide-react";

// Shared shell component: every portal (Student/Faculty/Admin) renders the
// same sidebar pattern with its own nav items, so switching portals feels
// like one product. Logout is a 2-step action: clicking Logout opens an
// in-page confirmation, and only "Yes, log out" actually logs out.
function Sidebar({ portalLabel, portalTag, navItems, activeKey, onNavigate, userName, onLogout }) {
  const [confirmingLogout, setConfirmingLogout] = useState(false);

  // Close the confirmation with the Escape key.
  useEffect(() => {
    if (!confirmingLogout) return;
    function onKeyDown(e) {
      if (e.key === "Escape") setConfirmingLogout(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [confirmingLogout]);

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-logo">FP</div>
        <div>
          <div className="sidebar-brand-name">FacultyPulse</div>
          <div className="sidebar-brand-tag">{portalTag}</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <button
            key={item.key}
            className={`sidebar-nav-item ${activeKey === item.key ? "active" : ""}`}
            onClick={() => onNavigate(item.key)}
          >
            <item.icon size={18} strokeWidth={2} />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-avatar">{userName.charAt(0)}</div>
          <div>
            <div className="sidebar-user-name">{userName}</div>
            <div className="sidebar-user-role">{portalLabel}</div>
          </div>
        </div>
        <button className="sidebar-switch" onClick={() => setConfirmingLogout(true)}>
          <LogOut size={16} />
          Logout
        </button>
      </div>

      {confirmingLogout &&
        createPortal(
          <div className="modal-backdrop" onClick={() => setConfirmingLogout(false)}>
            <div
              className="modal-card"
              role="dialog"
              aria-modal="true"
              aria-labelledby="logout-title"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-icon">
                <LogOut size={22} />
              </div>
              <h3 id="logout-title">Are you sure you want to log out?</h3>
              <p className="panel-muted">
                You'll need to sign in again with your ID and password.
              </p>
              <div className="modal-actions">
                <button
                  type="button"
                  className="modal-btn-cancel"
                  onClick={() => setConfirmingLogout(false)}
                  autoFocus
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setConfirmingLogout(false);
                    onLogout();
                  }}
                >
                  Yes, log out
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </aside>
  );
}

export default Sidebar;