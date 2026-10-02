import { useEffect, useState } from 'react';
import { hours } from '../data/site.js';

const SOON = 30;

const istClock = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Asia/Kolkata',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

function minutesNowIST() {
  const parts = istClock.formatToParts(new Date());
  const get = (type) => Number(parts.find((p) => p.type === type)?.value ?? 0);
  return get('hour') * 60 + get('minute');
}

function computeStatus() {
  const now = minutesNowIST();
  const current = hours.slots.find((s) => now >= s.open && now < s.close);
  if (current) {
    return current.close - now <= SOON
      ? { state: 'closing', label: 'Closing soon', detail: `until ${current.closeLabel}` }
      : { state: 'open', label: 'Open now', detail: `until ${current.closeLabel}` };
  }
  const next = hours.slots.find((s) => now < s.open);
  if (next && next.open - now <= SOON) {
    return { state: 'opening', label: 'Opening soon', detail: `at ${next.openLabel}` };
  }
  return {
    state: 'closed',
    label: 'Closed now',
    detail: next
      ? `opens today at ${next.openLabel}`
      : `opens tomorrow at ${hours.slots[0].openLabel}`,
  };
}

export default function useOpenStatus() {
  const [status, setStatus] = useState(computeStatus);

  useEffect(() => {
    const tick = () => setStatus(computeStatus());
    const id = setInterval(tick, 60_000);
    document.addEventListener('visibilitychange', tick);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', tick);
    };
  }, []);

  return status;
}
