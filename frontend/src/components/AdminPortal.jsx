import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  ClipboardList,
  UserPlus,
  FileBarChart,
  ArrowLeft,
  Settings as SettingsIcon,
  Trash2,
  Pencil,
  ArrowUpCircle,
  ListChecks,
} from "lucide-react";
import { api } from "../api";
import {
  DEPARTMENTS,
  DEFAULT_DEPARTMENT,
  PROGRAMS,
  PROGRAM_YEARS,
  ENTRY_TYPES,
  yearsForEntry,
  categoryScores,
  scoreOf,
  overallRatingAverage,
  formatScore,
} from "../data";
import Sidebar from "./Sidebar";
import StatCard from "./StatCard";
import PasswordSettingsPanel from "./PasswordSettingsPanel";
import CategoryBars from "./CategoryBars";
import usePersistentState from "../usePersistentState";
const NAV_ITEMS = [
  { key: "overview", label: "Dashboard", icon: LayoutDashboard },
  { key: "faculty", label: "Manage Faculty", icon: Users },
  { key: "students", label: "Manage Students", icon: GraduationCap },
  { key: "reports", label: "Reports", icon: FileBarChart },
  { key: "register", label: "Register", icon: UserPlus },
  { key: "settings", label: "Settings", icon: SettingsIcon },
];

function yearsFor(program) {
  return PROGRAM_YEARS[program] || PROGRAM_YEARS[PROGRAMS[0]];
}

