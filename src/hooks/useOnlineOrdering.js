import { useEffect, useState } from 'react';
import { ensureCustomerAuth } from '../lib/firebase.js';
import {
  resolveOnlineOrderingEnabled,
  subscribeOnlineOrderingSettings,
} from '../lib/onlineOrdering.js';

export default function useOnlineOrdering() {
  const [settings, setSettings] = useState({
    mode: 'auto',
    manualEnabled: false,
    deliveryDays: [1, 2, 3, 4, 5],
    pauseMessage: '',
  });
  const [status, setStatus] = useState(() => resolveOnlineOrderingEnabled(null));

  useEffect(() => {
    let unsub = () => {};
    let cancelled = false;
    (async () => {
      try {
        await ensureCustomerAuth();
      } catch {
        /* schedule-only fallback */
      }
      if (cancelled) return;
      unsub = subscribeOnlineOrderingSettings((s) => setSettings(s));
    })();
    return () => {
      cancelled = true;
      unsub();
    };
  }, []);

  useEffect(() => {
    const tick = () => setStatus(resolveOnlineOrderingEnabled(settings));
    tick();
    const id = setInterval(tick, 30_000);
    document.addEventListener('visibilitychange', tick);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', tick);
    };
  }, [settings]);

  return status;
}
