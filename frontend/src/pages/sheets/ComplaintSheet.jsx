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

function emptyForm() {
  return {
    date: new Date().toISOString().split('T')[0],
    code: '',
    batch_number: '',
    reason: '',
    qc_validation: '',
    is_valid: true,
  };
}

export function ComplaintSheet({ open, onOpenChange, onCreated }) {
  const [form, setForm] = useState(emptyForm);
  const [files, setFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(emptyForm());
      setFiles([]);
    }
  }, [open]);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  }

  function handleFiles(e) {
    setFiles(Array.from(e.target.files));
  }

  function removeFile(i) {
    setFiles((prev) => prev.filter((_, idx) => idx !== i));
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
      files.forEach((f) => fd.append('files', f));
      await api.createComplaint(fd);
      toast.success(`Filed ${form.code}`);
      onCreated && onCreated();
      onOpenChange(false);
    } catch (err) {
      toast.error('Could not save complaint', { description: err.message });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange} width={560}>
      <form onSubmit={handleSubmit} style={{ display: 'contents' }}>
        <Sheet.Header title="File a complaint" subtitle="Tie a customer complaint to a batch" />
        <Sheet.Body>
          <div className="form-grid">
            {FIELDS.map((f) => (
              <Field key={f.name} label={f.label} htmlFor={`cc-${f.name}`} span={f.full ? 'full' : undefined}>
                <input
                  id={`cc-${f.name}`}
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

            <Field label="Attachments" span="full" hint={files.length === 0 ? 'No files selected' : null}>
              <div className="filedrop">
                <label className="filedrop-btn">
                  <input type="file" multiple onChange={handleFiles} className="sr-only" />
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                  Add files
                </label>
                {files.length > 0 ? (
                  <div className="filedrop-list">
                    {files.map((f, i) => (
                      <span key={i} className="filechip">
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
            File complaint
          </Button>
        </Sheet.Footer>
      </form>
    </Sheet>
  );
}
