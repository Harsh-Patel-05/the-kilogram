import { Fragment } from 'react';
import { Clock, MapPin, Navigation, Phone } from 'lucide-react';
import DeliveryLinks from './DeliveryLinks.jsx';
import OpenStatus from './OpenStatus.jsx';
import { hours, site } from '../data/site.js';
import './Contact.css';

export default function Contact() {
  return (
    <section id="contact" className="section contact" aria-labelledby="contact-title">
      <div className="container">
        <div className="contact__card" data-reveal>
          <div className="contact__call">
            <p className="eyebrow">Order now</p>
            <h2 id="contact-title" className="section-title">
              Hungry? <em>Give us a call.</em>
            </h2>
            <p className="contact__lead">
              Tell us what you’d like and how much of it. We’ll pack it for you to pick up, or order on
              Swiggy, Zomato or Toing and have it delivered.
            </p>

            <div className="contact__phone">
              <span>For order call</span>
              <a href={site.phoneHref}>
                <small>{site.phoneCountryCode}</small> {site.phoneLocal}
              </a>
            </div>

            <div className="contact__ctas">
              <a className="btn btn--red" href={site.phoneHref}>
                <Phone aria-hidden="true" />
                Call Now
              </a>
              <a className="btn btn--blue" href={site.directionsHref} target="_blank" rel="noopener noreferrer">
                <Navigation aria-hidden="true" />
                Get Directions
                <span className="visually-hidden"> (opens Google Maps)</span>
              </a>
            </div>

            <div id="order-online" className="contact__delivery">
              <h3 className="contact__label">Or get it delivered</h3>
              <DeliveryLinks />
            </div>
          </div>

          <div className="contact__visit">
            <div className="contact__map">
              <iframe
                title="Map showing The Kilogram in Jagatpur, Ahmedabad"
                src={site.mapEmbedSrc}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>

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
                    <dd>
                      {hours.openLabel} – {hours.closeLabel}
                    </dd>
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
