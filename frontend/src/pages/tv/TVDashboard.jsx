import { MetricHero } from '../../components/data/MetricHero';
import { MetricCompact } from '../../components/data/MetricCompact';
import { Worklist } from '../../components/data/Worklist';
import { HorizontalBars } from '../../components/data/HorizontalBars';
import { fmtDelta } from '../../lib/format';

export function TVDashboard({ data, complaints = [], recentCases = [], loading }) {
  const qualityIssues = data?.quality_issues ?? [];
  const thisMonth = qualityIssues[qualityIssues.length - 1];
  const prevMonth = qualityIssues[qualityIssues.length - 2];
  const delta = thisMonth && prevMonth ? fmtDelta(thisMonth.count, prevMonth.count) : null;

  const pending = data?.pending_resamples || { not_resampled: 0, for_investigation: 0 };
  const pendingTotal = (pending.not_resampled || 0) + (pending.for_investigation || 0);

  const disableRates = data?.disable_rates ?? [];
  const latestRate = disableRates[disableRates.length - 1];

  const qsRatings = (data?.qs_ratings || []).map((r) => ({ label: r.feedback, value: r.value }));

  return (
    <div className="tv-dashboard">
      <header className="tv-section-head">
        <h1>Quality control · {thisMonth ? thisMonth.month : '—'}</h1>
      </header>

      <MetricHero
        label="Quality issues"
        value={thisMonth?.count ?? '—'}
        hint={thisMonth ? `${thisMonth.month} this year` : null}
        delta={delta}
        trend={qualityIssues.map((q) => q.count)}
        loading={loading}
      />

      <div className="metric-band tv-metric-band">
        <MetricCompact
          label="Pending resamples"
          value={pendingTotal}
          hint={`${pending.not_resampled || 0} no resample · ${pending.for_investigation || 0} at QC`}
          loading={loading}
        />
        <MetricCompact
          label="Open complaints"
          value={complaints.length}
          loading={loading}
        />
        <MetricCompact
          label="Resample rate"
          value={latestRate?.percentage ?? '—'}
          suffix="%"
          hint={latestRate ? `${latestRate.month}` : null}
          loading={loading}
        />
      </div>

      <section className="tv-section">
        <h2>Recent activity</h2>
        <Worklist rows={recentCases.slice(0, 5)} loading={loading} emptyHint="No cases logged yet." />
      </section>

      <section className="tv-section">
        <h2>Disposition mix</h2>
        <HorizontalBars items={qsRatings} loading={loading} label="conditions" />
      </section>
    </div>
  );
}
