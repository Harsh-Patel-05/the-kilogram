import { useEffect, useRef } from 'react';
import { Bike, Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { useCart } from '../../context/CartContext.jsx';
import { formatPrice } from '../../data/menu.js';
import { restaurantLocation } from '../../data/restaurantLocation.js';
import { lockBody, unlockBody } from '../../lib/bodyLock.js';
import useFocusTrap from '../../hooks/useFocusTrap.js';
import useOnlineOrdering from '../../hooks/useOnlineOrdering.js';
import './CartDrawer.css';

export default function CartDrawer({ open, onClose, onCheckout, menuReady = true }) {
  const { items, itemCount, subtotal, setQty, removeItem } = useCart();
  const panelRef = useRef(null);
  const onlineOrdering = useOnlineOrdering();
  const kitchenOpen = onlineOrdering.enabled;
  useFocusTrap(panelRef, open);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    lockBody();
    window.addEventListener('keydown', onKey);
    return () => {
      unlockBody();
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  const canCheckout = menuReady && kitchenOpen;

  return (
    <div className="kg-cart" role="dialog" aria-modal="true" aria-label="Your cart">
      <button type="button" className="kg-cart__backdrop" aria-label="Close cart" onClick={onClose} />
      <div className="kg-cart__panel" ref={panelRef} tabIndex={-1}>
        <header className="kg-cart__head">
          <div>
            <p className="eyebrow">Your order</p>
            <h2>
              <ShoppingBag aria-hidden="true" /> Cart
              {itemCount > 0 && <span className="kg-cart__count">{itemCount}</span>}
            </h2>
          </div>
          <button type="button" className="kg-cart__close" aria-label="Close" onClick={onClose}>
            <X aria-hidden="true" />
          </button>
        </header>

        {items.length === 0 ? (
          <div className="kg-cart__empty">
            <div className="kg-cart__empty-icon" aria-hidden="true">
              <ShoppingBag />
            </div>
            <p className="kg-cart__empty-title">Your cart is empty</p>
            <p>Browse the menu and tap a price to add dishes.</p>
            <a className="btn btn--red" href="#menu" onClick={onClose}>
              Browse menu
            </a>
          </div>
        ) : (
          <>
            <div className="kg-cart__banner">
              <Bike aria-hidden="true" />
              <span>
                Free delivery within {restaurantLocation.deliveryRadiusKm} km · or choose pickup
              </span>
            </div>

            <ul className="kg-cart__list">
              {items.map((item) => (
                <li key={item.id} className="kg-cart__row">
                  <div className="kg-cart__info">
                    <p className="kg-cart__name">{item.name}</p>
                    {item.optionLabel && <p className="kg-cart__opt">{item.optionLabel}</p>}
                    {item.addons?.length > 0 && (
                      <p className="kg-cart__opt">
                        + {item.addons.map((a) => a.name).join(', ')}
                      </p>
                    )}
                    {item.notes && <p className="kg-cart__opt">Note: {item.notes}</p>}
                    <p className="kg-cart__price">{formatPrice(item.unitPrice * item.qty)}</p>
                    {item.qty > 1 && (
                      <p className="kg-cart__opt">{formatPrice(item.unitPrice)} each</p>
                    )}
                  </div>
                  <div className="kg-cart__ops">
                    <div className="kg-cart__qty">
                      <button
                        type="button"
                        aria-label="Decrease quantity"
                        onClick={() => setQty(item.id, item.qty - 1)}
                      >
                        <Minus aria-hidden="true" />
                      </button>
                      <span>{item.qty}</span>
                      <button
                        type="button"
                        aria-label="Increase quantity"
                        onClick={() => setQty(item.id, item.qty + 1)}
                      >
                        <Plus aria-hidden="true" />
                      </button>
                    </div>
                    <button
                      type="button"
                      className="kg-cart__trash"
                      aria-label={`Remove ${item.name}`}
                      onClick={() => removeItem(item.id)}
                    >
                      <Trash2 aria-hidden="true" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            <footer className="kg-cart__foot">
              <div className="kg-cart__sub">
                <span>Subtotal</span>
                <strong>{formatPrice(subtotal)}</strong>
              </div>
              <button
                type="button"
                className="btn btn--red kg-cart__checkout"
                onClick={onCheckout}
                disabled={!canCheckout}
              >
                Checkout · {formatPrice(subtotal)}
              </button>
              <p className="kg-cart__note">
                {!menuReady
                  ? 'Live menu unavailable — checkout is paused. Please refresh.'
                  : !kitchenOpen
                    ? `${onlineOrdering.label} — ${onlineOrdering.detail}`
                    : 'Delivery charge calculated at checkout'}
              </p>
            </footer>
          </>
        )}
      </div>
    </div>
  );
}
