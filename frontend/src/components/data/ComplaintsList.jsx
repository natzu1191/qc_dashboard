import { StatusChip } from '../primitives/StatusChip';
import { fmtRelative } from '../../lib/format';
import { Skeleton } from '../primitives/Skeleton';
import './complaints-list.css';

export function ComplaintsList({ items = [], loading, onSelect }) {
  if (loading) {
    return (
      <div className="cmpl-list">
        {[0, 1, 2].map((i) => (
          <div className="cmpl-row" key={i}>
            <Skeleton w="5rem" h="1rem" />
            <Skeleton w="4.5rem" h="1rem" />
            <Skeleton w="3rem" h="1rem" />
          </div>
        ))}
      </div>
    );
  }

  if (!items.length) {
    return <p className="cmpl-empty">No complaints recorded.</p>;
  }

  return (
    <div className="cmpl-list">
      {items.slice(0, 6).map((c) => (
        <button
          type="button"
          key={c.id || c.code}
          className="cmpl-row"
          onClick={() => onSelect && onSelect(c)}
        >
          <span className="cmpl-code">{c.code}</span>
          <StatusChip tone={c.is_valid ? 'ok' : 'bad'} label={c.is_valid ? 'Valid' : 'Invalid'} />
          <span className="cmpl-time tabular">{fmtRelative(c.updatedDate || c.createdDate || c.date)}</span>
        </button>
      ))}
    </div>
  );
}
