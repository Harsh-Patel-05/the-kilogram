import { Check, ShoppingBag } from 'lucide-react';
import { useCart } from '../../context/CartContext.jsx';
import { formatPrice } from '../../data/menu.js';
import './CartToast.css';

export default function CartToast({ onOpenCart }) {
  const { toastOpen, lastAdded, itemCount, dismissToast } = useCart();

  if (!toastOpen || !lastAdded) return null;

  return (
    <div className="kg-toast" role="status" aria-live="polite">
      <div className="kg-toast__icon" aria-hidden="true">
        <Check />
      </div>
      <div className="kg-toast__body">
        <p className="kg-toast__title">Added to cart</p>
        <p className="kg-toast__meta">
          {lastAdded.name}
          {lastAdded.optionLabel ? ` · ${lastAdded.optionLabel}` : ''} ·{' '}
          {formatPrice(lastAdded.unitPrice)}
        </p>
      </div>
      <button
        type="button"
        className="kg-toast__cta"
        onClick={() => {
          dismissToast();
          onOpenCart?.();
        }}
      >
        <ShoppingBag aria-hidden="true" />
        View ({itemCount})
      </button>
    </div>
  );
}
