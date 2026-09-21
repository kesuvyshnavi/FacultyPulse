import { useState } from "react";
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
} from "lucide-react";
import { SUBJECTS } from "../data";
import Sidebar from "./Sidebar";
import StatCard from "./StatCard";
import FacultyInfoCard from "./FacultyInfoCard";
import FeedbackSummaryCard from "./FeedbackSummaryCard";
import StarRating from "./StarRating";
import FacultyDirectory from "./FacultyDirectory";
import FeedbackHistory from "./FeedbackHistory";

const NAV_ITEMS = [
  { key: "overview", label: "Dashboard", icon: LayoutDashboard },
  { key: "feedback", label: "Give Feedback", icon: MessageSquarePlus },
  { key: "history", label: "My Feedback", icon: HistoryIcon },
];

// Student Portal — the main functional dashboard component. Composes every
// smaller component and owns the wizard state (2c: button click events,
// 3d: forms, 3a: useState, 3c: props, 3e: map() all live here). Feedback
// this student submits is lifted to App.jsx via onSubmitFeedback, which is
// what makes it show up for real in the Faculty and Admin portals.
function StudentPortal({ user, onLogout, submissions, onSubmitFeedback }) {
  const [tab, setTab] = useState("overview");

  const [step, setStep] = useState("subjects"); // "subjects" | "faculty" | "form"
  const [activeSubjectId, setActiveSubjectId] = useState(null);
  const [activeFaculty, setActiveFaculty] = useState(null);
  const [rating, setRating] = useState(0);
  const [comments, setComments] = useState("");
  const [formError, setFormError] = useState("");

  const myHistory = submissions.filter((s) => s.studentId === user.id);
  const activeSubject = SUBJECTS.find((s) => s.id === activeSubjectId);
  const completedIds = new Set(myHistory.map((h) => h.subjectId));

  function openSubject(subject) {
    setActiveSubjectId(subject.id);
    setStep("faculty");
  }

  function chooseFaculty(name) {
    setActiveFaculty(name);
    setRating(0);
    setComments("");
    setFormError("");
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
    setFormError("");
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (rating === 0) {
      setFormError("Please select a rating before submitting.");
      return;
    }
    if (comments.trim() === "") {
      setFormError("Please add a comment before submitting.");
      return;
    }

    onSubmitFeedback({
      subjectId: activeSubject.id,
      subject: activeSubject.name,
      faculty: activeFaculty,
      studentId: user.id,
      studentName: user.name,
      rating,
      comments,
      submittedAt: new Date().toISOString(),
    });

    setFormError("");
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

        {tab === "overview" && (
          <>
            <div className="stat-grid">
              <StatCard icon={ClipboardList} label="Pending Subjects" value={SUBJECTS.length - completedIds.size} tone="warning" />
              <StatCard icon={CheckCircle2} label="Completed" value={completedIds.size} tone="success" />
              <StatCard icon={BookOpen} label="Total Subjects" value={SUBJECTS.length} />
            </div>

            <FeedbackDashboardPanel history={myHistory} />
            <FacultyDirectory />
          </>
        )}

        {tab === "feedback" && step === "subjects" && (
          <div className="panel">
            <h3>Choose a subject</h3>
            <div className="subject-grid">
              {SUBJECTS.map((subject) => {
                const done = completedIds.has(subject.id);
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
                        {subject.faculty.length} faculty teaching this subject
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
              {activeSubject.faculty.map((name) => (
                <button key={name} className="subject-card" onClick={() => chooseFaculty(name)}>
                  <div className="subject-card-icon">
                    <CircleUserRound size={18} />
                  </div>
                  <div className="subject-card-body">
                    <div className="subject-card-name">{name}</div>
                    <div className="subject-card-meta">{activeSubject.name}</div>
                  </div>
                  <ChevronRight size={18} />
                </button>
              ))}
            </div>
          </div>
        )}

        {tab === "feedback" && step === "form" && activeSubject && activeFaculty && (
          <>
            <FacultyInfoCard faculty={activeFaculty} subject={activeSubject.name} status="Pending" />
            <form className="panel feedback-form" onSubmit={handleSubmit}>
              <button type="button" className="wizard-back" onClick={backToFaculty}>
                <ArrowLeft size={15} /> Back to faculty list
              </button>
              <h3>Rate your experience</h3>

              <label>Rating</label>
              <StarRating rating={rating} onRatingChange={setRating} />

              <label htmlFor="comments">Comments</label>
              <textarea
                id="comments"
                placeholder="Enter your feedback"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
              />

              {formError && <p className="form-error">{formError}</p>}

              <div className="button-row">
                <button type="submit">Submit Feedback</button>
              </div>
            </form>
          </>
        )}

        {tab === "history" && (
          <>
            <div className="panel">
              <FeedbackSummaryCard
                faculty={latestEntry?.faculty}
                subject={latestEntry?.subject}
                comments={latestEntry?.comments}
                status={latestEntry ? "Submitted" : "Pending"}
              />
            </div>
            <div className="panel">
              <FeedbackHistory history={myHistory} />
            </div>
          </>
        )}

        <p className="footer-text">FacultyPulse © 2026 - Empowering Better Teaching</p>
      </main>
    </div>
  );
}

// Small helper panel for the overview tab, kept local to this file since it
// only makes sense in the context of the student's own feedback progress.
function FeedbackDashboardPanel({ history }) {
  const total = SUBJECTS.length;
  const done = new Set(history.map((h) => h.subjectId)).size;
  const remaining = SUBJECTS.filter((s) => !history.some((h) => h.subjectId === s.id));

  return (
    <div className="panel">
      <h3>Feedback progress</h3>
      {done === total ? (
        <p className="panel-muted">
          You've submitted feedback for all {total} subjects this session.
        </p>
      ) : (
        <>
          <p className="panel-muted">Subjects still waiting for your feedback:</p>
          <ul className="plain-list">
            {remaining.map((s) => (
              <li key={s.id}>{s.name}</li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

export default StudentPortal;
