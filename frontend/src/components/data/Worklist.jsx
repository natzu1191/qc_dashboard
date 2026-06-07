import { StatusChip } from '../primitives/StatusChip';
import { fmtRelative } from '../../lib/format';
import { Skeleton } from '../primitives/Skeleton';
import './worklist.css';

const STATUS_LABEL = {
  0: 'Others',
  1: 'No resample',
  2: 'Resample to QC',
  5: 'QC disposition',
};

const STATUS_TONE = {
  0: 'neutral',
  1: 'warn',
  2: 'neutral',
  5: 'warn',
};

function resolveResultTone(row) {
  if (row.disposition_result === 'approved') return { tone: 'ok', label: 'Approved' };
  if (row.disposition_result === 'conditionally approved') return { tone: 'warn', label: 'Conditional' };
  if (row.disposition_result === 'failed') return { tone: 'bad', label: 'Failed' };
  return { tone: STATUS_TONE[row.status] || 'neutral', label: STATUS_LABEL[row.status] || 'Pending' };
}

export function Worklist({ rows = [], loading, onSelect, emptyHint = 'No cases yet.' }) {
  if (loading) {
    return (
      <div className="worklist">
        {[0, 1, 2, 3].map((i) => (
          <div className="worklist-row worklist-row--skeleton" key={i}>
            <Skeleton w="6rem" h="1.125rem" />
            <Skeleton w="7rem" h="1.125rem" />
            <Skeleton w="9rem" h="1.125rem" />
            <Skeleton w="4rem" h="1.125rem" />
          </div>
        ))}
      </div>
    );
  }

  if (!rows.length) {
    return <p className="worklist-empty">{emptyHint}</p>;
  }

  return (
    <div className="worklist" role="list">
      {rows.map((row) => {
        const status = resolveResultTone(row);
        return (
          <button
            type="button"
            role="listitem"
            key={row.id || row.code}
            className="worklist-row"
            onClick={() => onSelect && onSelect(row)}
          >
            <span className="worklist-code">{row.code}</span>
            <span className="worklist-batch">{row.batch_number}</span>
            <span className="worklist-status">
              <StatusChip tone={status.tone} label={status.label} />
            </span>
            <span className="worklist-reason" title={row.reason}>{row.reason || '—'}</span>
            <span className="worklist-time tabular">{fmtRelative(row.updatedDate || row.createdDate || row.date)}</span>
          </button>
        );
      })}
    </div>
  );
}
