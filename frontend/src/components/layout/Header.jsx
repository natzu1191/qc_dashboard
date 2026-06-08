import { Kbd } from '../primitives/Kbd';
import './header.css';

const NAV = [
  { id: 'dashboard', label: 'Dashboard', key: 'D' },
  { id: 'cases', label: 'Cases', key: 'A' },
  { id: 'complaints', label: 'Complaints', key: 'P' },
];

const TV_VIEW_LABEL = { dashboard: 'Dashboard', cases: 'Cases', complaints: 'Complaints' };

export function Header({ page, onNavigate, onTheme, theme, onOpenCommand, onLog, onComplaint, broadcast, broadcastConnected, onTogglePanel }) {
  const tvLabel = TV_VIEW_LABEL[broadcast?.active_view] || 'TV';
  return (
    <header className="hd">
      <div className="hd-row">
        <div className="hd-brand">
          <span className="hd-mark">QC.</span>
          <span className="hd-divider" aria-hidden="true" />
          <span className="hd-context">Quality control</span>
        </div>

        <nav className="hd-nav" aria-label="Primary">
          {NAV.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`hd-nav-btn${page === item.id ? ' is-active' : ''}`}
              onClick={() => onNavigate(item.id)}
            >
              {item.label}
              <Kbd>{item.key}</Kbd>
            </button>
          ))}
        </nav>

        <div className="hd-actions">
          {onTogglePanel && (
            <button
              type="button"
              className={`hd-tv-pill${broadcastConnected ? ' is-live' : ' is-offline'}`}
              onClick={onTogglePanel}
              title={broadcastConnected ? `On TV: ${tvLabel}` : 'TV stream disconnected'}
            >
              <span className="hd-tv-dot" aria-hidden="true" />
              <span className="hd-tv-pill-label">TV · {tvLabel}</span>
            </button>
          )}
          <button type="button" className="hd-quiet" onClick={onLog} title="Log new entry (L)">
            <span>New entry</span>
            <Kbd>L</Kbd>
          </button>
          <button type="button" className="hd-quiet" onClick={onComplaint} title="New complaint (C)">
            <span>New complaint</span>
            <Kbd>C</Kbd>
          </button>
          <button
            type="button"
            className="hd-command"
            onClick={onOpenCommand}
            title="Open command palette"
          >
            <span>Search</span>
            <Kbd>⌘K</Kbd>
          </button>
          <button
            type="button"
            className="hd-icon-btn"
            onClick={onTheme}
            aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          >
            {theme === 'dark' ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
