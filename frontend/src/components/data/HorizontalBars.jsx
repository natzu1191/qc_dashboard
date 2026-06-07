import { Skeleton } from '../primitives/Skeleton';
import './horizontal-bars.css';

export function HorizontalBars({ items = [], loading, max, label }) {
  const computedMax = max ?? Math.max(1, ...items.map((i) => i.value));
  if (loading) {
    return (
      <div className="hbars">
        {[0, 1, 2, 3].map((i) => (
          <div className="hbar" key={i}>
            <Skeleton w="4rem" h="0.8125rem" />
            <Skeleton w="100%" h="0.5rem" />
            <Skeleton w="1.5rem" h="0.8125rem" />
          </div>
        ))}
      </div>
    );
  }
  if (!items.length) {
    return <p className="hbars-empty">{label ? `No ${label}` : 'No data'}</p>;
  }
  return (
    <div className="hbars">
      {items.map((item) => (
        <div className="hbar" key={item.label}>
          <span className="hbar-label">{item.label}</span>
          <span className="hbar-track" aria-hidden="true">
            <span
              className="hbar-fill"
              style={{ width: `${Math.max(2, (item.value / computedMax) * 100)}%` }}
            />
          </span>
          <span className="hbar-value tabular">{item.value}</span>
        </div>
      ))}
    </div>
  );
}
