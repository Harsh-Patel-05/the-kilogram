import { useEffect, useMemo, useRef, useState } from 'react';
import { Minus, Plus, X } from 'lucide-react';
import { useCustomize } from '../../context/CustomizeContext.jsx';
import { cartLineId, useCart } from '../../context/CartContext.jsx';
import { formatPrice, keepUnits } from '../../data/menu.js';
import { useMenu } from '../../context/MenuContext.jsx';
import { suggestedAddons } from '../../lib/addons.js';
import { lockBody, unlockBody } from '../../lib/bodyLock.js';
import useFocusTrap from '../../hooks/useFocusTrap.js';
import './AddToCartModal.css';

export default function AddToCartModal() {
  const { draft, closeCustomize } = useCustomize();
  const { addItem } = useCart();
  const { menuGroups } = useMenu();
  const panelRef = useRef(null);
  const submittingRef = useRef(false);
  useFocusTrap(panelRef, Boolean(draft));

  const options = draft?.options?.length
    ? draft.options
    : draft?.basePrice != null
      ? [{ label: null, price: draft.basePrice }]
      : [];

  const initialLabel =
    draft?.preselectLabel ??
    options.find((o) => o.label === draft?.preselectLabel)?.label ??
    options[0]?.label ??
    null;

  const [variantLabel, setVariantLabel] = useState(initialLabel);
  const [qty, setQty] = useState(1);
  const [notes, setNotes] = useState('');
  const [addonIds, setAddonIds] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!draft) return;
    const nextLabel =
      draft.preselectLabel ??
      draft.options?.[0]?.label ??
      null;
    setVariantLabel(nextLabel);
    setQty(1);
    setNotes('');
    setAddonIds([]);
    submittingRef.current = false;
    setSubmitting(false);
  }, [draft]);

  useEffect(() => {
    if (!draft) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') closeCustomize();
    };
    lockBody();
    window.addEventListener('keydown', onKey);
    return () => {
      unlockBody();
      window.removeEventListener('keydown', onKey);
    };
  }, [draft, closeCustomize]);

  const selected = useMemo(() => {
    if (!options.length) return null;
    if (variantLabel == null) return options[0];
    return options.find((o) => o.label === variantLabel) || options[0];
  }, [options, variantLabel]);

  const addons = useMemo(() => {
    if (!draft || !selected) return [];
    return suggestedAddons(draft.categoryId, selected.label || '', draft.name, menuGroups);
  }, [draft, selected, menuGroups]);

  // Drop addons that no longer apply when variant changes
  useEffect(() => {
    setAddonIds((prev) => prev.filter((id) => addons.some((a) => a.id === id)));
  }, [addons]);

  if (!draft || !selected) return null;

  const addonTotal = addons
    .filter((a) => addonIds.includes(a.id))
    .reduce((s, a) => s + a.price, 0);
  const unitPrice = Number(selected.price) + addonTotal;
  const lineTotal = unitPrice * qty;

  const toggleAddon = (id) => {
    setAddonIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const confirm = () => {
    // Guard double-clicks: same item would merge to qty 2 before modal unmounts.
    if (submittingRef.current) return;
    submittingRef.current = true;
    setSubmitting(true);

    const selectedAddons = addons.filter((a) => addonIds.includes(a.id));
    const addonKey = selectedAddons.map((a) => a.id).sort().join('+') || 'none';
    const noteKey = notes.trim() ? notes.trim().slice(0, 40) : '';
    addItem({
      id: cartLineId(draft.categoryId, draft.name, `${selected.label || 'default'}|${addonKey}|${noteKey}`),
      name: draft.name,
      optionLabel: selected.label,
      unitPrice,
      basePrice: Number(selected.price),
      addons: selectedAddons.map((a) => ({ id: a.id, name: a.name, price: a.price })),
      notes: notes.trim() || null,
      categoryId: draft.categoryId || null,
      qty,
    });
    closeCustomize();
  };

  return (
    <div className="kg-mod" role="dialog" aria-modal="true" aria-label={`Customize ${draft.name}`}>
      <button type="button" className="kg-mod__backdrop" aria-label="Close" onClick={closeCustomize} />
      <div className="kg-mod__panel" ref={panelRef} tabIndex={-1}>
        <header className="kg-mod__head">
          <div>
            <p className="eyebrow">Add to cart</p>
            <h2>{keepUnits(draft.name)}</h2>
            {draft.section && <p className="kg-mod__section">{draft.section}</p>}
          </div>
          <button type="button" className="kg-mod__close" aria-label="Close" onClick={closeCustomize}>
            <X aria-hidden="true" />
          </button>
        </header>

        <div className="kg-mod__body">
          {options.length > 1 && (
            <section className="kg-mod__block">
              <h3>Choose size</h3>
              <div className="kg-mod__chips" role="radiogroup" aria-label="Portion size">
                {options.map((o) => {
                  const active = (o.label || null) === (selected.label || null);
                  return (
                    <button
                      key={o.label || 'default'}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      className={`kg-mod__chip${active ? ' is-active' : ''}`}
                      onClick={() => setVariantLabel(o.label)}
                    >
                      <strong>{o.label}</strong>
                      <span>{formatPrice(o.price)}</span>
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {options.length === 1 && (
            <section className="kg-mod__block">
              <div className="kg-mod__price-row">
                <span>Price</span>
                <strong>{formatPrice(selected.price)}</strong>
              </div>
            </section>
          )}

          {addons.length > 0 && (
            <section className="kg-mod__block">
              <h3>Add-ons</h3>
              <ul className="kg-mod__addons">
                {addons.map((a) => {
                  const on = addonIds.includes(a.id);
                  return (
                    <li key={a.id}>
                      <button
                        type="button"
                        className={`kg-mod__addon${on ? ' is-active' : ''}`}
                        aria-pressed={on}
                        onClick={() => toggleAddon(a.id)}
                      >
                        <span className="kg-mod__check" aria-hidden="true">
                          {on ? '✓' : ''}
                        </span>
                        <span className="kg-mod__addon-name">{a.name}</span>
                        <span className="kg-mod__addon-price">+{formatPrice(a.price)}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          <section className="kg-mod__block">
            <h3>Quantity</h3>
            <div className="kg-mod__qty">
              <button
                type="button"
                aria-label="Decrease quantity"
                disabled={qty <= 1}
                onClick={() => setQty((q) => Math.max(1, q - 1))}
              >
                <Minus aria-hidden="true" />
              </button>
              <span>{qty}</span>
              <button
                type="button"
                aria-label="Increase quantity"
                onClick={() => setQty((q) => Math.min(20, q + 1))}
              >
                <Plus aria-hidden="true" />
              </button>
            </div>
          </section>

          <section className="kg-mod__block">
            <h3 id="kg-mod-notes-label">Special instructions</h3>
            <textarea
              id="kg-mod-notes"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Less spicy, no onion, packing notes…"
              maxLength={120}
              aria-labelledby="kg-mod-notes-label"
            />
          </section>
        </div>

        <footer className="kg-mod__foot">
          <div className="kg-mod__total">
            <span>Total</span>
            <strong>{formatPrice(lineTotal)}</strong>
          </div>
          <button
            type="button"
            className="btn btn--red kg-mod__cta"
            onClick={confirm}
            disabled={submitting}
          >
            Add to cart · {formatPrice(lineTotal)}
          </button>
        </footer>
      </div>
    </div>
  );
}
