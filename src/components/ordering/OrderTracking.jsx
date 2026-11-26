import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Bike,
  Check,
  ChefHat,
  Clock,
  MapPin,
  PackageCheck,
  Phone,
  RefreshCw,
  ShoppingBag,
  Store,
  XCircle,
} from 'lucide-react';
import {
  CUSTOMER_STATUSES,
  statusLabel,
  subscribeOnlineOrder,
  TERMINAL_STATUSES,
} from '../../lib/orders.js';
import { formatPrice } from '../../data/menu.js';
import { site } from '../../data/site.js';
import BrandLockup from '../BrandLockup.jsx';
import './OrderTracking.css';

const ICONS = {
  placed: ShoppingBag,
  confirmed: Check,
  preparing: ChefHat,
  ready: PackageCheck,
  out_for_delivery: Bike,
  delivered: Check,
};

const STATUS_COPY = {
  placed: {
    title: 'Order placed',
    hint: "We've got your order. Waiting for the kitchen to confirm.",
  },
  confirmed: {
    title: 'Order confirmed',
    hint: 'Confirmed — the kitchen is lining this up next.',
  },
  preparing: {
    title: 'Preparing your food',
    hint: 'Fresh on the tawa. Hang tight.',
  },
  ready: {
    title: 'Ready',
    deliveryHint: 'Packed and ready — rider will pick up shortly.',
    pickupHint: 'Ready for pickup at The Kilogram, Jagatpur.',
  },
  out_for_delivery: {
    title: 'Out for delivery',
    hint: 'On the way to you. Keep your phone handy.',
  },
  delivered: {
    title: 'Delivered',
    deliveryHint: 'Enjoy your meal. Thanks for ordering with us.',
    pickupHint: 'Picked up. Enjoy your meal!',
  },
  cancelled: {
    title: 'Order cancelled',
    hint: 'This order was cancelled. Call us if you need help.',
  },
  rejected: {
    title: 'Order declined',
    hint: "We couldn't take this order. Please call for details.",
  },
  refund_pending: {
    title: 'Refund pending',
    hint: "We're processing your refund and will update you soon.",
  },
};

function statusMessage(status, orderType) {
  const copy = STATUS_COPY[status] || {
    title: statusLabel(status, orderType),
    hint: 'Live updates will appear here.',
  };
  if (orderType === 'pickup' && copy.pickupHint) {
    return {
      title:
        copy.title === 'Ready'
          ? 'Ready for pickup'
          : copy.title === 'Delivered'
            ? 'Picked up'
            : copy.title,
      hint: copy.pickupHint,
    };
  }
  if (copy.deliveryHint) {
    return { title: copy.title, hint: copy.deliveryHint };
  }
  return { title: copy.title, hint: copy.hint };
}

