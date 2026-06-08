import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Modal } from '../../components/primitives/Modal';
import { StatusChip } from '../../components/primitives/StatusChip';
import { Button } from '../../components/primitives/Button';
import { fmtDate } from '../../lib/format';
import { api } from '../../lib/api';
import './complaint-detail.css';

export function ComplaintDetailModal({ open, complaint, onOpenChange, onHighlight, highlightedId, onDeleted, onEdit }) {
  const [urls, setUrls] = useState({});
  const [loadingAtt, setLoadingAtt] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const keys = complaint?.attachments ? complaint.attachments.split(',') : [];

  useEffect(() => {
    if (open) setConfirmDelete(false);
  }, [open, complaint]);

  useEffect(() => {
    if (!open || !complaint || keys.length === 0) {
      setUrls({});
      return;
    }
    let alive = true;
    setLoadingAtt(true);
    Promise.all(
      keys.map((k) =>
        api.attachmentUrl(k)
          .then((d) => ({ key: k, url: d.url }))
          .catch(() => ({ key: k, url: null }))
      )
    ).then((rs) => {
      if (!alive) return;
      const map = {};
      rs.forEach((r) => { map[r.key] = r.url; });
      setUrls(map);
      setLoadingAtt(false);
    });
    return () => { alive = false; };
  }, [open, complaint]);

  async function handleDelete() {
    if (!complaint?.id) return;
    setDeleting(true);
    try {
      await api.deleteComplaint(complaint.id);
      toast.success(`Deleted ${complaint.code}`);
      onDeleted && onDeleted();
      onOpenChange(false);
    } catch (err) {
      toast.error('Could not delete complaint', { description: err.message });
      setConfirmDelete(false);
    } finally {
      setDeleting(false);
    }
  }

  if (!complaint) return <Modal open={open} onOpenChange={onOpenChange} />;

  return (
    <Modal open={open} onOpenChange={onOpenChange} width={620}>
      <Modal.Header title="Complaint" subtitle={complaint.code} />
      <Modal.Body padded>
        <div className="cd-grid">
          <div className="cd-item">
            <span className="cd-label">Date</span>
            <span className="cd-value">{fmtDate(complaint.date)}</span>
          </div>
          <div className="cd-item">
            <span className="cd-label">Batch number</span>
            <span className="cd-value mono">{complaint.batch_number}</span>
          </div>
          <div className="cd-item">
            <span className="cd-label">Validity</span>
            <StatusChip
              tone={complaint.is_valid ? 'ok' : 'bad'}
              label={complaint.is_valid ? 'Valid' : 'Invalid'}
            />
          </div>
          <div className="cd-item">
            <span className="cd-label">Logged</span>
            <span className="cd-value">{fmtDate(complaint.createdDate)}</span>
          </div>
          <div className="cd-item cd-item--full">
            <span className="cd-label">Reason</span>
            <p className="cd-text">{complaint.reason}</p>
          </div>
          <div className="cd-item cd-item--full">
            <span className="cd-label">QC validation</span>
            <p className="cd-text">{complaint.qc_validation}</p>
          </div>
          {keys.length > 0 ? (
            <div className="cd-item cd-item--full">
              <span className="cd-label">Attachments</span>
              {loadingAtt ? (
                <p className="cd-text cd-dim">Loading attachments…</p>
              ) : (
                <ul className="cd-attachments">
                  {keys.map((k, i) => {
                    const url = urls[k];
                    const name = k.split('/').pop();
                    return (
                      <li key={i}>
                        {url ? (
                          <a href={url} target="_blank" rel="noreferrer" className="cd-attachment">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <path d="M21 11.5V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7.5" />
                              <path d="M15 3h6v6" /><path d="M10 14L21 3" />
                            </svg>
                            {name}
                          </a>
                        ) : (
                          <span className="cd-attachment cd-dim">{name} (unavailable)</span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          ) : null}
        </div>
      </Modal.Body>
      <Modal.Footer>
        {complaint.id && (
          confirmDelete ? (
            <div style={{ marginRight: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.8125rem', color: 'var(--ink-2)' }}>Delete this complaint?</span>
              <Button variant="ghost" onClick={() => setConfirmDelete(false)} disabled={deleting}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleDelete} loading={deleting}>
                Confirm delete
              </Button>
            </div>
          ) : (
            <Button
              variant="ghost"
              onClick={() => setConfirmDelete(true)}
              style={{ marginRight: 'auto', color: 'var(--bad)' }}
            >
              Delete
            </Button>
          )
        )}
        {!confirmDelete && onHighlight && complaint.id && (
          <Button
            variant="ghost"
            onClick={() => onHighlight(complaint.id)}
            disabled={highlightedId === complaint.id}
          >
            {highlightedId === complaint.id ? '★ Highlighted on TV' : 'Highlight on TV'}
          </Button>
        )}
        {!confirmDelete && onEdit && complaint.id && (
          <Button variant="ghost" onClick={() => onEdit(complaint)}>Edit</Button>
        )}
        {!confirmDelete && (
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Close</Button>
        )}
      </Modal.Footer>
    </Modal>
  );
}
