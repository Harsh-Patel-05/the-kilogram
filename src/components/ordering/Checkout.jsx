import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Bike,
  Check,
  MapPin,
  Package,
  Pencil,
  Store,
  Wallet,
  X,
} from 'lucide-react';
import { useCart } from '../../context/CartContext.jsx';
import { formatPrice } from '../../data/menu.js';
import { restaurantLocation } from '../../data/restaurantLocation.js';
import { site } from '../../data/site.js';
import { placeOnlineOrder } from '../../lib/orders.js';
import { checkDeliveryEligibility } from '../../lib/haversine.js';
import { resolveDeliveryCharge } from '../../lib/deliveryFees.js';
import {
  DELIVERY_PHONE_DISPLAY,
  DELIVERY_PHONE_HREF,
} from '../../data/restaurantLocation.js';
import { lockBody, unlockBody } from '../../lib/bodyLock.js';
import useFocusTrap from '../../hooks/useFocusTrap.js';
import useOnlineOrdering from '../../hooks/useOnlineOrdering.js';
import LocationPicker from './LocationPicker.jsx';
import './Checkout.css';

function digitsOnly(value) {
  return String(value || '').replace(/\D/g, '');
}

/** Accept 10-digit IN numbers, or +91 / 91 / 0-prefixed forms. */
function normalizeIndianMobile(value) {
  let d = digitsOnly(value);
  if (d.length === 12 && d.startsWith('91')) d = d.slice(2);
  if (d.length === 11 && d.startsWith('0')) d = d.slice(1);
  return d;
}

function isValidMobile(value) {
  const d = normalizeIndianMobile(value);
  return d.length === 10 && /^[6-9]/.test(d);
}

const ADDR_KEY = 'kg-last-address';
const STEPS = ['type', 'details', 'review'];

