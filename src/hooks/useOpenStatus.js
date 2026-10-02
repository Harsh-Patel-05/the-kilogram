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
  if (now >= hours.open && now < hours.close) {
    return hours.close - now <= SOON
      ? { state: 'closing', label: 'Closing soon', detail: `until ${hours.closeLabel}` }
      : { state: 'open', label: 'Open now', detail: `until ${hours.closeLabel}` };
  }
  if (now < hours.open && hours.open - now <= SOON) {
    return { state: 'opening', label: 'Opening soon', detail: `at ${hours.openLabel}` };
  }
  return {
    state: 'closed',
    label: 'Closed now',
    detail: `opens ${now < hours.open ? 'today' : 'tomorrow'} at ${hours.openLabel}`,
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
