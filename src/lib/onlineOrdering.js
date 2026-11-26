import { doc, onSnapshot } from 'firebase/firestore';
import { db } from './firebase.js';
import { hours } from '../data/site.js';
import { DELIVERY_PHONE_DISPLAY } from '../data/restaurantLocation.js';

const istClock = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Asia/Kolkata',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
  weekday: 'short',
});

const WEEKDAY_MAP = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 0 };

export function minutesNowIST(d = new Date()) {
  const parts = istClock.formatToParts(d);
  const get = (type) => Number(parts.find((p) => p.type === type)?.value ?? 0);
  return get('hour') * 60 + get('minute');
}

export function weekdayNowIST(d = new Date()) {
  const parts = istClock.formatToParts(d);
  const wd = parts.find((p) => p.type === 'weekday')?.value || 'Mon';
  return WEEKDAY_MAP[wd] ?? d.getDay();
}

/** Default: Monday–Friday only */
export function isDeliveryDay(day, deliveryDays = [1, 2, 3, 4, 5]) {
  return (deliveryDays || [1, 2, 3, 4, 5]).includes(day);
}

export function isWithinOnlineOrderSchedule(now = new Date(), deliveryDays = [1, 2, 3, 4, 5]) {
  const day = weekdayNowIST(now);
  if (!isDeliveryDay(day, deliveryDays)) return false;
  const m = minutesNowIST(now);
  return hours.slots.some((s) => m >= s.open && m < s.close);
}

export function scheduleDetail(now = new Date(), deliveryDays = [1, 2, 3, 4, 5]) {
  const day = weekdayNowIST(now);
  if (!isDeliveryDay(day, deliveryDays)) {
    return 'website delivery runs Mon–Fri';
  }
  const m = minutesNowIST(now);
  const current = hours.slots.find((s) => m >= s.open && m < s.close);
  if (current) return `until ${current.closeLabel}`;
  const next = hours.slots.find((s) => m < s.open);
  if (next) return `opens at ${next.openLabel}`;
  return `opens next weekday at ${hours.slots[0].openLabel}`;
}

const PAUSE_DEFAULT =
  `We're temporarily not accepting website orders due to high kitchen load. ` +
  `You're a most valued customer — call us on ${DELIVERY_PHONE_DISPLAY} and we'll find a solution for you.`;

/**
 * @param {{ mode?: string, manualEnabled?: boolean, pauseMessage?: string, deliveryDays?: number[] } | null | undefined} settings
 */
export function resolveOnlineOrderingEnabled(settings, now = new Date()) {
  const deliveryDays = Array.isArray(settings?.deliveryDays) ? settings.deliveryDays : [1, 2, 3, 4, 5];
  const scheduleOpen = isWithinOnlineOrderSchedule(now, deliveryDays);
  const pauseMessage = String(settings?.pauseMessage || '').trim() || PAUSE_DEFAULT;

  if (settings?.mode === 'manual') {
    const enabled = Boolean(settings.manualEnabled);
    return {
      enabled,
      mode: 'manual',
      scheduleOpen,
      deliveryDays,
      label: enabled ? 'Online ordering open' : 'Online ordering paused',
      detail: enabled
        ? 'Restaurant is accepting website orders'
        : pauseMessage,
      callHint: enabled
        ? null
        : `Still need help? Call ${DELIVERY_PHONE_DISPLAY} — you're a valued customer.`,
    };
  }

  return {
    enabled: scheduleOpen,
    mode: 'auto',
    scheduleOpen,
    deliveryDays,
    label: scheduleOpen ? 'Online ordering open' : 'Online ordering closed',
    detail: scheduleOpen
      ? `Accepting orders ${scheduleDetail(now, deliveryDays)} · Mon–Fri`
      : `Website delivery: Mon–Fri, 11 AM–2:50 PM & 6–11 PM (${scheduleDetail(now, deliveryDays)}). ${pauseMessage}`,
    callHint: scheduleOpen
      ? null
      : `Call ${DELIVERY_PHONE_DISPLAY} — we can still help arrange something for you.`,
  };
}

export function subscribeOnlineOrderingSettings(onData, onError) {
  try {
    return onSnapshot(
      doc(db, 'settings', 'onlineOrdering'),
      (snap) => {
        if (!snap.exists()) {
          onData({ mode: 'auto', manualEnabled: false, deliveryDays: [1, 2, 3, 4, 5], pauseMessage: '' });
          return;
        }
        const d = snap.data() || {};
        onData({
          mode: d.mode === 'manual' ? 'manual' : 'auto',
          manualEnabled: Boolean(d.manualEnabled),
          deliveryDays: Array.isArray(d.deliveryDays) ? d.deliveryDays : [1, 2, 3, 4, 5],
          pauseMessage: String(d.pauseMessage || ''),
        });
      },
      (err) => {
        onError?.(err);
        onData({ mode: 'auto', manualEnabled: false, deliveryDays: [1, 2, 3, 4, 5], pauseMessage: '' });
      },
    );
  } catch (err) {
    onError?.(err);
    onData({ mode: 'auto', manualEnabled: false, deliveryDays: [1, 2, 3, 4, 5], pauseMessage: '' });
    return () => {};
  }
}
