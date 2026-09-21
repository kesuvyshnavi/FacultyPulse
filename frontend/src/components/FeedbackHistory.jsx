// (3c) Props — this component holds no state of its own; it receives the
// feedback history array from its parent (StudentDashboard) as a prop,
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
            <strong>{entry.faculty}</strong> ({entry.subject}) — {entry.rating}/5
            <p>{entry.comments}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default FeedbackHistory;
