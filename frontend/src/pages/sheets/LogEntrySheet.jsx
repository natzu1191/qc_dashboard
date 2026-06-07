import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Sheet } from '../../components/primitives/Sheet';
import { Field } from '../../components/forms/Field';
import { Button } from '../../components/primitives/Button';
import { api } from '../../lib/api';

const FIELDS = [
  { name: 'date', label: 'Date', type: 'date', mono: true },
  { name: 'code', label: 'Code', type: 'text', placeholder: 'QC-2026-001', mono: true },
  { name: 'batch_number', label: 'Batch number', type: 'text', placeholder: 'BN-4892', mono: true },
  { name: 'reason', label: 'Reason', type: 'text', placeholder: 'Describe the deviation', full: true },
  { name: 'actual', label: 'Actual', type: 'text', placeholder: '98.5', mono: true },
  { name: 'standard', label: 'Standard', type: 'text', placeholder: '100.0', mono: true },
];

function emptyForm() {
  return {
    date: new Date().toISOString().split('T')[0],
    code: '',
    batch_number: '',
    reason: '',
    actual: '',
    standard: '',
  };
}

export function LogEntrySheet({ open, onOpenChange, onCreated }) {
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) setForm(emptyForm());
  }, [open]);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const missing = Object.entries(form).filter(([, v]) => !String(v).trim()).map(([k]) => k);
    if (missing.length) {
      toast.error('Some fields are missing', { description: missing.join(', ') });
      return;
    }
    setSubmitting(true);
    try {
      await api.createCase(form);
      toast.success(`Logged ${form.code}`);
      onCreated && onCreated();
      onOpenChange(false);
    } catch (err) {
      toast.error('Could not save entry', { description: err.message });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange} width={520}>
      <form onSubmit={handleSubmit} style={{ display: 'contents' }}>
        <Sheet.Header title="Log a new entry" subtitle="Record a deviation against standard" />
        <Sheet.Body>
          <div className="form-grid">
            {FIELDS.map((f) => (
              <Field key={f.name} label={f.label} htmlFor={`lg-${f.name}`} span={f.full ? 'full' : undefined}>
                <input
                  id={`lg-${f.name}`}
                  name={f.name}
                  type={f.type}
                  value={form[f.name]}
                  onChange={handleChange}
                  placeholder={f.placeholder || ''}
                  className={`input${f.mono ? ' input--mono' : ''}`}
                  autoFocus={f.name === 'code'}
                />
              </Field>
            ))}
          </div>
        </Sheet.Body>
        <Sheet.Footer>
          <Button variant="ghost" type="button" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button variant="primary" type="submit" loading={submitting}>
            Save entry
          </Button>
        </Sheet.Footer>
      </form>
    </Sheet>
  );
}
