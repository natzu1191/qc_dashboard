import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Sheet } from '../../components/primitives/Sheet';
import { Field } from '../../components/forms/Field';
import { Button } from '../../components/primitives/Button';
import { api } from '../../lib/api';

const STATUS_OPTIONS = [
  { value: 0, label: 'Others' },
  { value: 1, label: 'No resample' },
  { value: 2, label: 'Resample submitted to QC' },
  { value: 5, label: 'QC disposition' },
];

const DISPOSITION_OPTIONS = ['approved', 'conditionally approved', 'failed'];
const CONDITION_OPTIONS = ['Formula', 'Process', 'FBC', 'Material'];

function initialFor(qcCase) {
  if (!qcCase) return null;
  const saved = qcCase.disposition_conditions ? qcCase.disposition_conditions.split(',') : [];
  // Default the status select to the current status (not "the other ones")
  return {
    status: String(qcCase.status ?? ''),
    qc_disposition: qcCase.qc_disposition ?? '',
    notes: qcCase.notes ?? '',
    result_after_resample: qcCase.result_after_resample ?? '',
    disposition_result: qcCase.disposition_result ?? '',
    disposition_conditions: saved,
  };
}

export function EditCaseSheet({ open, qcCase, onOpenChange, onUpdated, onHighlight, highlightedId }) {
  const [form, setForm] = useState(() => initialFor(qcCase));
  const [submitting, setSubmitting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (open && qcCase) {
      setForm(initialFor(qcCase));
      setConfirmDelete(false);
    }
  }, [open, qcCase]);

  if (!qcCase || !form) {
    return <Sheet open={open} onOpenChange={onOpenChange} width={480} />;
  }

  const isQcDisposition = form.status === '5';
  const isConditional = isQcDisposition && form.disposition_result === 'conditionally approved';

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function toggleCondition(condition) {
    setForm((prev) => ({
      ...prev,
      disposition_conditions: prev.disposition_conditions.includes(condition) ? [] : [condition],
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        code: qcCase.code,
        status: Number(form.status),
        qc_disposition: form.qc_disposition || null,
        notes: form.notes || null,
        result_after_resample: form.result_after_resample !== '' ? Number(form.result_after_resample) : null,
        disposition_result: isQcDisposition ? (form.disposition_result || null) : null,
        disposition_conditions: isConditional && form.disposition_conditions.length > 0
          ? form.disposition_conditions.join(',')
          : null,
      };
      await api.updateCase(payload);
      toast.success(`Updated ${qcCase.code}`);
      onUpdated && onUpdated();
      onOpenChange(false);
    } catch (err) {
      toast.error('Could not update case', { description: err.message });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!qcCase?.id) return;
    setDeleting(true);
    try {
      await api.deleteCase(qcCase.id);
      toast.success(`Deleted ${qcCase.code}`);
      onUpdated && onUpdated();
      onOpenChange(false);
    } catch (err) {
      toast.error('Could not delete case', { description: err.message });
      setConfirmDelete(false);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange} width={520}>
      <form onSubmit={handleSubmit} style={{ display: 'contents' }}>
        <Sheet.Header
          title="Edit case"
          subtitle={`${qcCase.code} · ${qcCase.batch_number}`}
        />
        <Sheet.Body>
          <div className="form-grid form-grid--stack">
            <Field label="Status" htmlFor="ec-status">
              <select id="ec-status" name="status" value={form.status} onChange={handleChange} className="select">
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </Field>

            <Field label="Result after resample" htmlFor="ec-result" hint="Numeric measurement after re-test">
              <input
                id="ec-result"
                name="result_after_resample"
                type="number"
                step="any"
                value={form.result_after_resample ?? ''}
                onChange={handleChange}
                className="input input--mono"
                placeholder="e.g. 99.1"
              />
            </Field>

            {isQcDisposition ? (
              <Field label="Disposition result" htmlFor="ec-disp">
                <select id="ec-disp" name="disposition_result" value={form.disposition_result} onChange={handleChange} className="select">
                  <option value="">Select…</option>
                  {DISPOSITION_OPTIONS.map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              </Field>
            ) : null}

            {isConditional ? (
              <Field label="Conditions">
                <div className="checkrow">
                  {CONDITION_OPTIONS.map((c) => {
                    const checked = form.disposition_conditions.includes(c);
                    return (
                      <label key={c} className="checkitem" data-checked={checked}>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleCondition(c)}
                        />
                        {c}
                      </label>
                    );
                  })}
                </div>
              </Field>
            ) : null}

            <Field label="QC disposition" htmlFor="ec-qc">
              <input
                id="ec-qc"
                type="text"
                name="qc_disposition"
                value={form.qc_disposition}
                onChange={handleChange}
                className="input"
                placeholder="Free-text disposition"
              />
            </Field>

            <Field label="Notes" htmlFor="ec-notes">
              <textarea
                id="ec-notes"
                name="notes"
                value={form.notes}
                onChange={handleChange}
                className="textarea"
                placeholder="Context, RCA, follow-up"
                rows={3}
              />
            </Field>
          </div>
        </Sheet.Body>
        <Sheet.Footer>
          {qcCase.id && (
            confirmDelete ? (
              <div style={{ marginRight: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.8125rem', color: 'var(--ink-2)' }}>Delete this case?</span>
                <Button variant="ghost" type="button" onClick={() => setConfirmDelete(false)} disabled={deleting}>
                  Cancel
                </Button>
                <Button variant="danger" type="button" onClick={handleDelete} loading={deleting}>
                  Confirm delete
                </Button>
              </div>
            ) : (
              <Button
                variant="ghost"
                type="button"
                onClick={() => setConfirmDelete(true)}
                style={{ marginRight: 'auto', color: 'var(--bad)' }}
              >
                Delete
              </Button>
            )
          )}
          {!confirmDelete && onHighlight && (
            <Button
              variant="ghost"
              type="button"
              onClick={() => onHighlight(qcCase.id)}
              disabled={highlightedId === qcCase.id}
            >
              {highlightedId === qcCase.id ? '★ Highlighted on TV' : 'Highlight on TV'}
            </Button>
          )}
          {!confirmDelete && (
            <>
              <Button variant="ghost" type="button" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button variant="primary" type="submit" loading={submitting}>
                Save changes
              </Button>
            </>
          )}
        </Sheet.Footer>
      </form>
    </Sheet>
  );
}
