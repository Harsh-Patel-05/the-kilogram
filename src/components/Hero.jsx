import { useRef } from 'react';
import { Phone, ShoppingBag } from 'lucide-react';
import useInView from '../hooks/useInView.js';
import heroLarge from '../assets/food/hero-spread.webp';
import heroSmall from '../assets/food/hero-spread-600.webp';
import OpenStatus from './OpenStatus.jsx';
import { site } from '../data/site.js';
import './Hero.css';

export default function Hero() {
  const ref = useRef(null);
  const inView = useInView(ref);

  return (
    <section
      ref={ref}
      id="home"
      className={`hero${inView ? '' : ' is-offscreen'}`}
      aria-labelledby="hero-title"
    >
      <div className="hero__media" aria-hidden="true">
        <img
          className="hero__photo"
          src={heroLarge}
          srcSet={`${heroSmall} 600w, ${heroLarge} 939w`}
          sizes="100vw"
          width="939"
          height="990"
          alt=""
          fetchPriority="high"
          decoding="async"
        />
        <div className="hero__scrim" />
      </div>

      <div className="container hero__inner">
        <p className="hero__brand">The Kilogram</p>
        <OpenStatus className="hero__status" />

        <h1 id="hero-title" className="hero__title">
          Big flavours.
          <span>Served by the kilogram.</span>
        </h1>

        <p className="hero__lead">
          Pure veg takeaway from Jagatpur — bhaji, pulao, Chinese and Punjabi, packed by the half kilo or kilo.
        </p>

        <div className="hero__ctas">
          <a href="#menu" className="btn btn--red hero__cta-primary">
            <ShoppingBag aria-hidden="true" />
            Order online
          </a>
          <a href={site.phoneHref} className="btn btn--ghost hero__cta-secondary">
            <Phone aria-hidden="true" />
            Call {site.phoneDisplay}
          </a>
        </div>
      </div>
    </section>
  );
}
