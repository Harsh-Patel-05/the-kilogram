import { BookOpen, Phone, ShoppingBag } from 'lucide-react';
import { site } from '../data/site.js';
import { useCart } from '../context/CartContext.jsx';
import './MobileOrderBar.css';

export default function MobileOrderBar({ onOpenCart }) {
  const { itemCount } = useCart();

  return (
    <nav className="orderbar" aria-label="Quick actions">
      <a className="orderbar__btn orderbar__btn--call" href={site.phoneHref}>
        <Phone aria-hidden="true" />
        <span>Call</span>
      </a>
      <a className="orderbar__btn" href="#menu">
        <BookOpen aria-hidden="true" />
        <span>Menu</span>
      </a>
      <button type="button" className="orderbar__btn orderbar__btn--cart" onClick={onOpenCart}>
        <ShoppingBag aria-hidden="true" />
        <span>Cart{itemCount > 0 ? ` (${itemCount})` : ''}</span>
      </button>
    </nav>
  );
}
