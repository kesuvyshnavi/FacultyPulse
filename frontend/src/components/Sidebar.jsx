import { LogOut } from "lucide-react";

// Shared shell component: every portal (Student/Faculty/Admin) renders the
// same sidebar pattern with its own nav items, so switching portals feels
// like one product. Demonstrates props + map() in a navigation context.
function Sidebar({ portalLabel, portalTag, navItems, activeKey, onNavigate, userName, onLogout }) {
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
        <button className="sidebar-switch" onClick={onLogout}>
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
