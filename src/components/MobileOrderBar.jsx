import { Bike, BookOpen, Navigation, Phone } from 'lucide-react';
import { site } from '../data/site.js';
import './MobileOrderBar.css';

export default function MobileOrderBar() {
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
      <a className="orderbar__btn" href="#order-online">
        <Bike aria-hidden="true" />
        <span>Delivery</span>
      </a>
      <a className="orderbar__btn" href={site.directionsHref} target="_blank" rel="noopener noreferrer">
        <Navigation aria-hidden="true" />
        <span>
          Directions<span className="visually-hidden"> (opens Google Maps)</span>
        </span>
      </a>
    </nav>
  );
}
