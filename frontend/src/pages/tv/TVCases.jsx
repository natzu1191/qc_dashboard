import { useMemo } from 'react';
import { StatusChip } from '../../components/primitives/StatusChip';
import { Skeleton } from '../../components/primitives/Skeleton';
import { fmtRelative } from '../../lib/format';

const STATUS_LABEL = {
  0: 'Others',
  1: 'No resample',
  2: 'At QC',
  5: 'QC disposition',
};

function resultFor(row) {
  if (row.disposition_result === 'approved') return { tone: 'ok', label: 'Approved' };
  if (row.disposition_result === 'conditionally approved') return { tone: 'warn', label: 'Conditional' };
  if (row.disposition_result === 'failed') return { tone: 'bad', label: 'Failed' };
  return { tone: 'neutral', label: STATUS_LABEL[row.status] || 'Pending' };
}

export function TVCases({ rows = [], loading, filters = {}, highlightedId }) {
  const filtered = useMemo(() => {
    const statusList = Array.isArray(filters.status) ? filters.status : null;
    const result = rows.filter((r) => {
      if (statusList && statusList.length && !statusList.includes(r.status)) return false;
      return true;
    });
    result.sort((a, b) => {
      if (a.id === highlightedId) return -1;
      if (b.id === highlightedId) return 1;
      const ta = new Date(a.updatedDate || a.createdDate || a.date).getTime();
      const tb = new Date(b.updatedDate || b.createdDate || b.date).getTime();
      return tb - ta;
    });
    return result.slice(0, 12);
  }, [rows, filters, highlightedId]);

  return (
    <div className="tv-cases">
      <header className="tv-section-head">
        <h1>All cases</h1>
        <p className="tv-section-meta">{filtered.length} showing</p>
      </header>

      <div className="tv-cases-table" role="table">
        <div className="tv-cases-head" role="row">
          <span role="columnheader">Code</span>
          <span role="columnheader">Batch</span>
          <span role="columnheader">Reason</span>
          <span role="columnheader">Status</span>
          <span role="columnheader">Updated</span>
        </div>
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div className="tv-cases-row" role="row" key={i}>
                <Skeleton w="60%" h="1.5rem" />
                <Skeleton w="60%" h="1.5rem" />
                <Skeleton w="80%" h="1.5rem" />
                <Skeleton w="60%" h="1.5rem" />
                <Skeleton w="50%" h="1.5rem" />
              </div>
            ))
          : filtered.length === 0
            ? <p className="tv-empty">No cases match the current filters.</p>
            : filtered.map((row) => {
                const result = resultFor(row);
                const isHi = row.id === highlightedId;
                return (
                  <div
                    role="row"
                    key={row.id || row.code}
                    className={`tv-cases-row${isHi ? ' is-highlighted' : ''}`}
                  >
                    <span className="tv-mono">{row.code}</span>
                    <span className="tv-mono tv-dim">{row.batch_number}</span>
                    <span className="tv-reason">{row.reason || '—'}</span>
                    <span><StatusChip tone={result.tone} label={result.label} /></span>
                    <span className="tv-dim">{fmtRelative(row.updatedDate || row.createdDate || row.date)}</span>
                  </div>
                );
              })}
      </div>
    </div>
  );
}
