// (2b) React Functional Component
// (2d) Conditional Rendering — shows an empty-state message until feedback
// has actually been submitted, then switches to the filled summary view.
function FeedbackSummaryCard({ faculty, subject, comments, status }) {
  // (2e) Displaying String Literals
  const summaryHeading = "Feedback Summary";
  const noFeedbackText = "No feedback submitted yet. Please fill the form above.";
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
        <strong>Comments:</strong> {comments}
      </p>
      <p className="thank-you-text">{thankYouText}</p>
    </div>
  );
}

export default FeedbackSummaryCard;
