import './page.css';

export function Page({ children }) {
  return <main className="page">{children}</main>;
}

export function PageSection({ children, className }) {
  return <section className={`page-section${className ? ' ' + className : ''}`}>{children}</section>;
}
