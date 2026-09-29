import { useState } from "react";
import { Star } from "lucide-react";

// (3a) React program using the useState hook — clicking a star updates
// state immediately. Icons (lucide's Star), not emoji.
function StarRating({ rating, onRatingChange }) {
  const [hovered, setHovered] = useState(0);

  function handleClick(value) {
    onRatingChange(value);
  }

  return (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`star ${star <= (hovered || rating) ? "star-filled" : ""}`}
          onClick={() => handleClick(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
        >
          <Star
            size={26}
            strokeWidth={1.5}
            fill={star <= (hovered || rating) ? "currentColor" : "none"}
          />
        </span>
      ))}
      <p className="rating-value">
        {rating > 0 ? `You rated ${rating} / 5` : "Click a star to rate"}
      </p>
    </div>
  );
}

export default StarRating;
