import './kbd.css';

export function Kbd({ children, size = 'sm' }) {
  return <kbd className={`kbd kbd--${size}`}>{children}</kbd>;
}
