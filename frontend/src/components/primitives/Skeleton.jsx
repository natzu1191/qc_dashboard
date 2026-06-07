import './skeleton.css';

export function Skeleton({ w = '100%', h = '1em', radius = 4, style }) {
  return (
    <span
      className="skeleton"
      style={{ width: w, height: h, borderRadius: radius, ...style }}
      aria-hidden="true"
    />
  );
}
