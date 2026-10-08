import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  MessageSquarePlus,
  History as HistoryIcon,
  ClipboardList,
  CheckCircle2,
  BookOpen,
  ArrowLeft,
  ChevronRight,
  CircleUserRound,
  Settings as SettingsIcon,
} from "lucide-react";
import { api } from "../api";
import { reviewKey, submissionScore, formatScore } from "../data";
import usePersistentState from "../usePersistentState";
import Sidebar from "./Sidebar";
import StatCard from "./StatCard";
import FacultyInfoCard from "./FacultyInfoCard";
import FeedbackSummaryCard from "./FeedbackSummaryCard";
import FeedbackForm from "./FeedbackForm";
import FacultyDirectory from "./FacultyDirectory";
import FeedbackHistory from "./FeedbackHistory";
import PasswordSettingsPanel from "./PasswordSettingsPanel";

const NAV_ITEMS = [
  { key: "overview", label: "Dashboard", icon: LayoutDashboard },
  { key: "feedback", label: "Give Feedback", icon: MessageSquarePlus },
  { key: "history", label: "My Feedback", icon: HistoryIcon },
  { key: "settings", label: "Settings", icon: SettingsIcon },
];

// Student Portal — the main functional dashboard component. It owns the
// wizard state (subject -> faculty -> multi-step form). Subjects (and who
// teaches each one) are fetched from the API rather than hardcoded, since
// the HOD can reassign a faculty member to a different subject any
// semester from the Admin portal — this way a reassignment shows up here
// immediately. The form itself lives in FeedbackForm.jsx; when it
// finishes, the answers are lifted to App.jsx via onSubmitFeedback, which
// is what makes them show up for real in the Faculty and Admin portals.
function StudentPortal({ user, onLogout, submissions, onSubmitFeedback }) {
  // Remembered across page refresh.
  const [tab, setTab] = usePersistentState(`fp-tab-${user.id}`, "overview");

  const [subjects, setSubjects] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [subjectsError, setSubjectsError] = useState("");

  const [step, setStep] = useState("subjects"); // "subjects" | "faculty" | "form"
  const [activeSubjectId, setActiveSubjectId] = useState(null);
  const [activeFaculty, setActiveFaculty] = useState(null);

  function loadSubjects() {
    setLoadingSubjects(true);
    setSubjectsError("");
    api
      .fetchSubjects()
      .then((data) => {
        setSubjects(data);
        setLoadingSubjects(false);
      })
      .catch((err) => {
        setSubjectsError(err.message);
        setLoadingSubjects(false);
      });
  }

  useEffect(() => {
    loadSubjects();
  }, []);

  const totalReviews = subjects.reduce((sum, s) => sum + s.faculty.length, 0);
  const myHistory = submissions.filter((s) => s.studentId === user.id);
  const activeSubject = subjects.find((s) => s.id === activeSubjectId);
  // One review = one faculty for one subject.
  const completedKeys = new Set(myHistory.map((h) => reviewKey(h.subjectId, h.faculty)));

  function openSubject(subject) {
    setActiveSubjectId(subject.id);
    setStep("faculty");
  }

  function chooseFaculty(name) {
    setActiveFaculty(name);
    setStep("form");
  }

  function backToSubjects() {
    setStep("subjects");
    setActiveSubjectId(null);
    setActiveFaculty(null);
  }

  function backToFaculty() {
    setStep("faculty");
    setActiveFaculty(null);
  }

  function handleFormSubmit(formData) {
    onSubmitFeedback({
      subjectId: activeSubject.id,
      subject: activeSubject.name,
      faculty: activeFaculty,
      studentId: user.id,
      studentName: user.name,
      ...formData, // answers, overallRating, strengths, improvements, suggestions
      submittedAt: new Date().toISOString(),
    });

    setTab("history");
    setStep("subjects");
    setActiveSubjectId(null);
    setActiveFaculty(null);
  }

  const latestEntry = myHistory[myHistory.length - 1];

  return (
    <div className="portal-shell">
      <Sidebar
        portalLabel="Student"
        portalTag="Student Portal"
        navItems={NAV_ITEMS}
        activeKey={tab}
        onNavigate={(key) => {
          setTab(key);
          if (key === "feedback") backToSubjects();
        }}
        userName={user.name}
        onLogout={onLogout}
      />

      <main className="portal-main">
        <div className="portal-header">
          <div>
            <h1 id="title">FacultyPulse</h1>
            <p>Welcome back, {user.name}</p>
          </div>
        </div>

        {tab === "settings" && <PasswordSettingsPanel user={user} />}

        {tab !== "settings" && loadingSubjects && <p className="panel-muted">Loading subjects...</p>}
        {tab !== "settings" && subjectsError && <p className="form-error">{subjectsError}</p>}

        {tab !== "settings" && !loadingSubjects && !subjectsError && (
          <>
            {tab === "overview" && (
              <>
                <div className="stat-grid">
                  <StatCard icon={ClipboardList} label="Pending Reviews" value={totalReviews - completedKeys.size} tone="warning" />
                  <StatCard icon={CheckCircle2} label="Completed" value={completedKeys.size} tone="success" />
                  <StatCard icon={BookOpen} label="Total Reviews" value={totalReviews} />
                </div>

                <FeedbackDashboardPanel subjects={subjects} completedKeys={completedKeys} totalReviews={totalReviews} />
                <FacultyDirectory subjects={subjects} />
              </>
            )}

            {tab === "feedback" && step === "subjects" && (
              <div className="panel">
                <h3>Choose a subject</h3>
                <div className="subject-grid">
                  {subjects.map((subject) => {
                    const reviewed = subject.faculty.filter((name) =>
                      completedKeys.has(reviewKey(subject.id, name))
                    ).length;
                    const done = subject.faculty.length > 0 && reviewed === subject.faculty.length;
                    return (
                      <button
                        key={subject.id}
                        className={`subject-card ${done ? "subject-card-done" : ""}`}
                        onClick={() => openSubject(subject)}
                      >
                        <div className="subject-card-icon">
                          <BookOpen size={18} />
                        </div>
                        <div className="subject-card-body">
                          <div className="subject-card-name">{subject.name}</div>
                          <div className="subject-card-meta">
                            {reviewed} of {subject.faculty.length} faculty reviewed
                          </div>
                        </div>
                        {done ? (
                          <span className="pill pill-success">Submitted</span>
                        ) : (
                          <ChevronRight size={18} />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {tab === "feedback" && step === "faculty" && activeSubject && (
              <div className="panel">
                <button className="wizard-back" onClick={backToSubjects}>
                  <ArrowLeft size={15} /> Back to subjects
                </button>
                <h3>{activeSubject.name} — choose faculty</h3>
                <p className="panel-muted">
                  This subject is taught by more than one faculty member. Pick
                  the one you want to review.
                </p>
                <div className="subject-grid">
                  {activeSubject.faculty.map((name) => {
                    const done = completedKeys.has(reviewKey(activeSubject.id, name));
                    return (
                      <button
                        key={name}
                        className={`subject-card ${done ? "subject-card-done" : ""}`}
                        disabled={done}
                        onClick={() => chooseFaculty(name)}
                      >
                        <div className="subject-card-icon">
                          <CircleUserRound size={18} />
                        </div>
                        <div className="subject-card-body">
                          <div className="subject-card-name">{name}</div>
                          <div className="subject-card-meta">{activeSubject.name}</div>
                        </div>
                        {done ? (
                          <span className="pill pill-success">Submitted</span>
                        ) : (
                          <ChevronRight size={18} />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {tab === "feedback" && step === "form" && activeSubject && activeFaculty && (
              <>
                <FacultyInfoCard faculty={activeFaculty} subject={activeSubject.name} status="Pending" />
                <FeedbackForm
                  key={`${activeSubject.id}-${activeFaculty}`}
                  onSubmit={handleFormSubmit}
                  onBack={backToFaculty}
                />
              </>
            )}

            {tab === "history" && (
              <>
                <div className="panel">
                  <FeedbackSummaryCard
                    faculty={latestEntry?.faculty}
                    subject={latestEntry?.subject}
                    average={latestEntry ? formatScore(submissionScore(latestEntry)) : null}
                    overallRating={latestEntry?.overallRating}
                    strengths={latestEntry?.strengths}
                    status={latestEntry ? "Submitted" : "Pending"}
                  />
                </div>
                <div className="panel">
                  <FeedbackHistory history={myHistory} />
                </div>
              </>
            )}
          </>
        )}

        <p className="footer-text">FacultyPulse © 2026 - Empowering Better Teaching</p>
      </main>
    </div>
  );
}

// Small helper panel for the overview tab, kept local to this file since it
// only makes sense in the context of the student's own feedback progress.
function FeedbackDashboardPanel({ subjects, completedKeys, totalReviews }) {
  const remaining = subjects.flatMap((subject) =>
    subject.faculty.map((name) => ({ subject, name }))
  ).filter((item) => !completedKeys.has(reviewKey(item.subject.id, item.name)));

  return (
    <div className="panel">
      <h3>Feedback progress</h3>
      {remaining.length === 0 ? (
        <p className="panel-muted">
          You've submitted feedback for all {totalReviews} faculty reviews this session.
        </p>
      ) : (
        <>
          <p className="panel-muted">Reviews still waiting for your feedback:</p>
          <ul className="plain-list">
            {remaining.map((item) => (
              <li key={reviewKey(item.subject.id, item.name)}>
                {item.subject.name} — {item.name}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

export default StudentPortal;