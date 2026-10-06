import { useState } from "react";
import { ArrowLeft, ArrowRight, Send } from "lucide-react";
import { FEEDBACK_CATEGORIES, COMMENT_FIELDS, RATING_LABELS } from "../data";
import RatingScale from "./RatingScale";
import StarRating from "./StarRating";

// (3a) useState + (3d) Forms — the step-by-step feedback form.
// Flow: Teaching → Methodology → Punctuality → Communication → Classroom →
// Assessment → Mentoring → Professionalism → Overall → Submit.
// All rating questions are mandatory; the three comment boxes are optional.

const TOTAL_STEPS = FEEDBACK_CATEGORIES.length;

// 0 means "not answered yet".
function emptyAnswers() {
  const answers = {};
  FEEDBACK_CATEGORIES.forEach((category) => {
    answers[category.key] = category.questions.map(() => 0);
  });
  return answers;
}

function emptyComments() {
  const comments = {};
  COMMENT_FIELDS.forEach((field) => {
    comments[field.key] = "";
  });
  return comments;
}

function FeedbackForm({ onSubmit, onBack }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState(emptyAnswers);
  const [overallRating, setOverallRating] = useState(0);
  const [comments, setComments] = useState(emptyComments);
  const [error, setError] = useState("");
  const [showMissing, setShowMissing] = useState(false);

  const category = FEEDBACK_CATEGORIES[step];
  const isLastStep = step === TOTAL_STEPS - 1;
  const percent = Math.round(((step + 1) / TOTAL_STEPS) * 100);

  function handleRate(categoryKey, questionIndex, value) {
    setAnswers((prev) => ({
      ...prev,
      [categoryKey]: prev[categoryKey].map((v, i) => (i === questionIndex ? value : v)),
    }));
    setError("");
  }

  function handleComment(key, value) {
    setComments((prev) => ({ ...prev, [key]: value }));
  }

  // Every rating on the current step must be answered before moving on.
  function stepIsComplete() {
    let missing = answers[category.key].filter((v) => v === 0).length;
    if (category.isFinal && overallRating === 0) missing += 1;

    if (missing > 0) {
      setShowMissing(true);
      setError(
        `Please answer all questions on this step (${missing} remaining) before continuing.`
      );
      return false;
    }
    setShowMissing(false);
    setError("");
    return true;
  }

  function goToStep(nextStep) {
    setStep(nextStep);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handlePrevious() {
    setError("");
    setShowMissing(false);
    if (step === 0) {
      onBack();
    } else {
      goToStep(step - 1);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!stepIsComplete()) return;

    if (!isLastStep) {
      goToStep(step + 1);
      return;
    }

    onSubmit({
      answers,
      overallRating,
      strengths: comments.strengths.trim(),
      improvements: comments.improvements.trim(),
      suggestions: comments.suggestions.trim(),
    });
  }

  return (
    <form className="panel feedback-form" onSubmit={handleSubmit} noValidate>
      <div className="progress-head">
        <span>
          Step {step + 1} of {TOTAL_STEPS} — {category.title}
        </span>
        <span>{percent}%</span>
      </div>
      <div
        className="progress-track"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
      >
        <div className="progress-fill" style={{ width: `${percent}%` }} />
      </div>

      <h3>{category.title}</h3>
      <p className="panel-muted">{category.purpose}</p>

      <div className="scale-legend">
        {RATING_LABELS.map((option) => (
          <span key={option.value}>
            <strong>{option.value}</strong> {option.label}
          </span>
        ))}
      </div>

      {category.questions.map((question, index) => (
        <div
          key={question}
          className={`question-row ${
            showMissing && answers[category.key][index] === 0 ? "question-missing" : ""
          }`}
        >
          <p className="question-text">
            <span className="question-num">{index + 1}.</span> {question}
          </p>
          <RatingScale
            value={answers[category.key][index]}
            onChange={(value) => handleRate(category.key, index, value)}
          />
        </div>
      ))}

      {category.isFinal && (
        <>
          <div className={`overall-rating ${showMissing && overallRating === 0 ? "question-missing" : ""}`}>
            <label>Overall Rating</label>
            <p className="panel-muted">How would you rate this faculty overall?</p>
            <StarRating rating={overallRating} onRatingChange={setOverallRating} />
          </div>

          <h4 className="comments-heading">Comments (optional)</h4>
          {COMMENT_FIELDS.map((field) => (
            <div key={field.key}>
              <label htmlFor={`comment-${field.key}`}>{field.label}</label>
              <textarea
                id={`comment-${field.key}`}
                rows={3}
                value={comments[field.key]}
                onChange={(e) => handleComment(field.key, e.target.value)}
              />
            </div>
          ))}
        </>
      )}

      {error && <p className="form-error">{error}</p>}

      <div className="button-row">
        <button type="button" onClick={handlePrevious}>
          <ArrowLeft size={14} style={{ verticalAlign: "-2px", marginRight: 6 }} />
          {step === 0 ? "Change faculty" : "Previous"}
        </button>
        <button type="submit">
          {isLastStep ? "Submit Feedback" : "Next"}
          {isLastStep ? (
            <Send size={14} style={{ verticalAlign: "-2px", marginLeft: 6 }} />
          ) : (
            <ArrowRight size={14} style={{ verticalAlign: "-2px", marginLeft: 6 }} />
          )}
        </button>
      </div>
    </form>
  );
}

export default FeedbackForm;