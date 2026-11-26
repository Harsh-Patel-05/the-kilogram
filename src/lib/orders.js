import {
  collection,
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  serverTimestamp,
  updateDoc,
  arrayUnion,
} from 'firebase/firestore';
import { db, ensureCustomerAuth } from './firebase.js';
import { restaurantLocation } from '../data/restaurantLocation.js';
import { checkDeliveryEligibility } from './haversine.js';
import { resolveOnlineOrderingEnabled } from './onlineOrdering.js';

export const ONLINE_ORDERS = 'onlineOrders';

/** Customer-facing status timeline (restaurant-controlled; no rider GPS). */
export const CUSTOMER_STATUSES = [
  { id: 'placed', label: 'Order Placed' },
  { id: 'confirmed', label: 'Order Confirmed' },
  { id: 'preparing', label: 'Preparing Your Food' },
  { id: 'ready', label: 'Ready for Delivery' },
  { id: 'out_for_delivery', label: 'Out for Delivery' },
  { id: 'delivered', label: 'Delivered' },
];

export const TERMINAL_STATUSES = ['cancelled', 'rejected', 'refund_pending', 'delivered'];

export function statusLabel(status, orderType = 'delivery') {
  if (status === 'ready' && orderType === 'pickup') return 'Ready for Pickup';
  if (status === 'delivered' && orderType === 'pickup') return 'Picked Up';
  const found = CUSTOMER_STATUSES.find((s) => s.id === status);
  if (found) return found.label;
  const map = {
    cancelled: 'Cancelled',
    rejected: 'Rejected',
    refund_pending: 'Refund Pending',
  };
  return map[status] || status;
}

function makeOrderId() {
  const t = Date.now().toString(36).toUpperCase();
  const r = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `KG-${t}-${r}`;
}

export function calcDeliveryCharge(subtotal, orderType) {
  if (orderType !== 'delivery') return 0;
  const { deliveryCharge, freeDeliveryMinSubtotal } = restaurantLocation;
  if (
    freeDeliveryMinSubtotal != null &&
    Number.isFinite(freeDeliveryMinSubtotal) &&
    subtotal >= freeDeliveryMinSubtotal
  ) {
    return 0;
  }
  return Number(deliveryCharge) || 0;
}

/**
 * Place an online order. Revalidates delivery radius server-side-of-client
 * before write. Prices come from the live cart (Firestore menu); status starts as placed.
 */
export async function placeOnlineOrder({
  items,
  pricing,
  customer,
  deliveryAddress,
  orderType,
  paymentMethod,
  deliveryInstructions,
}) {
  if (!items?.length) throw new Error('Your cart is empty.');

  let gate;
  try {
    const gateSnap = await getDoc(doc(db, 'settings', 'onlineOrdering'));
    gate = resolveOnlineOrderingEnabled(gateSnap.exists() ? gateSnap.data() : null);
  } catch {
    // If settings unread (rules/network), fall back to local schedule only
    gate = resolveOnlineOrderingEnabled(null);
  }
  if (!gate.enabled) {
    throw new Error(`${gate.label}. ${gate.detail}`);
  }

  const type = orderType === 'pickup' ? 'pickup' : 'delivery';
  let distanceKm = null;
  let lat = null;
  let lng = null;

  if (type === 'delivery') {
    lat = Number(deliveryAddress?.latitude);
    lng = Number(deliveryAddress?.longitude);
    const check = checkDeliveryEligibility(
      lat,
      lng,
      restaurantLocation,
      restaurantLocation.deliveryRadiusKm,
    );
    if (!check.eligible) {
      throw new Error(check.message || 'Delivery is not available at this location.');
    }
    distanceKm = check.distanceKm;
  }

  const user = await ensureCustomerAuth();
  const orderId = makeOrderId();
  const nowIso = new Date().toISOString();
  const subtotal = Number(pricing.subtotal) || 0;
  const discount = Number(pricing.discount) || 0;
  const deliveryCharge = calcDeliveryCharge(subtotal - discount, type);
  const total = Math.max(0, subtotal - discount + deliveryCharge);

  const payload = {
    orderId,
    customerUid: user.uid,
    customer: {
      fullName: String(customer.fullName || '').trim(),
      mobile: String(customer.mobile || '').trim(),
    },
    items: items.map((it) => ({
      id: it.id,
      name: it.name,
      optionLabel: it.optionLabel || null,
      unitPrice: Number(it.unitPrice),
      basePrice: it.basePrice != null ? Number(it.basePrice) : Number(it.unitPrice),
      addons: Array.isArray(it.addons) ? it.addons : [],
      notes: it.notes || null,
      qty: Number(it.qty),
      lineTotal: Number(it.unitPrice) * Number(it.qty),
    })),
    pricing: {
      subtotal,
      discount,
      deliveryCharge,
      total,
    },
    deliveryAddress:
      type === 'delivery'
        ? {
            flat: String(deliveryAddress.flat || '').trim(),
            society: String(deliveryAddress.society || '').trim(),
            area: String(deliveryAddress.area || '').trim(),
            landmark: String(deliveryAddress.landmark || '').trim(),
            formatted: String(deliveryAddress.formatted || '').trim(),
            latitude: lat,
            longitude: lng,
          }
        : null,
    latitude: lat,
    longitude: lng,
    distanceKm,
    orderType: type,
    paymentMethod: paymentMethod || 'cod',
    paymentStatus: 'pending',
    orderStatus: 'placed',
    estimatedDeliveryMinutes: restaurantLocation.estimatedDeliveryMinutes,
    deliveryInstructions: String(deliveryInstructions || '').trim(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    createdAtIso: nowIso,
    statusHistory: [
      {
        status: 'placed',
        at: nowIso,
        note: 'Order placed by customer',
      },
    ],
    source: 'website',
    isDeleted: false,
  };

  await setDoc(doc(db, ONLINE_ORDERS, orderId), payload);
  return { orderId, total, distanceKm };
}

export function subscribeOnlineOrder(orderId, onData, onError) {
  const ref = doc(db, ONLINE_ORDERS, orderId);
  return onSnapshot(
    ref,
    (snap) => {
      if (!snap.exists()) {
        onData(null);
        return;
      }
      onData({ id: snap.id, ...snap.data() });
    },
    (err) => onError?.(err),
  );
}

/** Admin-side status update helper (also used if imported from admin). */
export async function appendOrderStatus(orderId, status, note = '') {
  const at = new Date().toISOString();
  await updateDoc(doc(db, ONLINE_ORDERS, orderId), {
    orderStatus: status,
    updatedAt: serverTimestamp(),
    statusHistory: arrayUnion({ status, at, note }),
  });
}
