import './status-chip.css';

const TONE_MAP = {
  ok: 'ok',
  approved: 'ok',
  pass: 'ok',
  valid: 'ok',

  conditional: 'warn',
  'conditionally approved': 'warn',
  pending: 'warn',
  hold: 'warn',

  bad: 'bad',
  failed: 'bad',
  rejected: 'bad',
  invalid: 'bad',

  neutral: 'neutral',
  others: 'neutral',
};

export function StatusChip({ tone, label, dotOnly = false, className }) {
  const resolved = tone || TONE_MAP[String(label).toLowerCase()] || 'neutral';
  if (dotOnly) {
    return <span className={`status-dot status-dot--${resolved}${className ? ' ' + className : ''}`} aria-label={label} />;
  }
  return (
    <span className={`status-chip status-chip--${resolved}${className ? ' ' + className : ''}`}>
      <span className={`status-dot status-dot--${resolved}`} />
      <span>{label}</span>
    </span>
  );
}