// Admin/HOD Portal — fetches users, subjects, and feedback straight from
// the API. Overview and Reports are computed live from real submissions;
// Register is where the HOD bootstraps every other account; Manage
// Faculty and Manage Students are where existing accounts are reviewed,
// edited, and removed.
function AdminPortal({ user, onLogout }) {
  const [tab, setTab] = usePersistentState(`fp-tab-${user.id}`, "overview");
  const [subjects, setSubjects] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [actionError, setActionError] = useState("");

  // --- Register form ---
  const [name, setName] = useState("");
  const [role, setRole] = useState("student");
  const [program, setProgram] = useState(PROGRAMS[0]);
  const [department, setDepartment] = useState(DEFAULT_DEPARTMENT);
  const [entryType, setEntryType] = useState("regular");
  const [year, setYear] = useState(yearsFor(PROGRAMS[0])[0]);
  const [regError, setRegError] = useState("");
  const [registering, setRegistering] = useState(false);
  const [justCreated, setJustCreated] = useState([]);

  // --- Manage Students: filters + edit panel ---
  const [studentProgramFilter, setStudentProgramFilter] = useState("all");
  const [studentYearFilter, setStudentYearFilter] = useState("all");
  const [studentDeptFilter, setStudentDeptFilter] = useState("all");

  const [editingStudent, setEditingStudent] = useState(null);
  const [editDepartment, setEditDepartment] = useState(DEFAULT_DEPARTMENT);
  const [editProgram, setEditProgram] = useState(PROGRAMS[0]);
  const [editYear, setEditYear] = useState(yearsFor(PROGRAMS[0])[0]);
  const [editError, setEditError] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  // --- Manage Faculty: edit-subjects panel ---
  const [editingFaculty, setEditingFaculty] = useState(null);
  const [selectedSubjectIds, setSelectedSubjectIds] = useState([]);
  const [subjectsError, setSubjectsError] = useState("");
  const [savingSubjects, setSavingSubjects] = useState(false);

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
  const departments = [...new Set(studentList.map((s) => s.department).filter(Boolean))];

  const filteredStudents = studentList.filter(
    (s) =>
      (studentProgramFilter === "all" || s.program === studentProgramFilter) &&
      (studentYearFilter === "all" || String(s.year) === studentYearFilter) &&
      (studentDeptFilter === "all" || s.department === studentDeptFilter)
  );

  const totalResponses = submissions.length;
  const overallAvgScore = totalResponses ? scoreOf(submissions) : null;
  const overallAvgRating = totalResponses ? overallRatingAverage(submissions) : null;
  const departmentCategories = categoryScores(submissions);

  // Total possible reviews = every faculty-subject pairing × every student.
  const possibleResponses = studentList.length * subjects.reduce((sum, s) => sum + s.faculty.length, 0);
  const responseRate = possibleResponses ? Math.round((totalResponses / possibleResponses) * 100) : 0;

  // ---------------- Register ----------------

  function handleRegisterProgramChange(nextProgram) {
    setProgram(nextProgram);
    setEntryType("regular");
    setYear(yearsForEntry(nextProgram, "regular")[0]);
    if (nextProgram === "MCA") setDepartment("CSE");
  }

  function handleEntryTypeChange(nextType) {
    setEntryType(nextType);
    setYear(yearsForEntry(program, nextType)[0]);
  }

  async function handleRegister(e) {
    e.preventDefault();
    setRegError("");
    if (name.trim() === "") {
      setRegError("Enter a name before registering.");
      return;
    }
    if (role === "student" && department.trim() === "") {
      setRegError("Enter a department for the student.");
      return;
    }

    setRegistering(true);
    try {
      const payload = { name: name.trim(), role };
      if (role === "student") {
        payload.program = program;
        payload.department = department.trim();
        payload.year = year;
        if (program === "B.Tech") payload.entryType = entryType;
      }
      const newUser = await api.registerUser(payload);
      setJustCreated((prev) => [newUser, ...prev]);
      setName("");
      setDepartment(DEFAULT_DEPARTMENT);
      loadData();
    } catch (err) {
      setRegError(err.message);
    } finally {
      setRegistering(false);
    }
  }

  // ---------------- Manage Students: edit / promote / remove ----------------

  function startEditStudent(student) {
    setEditingStudent(student);
    setEditDepartment(student.department || DEFAULT_DEPARTMENT);
    setEditProgram(student.program || PROGRAMS[0]);
    setEditYear(student.year || yearsFor(student.program || PROGRAMS[0])[0]);
    setEditError("");
  }

  function cancelEditStudent() {
    setEditingStudent(null);
    setEditError("");
  }

  function handleEditProgramChange(nextProgram) {
    setEditProgram(nextProgram);
    setEditYear(yearsFor(nextProgram)[0]);
    if (nextProgram === "MCA") setEditDepartment("CSE");
  }

  async function handleSaveStudentEdit(e) {
    e.preventDefault();
    setEditError("");
    if (editDepartment.trim() === "") {
      setEditError("Department is required.");
      return;
    }

    setSavingEdit(true);
    try {
      await api.updateStudent(editingStudent.id, {
        department: editDepartment,
        program: editProgram,
        year: editYear,
      });
      setEditingStudent(null);
      loadData();
    } catch (err) {
      setEditError(err.message);
    } finally {
      setSavingEdit(false);
    }
  }

  // One-click promotion for the common yearly case — bumps year by one
  // without opening the full edit panel. Does nothing but show a message
  // if the student is already in their final year.
  async function handlePromoteYear(student) {
    const years = yearsFor(student.program);
    const maxYear = years[years.length - 1];
    const currentYear = student.year || years[0];

    if (currentYear >= maxYear) {
      setActionError(`${student.name} is already in the final year of their program.`);
      return;
    }

    setActionError("");
    try {
      await api.updateStudent(student.id, { year: currentYear + 1 });
      loadData();
    } catch (err) {
      setActionError(err.message);
    }
  }

  // ---------------- Manage Faculty: edit subjects ----------------

  function startEditSubjects(faculty) {
    setEditingFaculty(faculty);
    const current = subjects.filter((s) => s.faculty.includes(faculty.name)).map((s) => s.id);
    setSelectedSubjectIds(current);
    setSubjectsError("");
  }

  function cancelEditSubjects() {
    setEditingFaculty(null);
    setSubjectsError("");
  }

  function toggleSubject(subjectId) {
    setSelectedSubjectIds((prev) =>
      prev.includes(subjectId) ? prev.filter((id) => id !== subjectId) : [...prev, subjectId]
    );
  }

  async function handleSaveSubjects(e) {
    e.preventDefault();
    setSubjectsError("");
    setSavingSubjects(true);
    try {
      await api.updateFacultySubjects(editingFaculty.name, selectedSubjectIds);
      setEditingFaculty(null);
      loadData();
    } catch (err) {
      setSubjectsError(err.message);
    } finally {
      setSavingSubjects(false);
    }
  }

  // ---------------- Remove (faculty or student) ----------------

  async function handleRemoveUser(targetUser) {
    const confirmed = window.confirm(
      `Remove ${targetUser.name} (${targetUser.id})? This cannot be undone.`
    );
    if (!confirmed) return;

    setActionError("");
    try {
      await api.deleteUser(targetUser.id);
      loadData();
    } catch (err) {
      setActionError(err.message);
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
        onNavigate={(key) => {
          setTab(key);
          setActionError("");
          setEditingStudent(null);
          setEditingFaculty(null);
        }}
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

        {actionError && <p className="form-error">{actionError}</p>}

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
                submitted so far ({studentList.length} students × every
                faculty-subject pairing) — a {responseRate}% response rate.
                {overallAvgRating &&
                  ` Overall rating across the department: ${formatScore(overallAvgRating)} / 5 (average score ${formatScore(overallAvgScore)} / 5).`}
              </p>
            </div>

            <div className="panel">
              <h3>Department-wide performance by category</h3>
              {totalResponses === 0 ? (
                <p className="panel-muted">
                  No feedback submitted yet — this fills in as students
                  complete their reviews.
                </p>
              ) : (
                <CategoryBars scores={departmentCategories} />
              )}
            </div>
          </>
        )}

        {tab === "faculty" && (
          <>
            {editingFaculty && (
              <form className="panel edit-panel" onSubmit={handleSaveSubjects}>
                <h3>Edit subjects — {editingFaculty.name}</h3>
                <p className="panel-muted">
                  Check every subject this faculty member currently teaches
                  this semester. Saving replaces their whole assignment.
                </p>

                <div className="checkbox-list">
                  {subjects.map((subject) => (
                    <label key={subject.id} className="checkbox-row">
                      <input
                        type="checkbox"
                        checked={selectedSubjectIds.includes(subject.id)}
                        onChange={() => toggleSubject(subject.id)}
                      />
                      {subject.name}
                    </label>
                  ))}
                </div>

                {subjectsError && <p className="form-error">{subjectsError}</p>}

                <div className="button-row">
                  <button type="button" onClick={cancelEditSubjects}>
                    Cancel
                  </button>
                  <button type="submit" disabled={savingSubjects}>
                    {savingSubjects ? "Saving..." : "Save subjects"}
                  </button>
                </div>
              </form>
            )}

            <div className="panel">
              <h3>Manage Faculty</h3>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Login status</th>
                    <th>Responses received</th>
                    <th>Overall rating</th>
                    <th>Subjects</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {facultyList.length === 0 && (
                    <tr>
                      <td colSpan={7} className="panel-muted">
                        No faculty registered yet.
                      </td>
                    </tr>
                  )}
                  {facultyList.map((f) => {
                    const theirs = submissions.filter((s) => s.faculty === f.name);
                    const theirSubjects = subjects.filter((s) => s.faculty.includes(f.name));
                    return (
                      <tr key={f.id}>
                        <td>{f.id}</td>
                        <td>{f.name}</td>
                        <td>
                          <span className={`pill ${f.mustChangePassword ? "pill-warning" : "pill-success"}`}>
                            {f.mustChangePassword ? "Password not set" : "Active"}
                          </span>
                        </td>
                        <td>{theirs.length}</td>
                        <td>{theirs.length ? `${formatScore(overallRatingAverage(theirs))} / 5` : "—"}</td>
                        <td>{theirSubjects.length ? theirSubjects.map((s) => s.name).join(", ") : "—"}</td>
                        <td>
                          <div className="row-actions">
                            <button
                              type="button"
                              className="icon-btn"
                              onClick={() => startEditSubjects(f)}
                              title={`Edit subjects for ${f.name}`}
                            >
                              <ListChecks size={14} />
                            </button>
                            <button
                              type="button"
                              className="remove-btn"
                              onClick={() => handleRemoveUser(f)}
                              title={`Remove ${f.name}`}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

        {tab === "students" && (
          <>
            {editingStudent && (
              <form className="panel edit-panel" onSubmit={handleSaveStudentEdit}>
                <h3>Edit — {editingStudent.name} ({editingStudent.id})</h3>
                <p className="panel-muted">
                  Most of the time only Year needs changing, at the start of
                  each new academic year.
                </p>

                <label htmlFor="editProgram">Program</label>
                <select
                  id="editProgram"
                  value={editProgram}
                  onChange={(e) => handleEditProgramChange(e.target.value)}
                >
                  {PROGRAMS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>

                <label htmlFor="editDepartment">Department</label>
                {editProgram === "MCA" ? (
                  <input id="editDepartment" type="text" value="CSE" disabled />
                ) : (
                  <select id="editDepartment" value={editDepartment} onChange={(e) => setEditDepartment(e.target.value)}>
                    {DEPARTMENTS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                )}

                <label htmlFor="editYear">Year</label>
                <select id="editYear" value={editYear} onChange={(e) => setEditYear(Number(e.target.value))}>
                  {yearsFor(editProgram).map((y) => (
                    <option key={y} value={y}>
                      Year {y}
                    </option>
                  ))}
                </select>

                {editError && <p className="form-error">{editError}</p>}

                <div className="button-row">
                  <button type="button" onClick={cancelEditStudent}>
                    Cancel
                  </button>
                  <button type="submit" disabled={savingEdit}>
                    {savingEdit ? "Saving..." : "Save changes"}
                  </button>
                </div>
              </form>
            )}

            <div className="panel">
              <div className="panel-head-row">
                <h3>Manage Students</h3>
              </div>

              <div className="filter-row">
                <select value={studentProgramFilter} onChange={(e) => setStudentProgramFilter(e.target.value)}>
                  <option value="all">All Programs</option>
                  {PROGRAMS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>

                <select value={studentYearFilter} onChange={(e) => setStudentYearFilter(e.target.value)}>
                  <option value="all">All Years</option>
                  {[1, 2, 3, 4].map((y) => (
                    <option key={y} value={String(y)}>
                      Year {y}
                    </option>
                  ))}
                </select>

                <select value={studentDeptFilter} onChange={(e) => setStudentDeptFilter(e.target.value)}>
                  <option value="all">All Departments</option>
                  {departments.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Program</th>
                    <th>Department</th>
                    <th>Year</th>
                    <th>Login status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.length === 0 && (
                    <tr>
                      <td colSpan={7} className="panel-muted">
                        No students match these filters.
                      </td>
                    </tr>
                  )}
                  {filteredStudents.map((s) => (
                    <tr key={s.id}>
                      <td>{s.id}</td>
                      <td>{s.name}</td>
                      <td>{s.program || "—"}</td>
                      <td>{s.department || "—"}</td>
                      <td>{s.year ? `Year ${s.year}` : "—"}</td>
                      <td>
                        <span className={`pill ${s.mustChangePassword ? "pill-warning" : "pill-success"}`}>
                          {s.mustChangePassword ? "Password not set" : "Active"}
                        </span>
                      </td>
                      <td>
                        <div className="row-actions">
                          <button
                            type="button"
                            className="icon-btn"
                            onClick={() => handlePromoteYear(s)}
                            title={`Promote ${s.name} to next year`}
                          >
                            <ArrowUpCircle size={14} />
                          </button>
                          <button
                            type="button"
                            className="icon-btn"
                            onClick={() => startEditStudent(s)}
                            title={`Edit ${s.name}`}
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            type="button"
                            className="remove-btn"
                            onClick={() => handleRemoveUser(s)}
                            title={`Remove ${s.name}`}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
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
                    <th>Average Score</th>
                    <th>Overall Rating</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.values(
                    submissions.reduce((groups, s) => {
                      const key = `${s.faculty}::${s.subject}`;
                      if (!groups[key]) {
                        groups[key] = { faculty: s.faculty, subject: s.subject, list: [] };
                      }
                      groups[key].list.push(s);
                      return groups;
                    }, {})
                  ).map((group) => (
                    <tr key={`${group.faculty}-${group.subject}`}>
                      <td>{group.faculty}</td>
                      <td>{group.subject}</td>
                      <td>{group.list.length}</td>
                      <td>{formatScore(scoreOf(group.list))} / 5</td>
                      <td>{formatScore(overallRatingAverage(group.list))} / 5</td>
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

              {role === "student" && (
                <>
                  <label htmlFor="regProgram">Program</label>
                  <select
                    id="regProgram"
                    value={program}
                    onChange={(e) => handleRegisterProgramChange(e.target.value)}
                  >
                    {PROGRAMS.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>

                  <label htmlFor="regDepartment">Department</label>
                  {program === "MCA" ? (
                    <input id="regDepartment" type="text" value="CSE" disabled />
                  ) : (
                    <select id="regDepartment" value={department} onChange={(e) => setDepartment(e.target.value)}>
                      {DEPARTMENTS.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  )}

                  {program === "B.Tech" && (
                    <>
                      <label htmlFor="regEntryType">Admission Type</label>
                      <select
                        id="regEntryType"
                        value={entryType}
                        onChange={(e) => handleEntryTypeChange(e.target.value)}
                      >
                        {ENTRY_TYPES.map((t) => (
                          <option key={t.value} value={t.value}>
                            {t.label}
                          </option>
                        ))}
                      </select>
                    </>
                  )}

                  <label htmlFor="regYear">Year</label>
                  <select id="regYear" value={year} onChange={(e) => setYear(Number(e.target.value))}>
                    {yearsForEntry(program, entryType).map((y) => (
                      <option key={y} value={y}>
                        Year {y}
                      </option>
                    ))}
                  </select>

                  {program === "B.Tech" && (
                    <p className="panel-muted hint-text">
                      A roll-number ID is generated automatically for B.Tech
                      students (e.g. 24001A0501) — year of joining, branch
                      code, and {entryType === "lateral" ? "lateral entry (5A)" : "regular (1A)"} admission type are
                      all encoded in it.
                    </p>
                  )}
                </>
              )}

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
                      <th>Program</th>
                      <th>Department</th>
                      <th>Year</th>
                      <th>Default password</th>
                    </tr>
                  </thead>
                  <tbody>
                    {justCreated.map((u) => (
                      <tr key={u.id}>
                        <td>{u.id}</td>
                        <td>{u.name}</td>
                        <td>{u.role}</td>
                        <td>{u.program || "—"}</td>
                        <td>{u.department || "—"}</td>
                        <td>{u.year ? `Year ${u.year}` : "—"}</td>
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