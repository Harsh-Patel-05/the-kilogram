/**
 * Run: node src/lib/haversine.test.mjs
 */
import { haversineKm, checkDeliveryEligibility } from './haversine.js';
import { restaurantLocation as r } from '../data/restaurantLocation.js';
import { resolveDeliveryCharge, freeDeliveryProgress } from './deliveryFees.js';

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

assert(haversineKm(r.latitude, r.longitude, r.latitude, r.longitude) === 0, 'zero distance');
assert(haversineKm(null, 1, 2, 3) === null, 'invalid coords');

const max = r.deliveryRadiusKm || 2;
const inside = checkDeliveryEligibility(r.latitude + 0.005, r.longitude, r, max);
assert(inside.eligible === true, 'inside should be eligible');

const edge = checkDeliveryEligibility(r.latitude + max / 111, r.longitude, r, max);
assert(edge.eligible === true, 'exactly ~max km should be eligible');

const out = checkDeliveryEligibility(r.latitude + (max + 0.3) / 111, r.longitude, r, max);
assert(out.eligible === false, 'outside should be ineligible');
assert(String(out.message).includes('Rapido') || String(out.message).includes('Porter'), 'out-of-area messaging');

assert(resolveDeliveryCharge({ orderType: 'delivery', subtotal: 200, distanceKm: 0.3 }).fee === 20, '≤500m fee');
assert(resolveDeliveryCharge({ orderType: 'delivery', subtotal: 200, distanceKm: 0.8 }).fee === 40, '≤1km fee');
assert(resolveDeliveryCharge({ orderType: 'delivery', subtotal: 200, distanceKm: 1.6 }).fee === 50, '≤2km fee');
assert(resolveDeliveryCharge({ orderType: 'delivery', subtotal: 500, distanceKm: 1.2 }).free === true, 'free ≥500 within 1.5');
assert(resolveDeliveryCharge({ orderType: 'delivery', subtotal: 500, distanceKm: 1.8 }).fee === 50, 'no free beyond 1.5');
assert(freeDeliveryProgress(500).unlocked === true, 'unlock at 500');

console.log('haversine + delivery fee tests passed');
