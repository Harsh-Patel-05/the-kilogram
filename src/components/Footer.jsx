import { Clock, MapPin, Phone } from 'lucide-react';
import logo from '../assets/logo/logo.webp';
import { hours, navLinks, site } from '../data/site.js';
import './Footer.css';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer__rule" aria-hidden="true">
        <i />
        <i />
        <i />
      </div>
      <div className="container footer__grid">
        <div className="footer__brand">
          <img src={logo} alt="The Kilogram" width="414" height="330" loading="lazy" decoding="async" />
          <p className="footer__tagline">Big flavours. Served by the kilogram.</p>
          <p className="footer__facts">Cooked in groundnut oil only · We use Amul dairy products</p>
        </div>

        <nav className="footer__nav" aria-label="Footer">
          <h2 className="footer__heading">Explore</h2>
          <ul>
            {navLinks.map((l) => (
              <li key={l.href}>
                <a href={l.href}>{l.label}</a>
              </li>
            ))}
            <li>
              <a href="#combos">Family Combos</a>
            </li>
            <li>
              <a href="#why-us">Why Us</a>
            </li>
          </ul>
        </nav>

        <div className="footer__contact">
          <h2 className="footer__heading">Visit us</h2>
          <a className="footer__phone" href={site.phoneHref}>
            <Phone aria-hidden="true" />
            {site.phoneDisplay}
          </a>
          <p className="footer__address">
            <MapPin aria-hidden="true" />
            <span>{site.addressOneLine}</span>
          </p>
          <p className="footer__address">
            <Clock aria-hidden="true" />
            <span>
              {hours.daysLabel},{' '}
              <span className="nowrap">
                {hours.openLabel} – {hours.closeLabel}
              </span>
            </span>
          </p>
        </div>
      </div>

      <div className="container footer__bottom">
        <p>© {year} The Kilogram, Ahmedabad. All rights reserved.</p>
        <p>Prices as per our June 2026 takeaway menu.</p>
      </div>
    </footer>
  );
}
