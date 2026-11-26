import { Fragment, useEffect, useRef, useState } from 'react';
import { Clock, MapPin, Navigation, Phone } from 'lucide-react';
import DeliveryLinks from './DeliveryLinks.jsx';
import OpenStatus from './OpenStatus.jsx';
import useInView from '../hooks/useInView.js';
import { hours, site } from '../data/site.js';
import './Contact.css';

const SCROLL_IDLE_MS = 250;

/** The Google Maps embed runs heavy scripts, so it is only attached near the viewport once scrolling pauses. */
function MapEmbed() {
  const ref = useRef(null);
  const near = useInView(ref, '400px 0px', false);
  const [attach, setAttach] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!near || attach) return undefined;
    let timer = setTimeout(() => setAttach(true), SCROLL_IDLE_MS);
    const onScroll = () => {
      clearTimeout(timer);
      timer = setTimeout(() => setAttach(true), SCROLL_IDLE_MS);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', onScroll);
    };
  }, [near, attach]);

  return (
    <div ref={ref} className="contact__map">
      {attach && (
        <iframe
          className={loaded ? 'is-loaded' : undefined}
          title="Map showing The Kilogram in Jagatpur, Ahmedabad"
          src={site.mapEmbedSrc}
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
          onLoad={() => setLoaded(true)}
        />
      )}
    </div>
  );
}

export default function Contact() {
  return (
    <section className="section contact" aria-labelledby="contact-title">
      <div className="container">
        {/* id on the card so /#contact lands on content, not empty section padding */}
        <div id="contact" className="contact__card" data-reveal>
          <div className="contact__call">
            <p className="eyebrow">Order now</p>
            <h2 id="contact-title" className="section-title">
              Hungry? <em>Order online.</em>
            </h2>
            <p className="contact__lead">
              Order direct from this website — delivery within 2 km of Jagatpur. Orders ₹500+ get free
              delivery within 1.5 km. Drop your pin on the map and track live. Outside our area? Call us
              — we can help arrange Rapido or Porter. You can also pick up or use Swiggy, Zomato or Toing.
            </p>

            <a className="contact__phone" href={site.phoneHref}>
              <span className="contact__phone-icon" aria-hidden="true">
                <Phone />
              </span>
              <span className="contact__phone-text">
                <span className="contact__phone-label">For orders call</span>
                <span className="contact__phone-number">{site.phoneDisplay}</span>
              </span>
            </a>

            <div className="contact__ctas">
              <a className="btn btn--red" href="#menu">
                Order Online
              </a>
              <a className="btn btn--blue" href={site.phoneHref}>
                <Phone aria-hidden="true" />
                Call {site.phoneDisplay}
              </a>
              <a className="btn btn--ghost" href={site.directionsHref} target="_blank" rel="noopener noreferrer">
                <Navigation aria-hidden="true" />
                Get Directions
                <span className="visually-hidden"> (opens Google Maps)</span>
              </a>
            </div>

            <div id="order-online" className="contact__delivery">
              <h3 className="contact__label">Order on this website</h3>
              <p className="contact__lead" style={{ marginBottom: 12 }}>
                Add items from the live menu, choose delivery or pickup at checkout. Delivery fees: ₹20
                nearby (≤500 m), ₹40 up to 1 km, ₹50 up to 2 km. Free delivery on ₹500+ within 1.5 km.
                Website delivery Mon–Fri during kitchen hours.
              </p>
              <a className="btn btn--yellow" href="#menu">
                Start ordering
              </a>
              <h3 className="contact__label" style={{ marginTop: 20 }}>
                Or use partner apps
              </h3>
              <DeliveryLinks />
            </div>
          </div>

          <div className="contact__visit">
            <MapEmbed />

            <div className="contact__info">
              <div className="contact__row">
                <span className="contact__icon" aria-hidden="true">
                  <MapPin />
                </span>
                <div>
                  <h3 className="contact__label">Find us</h3>
                  <address className="contact__address">
                    {site.addressLines.map((line, i) => (
                      <Fragment key={line}>
                        {i > 0 && ' '}
                        <span className="contact__addr-part">{line}</span>
                      </Fragment>
                    ))}
                  </address>
                  <a className="contact__maplink" href={site.mapsHref} target="_blank" rel="noopener noreferrer">
                    Open in Google Maps
                    <span className="visually-hidden"> (opens in a new tab)</span>
                  </a>
                </div>
              </div>

              <div className="contact__row">
                <span className="contact__icon contact__icon--yellow" aria-hidden="true">
                  <Clock />
                </span>
                <div>
                  <h3 className="contact__label">Opening hours</h3>
                  <dl className="contact__hours">
                    <dt>{hours.daysLabel}</dt>
                    {hours.slots.map((slot) => (
                      <dd key={slot.open}>
                        {slot.openLabel} – {slot.closeLabel}
                      </dd>
                    ))}
                  </dl>
                  <OpenStatus className="contact__status" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
