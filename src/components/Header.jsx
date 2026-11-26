import { useCallback, useRef, useState } from 'react';
import { Menu, ShoppingBag } from 'lucide-react';
import BrandLockup from './BrandLockup.jsx';
import MobileMenu from './MobileMenu.jsx';
import useScrolled from '../hooks/useScrolled.js';
import useActiveSection from '../hooks/useActiveSection.js';
import { useCart } from '../context/CartContext.jsx';
import { navLinks, site } from '../data/site.js';
import './Header.css';

const sectionIds = navLinks.map((l) => l.href.slice(1));

export default function Header({ onOpenCart }) {
  const scrolled = useScrolled(24);
  const active = useActiveSection(sectionIds);
  const [menuOpen, setMenuOpen] = useState(false);
  const burgerRef = useRef(null);
  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const { itemCount } = useCart();

  return (
    <header className={`header${scrolled ? ' is-scrolled' : ''}`}>
      <div className="container header__bar">
        <a href="#home" className="header__brand" aria-label="The Kilogram, back to top">
          <BrandLockup />
        </a>

        <nav className="header__nav" aria-label="Main">
          <ul>
            {navLinks.map((link) => {
              const isActive = active === link.href.slice(1);
              return (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className={isActive ? 'is-active' : undefined}
                    aria-current={isActive ? 'location' : undefined}
                  >
                    {link.label}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="header__actions">
          <button
            type="button"
            className="header__cart"
            aria-label={`Open cart${itemCount ? `, ${itemCount} items` : ''}`}
            onClick={onOpenCart}
          >
            <ShoppingBag aria-hidden="true" />
            {itemCount > 0 && <span className="header__cart-badge">{itemCount}</span>}
          </button>
          <a className="btn btn--red header__cta" href="#menu">
            <ShoppingBag aria-hidden="true" />
            <span>Order Online</span>
          </a>
        </div>

        <button
          ref={burgerRef}
          type="button"
          className="header__burger"
          aria-label="Open menu"
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          onClick={() => setMenuOpen(true)}
        >
          <Menu aria-hidden="true" />
        </button>
      </div>

      <MobileMenu open={menuOpen} onClose={closeMenu} returnFocusRef={burgerRef} />
    </header>
  );
}
