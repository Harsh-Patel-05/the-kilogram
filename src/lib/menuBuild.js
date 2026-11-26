/**
 * Turns flat Firestore `menuItems` docs into the website's
 * groups → categories → items shape (with size variants as options).
 */

function normalize(s) {
  return String(s || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\w\s\u0900-\u097F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function slugify(s) {
  const out = String(s || 'general')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return out || 'general';
}

function isSoftDeleted(item) {
  return item?.isDeleted === true || item?.deleted === true || item?.status === 'deleted';
}

/** Standalone “extra sabji” SKUs — hide from public menu (same as POS). */
function isExtraSabjiItem(name) {
  const n = normalize(name);
  if (!n) return false;
  return (
    /^extra\s+sabj/i.test(n) ||
    /^extras?\s+sabj/i.test(n) ||
    /^extra\s+subji/i.test(n) ||
    /^add\s+on\s+sabj/i.test(n) ||
    /^sabji\s+extra\b/i.test(n)
  );
}

export function deriveBaseAndVariant(name) {
  const raw = String(name || '').trim();
  const m =
    raw.match(/\((\s*\d+(?:\.\d+)?\s*(?:kg|g|gm|gms)\s*)\)\s*$/i) ||
    raw.match(/(?:-|–|—)\s*(\d+(?:\.\d+)?\s*(?:kg|g|gm|gms))\s*$/i) ||
    raw.match(/\s(\d+(?:\.\d+)?\s*(?:kg|g|gm|gms))\s*$/i) ||
    raw.match(/\((Option\s*\d+)\)\s*$/i) ||
    raw.match(/\(([^)]{1,24})\)\s*$/i);
  let variant = '';
  let base = raw;
  if (m) {
    variant = String(m[1] || '')
      .trim()
      .replace(/\s+/g, ' ');
    base = raw.replace(m[0], '').trim().replace(/\s+/g, ' ');
  }
  return { base: base || raw, variant };
}

function weightGramsFromLabel(label) {
  const s = String(label || '').trim();
  if (!s || /^default$/i.test(s)) return null;
  if (/^1$/i.test(s)) return 500;
  const m = s.match(/^(\d+(?:\.\d+)?)\s*(kg|gms|gm|g|किलो|kg\.|ग्राम|gm\.)?$/i);
  if (!m) return null;
  const n = Number(m[1]);
  if (!Number.isFinite(n) || n <= 0) return null;
  const u = String(m[2] || 'g').toLowerCase();
  if (u === 'kg' || u === 'kg.' || u === 'किलो') return Math.round(n * 1000);
  return Math.round(n);
}

export function shortSizeLabel(label) {
  const raw = String(label || '').trim();
  if (!raw) return 'Regular';
  const g = weightGramsFromLabel(raw);
  if (g != null && g > 0) {
    if (g % 1000 === 0) return `${g / 1000} kg`;
    if (g >= 1000) return `${Math.round((g / 1000) * 100) / 100} kg`;
    return `${g} g`;
  }
  return raw;
}

/**
 * Prefer folding known admin categories into the website's original group layout.
 * Unknown categories become their own group.
 */
const KNOWN_GROUPS = [
  {
    id: 'bhaji-pulao',
    label: 'Bhaji & Pulao',
    heading: 'Bhaji, Pau & Pulao',
    match: (slug) =>
      ['bhaji', 'pulao', 'pau', 'pav', 'extras', 'extras-add-ons', 'extras-addons', 'add-ons', 'addons'].includes(
        slug,
      ),
  },
  {
    id: 'combos',
    label: 'Family Combos',
    heading: 'Family Combo Offers',
    match: (slug) => /combo/.test(slug),
  },
  {
    id: 'chinese',
    label: 'Chinese',
    heading: 'Chinese',
    match: (slug) =>
      ['soups', 'soup', 'chinese', 'chinese-paneer', 'paneer-specials', 'manchurian', 'chatpata-starters', 'starters'].includes(
        slug,
      ),
  },
  {
    id: 'rice-noodles',
    label: 'Rice & Noodles',
    heading: 'Chinese Rice & Noodles',
    match: (slug) => /^(rice|noodles|chowmein|fried-rice|hakka)/.test(slug) || slug === 'rice-noodles',
  },
  {
    id: 'chinese-kilo',
    label: 'Chinese (kg)',
    heading: 'Chinese by the Kilo',
    match: (slug) => /kilo|per-kg|by-kg|chinese-kg|chinese-kilo/.test(slug),
  },
  {
    id: 'punjabi',
    label: 'Punjabi',
    heading: 'Punjabi',
    match: (slug) => /punjabi|tadka|paneer|kaju/.test(slug),
  },
  {
    id: 'dal-rice',
    label: 'Dal & Rice',
    heading: 'Dal & Rice',
    match: (slug) => /^(dal|rice|biryani)/.test(slug) || slug === 'dal-rice',
  },
  {
    id: 'breads',
    label: 'Roti & Bread',
    heading: 'Roti & Bread',
    match: (slug) => /roti|bread|paratha|naan/.test(slug),
  },
  {
    id: 'beverages',
    label: 'Beverages',
    heading: 'Beverages',
    match: (slug) => /beverage|drink|soft-drink|cold-drink/.test(slug),
  },
];

function resolveGroupMeta(categoryName) {
  const slug = slugify(categoryName);
  const known = KNOWN_GROUPS.find((g) => g.match(slug));
  if (known) return known;
  return {
    id: slug,
    label: categoryName,
    heading: categoryName,
  };
}

function dietTag(diet) {
  if (!diet) return undefined;
  const d = String(diet).toLowerCase();
  if (d === 'jain') return 'Jain';
  if (d === 'nonveg' || d === 'non-veg') return 'Non-veg';
  if (d === 'egg') return 'Egg';
  return undefined;
}

/** Build website menuGroups from Firestore menuItems docs. */
export function buildMenuGroupsFromItems(rawItems) {
  const usable = (Array.isArray(rawItems) ? rawItems : []).filter(
    (item) =>
      item &&
      String(item.name || '').trim() &&
      !isSoftDeleted(item) &&
      item.available !== false &&
      !isExtraSabjiItem(item.name),
  );

  /** @type {Map<string, { title: string, id: string, dishes: Map<string, any> }>} */
  const categories = new Map();

  for (const item of usable) {
    const catTitle = String(item.category || 'General').trim() || 'General';
    const catId = slugify(catTitle);
    if (!categories.has(catId)) {
      categories.set(catId, { id: catId, title: catTitle, dishes: new Map() });
    }
    const cat = categories.get(catId);
    const { base, variant } = deriveBaseAndVariant(item.name);
    const sizeLabel = shortSizeLabel(variant) || (variant ? variant : 'Regular');
    const dishKey = normalize(base);
    const price = Number(item.price);
    const safePrice = Number.isFinite(price) ? price : 0;

    let dish = cat.dishes.get(dishKey);
    if (!dish) {
      dish = {
        name: base,
        tag: dietTag(item.diet),
        variants: [],
        favorite: Boolean(item.favorite),
        imageUrl: item.imageUrl || '',
      };
      cat.dishes.set(dishKey, dish);
    }

    const dup = dish.variants.some(
      (v) => normalize(v.label) === normalize(sizeLabel) && Number(v.price) === safePrice,
    );
    if (dup) continue;

    dish.variants.push({
      label: sizeLabel,
      price: safePrice,
      weightGrams: weightGramsFromLabel(variant || sizeLabel),
    });
    if (item.favorite) dish.favorite = true;
    if (!dish.imageUrl && item.imageUrl) dish.imageUrl = item.imageUrl;
    if (!dish.tag && dietTag(item.diet)) dish.tag = dietTag(item.diet);
  }

  /** @type {Map<string, { id: string, label: string, heading: string, categories: any[] }>} */
  const groups = new Map();

  for (const cat of categories.values()) {
    const items = [...cat.dishes.values()]
      .map((dish) => {
        dish.variants.sort((a, b) => {
          const wa = a.weightGrams ?? Number.POSITIVE_INFINITY;
          const wb = b.weightGrams ?? Number.POSITIVE_INFINITY;
          if (wa !== wb) return wa - wb;
          return a.price - b.price;
        });

        const onlyRegular =
          dish.variants.length === 1 && normalize(dish.variants[0].label) === 'regular';

        if (onlyRegular) {
          return {
            name: dish.name,
            price: dish.variants[0].price,
            tag: dish.tag,
          };
        }

        return {
          name: dish.name,
          options: dish.variants.map(({ label, price }) => ({ label, price })),
          tag: dish.tag,
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name));

    if (!items.length) continue;

    const meta = resolveGroupMeta(cat.title);
    if (!groups.has(meta.id)) {
      groups.set(meta.id, {
        id: meta.id,
        label: meta.label,
        heading: meta.heading,
        categories: [],
      });
    }
    groups.get(meta.id).categories.push({
      id: cat.id,
      title: cat.title,
      items,
    });
  }

  // Stable order: known groups first, then alpha
  const knownOrder = KNOWN_GROUPS.map((g) => g.id);
  return [...groups.values()]
    .map((g) => ({
      ...g,
      categories: g.categories.sort((a, b) => a.title.localeCompare(b.title)),
    }))
    .sort((a, b) => {
      const ai = knownOrder.indexOf(a.id);
      const bi = knownOrder.indexOf(b.id);
      if (ai === -1 && bi === -1) return a.label.localeCompare(b.label);
      if (ai === -1) return 1;
      if (bi === -1) return -1;
      return ai - bi;
    });
}

export function findFamilyCombosCategory(groups) {
  if (!Array.isArray(groups)) return null;
  for (const g of groups) {
    for (const c of g.categories || []) {
      if (/combo/i.test(c.id) || /combo/i.test(c.title)) return c;
    }
  }
  return null;
}
