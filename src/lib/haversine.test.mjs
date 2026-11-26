/**
 * Run: node src/lib/haversine.test.mjs
 */
import { haversineKm, checkDeliveryEligibility } from './haversine.js';
import { restaurantLocation as r } from '../data/restaurantLocation.js';

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

assert(haversineKm(r.latitude, r.longitude, r.latitude, r.longitude) === 0, 'zero distance');
assert(haversineKm(null, 1, 2, 3) === null, 'invalid coords');

const inside = checkDeliveryEligibility(r.latitude + 0.01, r.longitude, r, 3);
assert(inside.eligible === true, 'inside should be eligible');

const edge = checkDeliveryEligibility(r.latitude + 3 / 111, r.longitude, r, 3);
assert(edge.eligible === true, 'exactly ~3km should be eligible');

const out = checkDeliveryEligibility(r.latitude + 3.2 / 111, r.longitude, r, 3);
assert(out.eligible === false, 'outside should be ineligible');

console.log('haversine tests passed');
