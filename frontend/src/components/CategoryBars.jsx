import { formatScore } from "../data";

// (3c) Props + (3e) map() — one horizontal bar per feedback category.
// Used by both the Faculty and Admin portals so category results look
// identical everywhere.
function CategoryBars({ scores }) {
  return (
    <div className="category-bars">
      {scores.map((s) => (
        <div className="category-bar-row" key={s.key}>
          <span className="category-bar-label">{s.title}</span>
          <div className="category-bar-track">
            <div
              className="category-bar-fill"
              style={{ width: `${s.avg ? (s.avg / 5) * 100 : 0}%` }}
            />
          </div>
          <span className="category-bar-value">{formatScore(s.avg)}</span>
        </div>
      ))}
    </div>
  );
}

export default CategoryBars;