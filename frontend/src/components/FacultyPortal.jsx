import { useState } from "react";
import { LayoutDashboard, MessageCircle, FileBarChart, Star, Users, TrendingUp } from "lucide-react";
import Sidebar from "./Sidebar";
import StatCard from "./StatCard";

const NAV_ITEMS = [
  { key: "overview", label: "Dashboard", icon: LayoutDashboard },
  { key: "comments", label: "Comments", icon: MessageCircle },
  { key: "reports", label: "Reports", icon: FileBarChart },
];

function sentimentFromRating(rating) {
  if (rating >= 4) return { label: "positive", pillClass: "pill-success" };
  if (rating === 3) return { label: "neutral", pillClass: "pill-warning" };
  return { label: "needs attention", pillClass: "pill-danger" };
}

// Faculty Portal — reuses the same Sidebar + StatCard building blocks, but
// every number here is derived from the `submissions` array lifted in
// App.jsx, filtered down to feedback aimed at this logged-in faculty
// member. Nothing shown is mock data anymore.
function FacultyPortal({ user, onLogout, submissions=[] }) {
  const [tab, setTab] = useState("overview");

  const myFeedback = submissions.filter((s) => s.faculty === user.name);
  const totalResponses = myFeedback.length;
  const avgRating = totalResponses
    ? (myFeedback.reduce((sum, f) => sum + f.rating, 0) / totalResponses).toFixed(2)
    : null;

  // (3e) map() over a fixed 1-5 scale to build a real rating-distribution
  // bar chart from the actual submissions, instead of invented numbers.
  const distribution = [1, 2, 3, 4, 5].map((star) => ({
    star,
    count: myFeedback.filter((f) => f.rating === star).length,
  }));
  const maxCount = Math.max(1, ...distribution.map((d) => d.count));

  // Group by subject to show a per-subject average in Reports.
  const subjectsTaught = [...new Set(myFeedback.map((f) => f.subject))];

  return (
    <div className="portal-shell">
      <Sidebar
        portalLabel="Faculty"
        portalTag="Faculty Portal"
        navItems={NAV_ITEMS}
        activeKey={tab}
        onNavigate={setTab}
        userName={user.name}
        onLogout={onLogout}
      />

      <main className="portal-main">
        <div className="portal-header">
          <div>
            <h1>Welcome, {user.name}</h1>
            <p>My Feedback Analytics — live from student submissions</p>
          </div>
        </div>

        {tab === "overview" && (
          <>
            <div className="stat-grid">
              <StatCard icon={Star} label="Average Rating" value={avgRating ? `${avgRating} / 5` : "—"} tone="success" />
              <StatCard icon={Users} label="Total Responses" value={totalResponses} />
              <StatCard icon={TrendingUp} label="Subjects Reviewed" value={subjectsTaught.length} tone="warning" />
            </div>

            <div className="panel">
              <h3>Rating distribution</h3>
              {totalResponses === 0 ? (
                <p className="panel-muted">
                  No feedback yet — this fills in as students submit reviews.
                </p>
              ) : (
                <div className="bar-chart">
                  {distribution.map((d) => (
                    <div className="bar-chart-col" key={d.star}>
                      <div
                        className="bar-chart-bar"
                        style={{ height: `${(d.count / maxCount) * 100}%` }}
                        title={`${d.count} response(s)`}
                      />
                      <div className="bar-chart-label">{d.star} star</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {tab === "comments" && (
          <div className="panel">
            <h3>Student Comments</h3>
            {myFeedback.length === 0 ? (
              <p className="panel-muted">No comments submitted yet.</p>
            ) : (
              <div className="comment-list">
                {myFeedback.map((f, index) => {
                  const sentiment = sentimentFromRating(f.rating);
                  return (
                    <div className="comment-item" key={index}>
                      <span>
                        <strong>{f.subject}:</strong> {f.comments}
                      </span>
                      <span className={`pill ${sentiment.pillClass}`}>{sentiment.label}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {tab === "reports" && (
          <div className="panel">
            <h3>Subject-wise summary</h3>
            {subjectsTaught.length === 0 ? (
              <p className="panel-muted">No submissions yet to summarize.</p>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Subject</th>
                    <th>Responses</th>
                    <th>Average Rating</th>
                  </tr>
                </thead>
                <tbody>
                  {subjectsTaught.map((subject) => {
                    const forSubject = myFeedback.filter((f) => f.subject === subject);
                    const avg = (
                      forSubject.reduce((sum, f) => sum + f.rating, 0) / forSubject.length
                    ).toFixed(2);
                    return (
                      <tr key={subject}>
                        <td>{subject}</td>
                        <td>{forSubject.length}</td>
                        <td>{avg} / 5</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default FacultyPortal;