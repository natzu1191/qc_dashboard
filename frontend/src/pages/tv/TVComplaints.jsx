import { useMemo } from 'react';
import { StatusChip } from '../../components/primitives/StatusChip';
import { Skeleton } from '../../components/primitives/Skeleton';
import { fmtRelative, fmtShortDate } from '../../lib/format';

export function TVComplaints({ items = [], loading, highlightedId }) {
  const sorted = useMemo(() => {
    const copy = items.slice();
    copy.sort((a, b) => {
      if (a.id === highlightedId) return -1;
      if (b.id === highlightedId) return 1;
      const ta = new Date(a.updatedDate || a.createdDate || a.date).getTime();
      const tb = new Date(b.updatedDate || b.createdDate || b.date).getTime();
      return tb - ta;
    });
    return copy;
  }, [items, highlightedId]);

  const highlighted = highlightedId ? sorted.find((c) => c.id === highlightedId) : null;
  const rest = highlighted ? sorted.filter((c) => c.id !== highlightedId) : sorted;

  if (loading) {
    return (
      <div className="tv-complaints">
        <header className="tv-section-head"><h1>Customer complaints</h1></header>
        {[0, 1, 2].map((i) => <Skeleton key={i} w="100%" h="3rem" />)}
      </div>
    );
  }

  return (
    <div className="tv-complaints">
      <header className="tv-section-head">
        <h1>Customer complaints</h1>
        <p className="tv-section-meta">{items.length} total</p>
      </header>

      {highlighted && (
        <article className="tv-complaint-feature">
          <div className="tv-complaint-feature-head">
            <span className="tv-mono tv-complaint-feature-code">{highlighted.code}</span>
            <StatusChip tone={highlighted.is_valid ? 'ok' : 'bad'} label={highlighted.is_valid ? 'Valid' : 'Invalid'} />
          </div>
          <p className="tv-complaint-feature-reason">{highlighted.reason || '—'}</p>
          <dl className="tv-complaint-feature-meta">
            <div><dt>Batch</dt><dd className="tv-mono">{highlighted.batch_number || '—'}</dd></div>
            <div><dt>Filed</dt><dd>{fmtShortDate(highlighted.date)}</dd></div>
            <div><dt>QC validation</dt><dd>{highlighted.qc_validation || '—'}</dd></div>
          </dl>
        </article>
      )}

      <ul className="tv-complaint-list">
        {rest.slice(0, 8).map((c) => (
          <li key={c.id || c.code} className="tv-complaint-row">
            <span className="tv-mono">{c.code}</span>
            <span className="tv-reason">{c.reason || '—'}</span>
            <StatusChip tone={c.is_valid ? 'ok' : 'bad'} label={c.is_valid ? 'Valid' : 'Invalid'} />
            <span className="tv-dim">{fmtRelative(c.updatedDate || c.createdDate || c.date)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
