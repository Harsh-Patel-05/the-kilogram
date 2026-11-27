import { useEffect, useState } from 'react';
import {
  resolveOnlineOrderingEnabled,
  subscribeOnlineOrderingSettings,
} from '../lib/onlineOrdering.js';

export default function useOnlineOrdering() {
  const [settings, setSettings] = useState({ mode: 'auto', manualEnabled: false });
  const [status, setStatus] = useState(() => resolveOnlineOrderingEnabled(null));

  useEffect(() => {
    const unsub = subscribeOnlineOrderingSettings((s) => setSettings(s));
    return unsub;
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
