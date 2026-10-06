import { RATING_LABELS } from "../data";

// (3c) Props — a small controlled component: the parent owns the value,
// this just renders five 1–5 buttons and reports clicks back up.
function RatingScale({ value, onChange }) {
  return (
    <div className="rating-scale" role="radiogroup">
      {RATING_LABELS.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={value === option.value}
          aria-label={`${option.value} – ${option.label}`}
          title={option.label}
          className={`scale-btn ${value === option.value ? "scale-btn-active" : ""}`}
          onClick={() => onChange(option.value)}
        >
          {option.value}
        </button>
      ))}
    </div>
  );
}

export default RatingScale;