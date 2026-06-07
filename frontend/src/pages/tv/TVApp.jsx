import { useEffect, useState, useCallback } from 'react';
import { api } from '../../lib/api';
import { useBroadcastStream } from '../../lib/broadcast';
import { TVDashboard } from './TVDashboard';
import { TVCases } from './TVCases';
import { TVComplaints } from './TVComplaints';

import '../../styles/tokens.css';
import '../../styles/base.css';
import '../../styles/tv.css';

export function TVApp() {
  const { state, dataVersion, connected } = useBroadcastStream();
  const [dashboardData, setDashboardData] = useState(null);
  const [cases, setCases] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.documentElement.setAttribute('data-mode', 'tv');
    document.documentElement.setAttribute('data-theme', 'dark');
    return () => {
      document.documentElement.removeAttribute('data-mode');
    };
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [dash, cmpl, cs] = await Promise.all([
        api.dashboard().catch(() => null),
        api.allComplaints().catch(() => []),
        api.allCases().catch(() => []),
      ]);
      setDashboardData(dash);
      setComplaints(Array.isArray(cmpl) ? cmpl : []);
      setCases(Array.isArray(cs) ? cs : []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);
  useEffect(() => { if (dataVersion > 0) refresh(); }, [dataVersion, refresh]);

  return (
    <div className="tv-shell">
      <div className="tv-statusbar">
        <span className="tv-statusbar-brand">QC Live</span>
        <span className="tv-statusbar-view">{labelFor(state.active_view)}</span>
        <span className={`tv-statusbar-dot ${connected ? 'is-live' : 'is-offline'}`} aria-label={connected ? 'Connected' : 'Reconnecting'}>
          <span className="tv-statusbar-dot-pulse" />
          {connected ? 'LIVE' : 'RECONNECTING…'}
        </span>
      </div>

      <main className="tv-stage">
        {state.active_view === 'cases' && (
          <TVCases
            rows={cases}
            loading={loading}
            filters={state.filters || {}}
            highlightedId={state.highlighted_id}
          />
        )}
        {state.active_view === 'complaints' && (
          <TVComplaints
            items={complaints}
            loading={loading}
            highlightedId={state.highlighted_id}
          />
        )}
        {state.active_view === 'dashboard' && (
          <TVDashboard
            data={dashboardData}
            complaints={complaints}
            recentCases={cases.slice().sort(byUpdatedDesc).slice(0, 6)}
            loading={loading}
          />
        )}
      </main>
    </div>
  );
}

function labelFor(view) {
  if (view === 'cases') return 'All Cases';
  if (view === 'complaints') return 'Customer Complaints';
  return 'Dashboard';
}

function byUpdatedDesc(a, b) {
  const ta = new Date(a.updatedDate || a.createdDate || a.date).getTime();
  const tb = new Date(b.updatedDate || b.createdDate || b.date).getTime();
  return tb - ta;
}
