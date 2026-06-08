import { useEffect, useState, useCallback, useMemo } from 'react';
import { Toaster, toast } from 'sonner';
import { Header } from './components/layout/Header';
import { Page } from './components/layout/Page';
import { CommandPalette } from './components/primitives/CommandPalette';
import { BroadcastPanel } from './components/control/BroadcastPanel';
import { Dashboard } from './pages/Dashboard';
import { AllCases } from './pages/AllCases';
import { AllComplaints } from './pages/AllComplaints';
import { LogEntrySheet } from './pages/sheets/LogEntrySheet';
import { ComplaintSheet } from './pages/sheets/ComplaintSheet';
import { EditComplaintSheet } from './pages/sheets/EditComplaintSheet';
import { EditCaseSheet } from './pages/sheets/EditCaseSheet';
import { ComplaintDetailModal } from './pages/modals/ComplaintDetailModal';
import { useTheme } from './lib/theme';
import { useHotkey } from './lib/keys';
import { api } from './lib/api';
import { useBroadcastState } from './lib/broadcast';

import './styles/tokens.css';
import './styles/base.css';
import './components/forms/form-layout.css';
import './components/control/broadcast-panel.css';

export function ControlApp() {
  const { theme, toggle: toggleTheme } = useTheme();
  const [page, setPage] = useState('dashboard');
  const [dashboardData, setDashboardData] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [recentCases, setRecentCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  // Sheets / modals
  const [logOpen, setLogOpen] = useState(false);
  const [cmplOpen, setCmplOpen] = useState(false);
  const [editCase, setEditCase] = useState(null);
  const [detailCmpl, setDetailCmpl] = useState(null);
  const [editCmpl, setEditCmpl] = useState(null);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [panelOpen, setPanelOpen] = useState(true);

  const { state: broadcast, dataVersion, connected, updateState } = useBroadcastState();

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [dash, cmpl, cases] = await Promise.all([
        api.dashboard().catch(() => null),
        api.allComplaints().catch(() => []),
        api.allCases().catch(() => []),
      ]);
      setDashboardData(dash);
      setComplaints(Array.isArray(cmpl) ? cmpl : []);
      const sorted = Array.isArray(cases)
        ? [...cases].sort((a, b) => new Date(b.updatedDate || b.createdDate || b.date) - new Date(a.updatedDate || a.createdDate || a.date)).slice(0, 6)
        : [];
      setRecentCases(sorted);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  useEffect(() => {
    if (dataVersion > 0) refresh();
  }, [dataVersion, refresh]);

  const highlightOnTV = useCallback((id, viewHint) => {
    updateState({ highlighted_id: id, ...(viewHint ? { active_view: viewHint } : {}) });
    toast.success('Highlighted on TV');
  }, [updateState]);

  function bumpReload() {
    setReloadKey((k) => k + 1);
    refresh();
  }

  // Hotkeys
  useHotkey('d', () => setPage('dashboard'));
  useHotkey('a', () => setPage('cases'));
  useHotkey('p', () => setPage('complaints'));
  useHotkey('l', () => setLogOpen(true));
  useHotkey('c', () => setCmplOpen(true));
  useHotkey('k', () => setPaletteOpen(true), { meta: true });

  const actions = useMemo(() => [
    { id: 'go-dashboard', label: 'Go to Dashboard', shortcut: 'D', run: () => setPage('dashboard') },
    { id: 'go-cases', label: 'Go to Cases', shortcut: 'A', run: () => setPage('cases') },
    { id: 'go-complaints', label: 'Go to Complaints', shortcut: 'P', run: () => setPage('complaints') },
    { id: 'new-entry', label: 'Log new entry', shortcut: 'L', run: () => setLogOpen(true) },
    { id: 'new-complaint', label: 'File complaint', shortcut: 'C', run: () => setCmplOpen(true) },
    { id: 'toggle-theme', label: theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme', run: toggleTheme },
    { id: 'refresh', label: 'Refresh data', run: () => { refresh(); toast.success('Refreshed'); } },
    { id: 'toggle-panel', label: panelOpen ? 'Hide broadcast panel' : 'Show broadcast panel', run: () => setPanelOpen((v) => !v) },
    { id: 'tv-dashboard', label: 'TV: Show Dashboard', run: () => updateState({ active_view: 'dashboard' }) },
    { id: 'tv-cases', label: 'TV: Show Cases', run: () => updateState({ active_view: 'cases' }) },
    { id: 'tv-complaints', label: 'TV: Show Complaints', run: () => updateState({ active_view: 'complaints' }) },
  ], [theme, toggleTheme, refresh, panelOpen, updateState]);

  function handleSelectCase(row) {
    setEditCase(row);
  }

  return (
    <div className={`control-shell ${panelOpen ? 'control-shell--panel-open' : ''}`}>
      <Header
        page={page}
        onNavigate={setPage}
        onTheme={toggleTheme}
        theme={theme}
        onOpenCommand={() => setPaletteOpen(true)}
        onLog={() => setLogOpen(true)}
        onComplaint={() => setCmplOpen(true)}
        broadcast={broadcast}
        broadcastConnected={connected}
        onTogglePanel={() => setPanelOpen((v) => !v)}
      />
      <Page>
        {page === 'dashboard' ? (
          <Dashboard
            data={dashboardData}
            complaints={complaints}
            recentCases={recentCases}
            loading={loading}
            onOpenComplaint={setDetailCmpl}
            onSelectCase={handleSelectCase}
            onNavigateCases={() => setPage('cases')}
          />
        ) : page === 'complaints' ? (
          <AllComplaints
            complaints={complaints}
            loading={loading}
            onSelect={setDetailCmpl}
            onEdit={setEditCmpl}
            highlightedId={broadcast?.highlighted_id || null}
            onHighlight={(id) => highlightOnTV(id, 'complaints')}
          />
        ) : (
          <AllCases
            onEdit={handleSelectCase}
            reloadKey={reloadKey}
            highlightedId={broadcast?.highlighted_id || null}
            onHighlight={(id) => highlightOnTV(id, 'cases')}
          />
        )}
      </Page>

      <BroadcastPanel
        open={panelOpen}
        onClose={() => setPanelOpen(false)}
        state={broadcast}
        connected={connected}
        updateState={updateState}
        complaints={complaints}
        recentCases={recentCases}
      />

      <LogEntrySheet
        open={logOpen}
        onOpenChange={setLogOpen}
        onCreated={bumpReload}
      />
      <ComplaintSheet
        open={cmplOpen}
        onOpenChange={setCmplOpen}
        onCreated={bumpReload}
      />
      <EditCaseSheet
        open={!!editCase}
        qcCase={editCase}
        onOpenChange={(v) => { if (!v) setEditCase(null); }}
        onUpdated={bumpReload}
        onHighlight={(id) => highlightOnTV(id, 'cases')}
        highlightedId={broadcast?.highlighted_id || null}
      />
      <ComplaintDetailModal
        open={!!detailCmpl}
        complaint={detailCmpl}
        onOpenChange={(v) => { if (!v) setDetailCmpl(null); }}
        onHighlight={(id) => highlightOnTV(id, 'complaints')}
        highlightedId={broadcast?.highlighted_id || null}
        onDeleted={bumpReload}
        onEdit={(c) => { setDetailCmpl(null); setEditCmpl(c); }}
      />
      <EditComplaintSheet
        open={!!editCmpl}
        complaint={editCmpl}
        onOpenChange={(v) => { if (!v) setEditCmpl(null); }}
        onUpdated={bumpReload}
      />
      <CommandPalette
        open={paletteOpen}
        onOpenChange={setPaletteOpen}
        actions={actions}
      />

      <Toaster
        position="bottom-right"
        theme={theme}
        toastOptions={{
          style: {
            fontFamily: 'var(--font-sans)',
            borderRadius: 'var(--r-2)',
          },
        }}
      />
    </div>
  );
}