function formatWhen(isoOrTs) {
  if (!isoOrTs) return '—';
  const d =
    typeof isoOrTs === 'object' && isoOrTs?.seconds
      ? new Date(isoOrTs.seconds * 1000)
      : new Date(isoOrTs);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function TrackHeader({ showCall = false }) {
  return (
    <header className="kg-track__top">
      <div className="kg-track__top-inner">
        <Link to="/" className="kg-track__back" aria-label="Back to home">
          <ArrowLeft aria-hidden="true" />
        </Link>
        <Link to="/" className="kg-track__brand" aria-label="The Kilogram home">
          <BrandLockup />
        </Link>
        {showCall ? (
          <a className="btn btn--ghost kg-track__call" href={site.phoneHref} aria-label="Call restaurant">
            <Phone aria-hidden="true" />
            <span className="kg-track__call-label">Call</span>
          </a>
        ) : (
          <span className="kg-track__call-spacer" aria-hidden="true" />
        )}
      </div>
    </header>
  );
}

function Skeleton() {
  return (
    <div className="kg-track__skel" aria-hidden="true">
      <div className="kg-shimmer kg-shimmer--hero" />
      <div className="kg-track__skel-side">
        <div className="kg-shimmer kg-shimmer--lg" />
        <div className="kg-shimmer" />
      </div>
    </div>
  );
}

export default function OrderTracking() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(undefined);
  const [error, setError] = useState('');
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!orderId) return undefined;
    setOrder(undefined);
    setError('');
    const unsub = subscribeOnlineOrder(
      orderId,
      (data) => setOrder(data),
      (err) => {
        setError(err?.message || 'Could not load this order.');
        setOrder(null);
      },
    );
    return unsub;
  }, [orderId, tick]);

  const timeline = useMemo(() => {
    if (!order) return [];
    return CUSTOMER_STATUSES.filter(
      (step) => !(order.orderType === 'pickup' && step.id === 'out_for_delivery'),
    );
  }, [order]);

  if (order === undefined) {
    return (
      <div className="kg-track">
        <TrackHeader />
        <Skeleton />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="kg-track">
        <TrackHeader showCall />
        <div className="kg-track__error" role="alert">
          <span className="kg-track__error-icon">
            <XCircle aria-hidden="true" />
          </span>
          <h1>Order not found</h1>
          <p>{error || 'Check the link or ask the restaurant for your order ID.'}</p>
          <div className="kg-track__error-actions">
            <button type="button" className="btn btn--ghost" onClick={() => setTick((t) => t + 1)}>
              <RefreshCw aria-hidden="true" /> Try again
            </button>
            <Link to="/" className="btn btn--red">
              Back to menu
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const status = order.orderStatus || 'placed';
  const isTerminalBad = status === 'cancelled' || status === 'rejected';
  const isRefund = status === 'refund_pending';
  const isDone = status === 'delivered';
  const isLive = !TERMINAL_STATUSES.includes(status);
  const est = order.estimatedDeliveryMinutes || { min: 35, max: 55 };
  const msg = statusMessage(status, order.orderType);
  const HeroIcon = ICONS[status] || (isTerminalBad || isRefund ? XCircle : Clock);
  const curIdx = timeline.findIndex((s) => s.id === status);
  const progress =
    isDone || status === 'delivered'
      ? 100
      : curIdx < 0
        ? 0
        : Math.round(((curIdx + 0.35) / Math.max(timeline.length - 1, 1)) * 100);

  const addr = order.deliveryAddress;
  const addressLine = addr
    ? [addr.flat, addr.society, addr.area, addr.landmark].filter(Boolean).join(', ')
    : null;

  const pricing = order.pricing || {};
  const subtotal = pricing.subtotal ?? null;
  const deliveryCharge = pricing.deliveryCharge ?? null;
  const discount = pricing.discount ?? 0;
  const total = pricing.total ?? 0;
  const itemCount = (order.items || []).length;

  return (
    <div className="kg-track">
      <div className="kg-track__glow" aria-hidden="true" />
      <TrackHeader showCall />

      <main className="kg-track__main">
        <div className="kg-track__layout">
          <div className="kg-track__primary">
            <section className={`kg-track__hero status-${status}`} aria-live="polite">
              <div className="kg-track__hero-copy">
                <div className="kg-track__hero-top">
                  {isLive ? (
                    <span className="kg-track__live-pill">
                      <span className="kg-track__live-dot" aria-hidden="true" />
                      Live tracking
                    </span>
                  ) : isDone ? (
                    <span className="kg-track__live-pill kg-track__live-pill--done">Completed</span>
                  ) : (
                    <span className="kg-track__live-pill kg-track__live-pill--bad">
                      {statusLabel(status, order.orderType)}
                    </span>
                  )}
                  <p className="kg-track__order-ref">{order.orderId || orderId}</p>
                </div>

                <h1 className="kg-track__hero-title">{msg.title}</h1>
                <p className="kg-track__hero-hint">{msg.hint}</p>

                {isLive && order.orderType === 'delivery' && (
                  <p className="kg-track__eta">
                    <Clock aria-hidden="true" />
                    <span className="kg-track__eta-text">
                      Est. <strong>{est.min}–{est.max} min</strong>
                      <em> after confirmation</em>
                    </span>
                  </p>
                )}

                <p className="kg-track__meta">
                  Placed {formatWhen(order.createdAtIso || order.createdAt)}
                  <span aria-hidden="true"> · </span>
                  {order.orderType === 'pickup' ? 'Pickup' : 'Delivery'}
                  {order.paymentMethod ? (
                    <>
                      <span aria-hidden="true"> · </span>
                      {String(order.paymentMethod).replace(/_/g, ' ')}
                    </>
                  ) : null}
                </p>

                {isLive && (
                  <div className="kg-track__progress" aria-hidden="true">
                    <div className="kg-track__progress-bar" style={{ width: `${progress}%` }} />
                  </div>
                )}
              </div>

              <div className="kg-track__hero-icon" aria-hidden="true">
                <HeroIcon />
              </div>
            </section>

            {!isTerminalBad && !isRefund && (
              <section className="kg-track__panel" aria-label="Order progress">
                <div className="kg-track__section-head">
                  <h2>Order progress</h2>
                  {isLive && <span>Updates live</span>}
                </div>

                <ol className="kg-track__steps-h" aria-label="Status steps">
                  {timeline.map((step, idx) => {
                    const Icon = ICONS[step.id] || Check;
                    const done = (curIdx >= 0 && idx <= curIdx) || isDone;
                    const current = step.id === status && !isDone;
                    const label =
                      step.id === 'ready' && order.orderType === 'pickup'
                        ? 'Ready for Pickup'
                        : step.id === 'delivered' && order.orderType === 'pickup'
                          ? 'Picked Up'
                          : step.label;
                    return (
                      <li
                        key={step.id}
                        className={`kg-track__hstep${done ? ' is-done' : ''}${current ? ' is-current' : ''}`}
                      >
                        <span className="kg-track__hstep-dot">
                          <Icon />
                        </span>
                        <span className="kg-track__hstep-label">{label}</span>
                        {current && <span className="kg-track__step-now">Now</span>}
                      </li>
                    );
                  })}
                </ol>

                <ol className="kg-track__timeline">
                  {timeline.map((step, idx) => {
                    const Icon = ICONS[step.id] || Check;
                    const done = (curIdx >= 0 && idx <= curIdx) || isDone;
                    const current = step.id === status && !isDone;
                    const label =
                      step.id === 'ready' && order.orderType === 'pickup'
                        ? 'Ready for Pickup'
                        : step.id === 'delivered' && order.orderType === 'pickup'
                          ? 'Picked Up'
                          : step.label;
                    return (
                      <li
                        key={step.id}
                        className={`kg-track__step${done ? ' is-done' : ''}${current ? ' is-current' : ''}`}
                      >
                        <span className="kg-track__rail" aria-hidden="true" />
                        <span className="kg-track__dot">
                          <Icon />
                        </span>
                        <div className="kg-track__step-body">
                          <span className="kg-track__step-label">{label}</span>
                          {current && <span className="kg-track__step-now">Now</span>}
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </section>
            )}

            {order.statusHistory?.length > 0 && (
              <section className="kg-track__panel kg-track__panel--history" aria-label="Status history">
                <div className="kg-track__section-head">
                  <h2>Updates</h2>
                </div>
                <ul className="kg-track__history">
                  {[...order.statusHistory].reverse().map((h, i) => (
                    <li key={`${h.at}-${i}`}>
                      <strong>{statusLabel(h.status, order.orderType)}</strong>
                      <time>{formatWhen(h.at)}</time>
                      {h.note ? <em>{h.note}</em> : null}
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          <aside className="kg-track__aside">
            <section className="kg-track__panel" aria-label="Order items">
              <div className="kg-track__section-head">
                <h2>Your order</h2>
                <span>
                  {itemCount} item{itemCount === 1 ? '' : 's'}
                </span>
              </div>
              <ul className="kg-track__items">
                {(order.items || []).map((it) => (
                  <li key={it.id}>
                    <span className="kg-track__qty" aria-hidden="true">
                      {it.qty}
                    </span>
                    <div className="kg-track__item-main">
                      <strong>{it.name}</strong>
                      {it.optionLabel ? <span>{it.optionLabel}</span> : null}
                    </div>
                    <span className="kg-track__item-price">
                      {formatPrice(it.lineTotal ?? it.unitPrice * it.qty)}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="kg-track__bill">
                {subtotal != null && (
                  <div>
                    <span>Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                )}
                {order.orderType === 'delivery' && deliveryCharge != null && (
                  <div>
                    <span>Delivery</span>
                    <span>{deliveryCharge === 0 ? 'Free' : formatPrice(deliveryCharge)}</span>
                  </div>
                )}
                {discount > 0 && (
                  <div>
                    <span>Discount</span>
                    <span>−{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="kg-track__bill-total">
                  <span>Total</span>
                  <strong>{formatPrice(total)}</strong>
                </div>
              </div>
            </section>

            <section
              className="kg-track__panel"
              aria-label={order.orderType === 'pickup' ? 'Pickup details' : 'Delivery details'}
            >
              <div className="kg-track__section-head">
                <h2>{order.orderType === 'pickup' ? 'Pickup details' : 'Delivery details'}</h2>
              </div>
              <div className="kg-track__place">
                <span className="kg-track__place-icon" aria-hidden="true">
                  {order.orderType === 'pickup' ? <Store /> : <MapPin />}
                </span>
                <div>
                  <p className="kg-track__place-name">
                    {order.customer?.fullName}
                    {order.customer?.mobile ? (
                      <>
                        <span aria-hidden="true"> · </span>
                        <a href={`tel:${String(order.customer.mobile).replace(/\D/g, '')}`}>
                          {order.customer.mobile}
                        </a>
                      </>
                    ) : null}
                  </p>
                  {addressLine ? (
                    <p className="kg-track__place-addr">{addressLine}</p>
                  ) : (
                    <p className="kg-track__place-addr">{site.addressOneLine}</p>
                  )}
                  {order.distanceKm != null && (
                    <p className="kg-track__place-meta">{order.distanceKm} km from restaurant</p>
                  )}
                  {order.deliveryInstructions ? (
                    <p className="kg-track__place-note">“{order.deliveryInstructions}”</p>
                  ) : null}
                </div>
              </div>
              {order.orderType === 'pickup' && (
                <a
                  className="kg-track__map-link"
                  href={site.directionsHref}
                  target="_blank"
                  rel="noreferrer"
                >
                  Get directions
                </a>
              )}
            </section>

            <div className="kg-track__aside-actions kg-track__aside-actions--desk">
              {isLive && (
                <button type="button" className="btn btn--ghost" onClick={() => setTick((t) => t + 1)}>
                  <RefreshCw aria-hidden="true" /> Refresh
                </button>
              )}
              <a className="btn btn--red" href={site.phoneHref}>
                <Phone aria-hidden="true" /> Call restaurant
              </a>
              <Link to="/" className="kg-track__home-link">
                Back to menu
              </Link>
            </div>
          </aside>
        </div>

        <Link to="/" className="kg-track__home-link kg-track__home-link--mobile">
          Back to menu
        </Link>
      </main>

      <div className="kg-track__mobile-bar" role="region" aria-label="Order actions">
        {isLive && (
          <button type="button" className="btn btn--ghost" onClick={() => setTick((t) => t + 1)}>
            <RefreshCw aria-hidden="true" />
            <span>Refresh</span>
          </button>
        )}
        <a className="btn btn--red" href={site.phoneHref}>
          <Phone aria-hidden="true" />
          <span>Call</span>
        </a>
      </div>
    </div>
  );
}
