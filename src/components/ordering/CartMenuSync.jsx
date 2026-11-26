import { useEffect, useRef } from 'react';
import { useCart } from '../../context/CartContext.jsx';
import { useMenu } from '../../context/MenuContext.jsx';
import { menuFingerprint, resolveCartLinePricing } from '../../data/menu.js';

/**
 * Drops unavailable cart lines and refreshes unit prices from the live menu.
 */
export default function CartMenuSync() {
  const { menuGroups, loading, error, itemCount } = useMenu();
  const { items, syncLines } = useCart();
  const lastKey = useRef('');

  useEffect(() => {
    if (loading || error || !itemCount) return;
    const key = menuFingerprint(menuGroups);
    if (!key || key === lastKey.current) return;

    const next = [];
    let changed = false;
    for (const line of items) {
      const pricing = resolveCartLinePricing(line, menuGroups);
      if (!pricing) {
        changed = true;
        continue;
      }
      if (pricing.unitPrice !== line.unitPrice || pricing.basePrice !== line.basePrice) {
        changed = true;
        next.push({ ...line, unitPrice: pricing.unitPrice, basePrice: pricing.basePrice });
      } else {
        next.push(line);
      }
    }

    // Only mark fingerprint applied after a successful sync pass.
    lastKey.current = key;
    if (changed || next.length !== items.length) syncLines(next);
  }, [loading, error, itemCount, menuGroups, items, syncLines]);

  return null;
}
