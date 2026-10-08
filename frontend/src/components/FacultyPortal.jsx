import {
  LayoutDashboard,
  MessageCircle,
  FileBarChart,
  Star,
  Users,
  TrendingUp,
  BookOpen,
  Settings as SettingsIcon,
} from "lucide-react";
import {
  FEEDBACK_CATEGORIES,
  COMMENT_FIELDS,
  categoryScores,
  scoreOf,
  overallRatingAverage,
  formatScore,
} from "../data";
import usePersistentState from "../usePersistentState";
import Sidebar from "./Sidebar";
import StatCard from "./StatCard";
import CategoryBars from "./CategoryBars";
import PasswordSettingsPanel from "./PasswordSettingsPanel";

const NAV_ITEMS = [
  { key: "overview", label: "Dashboard", icon: LayoutDashboard },
  { key: "comments", label: "Comments", icon: MessageCircle },
  { key: "reports", label: "Reports", icon: FileBarChart },
  { key: "settings", label: "Settings", icon: SettingsIcon },
];

function sentimentFromRating(rating) {
  if (rating >= 4) return { label: "positive", pillClass: "pill-success" };
  if (rating === 3) return { label: "neutral", pillClass: "pill-warning" };
  return { label: "needs attention", pillClass: "pill-danger" };
}

// Faculty Portal — reuses the same Sidebar + StatCard building blocks, but
// every number here is derived from the `submissions` array lifted in
// App.jsx, filtered down to feedback aimed at this logged-in faculty
// member, using the same category structure the students filled in.
function FacultyPortal({ user, onLogout, submissions }) {
  // Remembered across page refresh.
  const [tab, setTab] = usePersistentState(`fp-tab-${user.id}`, "overview");

  const myFeedback = submissions.filter((s) => s.faculty === user.name);
  const totalResponses = myFeedback.length;
  const avgScore = totalResponses ? scoreOf(myFeedback) : null;
  const avgOverall = totalResponses ? overallRatingAverage(myFeedback) : null;
  const categories = categoryScores(myFeedback);

  // (3e) map() over a fixed 1-5 scale to build a rating-distribution bar
  // chart from the students' overall star ratings.
  const distribution = [1, 2, 3, 4, 5].map((star) => ({
    star,
    count: myFeedback.filter((f) => f.overallRating === star).length,
  }));
  const maxCount = Math.max(1, ...distribution.map((d) => d.count));

  const subjectsTaught = [...new Set(myFeedback.map((f) => f.subject))];
  const perSubject = subjectsTaught.map((subject) => {
    const list = myFeedback.filter((f) => f.subject === subject);
    return {
      subject,
      list,
      scores: categoryScores(list),
      avg: scoreOf(list),
      overall: overallRatingAverage(list),
    };
  });

  const withComments = myFeedback.filter((f) => COMMENT_FIELDS.some((field) => f[field.key]));

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
              <StatCard icon={Star} label="Average Score" value={avgScore ? `${formatScore(avgScore)} / 5` : "—"} tone="success" />
              <StatCard icon={TrendingUp} label="Overall Rating" value={avgOverall ? `${formatScore(avgOverall)} / 5` : "—"} />
              <StatCard icon={Users} label="Total Responses" value={totalResponses} />
              <StatCard icon={BookOpen} label="Subjects Reviewed" value={subjectsTaught.length} tone="warning" />
            </div>

            <div className="panel">
              <h3>Performance by category</h3>
              {totalResponses === 0 ? (
                <p className="panel-muted">
                  No feedback yet — this fills in as students submit reviews.
                </p>
              ) : (
                <CategoryBars scores={categories} />
              )}
            </div>

            <div className="panel">
              <h3>Overall star rating distribution</h3>
              {totalResponses === 0 ? (
                <p className="panel-muted">No ratings yet.</p>
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
            {withComments.length === 0 ? (
              <p className="panel-muted">No comments submitted yet.</p>
            ) : (
              <div className="comment-list">
                {withComments.map((f, index) => {
                  const sentiment = sentimentFromRating(f.overallRating);
                  return (
                    <div className="feedback-comment" key={index}>
                      <div className="feedback-comment-head">
                        <strong>{f.subject}</strong>
                        <span className={`pill ${sentiment.pillClass}`}>{sentiment.label}</span>
                      </div>
                      {COMMENT_FIELDS.filter((field) => f[field.key]).map((field) => (
                        <div className="comment-block" key={field.key}>
                          <span className="comment-label">{field.short}</span>
                          <p>{f[field.key]}</p>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {tab === "reports" && (
          <>
            <div className="panel">
              <h3>Subject-wise summary</h3>
              {perSubject.length === 0 ? (
                <p className="panel-muted">No submissions yet to summarize.</p>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Subject</th>
                      <th>Responses</th>
                      <th>Average Score</th>
                      <th>Overall Rating</th>
                    </tr>
                  </thead>
                  <tbody>
                    {perSubject.map((p) => (
                      <tr key={p.subject}>
                        <td>{p.subject}</td>
                        <td>{p.list.length}</td>
                        <td>{formatScore(p.avg)} / 5</td>
                        <td>{formatScore(p.overall)} / 5</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {perSubject.length > 0 && (
              <div className="panel">
                <h3>Category-wise breakdown</h3>
                <div className="table-scroll">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Category</th>
                        {perSubject.map((p) => (
                          <th key={p.subject}>{p.subject}</th>
                        ))}
                        <th>All subjects</th>
                      </tr>
                    </thead>
                    <tbody>
                      {FEEDBACK_CATEGORIES.map((category, i) => (
                        <tr key={category.key}>
                          <td>{category.title}</td>
                          {perSubject.map((p) => (
                            <td key={p.subject}>{formatScore(p.scores[i].avg)}</td>
                          ))}
                          <td>
                            <strong>{formatScore(categories[i].avg)}</strong>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}

        {tab === "settings" && <PasswordSettingsPanel user={user} />}
      </main>
    </div>
  );
}

export default FacultyPortal;