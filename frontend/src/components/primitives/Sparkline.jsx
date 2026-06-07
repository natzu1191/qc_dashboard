/**
 * Sparkline — tiny inline trend chart.
 *
 * Pure SVG, no library. Pass an array of {value} (or numbers); draws
 * a smooth area + line. Designed to sit next to a hero numeral, not
 * to be interactive.
 */
export function Sparkline({
  data = [],
  width = 180,
  height = 44,
  stroke = 'var(--ink-1)',
  fill = 'var(--ink-1)',
  fillOpacity = 0.08,
  strokeWidth = 1.5,
}) {
  const values = data.map((d) => (typeof d === 'number' ? d : d.value ?? d.count ?? 0));
  if (values.length < 2) {
    return (
      <svg width={width} height={height} aria-hidden="true">
        <line x1="0" y1={height - 1} x2={width} y2={height - 1} stroke="var(--hairline)" />
      </svg>
    );
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const step = width / (values.length - 1);
  const yFor = (v) => height - 2 - ((v - min) / range) * (height - 6);

  const points = values.map((v, i) => [i * step, yFor(v)]);
  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0].toFixed(2)} ${p[1].toFixed(2)}`).join(' ');
  const areaPath = `${linePath} L ${width} ${height} L 0 ${height} Z`;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-label="trend">
      <path d={areaPath} fill={fill} fillOpacity={fillOpacity} stroke="none" />
      <path d={linePath} fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
