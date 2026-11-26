const EARTH_RADIUS_KM = 6371;

function toRad(deg) {
  return (deg * Math.PI) / 180;
}

function isValidCoord(lat, lon) {
  if (lat == null || lon == null) return false;
  const aLat = Number(lat);
  const aLon = Number(lon);
  if (![aLat, aLon].every((n) => Number.isFinite(n))) return false;
  if (aLat < -90 || aLat > 90 || aLon < -180 || aLon > 180) return false;
  return true;
}

/**
 * Straight-line distance between two WGS84 points (kilometres).
 * Used for delivery-radius checks — no routing API.
 */
export function haversineKm(lat1, lon1, lat2, lon2) {
  if (!isValidCoord(lat1, lon1) || !isValidCoord(lat2, lon2)) return null;

  const aLat = Number(lat1);
  const aLon = Number(lon1);
  const bLat = Number(lat2);
  const bLon = Number(lon2);

  const dLat = toRad(bLat - aLat);
  const dLon = toRad(bLon - aLon);
  const lat1r = toRad(aLat);
  const lat2r = toRad(bLat);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1r) * Math.cos(lat2r) * Math.sin(dLon / 2) ** 2;

  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}

export function roundKm(km, digits = 1) {
  if (km == null || !Number.isFinite(km)) return null;
  const f = 10 ** digits;
  return Math.round(km * f) / f;
}

/**
 * Eligibility uses the displayed (1-decimal) distance so "3.0 km" is inside the radius.
 * @returns {{ eligible: boolean, distanceKm: number|null, message: string }}
 */
export function checkDeliveryEligibility(customerLat, customerLng, restaurant, radiusKm) {
  const distanceKm = haversineKm(
    restaurant.latitude,
    restaurant.longitude,
    customerLat,
    customerLng,
  );

  if (distanceKm == null) {
    return {
      eligible: false,
      distanceKm: null,
      message: 'Select a valid location on the map to check delivery availability.',
    };
  }

  const shown = roundKm(distanceKm, 1);
  const max = radiusKm ?? restaurant.deliveryRadiusKm ?? 3;

  if (shown <= max) {
    return {
      eligible: true,
      distanceKm: shown,
      message: `You're ${shown} km away — delivery is available!`,
    };
  }

  return {
    eligible: false,
    distanceKm: shown,
    message: `You're outside our ${max} km delivery area. You can still order for pickup.`,
  };
}
