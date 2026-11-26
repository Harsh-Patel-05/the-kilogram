import { Clock, Heart } from 'lucide-react';
import './PreparingHero.css';

/**
 * Animated “thank you / preparing” hero (inspired by preparing-order motion shots).
 * Shown while order is placed → confirmed → preparing so the customer stays engaged.
 */
export default function PreparingHero({
  status = 'placed',
  etaMinutes = null,
  estRange = { min: 35, max: 55 },
  tokenNumber = null,
  orderId = '',
  customerName = '',
}) {
  const waiting = status === 'placed';
  const cooking = status === 'confirmed' || status === 'preparing';
  const etaLabel =
    etaMinutes != null
      ? `~${etaMinutes} min`
      : `${estRange.min}–${estRange.max} min`;

  const title = waiting
    ? 'Thank you!'
    : cooking
      ? 'Preparing your order'
      : 'We\'ve got it';

  const subtitle = waiting
    ? 'Your order is with us. Kitchen will confirm shortly.'
    : cooking
      ? 'Fresh on the tawa — hang tight, we\'re cooking with care.'
      : 'Live updates will appear here.';

  return (
    <section className={`kg-prep status-${status}`} aria-live="polite">
      <div className="kg-prep__stage" aria-hidden="true">
        <div className="kg-prep__glow" />
        <div className="kg-prep__plate">
          <span className="kg-prep__steam kg-prep__steam--1" />
          <span className="kg-prep__steam kg-prep__steam--2" />
          <span className="kg-prep__steam kg-prep__steam--3" />
          <div className="kg-prep__bowl">
            <span className="kg-prep__food" />
          </div>
          <div className={`kg-prep__chef${cooking ? ' is-cook' : ''}`}>
            <span className="kg-prep__chef-hat" />
            <span className="kg-prep__chef-face" />
            <span className="kg-prep__spatula" />
          </div>
        </div>
        <div className="kg-prep__spark kg-prep__spark--a" />
        <div className="kg-prep__spark kg-prep__spark--b" />
        <div className="kg-prep__spark kg-prep__spark--c" />
      </div>

      <div className="kg-prep__copy">
        <p className="kg-prep__thanks">
          <Heart aria-hidden="true" />
          {customerName ? `Thanks, ${customerName.split(' ')[0]}` : 'Thanks for ordering'}
        </p>
        <h1 className="kg-prep__title">{title}</h1>
        <p className="kg-prep__sub">{subtitle}</p>

        <div className="kg-prep__eta" role="status">
          <Clock aria-hidden="true" />
          <div>
            <strong>{etaLabel}</strong>
            <span>{waiting ? 'after confirmation' : 'estimated ready time'}</span>
          </div>
        </div>

        <div className="kg-prep__meta">
          {tokenNumber ? (
            <p className="kg-prep__token">
              Token <strong>#{tokenNumber}</strong>
            </p>
          ) : (
            <p className="kg-prep__token kg-prep__token--wait">Token assigned when kitchen accepts</p>
          )}
          {orderId ? <p className="kg-prep__oid">{orderId}</p> : null}
        </div>
      </div>
    </section>
  );
}