function loadSavedAddress() {
  try {
    const raw = localStorage.getItem(ADDR_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function friendlyError(err) {
  const code = err?.code || '';
  const msg = String(err?.message || '');
  if (code.includes('admin-restricted') || msg.includes('admin-restricted-operation')) {
    return 'Ordering is almost ready — Anonymous sign-in needs to be enabled in Firebase Auth. Please contact the restaurant.';
  }
  if (msg.includes('permission') || code.includes('permission-denied')) {
    return 'Could not save the order (permissions). Please try again in a moment.';
  }
  return msg || 'Could not place order. Please try again.';
}

export default function Checkout({ open, onClose, onBackToCart, menuReady = true }) {
  const { items, itemCount, subtotal, clearCart } = useCart();
  const navigate = useNavigate();
  const saved = loadSavedAddress();
  const panelRef = useRef(null);
  const onlineOrdering = useOnlineOrdering();
  const kitchenOpen = onlineOrdering.enabled;
  useFocusTrap(panelRef, open);

  const [step, setStep] = useState(0);
  const [orderType, setOrderType] = useState('delivery');
  const [address, setAddress] = useState(() => saved);
  const [eligibility, setEligibility] = useState(null);
  const [editingAddress, setEditingAddress] = useState(!saved);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [pickupName, setPickupName] = useState(saved?.fullName || '');
  const [pickupMobile, setPickupMobile] = useState(saved?.mobile || '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [successId, setSuccessId] = useState(null);

  const discount = 0;
  const radiusKm = restaurantLocation.deliveryRadiusKm;
  const freeMin = restaurantLocation.freeDeliveryMinSubtotal;
  const freeMaxKm = restaurantLocation.freeDeliveryMaxKm;

  const feePreview = useMemo(() => {
    if (orderType !== 'delivery') {
      return resolveDeliveryCharge({
        orderType: 'pickup',
        subtotal: subtotal - discount,
        distanceKm: null,
      });
    }
    const dist =
      address?.latitude != null && address?.longitude != null
        ? checkDeliveryEligibility(
            address.latitude,
            address.longitude,
            restaurantLocation,
            restaurantLocation.deliveryRadiusKm,
          ).distanceKm
        : null;
    return resolveDeliveryCharge({
      orderType: 'delivery',
      subtotal: subtotal - discount,
      distanceKm: dist,
    });
  }, [orderType, subtotal, discount, address?.latitude, address?.longitude]);

  const deliveryCharge = feePreview.fee;
  const total = Math.max(0, subtotal - discount + deliveryCharge);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape' && !busy) onClose?.();
    };
    lockBody();
    window.addEventListener('keydown', onKey);
    return () => {
      unlockBody();
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose, busy]);

  /* Phone keyboard: keep sheet inside visual viewport + scroll focused fields into view */
  useEffect(() => {
    if (!open) return undefined;
    const panel = panelRef.current;
    if (!panel) return undefined;

    const syncViewport = () => {
      const vv = window.visualViewport;
      if (!vv || window.matchMedia('(min-width: 720px)').matches) {
        panel.style.removeProperty('--kg-vv-h');
        return;
      }
      panel.style.setProperty('--kg-vv-h', `${Math.round(vv.height)}px`);
    };

    const onFocusIn = (e) => {
      const el = e.target;
      if (!(el instanceof HTMLElement)) return;
      if (!/^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName)) return;
      window.setTimeout(() => {
        el.scrollIntoView({ block: 'center', behavior: 'smooth' });
      }, 120);
    };

    syncViewport();
    const vv = window.visualViewport;
    vv?.addEventListener('resize', syncViewport);
    vv?.addEventListener('scroll', syncViewport);
    panel.addEventListener('focusin', onFocusIn);
    return () => {
      vv?.removeEventListener('resize', syncViewport);
      vv?.removeEventListener('scroll', syncViewport);
      panel.removeEventListener('focusin', onFocusIn);
      panel.style.removeProperty('--kg-vv-h');
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      setStep(0);
      setError('');
      setSuccessId(null);
      setBusy(false);
    }
  }, [open]);

  const liveEligibility = useMemo(() => {
    if (orderType !== 'delivery') return null;
    if (address?.latitude == null || address?.longitude == null) return eligibility;
    return checkDeliveryEligibility(
      address.latitude,
      address.longitude,
      restaurantLocation,
      restaurantLocation.deliveryRadiusKm,
    );
  }, [orderType, address?.latitude, address?.longitude, eligibility]);

  if (!open) return null;

  const addressSummary = address
    ? [address.flat, address.society, address.area, address.landmark].filter(Boolean).join(', ')
    : '';

  const deliveryDetailsOk = Boolean(
    liveEligibility?.eligible &&
      address?.latitude != null &&
      address?.fullName?.trim() &&
      isValidMobile(address?.mobile) &&
      address?.flat?.trim() &&
      address?.area?.trim(),
  );

  const detailsReady =
    orderType === 'delivery'
      ? deliveryDetailsOk
      : Boolean(pickupName.trim() && isValidMobile(pickupMobile));

  const stepTitles = {
    type: 'How should we send it?',
    details: orderType === 'delivery' ? 'Delivery details' : 'Pickup details',
    review: 'Review & place order',
  };

  const deliveryBlockReason = () => {
    if (address?.latitude == null || address?.longitude == null) {
      return `Drop a pin on the map inside our ${radiusKm} km delivery area.`;
    }
    if (!liveEligibility?.eligible) {
      return liveEligibility?.message || `Pin is outside our ${radiusKm} km delivery area.`;
    }
    if (!address?.fullName?.trim()) return 'Enter your full name.';
    if (!isValidMobile(address?.mobile)) {
      return 'Enter a valid 10-digit Indian mobile number (with or without +91).';
    }
    if (!address?.flat?.trim()) return 'Enter flat / house / building.';
    if (!address?.area?.trim()) return 'Enter area / locality.';
    return '';
  };

  const goNext = () => {
    setError('');
    if (step === 0) setStep(1);
    else if (step === 1) {
      if (!detailsReady) {
        setError(
          orderType === 'delivery'
            ? deliveryBlockReason()
            : !pickupName.trim()
              ? 'Enter your name.'
              : 'Enter a valid 10-digit Indian mobile number (with or without +91).',
        );
        return;
      }
      if (orderType === 'delivery') {
        // Persist normalized mobile for place/order + saved address
        const mobile = normalizeIndianMobile(address.mobile);
        setAddress((a) => (a ? { ...a, mobile } : a));
        setEditingAddress(false);
      } else {
        setPickupMobile(normalizeIndianMobile(pickupMobile));
      }
      setStep(2);
    }
  };

  const goBack = () => {
    setError('');
    if (step === 0) onBackToCart?.();
    else setStep((s) => s - 1);
  };

  const placeOrder = async () => {
    setError('');
    setBusy(true);
    try {
      if (!menuReady) {
        throw new Error('Live menu is unavailable. Refresh the page and try again.');
      }
      if (!kitchenOpen) {
        throw new Error(`${onlineOrdering.label}. ${onlineOrdering.detail}`);
      }
      const mobile = normalizeIndianMobile(
        orderType === 'delivery' ? address.mobile : pickupMobile,
      );
      if (!isValidMobile(mobile)) {
        throw new Error('Enter a valid 10-digit Indian mobile number (with or without +91).');
      }
      const deliveryAddress =
        orderType === 'delivery' ? { ...address, mobile } : null;
      if (orderType === 'delivery') {
        const recheck = checkDeliveryEligibility(
          deliveryAddress.latitude,
          deliveryAddress.longitude,
          restaurantLocation,
          restaurantLocation.deliveryRadiusKm,
        );
        if (!recheck.eligible) throw new Error(recheck.message);
        try {
          localStorage.setItem(ADDR_KEY, JSON.stringify(deliveryAddress));
        } catch {
          /* ignore */
        }
      }

      const result = await placeOnlineOrder({
        items,
        pricing: { subtotal, discount, deliveryCharge, total },
        customer: {
          fullName: orderType === 'delivery' ? address.fullName : pickupName,
          mobile,
        },
        deliveryAddress,
        orderType,
        paymentMethod,
        deliveryInstructions:
          orderType === 'delivery' ? address.deliveryInstructions || '' : '',
      });

      clearCart();
      setSuccessId(result.orderId);
      // Quick thank-you flash, then stay on live preparing/track page
      setTimeout(() => {
        onClose?.();
        navigate(`/track/${result.orderId}`, { replace: true });
      }, 900);
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setBusy(false);
    }
  };

  if (successId) {
    return (
      <div className="kg-check" role="dialog" aria-modal="true" aria-label="Order placed">
        <div className="kg-check__backdrop" />
        <div className="kg-check__panel kg-check__panel--success">
          <div className="kg-check__success">
            <div className="kg-check__success-ring" aria-hidden="true">
              <Check />
            </div>
            <p className="eyebrow">Order placed</p>
            <h2>Thank you!</h2>
            <p className="kg-check__success-id">{successId}</p>
            <p className="kg-check__hint">Opening live tracking…</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="kg-check" role="dialog" aria-modal="true" aria-label="Checkout">
      <button type="button" className="kg-check__backdrop" aria-label="Close" onClick={onClose} />
      <div className="kg-check__panel" ref={panelRef} tabIndex={-1}>
        <header className="kg-check__head">
          <button type="button" className="kg-check__back" onClick={goBack} aria-label="Back">
            <ArrowLeft aria-hidden="true" />
          </button>
          <div>
            <p className="eyebrow">Step {step + 1} of {STEPS.length}</p>
            <h2>{stepTitles[STEPS[step]]}</h2>
          </div>
          <button type="button" className="kg-check__close" aria-label="Close" onClick={onClose}>
            <X aria-hidden="true" />
          </button>
        </header>

        <ol className="kg-check__progress" aria-label="Checkout progress">
          {STEPS.map((id, i) => (
            <li key={id} className={i === step ? 'is-current' : i < step ? 'is-done' : undefined}>
              <span>{i + 1}</span>
            </li>
          ))}
        </ol>

        <div className="kg-check__body">
          {step === 0 && (
            <section className="kg-check__section">
              <div className="kg-check__type-grid">
                <button
                  type="button"
                  className={`kg-check__type${orderType === 'delivery' ? ' is-active' : ''}`}
                  onClick={() => setOrderType('delivery')}
                >
                  <Bike aria-hidden="true" />
                  <strong>Delivery</strong>
                  <span>
                    Up to {radiusKm} km · free over ₹{freeMin} within {freeMaxKm} km
                  </span>
                </button>
                <button
                  type="button"
                  className={`kg-check__type${orderType === 'pickup' ? ' is-active' : ''}`}
                  onClick={() => setOrderType('pickup')}
                >
                  <Store aria-hidden="true" />
                  <strong>Pickup</strong>
                  <span>Collect from Jagatpur</span>
                </button>
              </div>

              <div className="kg-check__mini">
                <Package aria-hidden="true" />
                <div>
                  <strong>
                    {itemCount} item{itemCount === 1 ? '' : 's'}
                  </strong>
                  <span>{formatPrice(subtotal)} subtotal</span>
                </div>
              </div>
            </section>
          )}

          {step === 1 && orderType === 'delivery' && (
            <section className="kg-check__section">
              <div className="kg-check__section-head">
                <h3>Where should we deliver?</h3>
                {address && !editingAddress && (
                  <button type="button" className="kg-check__edit" onClick={() => setEditingAddress(true)}>
                    <Pencil aria-hidden="true" /> Edit
                  </button>
                )}
              </div>

              {!editingAddress && address && liveEligibility?.eligible ? (
                <div className="kg-check__addr">
                  <p>
                    <strong>{address.fullName}</strong> · {address.mobile}
                  </p>
                  <p>
                    <MapPin aria-hidden="true" className="kg-check__inline-icon" />
                    {addressSummary}
                  </p>
                  <p className="is-ok">{liveEligibility.message}</p>
                  {feePreview.reason ? <p className="kg-check__fee-hint">{feePreview.reason}</p> : null}
                </div>
              ) : (
                <>
                  <LocationPicker
                    value={address || undefined}
                    onChange={setAddress}
                    onEligibilityChange={setEligibility}
                  />
                  {liveEligibility && !liveEligibility.eligible ? (
                    <div className="kg-check__out-area" role="alert">
                      <p>{liveEligibility.message}</p>
                      <a className="btn btn--blue" href={DELIVERY_PHONE_HREF}>
                        Call {DELIVERY_PHONE_DISPLAY}
                      </a>
                    </div>
                  ) : null}
                </>
              )}
            </section>
          )}

          {step === 1 && orderType === 'pickup' && (
            <section className="kg-check__section">
              <div className="kg-check__pickup-card">
                <Store aria-hidden="true" />
                <div>
                  <strong>The Kilogram</strong>
                  <p>{site.addressOneLine}</p>
                </div>
              </div>
              <div className="kg-check__pickup">
                <label>
                  <span>Full name</span>
                  <input
                    value={pickupName}
                    onChange={(e) => setPickupName(e.target.value)}
                    autoComplete="name"
                    placeholder="Your name"
                  />
                </label>
                <label>
                  <span>Mobile</span>
                  <input
                    type="tel"
                    inputMode="numeric"
                    value={pickupMobile}
                    onChange={(e) => setPickupMobile(e.target.value)}
                    autoComplete="tel"
                    placeholder="10-digit mobile"
                  />
                </label>
              </div>
            </section>
          )}

          {step === 2 && (
            <>
              <section className="kg-check__section">
                <h3>Items</h3>
                <ul className="kg-check__items">
                  {items.map((it) => (
                    <li key={it.id}>
                      <span>
                        {it.name}
                        {it.optionLabel ? ` · ${it.optionLabel}` : ''}
                        <em> × {it.qty}</em>
                      </span>
                      <span>{formatPrice(it.unitPrice * it.qty)}</span>
                    </li>
                  ))}
                </ul>
                <dl className="kg-check__totals">
                  <div>
                    <dt>Subtotal</dt>
                    <dd>{formatPrice(subtotal)}</dd>
                  </div>
                  <div>
                    <dt>{orderType === 'delivery' ? 'Delivery' : 'Pickup'}</dt>
                    <dd>
                      {orderType === 'pickup'
                        ? 'Free'
                        : feePreview.free
                          ? 'Free unlocked'
                          : deliveryCharge === 0
                            ? 'Set pin for fee'
                            : formatPrice(deliveryCharge)}
                    </dd>
                  </div>
                  {orderType === 'delivery' && feePreview.reason ? (
                    <p className="kg-check__fee-hint">{feePreview.reason}</p>
                  ) : null}
                  <div className="kg-check__grand">
                    <dt>Total</dt>
                    <dd>{formatPrice(total)}</dd>
                  </div>
                </dl>
              </section>

              <section className="kg-check__section">
                <h3>{orderType === 'delivery' ? 'Deliver to' : 'Pickup for'}</h3>
                <div className="kg-check__addr">
                  {orderType === 'delivery' ? (
                    <>
                      <p>
                        <strong>{address.fullName}</strong> · {address.mobile}
                      </p>
                      <p>{addressSummary}</p>
                      {liveEligibility?.distanceKm != null && (
                        <p className="is-ok">{liveEligibility.distanceKm} km from restaurant</p>
                      )}
                    </>
                  ) : (
                    <p>
                      <strong>{pickupName}</strong> · {pickupMobile}
                    </p>
                  )}
                </div>
              </section>

              <section className="kg-check__section">
                <h3>Payment</h3>
                <div className="kg-check__pay">
                  <label className={paymentMethod === 'cod' ? 'is-active' : undefined}>
                    <input
                      type="radio"
                      name="pay"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                    />
                    <Wallet aria-hidden="true" />
                    <span>
                      Cash / UPI on {orderType === 'delivery' ? 'delivery' : 'pickup'}
                      <small>Pay when you receive your order</small>
                    </span>
                  </label>
                </div>
              </section>
            </>
          )}

          {error && (
            <p className="kg-check__error" role="alert">
              {error}
            </p>
          )}
        </div>

        <footer className="kg-check__foot">
          {step < 2 ? (
            <button type="button" className="btn btn--red" onClick={goNext}>
              Continue
            </button>
          ) : (
            <button
              type="button"
              className="btn btn--red"
              disabled={busy || !detailsReady}
              onClick={placeOrder}
            >
              {busy ? 'Placing order…' : `Place order · ${formatPrice(total)}`}
            </button>
          )}
          {step === 2 && (
            <p className="kg-check__foot-note">
              You’ll get a live tracking link as soon as the order is placed.
            </p>
          )}
        </footer>
      </div>
    </div>
  );
}
