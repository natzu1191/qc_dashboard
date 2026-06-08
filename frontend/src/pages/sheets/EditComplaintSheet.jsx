import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Sheet } from '../../components/primitives/Sheet';
import { Field } from '../../components/forms/Field';
import { Button } from '../../components/primitives/Button';
import { api } from '../../lib/api';

const FIELDS = [
  { name: 'date', label: 'Date', type: 'date', mono: true },
  { name: 'code', label: 'Code', type: 'text', placeholder: 'CC-2026-001', mono: true },
  { name: 'batch_number', label: 'Batch number', type: 'text', placeholder: 'BN-4892', mono: true },
  { name: 'reason', label: 'Reason', type: 'text', placeholder: 'Customer-reported issue', full: true },
  { name: 'qc_validation', label: 'QC validation', type: 'text', placeholder: 'How QC validated', full: true },
];

function formFor(complaint) {
  if (!complaint) return null;
  return {
    date: complaint.date ? String(complaint.date).split('T')[0] : '',
    code: complaint.code ?? '',
    batch_number: complaint.batch_number ?? '',
    reason: complaint.reason ?? '',
    qc_validation: complaint.qc_validation ?? '',
    is_valid: !!complaint.is_valid,
  };
}

function keysFor(complaint) {
  return complaint?.attachments ? complaint.attachments.split(',').filter(Boolean) : [];
}

export function EditComplaintSheet({ open, complaint, onOpenChange, onUpdated }) {
  const [form, setForm] = useState(() => formFor(complaint));
  const [keptKeys, setKeptKeys] = useState(() => keysFor(complaint));
  const [files, setFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open && complaint) {
      setForm(formFor(complaint));
      setKeptKeys(keysFor(complaint));
      setFiles([]);
    }
  }, [open, complaint]);

  if (!complaint || !form) {
    return <Sheet open={open} onOpenChange={onOpenChange} width={560} />;
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  }

  function handleFiles(e) {
    setFiles((prev) => [...prev, ...Array.from(e.target.files)]);
    e.target.value = '';
  }

  function removeFile(i) {
    setFiles((prev) => prev.filter((_, idx) => idx !== i));
  }

  function removeExisting(key) {
    setKeptKeys((prev) => prev.filter((k) => k !== key));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const required = ['date', 'code', 'batch_number', 'reason', 'qc_validation'];
    const missing = required.filter((k) => !String(form[k]).trim());
    if (missing.length) {
      toast.error('Some fields are missing', { description: missing.join(', ') });
      return;
    }
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('date', form.date);
      fd.append('code', form.code);
      fd.append('batch_number', form.batch_number);
      fd.append('reason', form.reason);
      fd.append('qc_validation', form.qc_validation);
      fd.append('is_valid', form.is_valid);
      fd.append('existing_attachments', keptKeys.join(','));
      files.forEach((f) => fd.append('files', f));
      await api.updateComplaint(complaint.id, fd);
      toast.success(`Updated ${form.code}`);
      onUpdated && onUpdated();
      onOpenChange(false);
    } catch (err) {
      toast.error('Could not update complaint', { description: err.message });
    } finally {
      setSubmitting(false);
    }
  }

  const noAttachments = keptKeys.length === 0 && files.length === 0;

  return (
    <Sheet open={open} onOpenChange={onOpenChange} width={560}>
      <form onSubmit={handleSubmit} style={{ display: 'contents' }}>
        <Sheet.Header title="Edit complaint" subtitle={complaint.code} />
        <Sheet.Body>
          <div className="form-grid">
            {FIELDS.map((f) => (
              <Field key={f.name} label={f.label} htmlFor={`ecc-${f.name}`} span={f.full ? 'full' : undefined}>
                <input
                  id={`ecc-${f.name}`}
                  name={f.name}
                  type={f.type}
                  value={form[f.name]}
                  onChange={handleChange}
                  placeholder={f.placeholder || ''}
                  className={`input${f.mono ? ' input--mono' : ''}`}
                />
              </Field>
            ))}

            <Field label="QC validation" span="full">
              <label className="toggle">
                <input
                  type="checkbox"
                  name="is_valid"
                  checked={form.is_valid}
                  onChange={handleChange}
                />
                <span className="toggle-switch" />
                <span className="toggle-text">{form.is_valid ? 'Complaint is valid' : 'Complaint is invalid'}</span>
              </label>
            </Field>

            <Field label="Attachments" span="full" hint={noAttachments ? 'No files selected' : null}>
              <div className="filedrop">
                <label className="filedrop-btn">
                  <input type="file" multiple onChange={handleFiles} className="sr-only" />
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                  Add files
                </label>
                {!noAttachments ? (
                  <div className="filedrop-list">
                    {keptKeys.map((k) => (
                      <span key={k} className="filechip">
                        <span className="filechip-name">{k.split('/').pop()}</span>
                        <button type="button" className="filechip-x" onClick={() => removeExisting(k)} aria-label={`Remove ${k}`}>
                          ×
                        </button>
                      </span>
                    ))}
                    {files.map((f, i) => (
                      <span key={`new-${i}`} className="filechip">
                        <span className="filechip-name">{f.name}</span>
                        <button type="button" className="filechip-x" onClick={() => removeFile(i)} aria-label={`Remove ${f.name}`}>
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            </Field>
          </div>
        </Sheet.Body>
        <Sheet.Footer>
          <Button variant="ghost" type="button" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button variant="primary" type="submit" loading={submitting}>
            Save changes
          </Button>
        </Sheet.Footer>
      </form>
    </Sheet>
  );
}
