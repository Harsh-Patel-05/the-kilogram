/**
 * Photon (Komoot) geocoder — free public API with fair-use limits.
 * Debounce + min query length + simple rate limiting + reverse-geocode cache.
 * If Photon is down, callers must fall back to manual map + typed address.
 */

const PHOTON_BASE = 'https://photon.komoot.io';
const MIN_QUERY_LEN = 3;
const DEBOUNCE_MS = 400;
const MIN_REQUEST_GAP_MS = 350;
const CACHE_MAX = 40;

const reverseCache = new Map();
let lastRequestAt = 0;
let searchTimer = null;
let searchAbort = null;

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function throttle() {
  const wait = MIN_REQUEST_GAP_MS - (Date.now() - lastRequestAt);
  if (wait > 0) await sleep(wait);
  lastRequestAt = Date.now();
}

function cacheKey(lat, lon) {
  return `${Number(lat).toFixed(5)},${Number(lon).toFixed(5)}`;
}

function remember(key, value) {
  if (reverseCache.size >= CACHE_MAX) {
    const first = reverseCache.keys().next().value;
    reverseCache.delete(first);
  }
  reverseCache.set(key, value);
}

function formatFeature(f) {
  const p = f?.properties || {};
  const parts = [
    p.name,
    p.housenumber && p.street ? `${p.housenumber} ${p.street}` : p.street,
    p.district || p.suburb || p.neighbourhood,
    p.city || p.town || p.village || p.county,
    p.state,
    p.postcode,
  ].filter(Boolean);

  const unique = [...new Set(parts.map((s) => String(s).trim()).filter(Boolean))];
  const label = unique.join(', ') || 'Selected location';
  const [lon, lat] = f.geometry?.coordinates || [];

  return {
    label,
    name: p.name || '',
    area: p.district || p.suburb || p.neighbourhood || p.city || '',
    city: p.city || p.town || p.village || '',
    postcode: p.postcode || '',
    lat: Number(lat),
    lng: Number(lon),
  };
}

/**
 * Debounced address search. Resolves to [] on failure / short query.
 */
export function searchAddresses(query, { lat, lon, limit = 6 } = {}) {
  return new Promise((resolve) => {
    if (searchTimer) clearTimeout(searchTimer);
    if (searchAbort) {
      searchAbort.abort();
      searchAbort = null;
    }

    const q = String(query || '').trim();
    if (q.length < MIN_QUERY_LEN) {
      resolve([]);
      return;
    }

    searchTimer = setTimeout(async () => {
      try {
        await throttle();
        const ctrl = new AbortController();
        searchAbort = ctrl;
        const params = new URLSearchParams({
          q,
          limit: String(limit),
          lang: 'en',
        });
        if (Number.isFinite(lat) && Number.isFinite(lon)) {
          params.set('lat', String(lat));
          params.set('lon', String(lon));
        }
        const res = await fetch(`${PHOTON_BASE}/api/?${params}`, {
          signal: ctrl.signal,
          headers: { Accept: 'application/json' },
        });
        if (!res.ok) {
          resolve([]);
          return;
        }
        const data = await res.json();
        resolve((data.features || []).map(formatFeature).filter((f) => Number.isFinite(f.lat)));
      } catch (err) {
        if (err?.name === 'AbortError') return;
        resolve([]);
      } finally {
        searchAbort = null;
      }
    }, DEBOUNCE_MS);
  });
}

/**
 * Reverse geocode with in-memory cache. Returns null if Photon fails.
 */
export async function reverseGeocode(lat, lon) {
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
  const key = cacheKey(lat, lon);
  if (reverseCache.has(key)) return reverseCache.get(key);

  try {
    await throttle();
    const params = new URLSearchParams({
      lat: String(lat),
      lon: String(lon),
      lang: 'en',
    });
    const res = await fetch(`${PHOTON_BASE}/reverse?${params}`, {
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) return null;
    const data = await res.json();
    const feature = data.features?.[0];
    if (!feature) return null;
    const formatted = { ...formatFeature(feature), lat, lng: lon };
    remember(key, formatted);
    return formatted;
  } catch {
    return null;
  }
}

export const PHOTON_MIN_QUERY_LEN = MIN_QUERY_LEN;
