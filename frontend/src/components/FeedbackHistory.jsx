import { COMMENT_FIELDS, categoryScores, submissionScore, formatScore } from "../data";

// (3c) Props — this component holds no state of its own; it receives the
// feedback history array from its parent (StudentPortal) as a prop,
// demonstrating two components sharing data.
// (3e) Iterative rendering using map() again, over a different data source.
function FeedbackHistory({ history }) {
  if (!history || history.length === 0) {
    return <p className="history-empty">No feedback submitted yet this session.</p>;
  }

  return (
    <div className="feedback-history">
      <h3>Feedback History</h3>
      <ul>
        {history.map((entry, index) => (
          <li key={index} className="history-item">
            <strong>{entry.faculty}</strong> ({entry.subject}) — overall {entry.overallRating}/5,
            average {formatScore(submissionScore(entry))}/5
            <div className="chip-row">
              {categoryScores([entry]).map((c) => (
                <span className="chip" key={c.key}>
                  {c.title}: {formatScore(c.avg)}
                </span>
              ))}
            </div>
            {COMMENT_FIELDS.filter((field) => entry[field.key]).map((field) => (
              <p key={field.key}>
                <strong>{field.short}:</strong> {entry[field.key]}
              </p>
            ))}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default FeedbackHistory;