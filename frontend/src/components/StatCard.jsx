// Small reusable presentational component driven entirely by props —
// used by all three portals so the "at a glance" numbers look consistent.
function StatCard({ icon: Icon, label, value, tone = "default" }) {
  return (
    <div className={`stat-card stat-tone-${tone}`}>
      <div className="stat-icon">
        <Icon size={20} strokeWidth={2} />
      </div>
      <div>
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  );
}

export default StatCard;
