import { useMemo, useRef, useState } from 'react';
import { StatusChip } from '../components/primitives/StatusChip';
import { Skeleton } from '../components/primitives/Skeleton';
import { Button } from '../components/primitives/Button';
import { Kbd } from '../components/primitives/Kbd';
import { fmtShortDate, fmtRelative } from '../lib/format';
import { useHotkey } from '../lib/keys';
import './all-cases.css';

const VALIDITY_FILTERS = [
  { value: 'all', label: 'All', match: () => true },
  { value: 'valid', label: 'Valid', match: (r) => !!r.is_valid },
  { value: 'invalid', label: 'Invalid', match: (r) => !r.is_valid },
];

function sortRows(rows, sortBy, dir) {
  if (!sortBy) return rows;
  const m = dir === 'asc' ? 1 : -1;
  return [...rows].sort((a, b) => {
    const av = a[sortBy] ?? '';
    const bv = b[sortBy] ?? '';
    if (av < bv) return -1 * m;
    if (av > bv) return 1 * m;
    return 0;
  });
}

export function AllComplaints({ complaints = [], loading, onSelect, onEdit, highlightedId, onHighlight }) {
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState('updatedDate');
  const [sortDir, setSortDir] = useState('desc');
  const searchRef = useRef(null);

  useHotkey('/', () => { searchRef.current?.focus(); });

  const filtered = useMemo(() => {
    const f = VALIDITY_FILTERS.find((x) => x.value === filter);
    const matchFilter = f ? f.match : () => true;
    const q = query.trim().toLowerCase();
    const base = complaints.filter((r) => {
      if (!matchFilter(r)) return false;
      if (!q) return true;
      return (
        String(r.code || '').toLowerCase().includes(q) ||
        String(r.batch_number || '').toLowerCase().includes(q) ||
        String(r.reason || '').toLowerCase().includes(q) ||
        String(r.qc_validation || '').toLowerCase().includes(q)
      );
    });
    return sortRows(base, sortBy, sortDir);
  }, [complaints, filter, query, sortBy, sortDir]);

  function toggleSort(col) {
    if (sortBy === col) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortBy(col); setSortDir('asc'); }
  }

  function sortIcon(col) {
    if (sortBy !== col) return null;
    return <span className="ac-sort">{sortDir === 'asc' ? '↑' : '↓'}</span>;
  }

  return (
    <>
      <header className="dash-head ac-head">
        <div>
          <h1 className="dash-title">Complaints</h1>
          <p className="dash-sub tabular">{filtered.length} of {complaints.length} record{complaints.length === 1 ? '' : 's'}</p>
        </div>
      </header>

      <div className="ac-controls">
        <div className="ac-search">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            ref={searchRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search code, batch, reason…"
            className="ac-search-input"
          />
          <Kbd>/</Kbd>
        </div>

        <div className="ac-filters">
          {VALIDITY_FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              className={`ac-filter${filter === f.value ? ' is-active' : ''}`}
              onClick={() => setFilter(f.value)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="ac-table-wrap">
        <table className="ac-table">
          <thead>
            <tr>
              <th onClick={() => toggleSort('code')}><span>Code{sortIcon('code')}</span></th>
              <th onClick={() => toggleSort('batch_number')}><span>Batch{sortIcon('batch_number')}</span></th>
              <th onClick={() => toggleSort('date')}><span>Date{sortIcon('date')}</span></th>
              <th>Reason</th>
              <th>QC validation</th>
              <th>Validity</th>
              <th onClick={() => toggleSort('updatedDate')}><span>Updated{sortIcon('updatedDate')}</span></th>
              <th aria-label="actions" />
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 8 }).map((__, j) => (
                      <td key={j}><Skeleton w="80%" h="1rem" /></td>
                    ))}
                  </tr>
                ))
              : filtered.length === 0
                ? (
                  <tr><td colSpan={8} className="ac-empty">No complaints match your filters.</td></tr>
                )
                : filtered.map((row) => {
                    const isHi = highlightedId && row.id === highlightedId;
                    return (
                      <tr
                        key={row.id || row.code}
                        className={`ac-row-clickable${isHi ? ' is-highlighted' : ''}`}
                        onClick={() => onSelect && onSelect(row)}
                      >
                        <td className="ac-mono">
                          {isHi ? <span className="ac-pin" aria-label="Highlighted on TV">★</span> : null}
                          {row.code}
                        </td>
                        <td className="ac-mono ac-dim">{row.batch_number}</td>
                        <td className="ac-mono ac-dim">{fmtShortDate(row.date)}</td>
                        <td className="ac-reason" title={row.reason}>{row.reason || '—'}</td>
                        <td className="ac-reason ac-dim" title={row.qc_validation}>{row.qc_validation || '—'}</td>
                        <td>
                          <StatusChip tone={row.is_valid ? 'ok' : 'bad'} label={row.is_valid ? 'Valid' : 'Invalid'} />
                        </td>
                        <td className="ac-dim">{fmtRelative(row.updatedDate || row.createdDate || row.date)}</td>
                        <td className="ac-actions" onClick={(e) => e.stopPropagation()}>
                          {onHighlight && row.id && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onHighlight(row.id)}
                              title={isHi ? 'Already highlighted' : 'Highlight on TV'}
                              disabled={isHi}
                            >
                              {isHi ? '★ On TV' : 'Highlight'}
                            </Button>
                          )}
                          <Button variant="ghost" size="sm" onClick={() => onEdit && onEdit(row)}>Edit</Button>
                        </td>
                      </tr>
                    );
                  })}
          </tbody>
        </table>
      </div>
    </>
  );
}
