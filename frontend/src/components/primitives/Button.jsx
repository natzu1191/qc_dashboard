import './button.css';

/**
 * Button — solid by default. Variants:
 *   - primary: brand-filled, the affirmative action per screen (one only)
 *   - secondary: ink-1 filled, neutral confirm
 *   - ghost: text-only, dismiss / tertiary
 *   - danger: destructive, uses --bad
 */
export function Button({
  variant = 'secondary',
  size = 'md',
  type = 'button',
  loading = false,
  disabled,
  children,
  className,
  ...rest
}) {
  return (
    <button
      type={type}
      className={`btn btn--${variant} btn--${size}${loading ? ' is-loading' : ''}${className ? ' ' + className : ''}`}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? <span className="btn-spinner" aria-hidden="true" /> : null}
      <span className="btn-label">{children}</span>
    </button>
  );
}
