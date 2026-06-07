import './field.css';

/**
 * Field — label + control + optional hint/error wrapper.
 *
 *   <Field label="Code" hint="e.g. QC-2026-001">
 *     <input className="input" … />
 *   </Field>
 */
export function Field({ label, hint, error, required, htmlFor, children, span }) {
  return (
    <div className={`field${span === 'full' ? ' field--full' : ''}`}>
      {label ? (
        <label className="field-label" htmlFor={htmlFor}>
          {label}
          {required ? <span className="field-required" aria-hidden="true"> *</span> : null}
        </label>
      ) : null}
      {children}
      {error ? <p className="field-error">{error}</p> : hint ? <p className="field-hint">{hint}</p> : null}
    </div>
  );
}
