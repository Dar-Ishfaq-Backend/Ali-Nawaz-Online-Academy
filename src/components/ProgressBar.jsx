// Reusable progress bar component
export default function ProgressBar({ value = 0, label, showLabel = true, height = 6, className = '' }) {
  const pct = Math.min(100, Math.max(0, value));
  const color = pct === 100 ? '#10b981' : pct >= 50 ? '#f59e0b' : '#059669';

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between items-center mb-1.5">
          {label && <span className="text-xs font-crimson text-cream/60">{label}</span>}
          <span className="text-xs font-cinzel font-bold ml-auto" style={{ color }}>
            {pct}%
          </span>
        </div>
      )}
      <div className="progress-track" style={{ height: `${height}px` }}>
        <div className="progress-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
