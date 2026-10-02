import { ArrowUpRight } from 'lucide-react';
import swiggyLogo from '../assets/delivery/swiggy.webp';
import zomatoLogo from '../assets/delivery/zomato.webp';
import toingLogo from '../assets/delivery/toing.webp';
import { delivery } from '../data/site.js';
import './DeliveryLinks.css';

const logos = { swiggy: swiggyLogo, zomato: zomatoLogo, toing: toingLogo };

export default function DeliveryLinks({ className = '', compact = false }) {
  return (
    <ul className={`dlinks${compact ? ' dlinks--compact' : ''} ${className}`.trim()}>
      {delivery.map((d) => (
        <li key={d.id}>
          <a className={`dlink dlink--${d.id}`} href={d.href} target="_blank" rel="noopener noreferrer">
            <span className="dlink__badge" aria-hidden="true">
              <img src={logos[d.id]} alt="" width="128" height="128" decoding="async" />
            </span>
            <span className="dlink__text">
              <small>Order on</small>
              {d.name}
            </span>
            <ArrowUpRight className="dlink__arrow" aria-hidden="true" />
            <span className="visually-hidden"> (opens in a new tab)</span>
          </a>
        </li>
      ))}
    </ul>
  );
}
