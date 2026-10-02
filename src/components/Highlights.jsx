import { CookingPot, Droplet, Milk, Weight } from 'lucide-react';
import './Highlights.css';

const highlights = [
  {
    icon: <Droplet aria-hidden="true" />,
    title: 'Cooked in groundnut oil only',
    text: 'For everything that comes out of our kitchen.',
    accent: 'yellow',
  },
  {
    icon: <Milk aria-hidden="true" />,
    title: 'We use Amul dairy products',
    text: 'A name every Gujarati kitchen already trusts.',
    accent: 'yellow',
  },
  {
    icon: <CookingPot aria-hidden="true" />,
    title: 'Freshly prepared',
    text: 'Made in our kitchen and packed for you to take home.',
    accent: 'blue',
  },
  {
    icon: <Weight aria-hidden="true" />,
    title: 'Family portions',
    text: 'Order by 300 gm, 500 gm or the full kilo.',
    accent: 'blue',
  },
];

export default function Highlights() {
  return (
    <section className="highlights" aria-label="Kitchen highlights">
      <div className="container">
        <ul className="highlights__list">
          {highlights.map((h, i) => (
            <li
              key={h.title}
              className={`highlights__item highlights__item--${h.accent}`}
              data-reveal
              style={{ '--reveal-delay': i }}
            >
              <span className="highlights__icon">{h.icon}</span>
              <span>
                <strong>{h.title}</strong>
                <span className="highlights__text">{h.text}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
