import { Leaf, MapPin, Scale } from 'lucide-react';
import DeliveryLinks from './DeliveryLinks.jsx';
import './Highlights.css';

const points = [
  { icon: <Leaf aria-hidden="true" />, label: '100% vegetarian' },
  { icon: <Scale aria-hidden="true" />, label: '500 gm & 1 kg' },
  { icon: <MapPin aria-hidden="true" />, label: 'Jagatpur, Ahmedabad' },
];

export default function Highlights() {
  return (
    <section className="section section--band order-strip" aria-labelledby="order-strip-title">
      <div className="container">
        <div className="order-strip__head" data-reveal>
          <p className="eyebrow">Order</p>
          <h2 id="order-strip-title" className="section-title">
            Delivery apps <em>or call us</em>
          </h2>
          <p className="section-sub">Prefer Swiggy, Zomato or Toing? Same kitchen — pick what’s easiest.</p>
        </div>

        <div className="order-strip__apps" data-reveal>
          <DeliveryLinks />
        </div>

        <ul className="order-strip__points" data-reveal>
          {points.map((p) => (
            <li key={p.label}>
              {p.icon}
              <span>{p.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
