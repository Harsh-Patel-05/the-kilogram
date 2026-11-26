/**
 * Suggest relevant extras based on dish + selected portion label.
 * Uses real menu extras prices — no invented prices.
 */
export function suggestedAddons(categoryId, optionLabel = '', itemName = '', groups = []) {
  const label = String(optionLabel || itemName || '').toLowerCase();
  const list = [];

  const findPrice = (categoryHint, itemNameHint) => {
    const categories = (groups || []).flatMap((g) => g.categories || []);
    const category =
      categories.find((c) => c.id === categoryHint) ||
      categories.find((c) => /extra|add.?on/i.test(c.id) || /extra|add.?on/i.test(c.title));
    if (!category) return undefined;
    const item = category.items.find(
      (i) => i.name === itemNameHint || i.name.toLowerCase() === itemNameHint.toLowerCase(),
    );
    if (item?.price != null) return item.price;
    if (item?.options?.[0]?.price != null) return item.options[0].price;
    return undefined;
  };

  const isCombo = categoryId === 'family-combos' || /combo/i.test(categoryId) || /combo/i.test(itemName);
  const isBhajiPulao =
    ['bhaji', 'pulao'].includes(categoryId) || /bhaji|pulao/i.test(itemName);

  if (isCombo) {
    if (label.includes('1 kg') || itemName.toLowerCase().includes('1 kg')) {
      const p = findPrice('extras', '1 kg Combo');
      if (p != null) list.push({ id: 'butter-1kg-combo', name: 'Extra butter', price: p });
    } else if (label.includes('500') || itemName.toLowerCase().includes('500 gm')) {
      const p = findPrice('extras', '500 gm Combo');
      if (p != null) list.push({ id: 'butter-500-combo', name: 'Extra butter', price: p });
    }
  } else if (isBhajiPulao) {
    if (label.includes('1 kg')) {
      const p = findPrice('extras', '1 kg Bhaji / Pulao');
      if (p != null) list.push({ id: 'butter-1kg', name: 'Extra butter', price: p });
    } else if (label.includes('500')) {
      const p = findPrice('extras', '500 gm Bhaji / Pulao');
      if (p != null) list.push({ id: 'butter-500', name: 'Extra butter', price: p });
    }
  }

  const chutney = findPrice('extras', 'Lasan Chutney (250 gm)');
  if (chutney != null && (isBhajiPulao || isCombo)) {
    list.push({ id: 'lasan-chutney', name: 'Lasan Chutney (250 gm)', price: chutney });
  }

  return list;
}
