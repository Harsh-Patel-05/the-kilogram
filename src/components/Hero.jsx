import { useRef } from 'react';
import { ArrowRight, Leaf, MapPin, ShoppingBag, Weight } from 'lucide-react';
import useInView from '../hooks/useInView.js';
import logo from '../assets/logo/logo.webp';
import heroLarge from '../assets/food/hero-spread.webp';
import heroSmall from '../assets/food/hero-spread-600.webp';
import DeliveryLinks from './DeliveryLinks.jsx';
import OpenStatus from './OpenStatus.jsx';
import { site } from '../data/site.js';
import { useMenu } from '../context/MenuContext.jsx';
import { menuStartingOffer, formatPrice } from '../data/menu.js';
import './Hero.css';

const trust = [
  { icon: <Leaf aria-hidden="true" />, text: 'All-vegetarian menu' },
  { icon: <Weight aria-hidden="true" />, text: 'Family portions by weight' },
  { icon: <span className="hero__trust-dot" aria-hidden="true" />, text: 'Jain & Swaminarayan options' },
];

export default function Hero() {
  const ref = useRef(null);
  const inView = useInView(ref);
  const { menuGroups, loading } = useMenu();
  const offer = menuStartingOffer(menuGroups);

  return (
    <section ref={ref} id="home" className={`hero${inView ? '' : ' is-offscreen'}`} aria-labelledby="hero-title">
      <svg className="hero__lines" viewBox="0 0 800 520" fill="none" aria-hidden="true">
        <path d="M80 250 L720 150" />
        <path d="M400 200 L470 470 H330 Z" />
        <path d="M250 480 H550" />
        <path d="M20 250 H180 L164 286 H36 Z" />
        <path d="M620 150 H780 L764 186 H636 Z" />
      </svg>

      <div className="container hero__grid">
        <div className="hero__copy">
          <OpenStatus className="hero__status" />

          <p className="hero__meta">
            <span className="hero__meta-item">
              <span className="hero__veg" aria-hidden="true" />
              Pure veg takeaway
            </span>
            <span className="hero__meta-sep" aria-hidden="true" />
            <span className="hero__meta-item">
              <MapPin aria-hidden="true" />
              Jagatpur, Ahmedabad
            </span>
          </p>

          <h1 id="hero-title" className="hero__title">
            Big flavours.
            <span>Served by the kilogram.</span>
          </h1>

          <p className="hero__lead">
            From buttery bhaji and flavour-packed pulao to Indo-Chinese favourites and comforting Punjabi
            meals — good food is always better when there’s enough for everyone.
          </p>

          <div className="hero__ctas">
            <a href="#menu" className="btn btn--red">
              <ShoppingBag aria-hidden="true" />
              Order Online
            </a>
            <a href={site.phoneHref} className="btn btn--ghost">
              Call {site.phoneDisplay}
              <ArrowRight aria-hidden="true" />
            </a>
          </div>

          <div className="hero__delivery">
            <p className="hero__delivery-label">Or get it delivered</p>
            <DeliveryLinks compact />
          </div>

          <ul className="hero__trust">
            {trust.map((t) => (
              <li key={t.text}>
                {t.icon}
                {t.text}
              </li>
            ))}
          </ul>
        </div>

        <div className="hero__visual">
          <div className="hero__plate frame">
            <img
              className="hero__food"
              src={heroLarge}
              srcSet={`${heroSmall} 600w, ${heroLarge} 939w`}
              sizes="(min-width: 1024px) 540px, (min-width: 640px) 560px, 100vw"
              width="939"
              height="990"
              alt="Bhaji with buttered pau, vegetable pulao, noodles and paneer curry laid out on a dark table"
              fetchPriority="high"
              decoding="async"
            />
            <img className="hero__logo" src={logo} alt="The Kilogram logo" width="414" height="330" />
            {!loading && offer.price != null && (
              <p className="hero__tag">
                <span>From</span>
                <strong>{formatPrice(offer.price)}</strong>
                <span>{offer.label ? `per ${offer.label}` : 'on the menu'}</span>
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
