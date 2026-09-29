import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  ClipboardList,
  GraduationCap,
  UserPlus,
  FileBarChart,
  ArrowLeft,
  Settings as SettingsIcon,
} from "lucide-react";
import { api } from "../api";
import Sidebar from "./Sidebar";
import StatCard from "./StatCard";
import PasswordSettingsPanel from "./PasswordSettingsPanel";

const NAV_ITEMS = [
  { key: "overview", label: "Dashboard", icon: LayoutDashboard },
  { key: "faculty", label: "Manage Faculty", icon: Users },
  { key: "reports", label: "Reports", icon: FileBarChart },
  { key: "register", label: "Register", icon: UserPlus },
  { key: "settings", label: "Settings", icon: SettingsIcon },
];

// Admin/HOD Portal — fetches users, subjects, and feedback straight from
// the API. Overview and Reports are computed live from real submissions;
// Register is where the HOD bootstraps every other account (and can hand
// the HOD role itself to a successor).
function AdminPortal({ user, onLogout }) {
  const [tab, setTab] = useState("overview");
  const [users, setUsers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [name, setName] = useState("");
  const [role, setRole] = useState("student");
  const [regError, setRegError] = useState("");
  const [registering, setRegistering] = useState(false);
  const [justCreated, setJustCreated] = useState([]);

  function loadData() {
    setLoading(true);
    setLoadError("");
    Promise.all([api.fetchUsers(), api.fetchSubjects(), api.fetchFeedback()])
      .then(([usersData, subjectsData, feedbackData]) => {
        setUsers(usersData);
        setSubjects(subjectsData);
        setSubmissions(feedbackData);
        setLoading(false);
      })
      .catch((err) => {
        setLoadError(err.message);
        setLoading(false);
      });
  }

  useEffect(() => {
    loadData();
  }, []);

  const facultyList = users.filter((u) => u.role === "faculty");
  const studentList = users.filter((u) => u.role === "student");

  const totalResponses = submissions.length;
  const overallAvg = totalResponses
    ? (submissions.reduce((sum, s) => sum + s.rating, 0) / totalResponses).toFixed(2)
    : null;
  const possibleResponses = studentList.length * subjects.length;
  const responseRate = possibleResponses ? Math.round((totalResponses / possibleResponses) * 100) : 0;

  async function handleRegister(e) {
    e.preventDefault();
    setRegError("");
    if (name.trim() === "") {
      setRegError("Enter a name before registering.");
      return;
    }

    setRegistering(true);
    try {
      const newUser = await api.registerUser(name.trim(), role);
      setJustCreated((prev) => [newUser, ...prev]);
      setName("");
      loadData(); // refresh Manage Faculty / stat counts
    } catch (err) {
      setRegError(err.message);
    } finally {
      setRegistering(false);
    }
  }

  if (loading) {
    return <FullScreenStatus message="Loading department data..." />;
  }

  if (loadError) {
    return <FullScreenStatus message={loadError} isError onRetry={loadData} />;
  }

  return (
    <div className="portal-shell">
      <Sidebar
        portalLabel="Admin"
        portalTag="Admin / HOD Portal"
        navItems={NAV_ITEMS}
        activeKey={tab}
        onNavigate={setTab}
        userName={user.name}
        onLogout={onLogout}
      />

      <main className="portal-main">
        <div className="portal-header">
          <div>
            <h1>Dashboard Overview</h1>
            <p>Department of Computer Science and Engineering</p>
          </div>
        </div>

        {tab === "overview" && (
          <>
            <div className="stat-grid">
              <StatCard icon={GraduationCap} label="Students" value={studentList.length} />
              <StatCard icon={Users} label="Faculty" value={facultyList.length} />
              <StatCard icon={BookOpen} label="Subjects" value={subjects.length} />
              <StatCard icon={ClipboardList} label="Feedback Submitted" value={totalResponses} tone="success" />
            </div>

            <div className="panel">
              <h3>Overall Response Rate</h3>
              <p className="panel-muted">
                {totalResponses} of {possibleResponses} possible responses
                submitted so far ({studentList.length} students ×{" "}
                {subjects.length} subjects) — a {responseRate}% response rate.
                {overallAvg && ` Overall average rating across the department: ${overallAvg} / 5.`}
              </p>
            </div>
          </>
        )}

        {tab === "faculty" && (
          <div className="panel">
            <h3>Manage Faculty</h3>
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Login status</th>
                  <th>Responses received</th>
                </tr>
              </thead>
              <tbody>
                {facultyList.map((f) => (
                  <tr key={f.id}>
                    <td>{f.id}</td>
                    <td>{f.name}</td>
                    <td>
                      <span className={`pill ${f.mustChangePassword ? "pill-warning" : "pill-success"}`}>
                        {f.mustChangePassword ? "Password not set" : "Active"}
                      </span>
                    </td>
                    <td>{submissions.filter((s) => s.faculty === f.name).length}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === "reports" && (
          <div className="panel">
            <h3>Department-wide report</h3>
            {totalResponses === 0 ? (
              <p className="panel-muted">
                No feedback submitted yet — this table fills in as students
                complete their reviews.
              </p>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Faculty</th>
                    <th>Subject</th>
                    <th>Responses</th>
                    <th>Average Rating</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.values(
                    submissions.reduce((groups, s) => {
                      const key = `${s.faculty}::${s.subject}`;
                      if (!groups[key]) {
                        groups[key] = { faculty: s.faculty, subject: s.subject, ratings: [] };
                      }
                      groups[key].ratings.push(s.rating);
                      return groups;
                    }, {})
                  ).map((group) => (
                    <tr key={`${group.faculty}-${group.subject}`}>
                      <td>{group.faculty}</td>
                      <td>{group.subject}</td>
                      <td>{group.ratings.length}</td>
                      <td>
                        {(group.ratings.reduce((a, b) => a + b, 0) / group.ratings.length).toFixed(2)} / 5
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {tab === "register" && (
          <>
            <form className="panel" onSubmit={handleRegister}>
              <h3>Register an account</h3>
              <p className="panel-muted">
                The password is set automatically to the person's name
                (lowercase, no spaces). They'll be required to change it the
                first time they log in. Use "Admin/HOD" when handing the
                role over to a new HOD.
              </p>

              <label htmlFor="regName">Full name</label>
              <input
                id="regName"
                type="text"
                placeholder="e.g. Dr. Meera Iyer"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />

              <label htmlFor="regRole">Role</label>
              <select id="regRole" value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="student">Student</option>
                <option value="faculty">Faculty</option>
                <option value="admin">Admin / HOD</option>
              </select>

              {regError && <p className="form-error">{regError}</p>}

              <div className="button-row">
                <button type="submit" disabled={registering}>
                  <UserPlus size={15} style={{ verticalAlign: "-3px", marginRight: 6 }} />
                  {registering ? "Registering..." : "Register account"}
                </button>
              </div>
            </form>

            {justCreated.length > 0 && (
              <div className="panel">
                <h3>Accounts created this session</h3>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Role</th>
                      <th>Default password</th>
                    </tr>
                  </thead>
                  <tbody>
                    {justCreated.map((u) => (
                      <tr key={u.id}>
                        <td>{u.id}</td>
                        <td>{u.name}</td>
                        <td>{u.role}</td>
                        <td>{u.password}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {tab === "settings" && (
          <>
            <button className="wizard-back" onClick={() => setTab("overview")}>
              <ArrowLeft size={15} /> Back to Dashboard
            </button>
            <PasswordSettingsPanel user={user} />
          </>
        )}
      </main>
    </div>
  );
}

function FullScreenStatus({ message, isError, onRetry }) {
  return (
    <div className="auth-screen">
      <div className="auth-card">
        <p className={isError ? "auth-error" : "auth-subtitle"}>{message}</p>
        {isError && onRetry && (
          <button type="button" className="auth-submit" onClick={onRetry}>
            Retry
          </button>
        )}
      </div>
    </div>
  );
}

export default AdminPortal;
