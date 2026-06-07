import { Skeleton } from '../primitives/Skeleton';

export function MetricCompact({ label, value, hint, suffix, loading, onClick }) {
  const Comp = onClick ? 'button' : 'div';
  return (
    <Comp
      className={`metric-compact${onClick ? ' is-clickable' : ''}`}
      onClick={onClick}
      type={onClick ? 'button' : undefined}
    >
      <p className="metric-compact-label">{label}</p>
      <p className="metric-compact-value tabular">
        {loading ? (
          <Skeleton w="3.5rem" h="2rem" />
        ) : (
          <>
            {value ?? '—'}
            {suffix ? <span className="metric-compact-suffix">{suffix}</span> : null}
          </>
        )}
      </p>
      {hint ? <p className="metric-compact-hint">{hint}</p> : null}
    </Comp>
  );
}
