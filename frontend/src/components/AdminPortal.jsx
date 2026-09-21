import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  ClipboardList,
  GraduationCap,
  UserPlus,
  FileBarChart,
} from "lucide-react";
import { SUBJECTS, defaultPasswordFor } from "../data";
import Sidebar from "./Sidebar";
import StatCard from "./StatCard";

const NAV_ITEMS = [
  { key: "overview", label: "Dashboard", icon: LayoutDashboard },
  { key: "faculty", label: "Manage Faculty", icon: Users },
  { key: "reports", label: "Reports", icon: FileBarChart },
  { key: "register", label: "Register", icon: UserPlus },
];

let registrationCounter = 1;

// Admin/HOD Portal — reuses the same Sidebar/StatCard building blocks.
// Overview and Reports are both computed live from `submissions`, the same
// array StudentPortal writes to and FacultyPortal reads from — this is the
// portal where all three finally meet. Register is also where the HOD
// bootstraps every other account, including handing off to another HOD.
function AdminPortal({ user, onLogout, users, onRegisterUser, submissions }) {
  const [tab, setTab] = useState("overview");
  const [name, setName] = useState("");
  const [role, setRole] = useState("student");
  const [justCreated, setJustCreated] = useState([]);

  const facultyList = users.filter((u) => u.role === "faculty");
  const studentList = users.filter((u) => u.role === "student");

  const totalResponses = submissions.length;
  const overallAvg = totalResponses
    ? (submissions.reduce((sum, s) => sum + s.rating, 0) / totalResponses).toFixed(2)
    : null;
  const possibleResponses = studentList.length * SUBJECTS.length;
  const responseRate = possibleResponses
    ? Math.round((totalResponses / possibleResponses) * 100)
    : 0;

  function handleRegister(e) {
    e.preventDefault();
    if (name.trim() === "") {
      alert("Enter a name before registering.");
      return;
    }

    const prefix = role === "student" ? "STU" : role === "faculty" ? "FAC" : "HOD";
    const id = `${prefix}${String(200 + registrationCounter).padStart(3, "0")}`;
    registrationCounter += 1;

    const newUser = {
      id,
      name: name.trim(),
      role,
      password: defaultPasswordFor(name.trim()),
      mustChangePassword: true,
    };

    onRegisterUser(newUser);
    setJustCreated((prev) => [newUser, ...prev]);
    setName("");
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
              <StatCard icon={BookOpen} label="Subjects" value={SUBJECTS.length} />
              <StatCard icon={ClipboardList} label="Feedback Submitted" value={totalResponses} tone="success" />
            </div>

            <div className="panel">
              <h3>Overall Response Rate</h3>
              <p className="panel-muted">
                {totalResponses} of {possibleResponses} possible responses
                submitted so far ({studentList.length} students ×{" "}
                {SUBJECTS.length} subjects) — a {responseRate}% response rate.
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

              <div className="button-row">
                <button type="submit">
                  <UserPlus size={15} style={{ verticalAlign: "-3px", marginRight: 6 }} />
                  Register account
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
      </main>
    </div>
  );
}

export default AdminPortal;
