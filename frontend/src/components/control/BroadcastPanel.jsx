import { useMemo, useState } from 'react';

const VIEWS = [
  { id: 'dashboard', label: 'Dashboard', hint: 'KPIs + recent activity' },
  { id: 'cases', label: 'All Cases', hint: 'Filterable table' },
  { id: 'complaints', label: 'Complaints', hint: 'Customer complaint feed' },
];

const CASE_STATUS_OPTIONS = [
  { value: 1, label: 'No resample' },
  { value: 2, label: 'At QC' },
  { value: 5, label: 'QC disposition' },
];

export function BroadcastPanel({
  open,
  onClose,
  state,
  connected,
  updateState,
  complaints = [],
  recentCases = [],
}) {
  const activeView = state?.active_view || 'dashboard';
  const filters = state?.filters || {};
  const statusFilter = Array.isArray(filters.status) ? filters.status : [];
  const highlightedId = state?.highlighted_id || null;
  const [previewOn, setPreviewOn] = useState(false);

  function openPreviewWindow() {
    const w = 1280;
    const h = 720;
    window.open(
      '/tv',
      'tv-preview',
      `width=${w},height=${h},menubar=no,toolbar=no,location=no,status=no,resizable=yes`
    );
  }

  const highlightLabel = useMemo(() => {
    if (!highlightedId) return null;
    const c = recentCases.find((r) => r.id === highlightedId);
    if (c) return `Case ${c.code}`;
    const k = complaints.find((r) => r.id === highlightedId);
    if (k) return `Complaint ${k.code}`;
    return 'Item ' + highlightedId.slice(0, 6);
  }, [highlightedId, recentCases, complaints]);

  function toggleStatus(s) {
    const next = statusFilter.includes(s)
      ? statusFilter.filter((x) => x !== s)
      : [...statusFilter, s];
    updateState({ filters: { ...filters, status: next } });
  }

  function clearHighlight() {
    updateState({ clear_highlight: true });
  }

  return (
    <aside className={`bp${open ? ' bp--open' : ''}`} aria-hidden={!open}>
      <header className="bp-head">
        <div className="bp-head-titles">
          <p className="bp-eyebrow">
            <span className={`bp-dot ${connected ? 'is-live' : 'is-offline'}`} />
            {connected ? 'LIVE on TV' : 'TV disconnected'}
          </p>
          <h3 className="bp-title">Broadcast</h3>
        </div>
        <button type="button" className="bp-close" onClick={onClose} aria-label="Close panel">×</button>
      </header>

      <section className="bp-section">
        <div className="bp-now">
          <p className="bp-now-label">Showing</p>
          <p className="bp-now-value">{VIEWS.find((v) => v.id === activeView)?.label || activeView}</p>
          {highlightLabel && (
            <p className="bp-now-highlight">★ {highlightLabel}</p>
          )}
        </div>
      </section>

      <section className="bp-section">
        <h4 className="bp-section-title">View</h4>
        <div className="bp-views" role="radiogroup">
          {VIEWS.map((v) => (
            <button
              key={v.id}
              type="button"
              role="radio"
              aria-checked={activeView === v.id}
              className={`bp-view${activeView === v.id ? ' is-active' : ''}`}
              onClick={() => updateState({ active_view: v.id })}
            >
              <span className="bp-view-label">{v.label}</span>
              <span className="bp-view-hint">{v.hint}</span>
            </button>
          ))}
        </div>
      </section>

      {activeView === 'cases' && (
        <section className="bp-section">
          <h4 className="bp-section-title">Filter by status</h4>
          <div className="bp-checks">
            {CASE_STATUS_OPTIONS.map((opt) => (
              <label key={opt.value} className="bp-check">
                <input
                  type="checkbox"
                  checked={statusFilter.includes(opt.value)}
                  onChange={() => toggleStatus(opt.value)}
                />
                <span>{opt.label}</span>
              </label>
            ))}
          </div>
          {statusFilter.length > 0 && (
            <button
              type="button"
              className="bp-link"
              onClick={() => updateState({ filters: { ...filters, status: [] } })}
            >
              Clear filters
            </button>
          )}
        </section>
      )}

      <section className="bp-section">
        <h4 className="bp-section-title">Highlight</h4>
        {highlightedId ? (
          <div className="bp-highlight">
            <p className="bp-highlight-label">{highlightLabel}</p>
            <button type="button" className="bp-link" onClick={clearHighlight}>Clear highlight</button>
          </div>
        ) : (
          <p className="bp-hint">
            Pin a case or complaint to the TV from its detail view.
          </p>
        )}
      </section>

      <section className="bp-section">
        <div className="bp-preview-head">
          <h4 className="bp-section-title" style={{ margin: 0 }}>Simulate on this laptop</h4>
          <button
            type="button"
            role="switch"
            aria-checked={previewOn}
            className={`bp-switch${previewOn ? ' is-on' : ''}`}
            onClick={() => setPreviewOn((v) => !v)}
          >
            <span className="bp-switch-thumb" />
          </button>
        </div>
        {previewOn ? (
          <div className="bp-preview">
            <div className="bp-preview-frame-wrap">
              <iframe
                key="tv-preview"
                title="TV preview"
                src="/tv"
                className="bp-preview-frame"
              />
            </div>
            <div className="bp-preview-foot">
              <span className="bp-hint">Live · scaled 1280×720</span>
              <button type="button" className="bp-link" onClick={openPreviewWindow}>
                Open in window ↗
              </button>
            </div>
          </div>
        ) : (
          <p className="bp-hint">
            Toggle on to see what the TV will display, scaled to fit. Useful before the production TV is wired up.
          </p>
        )}
      </section>

      <footer className="bp-foot">
        <p className="bp-hint">
          The TV reflects changes within ~1s. If it's stuck, refresh the TV browser.
        </p>
      </footer>
    </aside>
  );
}
