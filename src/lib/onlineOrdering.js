import { doc, onSnapshot } from 'firebase/firestore';
import { db } from './firebase.js';
import { hours } from '../data/site.js';

const DOC = 'settings/onlineOrdering';

const istClock = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Asia/Kolkata',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

export function minutesNowIST(d = new Date()) {
  const parts = istClock.formatToParts(d);
  const get = (type) => Number(parts.find((p) => p.type === type)?.value ?? 0);
  return get('hour') * 60 + get('minute');
}

export function isWithinOnlineOrderSchedule(now = new Date()) {
  const m = minutesNowIST(now);
  return hours.slots.some((s) => m >= s.open && m < s.close);
}

export function scheduleDetail(now = new Date()) {
  const m = minutesNowIST(now);
  const current = hours.slots.find((s) => m >= s.open && m < s.close);
  if (current) return `until ${current.closeLabel}`;
  const next = hours.slots.find((s) => m < s.open);
  if (next) return `opens at ${next.openLabel}`;
  return `opens tomorrow at ${hours.slots[0].openLabel}`;
}

/**
 * @param {{ mode?: string, manualEnabled?: boolean } | null | undefined} settings
 * @param {Date} [now]
 */
export function resolveOnlineOrderingEnabled(settings, now = new Date()) {
  const scheduleOpen = isWithinOnlineOrderSchedule(now);
  if (settings?.mode === 'manual') {
    const enabled = Boolean(settings.manualEnabled);
    return {
      enabled,
      mode: 'manual',
      scheduleOpen,
      label: enabled ? 'Online ordering open' : 'Online ordering paused',
      detail: enabled
        ? 'Restaurant is accepting website orders'
        : 'Paused by restaurant — try again later',
    };
  }
  return {
    enabled: scheduleOpen,
    mode: 'auto',
    scheduleOpen,
    label: scheduleOpen ? 'Online ordering open' : 'Online ordering closed',
    detail: scheduleOpen
      ? `Accepting orders ${scheduleDetail(now)}`
      : `Hours: 11 AM–2:50 PM & 6–11 PM (${scheduleDetail(now)})`,
  };
}

/** Live subscribe to POS online-ordering switch. Falls back to schedule-only if unread. */
export function subscribeOnlineOrderingSettings(onData, onError) {
  try {
    return onSnapshot(
      doc(db, 'settings', 'onlineOrdering'),
      (snap) => {
        if (!snap.exists()) {
          onData({ mode: 'auto', manualEnabled: false });
          return;
        }
        const d = snap.data() || {};
        onData({
          mode: d.mode === 'manual' ? 'manual' : 'auto',
          manualEnabled: Boolean(d.manualEnabled),
        });
      },
      (err) => {
        onError?.(err);
        // Still allow schedule-based fallback
        onData({ mode: 'auto', manualEnabled: false });
      },
    );
  } catch (err) {
    onError?.(err);
    onData({ mode: 'auto', manualEnabled: false });
    return () => {};
  }
}
