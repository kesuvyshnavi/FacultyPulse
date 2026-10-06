// (2b) React Functional Component
// (2d) Conditional Rendering — shows an empty-state message until feedback
// has actually been submitted, then switches to the filled summary view.
function FeedbackSummaryCard({ faculty, subject, average, overallRating, strengths, status }) {
  // (2e) Displaying String Literals
  const summaryHeading = "Feedback Summary";
  const noFeedbackText = "No feedback submitted yet. Choose a subject under Give Feedback to get started.";
  const thankYouText = "Thank you for helping us improve teaching quality!";

  if (status !== "Submitted") {
    return (
      <div className="summary-card summary-empty">
        <h3>{summaryHeading}</h3>
        <p>{noFeedbackText}</p>
      </div>
    );
  }

  return (
    <div className="summary-card summary-filled">
      <h3>{summaryHeading}</h3>
      <p>
        <strong>Faculty:</strong> {faculty}
      </p>
      <p>
        <strong>Subject:</strong> {subject}
      </p>
      <p>
        <strong>Overall rating:</strong> {overallRating} / 5
      </p>
      <p>
        <strong>Average score:</strong> {average} / 5
      </p>
      {strengths && (
        <p>
          <strong>Strengths you noted:</strong> {strengths}
        </p>
      )}
      <p className="thank-you-text">{thankYouText}</p>
    </div>
  );
}

export default FeedbackSummaryCard;