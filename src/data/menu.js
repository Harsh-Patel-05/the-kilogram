/**
 * Menu display helpers only.
 * Dish catalog comes from Firestore `menuItems` via MenuContext — never hardcode prices here.
 */

function safeNumber(n) {
  const v = Number(n);
  return Number.isFinite(v) ? v : null;
}

/** Lowest price (and its portion label, if any) across the given categories / groups. */
export function startingOffer(categoryIds, groups = []) {
  const ids = new Set(categoryIds || []);
  const offers = (groups || []).flatMap((g) =>
    (g.categories || [])
      .filter((c) => ids.has(c.id) || ids.has(g.id))
      .flatMap((c) =>
        c.sharedOptions
          ? c.sharedOptions
          : (c.items || []).flatMap((i) => i.options ?? [{ label: null, price: i.price }]),
      ),
  );
  const valid = offers.filter((o) => safeNumber(o.price) != null);
  if (!valid.length) return { price: null, label: null };
  return valid.reduce((best, o) => (o.price < best.price ? o : best));
}

/** Lowest priced offer anywhere in the live menu. */
export function menuStartingOffer(groups = []) {
  const offers = (groups || []).flatMap((g) =>
    (g.categories || []).flatMap((c) =>
      c.sharedOptions
        ? c.sharedOptions
        : (c.items || []).flatMap((i) => i.options ?? [{ label: null, price: i.price }]),
    ),
  );
  const valid = offers.filter((o) => safeNumber(o.price) != null);
  if (!valid.length) return { price: null, label: null };
  return valid.reduce((best, o) => (o.price < best.price ? o : best));
}

export function findItemPrice(categoryId, itemName, groups = []) {
  const categories = (groups || []).flatMap((g) => g.categories || []);
  const category =
    categories.find((c) => c.id === categoryId) ||
    categories.find((c) => /extra|add.?on/i.test(c.id) || /extra|add.?on/i.test(c.title));
  if (!category) return undefined;
  const exact = category.items.find((i) => i.name === itemName);
  if (exact?.price != null) return exact.price;
  if (exact?.options?.[0]?.price != null) return exact.options[0].price;
  const fuzzy = category.items.find((i) => i.name.toLowerCase() === String(itemName).toLowerCase());
  return fuzzy?.price ?? fuzzy?.options?.[0]?.price;
}

function findMenuDish(cartItem, groups = []) {
  const name = String(cartItem?.name || '').toLowerCase();
  if (!name) return null;
  for (const g of groups || []) {
    for (const c of g.categories || []) {
      if (cartItem.categoryId && c.id !== cartItem.categoryId && g.id !== cartItem.categoryId) {
        // allow cross-category name match if category slug drifted
      }
      for (const item of c.items || []) {
        if (item.name.toLowerCase() === name) return { category: c, item };
      }
    }
  }
  return null;
}

/** True if a cart line still exists on the live menu. */
export function cartItemOnMenu(cartItem, groups = []) {
  const found = findMenuDish(cartItem, groups);
  if (!found) return false;
  const { item } = found;
  if (!cartItem.optionLabel || !item.options?.length) return true;
  return item.options.some((o) => o.label === cartItem.optionLabel);
}

/**
 * Live unit price for a cart line (base + addons), or null if the dish is gone.
 * Addon prices are kept from the cart line (extras may rename); base is live.
 */
export function resolveCartLinePricing(cartItem, groups = []) {
  const found = findMenuDish(cartItem, groups);
  if (!found) return null;
  const { item } = found;
  let base = null;
  if (cartItem.optionLabel && item.options?.length) {
    const opt = item.options.find((o) => o.label === cartItem.optionLabel);
    if (!opt) return null;
    base = safeNumber(opt.price);
  } else if (item.options?.length === 1) {
    base = safeNumber(item.options[0].price);
  } else if (item.price != null) {
    base = safeNumber(item.price);
  } else if (item.options?.[0]) {
    base = safeNumber(item.options[0].price);
  }
  if (base == null) return null;
  const addonTotal = (cartItem.addons || []).reduce((s, a) => s + (safeNumber(a.price) || 0), 0);
  return { basePrice: base, unitPrice: base + addonTotal };
}

/** Stable fingerprint of live menu content (ids, names, options, prices). */
export function menuFingerprint(groups = []) {
  const parts = [];
  for (const g of groups || []) {
    parts.push(g.id);
    for (const c of g.categories || []) {
      parts.push(c.id);
      for (const item of c.items || []) {
        parts.push(item.name);
        if (item.price != null) parts.push(String(item.price));
        for (const o of item.options || []) parts.push(`${o.label}:${o.price}`);
      }
    }
  }
  return parts.join('||');
}

export const formatPrice = (n) => {
  const v = safeNumber(n);
  if (v == null) return '₹—';
  return `₹${Math.round(v)}`;
};

/** Keeps a quantity and its unit on the same line: "1 kg" -> "1\u00A0kg". */
export const keepUnits = (text) =>
  String(text || '').replace(/(\d) (gm|kg|pcs|g)\b/gi, '$1\u00A0$2');
