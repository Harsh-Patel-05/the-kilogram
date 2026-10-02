import { Phone } from 'lucide-react';
import { familyCombos, findItemPrice, formatPrice, keepUnits } from '../data/menu.js';
import { site } from '../data/site.js';
import comboImg from '../assets/food/combo-plate.webp';
import './FamilyCombos.css';

/** "500 gm Bhaji + 500 gm Pulao + 6 Reg Pau" -> base "500 gm Bhaji + 500 gm Pulao", pau "6 Reg Pau" */
function groupCombos(items) {
  const tiers = new Map();
  items.forEach((item) => {
    const parts = item.name.split(' + ');
    const pau = parts.pop();
    const base = parts.join(' + ');
    if (!tiers.has(base)) tiers.set(base, []);
    tiers.get(base).push({ pau, price: item.price, name: item.name });
  });
  return [...tiers.entries()].map(([base, options]) => ({ base, options }));
}

const tiers = groupCombos(familyCombos.items);
const butterHalf = findItemPrice('extras', '500 gm Combo');
const butterKilo = findItemPrice('extras', '1 kg Combo');

export default function FamilyCombos() {
  return (
    <section id="combos" className="section combos" aria-labelledby="combos-title">
      <div className="container combos__grid">
        <div className="combos__intro" data-reveal>
          <p className="eyebrow">
            Family combo offers
          </p>
          <h2 id="combos-title" className="section-title">
            One call. <em>Dinner sorted.</em>
          </h2>
          <p className="section-sub">
            Bhaji, pulao and pau packed together, so you don’t have to work out quantities for everyone.
          </p>
          <div className="combos__media frame">
            <img
              src={comboImg}
              alt="Bhaji with butter, two pau and vegetable pulao on a copper tray"
              width="540"
              height="510"
              loading="lazy"
              decoding="async"
            />
          </div>
        </div>

        <div className="combos__list">
          {tiers.map((tier, i) => (
            <article key={tier.base} className="combo" data-reveal style={{ '--reveal-delay': i }}>
              <header className="combo__head">
                <h3 className="combo__base">
                  {tier.base.split(' + ').map((part, k) => (
                    <span key={part}>
                      {k > 0 && <i aria-hidden="true">+</i>}
                      {part}
                    </span>
                  ))}
                </h3>
              </header>
              <ul className="combo__options">
                {tier.options.map((o) => (
                  <li key={o.name}>
                    <span className="combo__pau">
                      <i aria-hidden="true">+</i> {o.pau}
                    </span>
                    <span className="combo__price">{formatPrice(o.price)}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}

          <div className="combos__notes" data-reveal>
            <p>{keepUnits(familyCombos.note)}</p>
            <p>
              Extra butter: {formatPrice(butterHalf)} on 500&nbsp;gm combos, {formatPrice(butterKilo)} on 1&nbsp;kg
              combos.
            </p>
            <a className="btn btn--red combos__cta" href={site.phoneHref}>
              <Phone aria-hidden="true" />
              Call to order a combo
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
