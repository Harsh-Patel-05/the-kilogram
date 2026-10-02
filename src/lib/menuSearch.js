const ALIASES = {
  pav: 'pau',
  paav: 'pau',
  panner: 'paneer',
  paner: 'paneer',
  pneer: 'paneer',
  pulav: 'pulao',
  pulaw: 'pulao',
  pulau: 'pulao',
  bhajji: 'bhaji',
  bhaaji: 'bhaji',
  biriyani: 'biryani',
  briyani: 'biryani',
  biriani: 'biryani',
  manchuriyan: 'manchurian',
  manchuria: 'manchurian',
  chilly: 'chilli',
  chili: 'chilli',
  thumbs: 'thums',
  jira: 'jeera',
  cashew: 'kaju',
  chowmin: 'chowmein',
  daal: 'dal',
  dhal: 'dal',
  khichadi: 'khichdi',
  soups: 'soup',
  noodle: 'noodles',
  parantha: 'paratha',
  parotha: 'paratha',
  szechwan: 'schezwan',
  shezwan: 'schezwan',
};

/** Extra words a category should answer to, keyed by menu group id. */
const GROUP_KEYWORDS = {
  combos: 'combo family offer',
  chinese: 'chinese',
  'rice-noodles': 'chinese',
  'chinese-kilo': 'chinese kilo kg',
  punjabi: 'punjabi sabzi curry',
  breads: 'roti bread',
  beverages: 'drinks cold drink soft drink water',
};

export function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .map((t) => ALIASES[t] ?? t);
}

/** Returns menu groups trimmed to items matching every word in the query, plus a match count. */
export function filterMenu(groups, query) {
  const tokens = tokenize(query);
  if (!tokens.length) return { groups, count: null };

  let count = 0;
  const result = groups
    .map((group) => {
      const categories = group.categories
        .map((category) => {
          const context = tokenize(`${category.title} ${GROUP_KEYWORDS[group.id] ?? ''}`).join(' ');
          const items = category.items.filter((item) => {
            const hay = `${context} ${tokenize(`${item.name} ${item.tag ?? ''} ${item.section ?? ''}`).join(' ')}`;
            return tokens.every((t) => hay.includes(t));
          });
          count += items.length;
          return items.length ? { ...category, items } : null;
        })
        .filter(Boolean);
      return categories.length ? { ...group, categories } : null;
    })
    .filter(Boolean);

  return { groups: result, count };
}
