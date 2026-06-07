import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts';
import './bar-trend.css';

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bartrend-tooltip">
      <div className="bartrend-tooltip-label">{label}</div>
      <div className="bartrend-tooltip-value tabular">{payload[0].value}</div>
    </div>
  );
}

export function BarTrend({ data = [], height = 200 }) {
  const max = Math.max(1, ...data.map((d) => d.count));
  return (
    <div className="bartrend">
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ top: 8, right: 4, left: -16, bottom: 0 }}>
          <XAxis
            dataKey="month"
            tickLine={false}
            axisLine={{ stroke: 'var(--hairline)' }}
            tick={{ fill: 'var(--ink-3)', fontSize: 11, fontFamily: 'var(--font-sans)' }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fill: 'var(--ink-3)', fontSize: 11, fontFamily: 'var(--font-mono)' }}
          />
          <Tooltip
            cursor={{ fill: 'var(--surface-hover)' }}
            content={<CustomTooltip />}
          />
          <Bar dataKey="count" radius={[2, 2, 0, 0]} maxBarSize={28}>
            {data.map((entry, i) => (
              <Cell key={i} fill={i === data.length - 1 ? 'var(--ink-1)' : 'var(--ink-3)'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
