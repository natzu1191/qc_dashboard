import { MetricHero } from '../components/data/MetricHero';
import { MetricCompact } from '../components/data/MetricCompact';
import { Worklist } from '../components/data/Worklist';
import { HorizontalBars } from '../components/data/HorizontalBars';
import { ComplaintsList } from '../components/data/ComplaintsList';
import { fmtDelta } from '../lib/format';
import './dashboard.css';

export function Dashboard({
  data,
  complaints,
  recentCases,
  loading,
  onOpenComplaint,
  onSelectCase,
  onNavigateCases,
}) {
  const qualityIssues = data?.quality_issues ?? [];
  const thisMonth = qualityIssues[qualityIssues.length - 1];
  const prevMonth = qualityIssues[qualityIssues.length - 2];
  const delta = thisMonth && prevMonth ? fmtDelta(thisMonth.count, prevMonth.count) : null;

  const pending = data?.pending_resamples || { not_resampled: 0, for_investigation: 0 };
  const pendingTotal = (pending.not_resampled || 0) + (pending.for_investigation || 0);

  const disableRates = data?.disable_rates ?? [];
  const latestRate = disableRates[disableRates.length - 1];

  const qsRatings = (data?.qs_ratings || []).map((r) => ({ label: r.feedback, value: r.value }));
  const qsMonth = data?.qs_ratings_month;

  const openComplaints = complaints.filter((c) => c.is_valid !== false).length || complaints.length;

  return (
    <>
      <header className="dash-head">
        <div>
          <h1 className="dash-title">Dashboard</h1>
          <p className="dash-sub">{thisMonth ? `${thisMonth.month} · ${data?.year ?? new Date().getFullYear()}` : 'Loading…'}</p>
        </div>
      </header>

      <MetricHero
        label="Quality issues"
        value={thisMonth?.count ?? '—'}
        hint={thisMonth ? `${thisMonth.month} this year` : null}
        delta={delta}
        trend={qualityIssues.map((q) => q.count)}
        loading={loading}
      />

      <div className="metric-band">
        <MetricCompact
          label="Pending resamples"
          value={pendingTotal}
          hint={`${pending.not_resampled || 0} no resample · ${pending.for_investigation || 0} at QC`}
          loading={loading}
          onClick={onNavigateCases}
        />
        <MetricCompact
          label="Open complaints"
          value={complaints.length}
          hint={`${openComplaints} marked valid`}
          loading={loading}
          onClick={onOpenComplaint}
        />
        <MetricCompact
          label="Resample rate"
          value={latestRate?.percentage ?? '—'}
          suffix="%"
          hint={latestRate ? `${latestRate.month}` : null}
          loading={loading}
        />
        <MetricCompact
          label="QS reviews"
          value={qsRatings.reduce((a, b) => a + b.value, 0) || '—'}
          hint={qsMonth ? `Conditions logged in ${qsMonth}` : null}
          loading={loading}
        />
      </div>

      <section className="dash-section">
        <div className="dash-section-head">
          <h2>Recent activity</h2>
          <button type="button" className="dash-link" onClick={onNavigateCases}>
            View all cases <span aria-hidden="true">→</span>
          </button>
        </div>
        <Worklist
          rows={recentCases}
          loading={loading}
          onSelect={onSelectCase}
          emptyHint="No cases logged yet. Press L to file the first one."
        />
      </section>

      <div className="dash-secondary">
        <section className="dash-section">
          <div className="dash-section-head">
            <h2>Disposition mix</h2>
            <p className="dash-meta">{qsMonth || '—'}</p>
          </div>
          <HorizontalBars items={qsRatings} loading={loading} label="conditions" />
        </section>

        <section className="dash-section">
          <div className="dash-section-head">
            <h2>Recent complaints</h2>
            <p className="dash-meta">{complaints.length} total</p>
          </div>
          <ComplaintsList items={complaints} loading={loading} onSelect={onOpenComplaint} />
        </section>
      </div>
    </>
  );
}
