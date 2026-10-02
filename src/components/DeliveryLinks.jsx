import { ArrowUpRight } from 'lucide-react';
import { delivery } from '../data/site.js';
import './DeliveryLinks.css';

export default function DeliveryLinks({ className = '', compact = false }) {
  return (
    <ul className={`dlinks${compact ? ' dlinks--compact' : ''} ${className}`.trim()}>
      {delivery.map((d) => (
        <li key={d.id}>
          <a className={`dlink dlink--${d.id}`} href={d.href} target="_blank" rel="noopener noreferrer">
            <span className="dlink__badge" aria-hidden="true">
              {d.name[0]}
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
