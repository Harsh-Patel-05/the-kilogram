import { useMemo } from 'react';
import { ShoppingBag, Plus } from 'lucide-react';
import { formatPrice, keepUnits } from '../data/menu.js';
import { useMenu } from '../context/MenuContext.jsx';
import { useCustomize } from '../context/CustomizeContext.jsx';
import comboImg from '../assets/food/combo-plate.webp';
import './FamilyCombos.css';

/**
 * Group combo SKUs for display.
 * Preserves the real dish `name` + optional portion label so cart sync stays valid.
 */
function groupCombos(items) {
  const tiers = new Map();
  items.forEach((item) => {
    if (item.options?.length) {
      item.options.forEach((o) => {
        const parts = String(item.name || '').split(' + ');
        if (parts.length < 2) {
          if (!tiers.has(item.name)) tiers.set(item.name, []);
          tiers.get(item.name).push({
            pau: o.label,
            price: o.price,
            name: item.name,
            optionLabel: o.label,
          });
          return;
        }
        const pau = parts.pop();
        const base = parts.join(' + ');
        // Prefer size label when the last segment isn't a pau-style choice
        const displayPau = /pau|pav|pcs/i.test(pau) ? pau : o.label;
        if (!tiers.has(base)) tiers.set(base, []);
        tiers.get(base).push({
          pau: displayPau,
          price: o.price,
          name: item.name,
          optionLabel: o.label,
        });
      });
      return;
    }

    const parts = String(item.name || '').split(' + ');
    if (parts.length < 2) {
      if (item.price == null) return;
      if (!tiers.has(item.name)) tiers.set(item.name, []);
      tiers.get(item.name).push({
        pau: 'Regular',
        price: item.price,
        name: item.name,
        optionLabel: null,
      });
      return;
    }
    const pau = parts.pop();
    const base = parts.join(' + ');
    if (!tiers.has(base)) tiers.set(base, []);
    tiers.get(base).push({
      pau,
      price: item.price,
      name: item.name,
      optionLabel: null,
    });
  });
  return [...tiers.entries()].map(([base, options]) => ({ base, options }));
}

function findExtraPrice(menuGroups, nameHint) {
  const extras = menuGroups
    .flatMap((g) => g.categories)
    .find((c) => /extra|add.?on/i.test(c.id) || /extra|add.?on/i.test(c.title));
  if (!extras) return null;
  const item = extras.items.find(
    (i) => i.name === nameHint || i.name.toLowerCase().includes(nameHint.toLowerCase()),
  );
  return item?.price ?? item?.options?.[0]?.price ?? null;
}

export default function FamilyCombos() {
  const { openCustomize } = useCustomize();
  const { familyCombos, menuGroups, loading } = useMenu();

  const tiers = useMemo(
    () => (familyCombos?.items?.length ? groupCombos(familyCombos.items) : []),
    [familyCombos],
  );

  const butterHalf = findExtraPrice(menuGroups, '500 gm Combo');
  const butterKilo = findExtraPrice(menuGroups, '1 kg Combo');

  // Avoid a tall empty/black gap while Firestore loads (or when no combos exist).
  if (loading || !tiers.length) return null;

  return (
    <section id="combos" className="section combos" aria-labelledby="combos-title">
      <div className="container combos__grid">
        <div className="combos__intro" data-reveal>
          <p className="eyebrow">Family combo offers</p>
          <h2 id="combos-title" className="section-title">
            One order. <em>Dinner sorted.</em>
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
                    <span key={`${tier.base}-${part}-${k}`}>
                      {k > 0 && <i aria-hidden="true">+</i>}
                      {part}
                    </span>
                  ))}
                </h3>
              </header>
              <ul className="combo__options">
                {tier.options.map((o) => (
                  <li key={`${o.name}|${o.optionLabel || o.pau}`}>
                    <span className="combo__pau">
                      <i aria-hidden="true">+</i> {o.pau}
                    </span>
                    <button
                      type="button"
                      className="combo__price mi__add"
                      aria-label={`Add ${o.name} for ${formatPrice(o.price)}`}
                      onClick={() =>
                        openCustomize({
                          name: o.name,
                          categoryId: familyCombos?.id || 'family-combos',
                          basePrice: o.optionLabel ? undefined : Number(o.price),
                          options: o.optionLabel
                            ? [{ label: o.optionLabel, price: Number(o.price) }]
                            : null,
                          preselectLabel: o.optionLabel,
                        })
                      }
                    >
                      {formatPrice(o.price)}
                      <Plus aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ul>
            </article>
          ))}

          <div className="combos__notes" data-reveal>
            {familyCombos?.note && <p>{keepUnits(familyCombos.note)}</p>}
            {(butterHalf != null || butterKilo != null) && (
              <p>
                Extra butter
                {butterHalf != null && <>: {formatPrice(butterHalf)} on 500&nbsp;gm combos</>}
                {butterHalf != null && butterKilo != null && ','}{' '}
                {butterKilo != null && <>{formatPrice(butterKilo)} on 1&nbsp;kg combos</>}.
              </p>
            )}
            <a className="btn btn--red combos__cta" href="#menu">
              <ShoppingBag aria-hidden="true" />
              Order a combo online
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
