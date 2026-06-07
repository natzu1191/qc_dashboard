import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from './api';

const DEFAULT_STATE = {
  active_view: 'dashboard',
  filters: {},
  highlighted_id: null,
  updated_at: null,
};

function useStream() {
  const [state, setState] = useState(DEFAULT_STATE);
  const [dataVersion, setDataVersion] = useState(0);
  const [connected, setConnected] = useState(false);
  const esRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    let retryTimer = null;

    function open() {
      const es = new EventSource(api.streamUrl());
      esRef.current = es;

      es.addEventListener('state', (e) => {
        try {
          const data = JSON.parse(e.data);
          if (!cancelled) setState(data);
        } catch {}
      });

      es.addEventListener('data:cases', () => {
        if (!cancelled) setDataVersion((v) => v + 1);
      });

      es.addEventListener('data:complaints', () => {
        if (!cancelled) setDataVersion((v) => v + 1);
      });

      es.onopen = () => { if (!cancelled) setConnected(true); };
      es.onerror = () => {
        if (cancelled) return;
        setConnected(false);
        es.close();
        retryTimer = setTimeout(open, 3000);
      };
    }

    api.getBroadcast().then((s) => { if (!cancelled) setState(s); }).catch(() => {});
    open();

    return () => {
      cancelled = true;
      if (retryTimer) clearTimeout(retryTimer);
      if (esRef.current) esRef.current.close();
    };
  }, []);

  return { state, dataVersion, connected };
}

export function useBroadcastStream() {
  return useStream();
}

export function useBroadcastState() {
  const { state, dataVersion, connected } = useStream();
  const pendingRef = useRef(null);

  const updateState = useCallback((patch) => {
    pendingRef.current = patch;
    api.updateBroadcast(patch).catch(() => {});
  }, []);

  return { state, dataVersion, connected, updateState };
}
