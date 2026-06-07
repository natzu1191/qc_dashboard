import { Sparkline } from '../primitives/Sparkline';
import { Skeleton } from '../primitives/Skeleton';
import './metric.css';

export function MetricHero({ label, value, delta, hint, trend, loading }) {
  return (
    <div className="metric-hero">
      <div className="metric-hero-num">
        {loading ? (
          <Skeleton w="11rem" h="5rem" radius={8} />
        ) : (
          <span className="metric-hero-value tabular">{value ?? '—'}</span>
        )}
      </div>
      <div className="metric-hero-meta">
        <p className="metric-hero-label">{label}</p>
        {hint ? <p className="metric-hero-hint">{hint}</p> : null}
        {delta ? (
          <p className={`metric-hero-delta ${delta.value > 0 ? 'is-up' : delta.value < 0 ? 'is-down' : ''}`}>
            <span aria-hidden="true">{delta.value > 0 ? '↑' : delta.value < 0 ? '↓' : '·'}</span>
            <span className="tabular">{delta.label}</span>
            <span className="metric-hero-delta-suffix">vs. previous</span>
          </p>
        ) : null}
      </div>
      {trend && trend.length > 1 ? (
        <div className="metric-hero-trend">
          <Sparkline data={trend} width={280} height={56} />
        </div>
      ) : null}
    </div>
  );
}
