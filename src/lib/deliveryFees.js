import { restaurantLocation } from '../data/restaurantLocation.js';
import { DELIVERY_PHONE_DISPLAY } from '../data/restaurantLocation.js';

/**
 * Fee for a given distance (km). Returns null if outside max radius.
 */
export function deliveryFeeForDistanceKm(distanceKm, policy = restaurantLocation) {
  if (distanceKm == null || !Number.isFinite(distanceKm)) return null;
  const max = Number(policy.deliveryRadiusKm) || 2;
  if (distanceKm > max) return null;
  const slabs = policy.deliveryFeeSlabs || [];
  for (const slab of slabs) {
    if (distanceKm <= Number(slab.maxKm)) return Number(slab.fee) || 0;
  }
  return Number(slabs[slabs.length - 1]?.fee) || 0;
}

/**
 * @returns {{ fee: number, free: boolean, reason: string }}
 */
export function resolveDeliveryCharge({
  orderType,
  subtotal,
  distanceKm,
  policy = restaurantLocation,
}) {
  if (orderType !== 'delivery') {
    return { fee: 0, free: false, reason: 'Pickup — no delivery charge' };
  }
  if (distanceKm == null || !Number.isFinite(distanceKm)) {
    return { fee: 0, free: false, reason: 'Set delivery pin to calculate charge' };
  }
  const max = Number(policy.deliveryRadiusKm) || 2;
  if (distanceKm > max) {
    return { fee: 0, free: false, reason: 'Outside delivery area' };
  }

  const freeMin = Number(policy.freeDeliveryMinSubtotal) || 500;
  const freeMaxKm = Number(policy.freeDeliveryMaxKm) || 1.5;
  if (subtotal >= freeMin && distanceKm <= freeMaxKm) {
    return {
      fee: 0,
      free: true,
      reason: `Free delivery unlocked (order ₹${freeMin}+ within ${freeMaxKm} km)`,
    };
  }

  const fee = deliveryFeeForDistanceKm(distanceKm, policy) ?? 0;
  return {
    fee,
    free: false,
    reason:
      distanceKm <= 0.5
        ? `Nearby (≤500 m) · ₹${fee}`
        : distanceKm <= 1
          ? `0.5–1 km · ₹${fee}`
          : `Within ${max} km · ₹${fee}`,
  };
}

export function outOfAreaMessage(distanceKm, phone = DELIVERY_PHONE_DISPLAY) {
  const shown = distanceKm != null ? `${distanceKm} km` : 'that area';
  return (
    `We're not delivering to ${shown} yet — we'll start soon. ` +
    `You're a valued customer: call us on ${phone} and we can help arrange Rapido or Porter for you.`
  );
}

export function freeDeliveryProgress(subtotal, policy = restaurantLocation) {
  const need = Number(policy.freeDeliveryMinSubtotal) || 500;
  const left = Math.max(0, need - (Number(subtotal) || 0));
  const unlocked = left <= 0;
  return { need, left, unlocked, progress: Math.min(1, (Number(subtotal) || 0) / need) };
}
