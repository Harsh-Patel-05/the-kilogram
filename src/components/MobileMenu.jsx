import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ArrowRight, BookOpen, Clock, MapPin, Phone, X } from 'lucide-react';
import BrandLockup from './BrandLockup.jsx';
import DeliveryLinks from './DeliveryLinks.jsx';
import OpenStatus from './OpenStatus.jsx';
import { hours, navLinks, site } from '../data/site.js';
import './MobileMenu.css';

const FOCUSABLE = 'a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])';

export default function MobileMenu({ open, onClose, returnFocusRef }) {
  const panelRef = useRef(null);
  const closeRef = useRef(null);
  const wasOpen = useRef(false);

  useEffect(() => {
    if (!open) {
      if (wasOpen.current) returnFocusRef.current?.focus({ preventScroll: true });
      wasOpen.current = false;
      return undefined;
    }
    wasOpen.current = true;
    document.body.classList.add('is-locked');
    closeRef.current?.focus({ preventScroll: true });

    const onKey = (e) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key !== 'Tab' || !panelRef.current) return;
      const items = [...panelRef.current.querySelectorAll(FOCUSABLE)];
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    const onResize = () => {
      if (window.innerWidth >= 1024) onClose();
    };

    document.addEventListener('keydown', onKey);
    window.addEventListener('resize', onResize);
    return () => {
      document.body.classList.remove('is-locked');
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onResize);
    };
  }, [open, onClose, returnFocusRef]);

  const goTo = (e, href) => {
    e.preventDefault();
    onClose();
    requestAnimationFrame(() => {
      document.querySelector(href)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  return createPortal(
    <div className={`mmenu${open ? ' is-open' : ''}`} inert={!open}>
      <div className="mmenu__backdrop" onClick={onClose} aria-hidden="true" />
      <div
        ref={panelRef}
        id="mobile-menu"
        className="mmenu__panel"
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
      >
        <div className="mmenu__top">
          <BrandLockup />
          <button ref={closeRef} type="button" className="mmenu__close" onClick={onClose} aria-label="Close menu">
            <X aria-hidden="true" />
          </button>
        </div>

        <nav aria-label="Mobile">
          <ul className="mmenu__links">
            {navLinks.map((link, i) => (
              <li key={link.href} style={{ '--i': i }}>
                <a href={link.href} onClick={(e) => goTo(e, link.href)}>
                  {link.label}
                  <ArrowRight className="mmenu__arrow" aria-hidden="true" />
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mmenu__ctas">
          <a className="btn btn--red" href={site.phoneHref}>
            <Phone aria-hidden="true" />
            Call to Order
          </a>
          <a className="btn btn--yellow" href="#menu" onClick={(e) => goTo(e, '#menu')}>
            <BookOpen aria-hidden="true" />
            View Menu
          </a>
          <DeliveryLinks compact />
        </div>

        <div className="mmenu__info">
          <div className="mmenu__block">
            <h2 className="mmenu__label">
              <Clock aria-hidden="true" />
              Opening hours
            </h2>
            <dl className="mmenu__hours">
              <dt>{hours.daysLabel}</dt>
              {hours.slots.map((slot) => (
                <dd key={slot.open}>
                  {slot.openLabel} – {slot.closeLabel}
                </dd>
              ))}
            </dl>
            <OpenStatus className="mmenu__status" />
          </div>
          <div className="mmenu__block">
            <h2 className="mmenu__label">
              <Phone aria-hidden="true" />
              For orders call
            </h2>
            <a className="mmenu__phone" href={site.phoneHref}>
              {site.phoneDisplay}
            </a>
          </div>
          <div className="mmenu__block">
            <h2 className="mmenu__label">
              <MapPin aria-hidden="true" />
              Find us
            </h2>
            <p className="mmenu__addr">{site.addressOneLine}</p>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
