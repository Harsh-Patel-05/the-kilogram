/**
 * The Kilogram takeaway menu (June 2026).
 *
 * Price shapes supported by the UI:
 *  - options: [{ label, price }]            -> per-item portions (500 gm / 1 kg, 6 / 12 pcs, ...)
 *  - price: number                           -> single price
 *  - category.sharedOptions + items [{name}] -> every dish in the category costs the same per portion
 *
 * `section` on an item renders a small sub-heading above it (e.g. "Add butter").
 */

const halfKilo = (half, kilo) => [
  { label: '500 gm', price: half },
  { label: '1 kg', price: kilo },
];

const threeSizes = (s, m, l) => [
  { label: '300 gm', price: s },
  { label: '500 gm', price: m },
  { label: '1 kg', price: l },
];

const pieces = (six, twelve) => [
  { label: '6 pcs', price: six },
  { label: '12 pcs', price: twelve },
];

export const menuGroups = [
  {
    id: 'bhaji-pulao',
    label: 'Bhaji & Pulao',
    heading: 'Bhaji, Pau & Pulao',
    categories: [
      {
        id: 'bhaji',
        title: 'Bhaji',
        items: [
          { name: 'Regular Bhaji', options: halfKilo(120, 230) },
          { name: 'Swaminarayan Bhaji', options: halfKilo(120, 230) },
          { name: 'Jain Bhaji', options: halfKilo(130, 250) },
          { name: 'Paneer Bhaji', options: halfKilo(150, 270) },
          { name: 'Special Bhaji', options: halfKilo(160, 300) },
        ],
      },
      {
        id: 'pulao',
        title: 'Pulao',
        items: [
          { name: 'Regular Pulao', options: halfKilo(120, 230) },
          { name: 'Swaminarayan Pulao', options: halfKilo(120, 230) },
          { name: 'Jain Pulao', options: halfKilo(120, 230) },
          { name: 'Dry Fruit Pulao', options: halfKilo(140, 260) },
          { name: 'Kashmiri Pulao', options: halfKilo(140, 260) },
          { name: 'Special Pulao', options: halfKilo(160, 300) },
        ],
      },
      {
        id: 'pau',
        title: 'Pau',
        items: [
          { name: 'Regular Pau', options: pieces(25, 45) },
          { name: 'Oil Pau', options: pieces(40, 70) },
          { name: 'Butter Pau', options: pieces(50, 90) },
        ],
      },
      {
        id: 'extras',
        title: 'Extras & Add-ons',
        items: [
          { section: 'Add butter', name: '500 gm Bhaji / Pulao', price: 20 },
          { section: 'Add butter', name: '1 kg Bhaji / Pulao', price: 40 },
          { section: 'Add butter', name: '500 gm Combo', price: 40 },
          { section: 'Add butter', name: '1 kg Combo', price: 60 },
          { section: 'Chutney', name: 'Lasan Chutney (250 gm)', price: 100 },
        ],
      },
    ],
  },
  {
    id: 'combos',
    label: 'Family Combos',
    heading: 'Family Combo Offers',
    categories: [
      {
        id: 'family-combos',
        title: 'Family Combo Offers',
        note: 'In 500 gm & 1 kg combos, Pulao can be replaced with Manchurian Dry or Manchurian Fried Rice.',
        items: [
          { name: '250 gm Bhaji + 2 Oil Pau', price: 90 },
          { name: '250 gm Bhaji + 2 Butter Pau', price: 110 },
          { name: '500 gm Bhaji + 500 gm Pulao + 6 Reg Pau', price: 240 },
          { name: '500 gm Bhaji + 500 gm Pulao + 6 Oil Pau', price: 250 },
          { name: '1 kg Bhaji + 1 kg Pulao + 12 Reg Pau', price: 460 },
          { name: '1 kg Bhaji + 1 kg Pulao + 12 Oil Pau', price: 480 },
        ],
      },
    ],
  },
  {
    id: 'chinese',
    label: 'Chinese',
    heading: 'Chinese',
    categories: [
      {
        id: 'soups',
        title: 'Soups',
        items: [
          { name: 'Hot & Sour Soup', price: 80 },
          { name: 'Man Chow Soup', price: 80 },
          { name: 'Tomato Soup', price: 80 },
          { name: 'Sweet Corn Soup', price: 100 },
        ],
      },
      {
        id: 'chinese-paneer',
        title: 'Paneer Specials',
        items: [
          { name: 'Paneer Chilly Dry', price: 170 },
          { name: 'Paneer Chilly Gravy', price: 170 },
          { name: 'Paneer Crispy', price: 170 },
        ],
      },
      {
        id: 'manchurian',
        title: 'Manchurian',
        items: [
          { name: 'Dry Manchurian', price: 120 },
          { name: 'Gravy Manchurian', price: 120 },
          { name: 'Paneer Manchurian Dry', price: 150 },
          { name: 'Paneer Manchurian Gravy', price: 150 },
        ],
      },
      {
        id: 'chatpata-starters',
        title: 'Chatpata Starters',
        items: [
          { name: 'Chilli Potato', price: 150 },
          { name: 'Honey Chilli Potato', price: 160 },
          { name: 'Crispy Corn', price: 150 },
          { name: 'Chinese Bhel', price: 160 },
        ],
      },
    ],
  },
  {
    id: 'rice-noodles',
    label: 'Rice & Noodles',
    heading: 'Chinese Rice & Noodles',
    categories: [
      {
        id: 'chinese-rice',
        title: 'Rice',
        items: [
          { name: 'Veg Fried Rice', price: 120 },
          { name: 'Schezwan Rice', price: 120 },
          { name: 'Manchurian Rice', price: 120 },
          { name: 'Garlic Rice', price: 120 },
          { name: 'Noodle Rice', price: 120 },
          { name: 'Paneer Rice', price: 150 },
          { name: 'Mexican Rice', price: 150 },
          { name: 'Triple Fried Rice', price: 200 },
          { name: 'Kilogram Special Rice', price: 200 },
        ],
      },
      {
        id: 'noodles',
        title: 'Noodles',
        items: [
          { name: 'Hakka Noodles', price: 120 },
          { name: 'Schezwan Noodles', price: 120 },
          { name: 'Chowmein', price: 120 },
          { name: 'Manchurian Noodles', price: 120 },
          { name: 'Garlic Noodles', price: 120 },
          { name: 'Paneer Noodles', price: 150 },
        ],
      },
    ],
  },
  {
    id: 'chinese-kilo',
    label: 'Chinese on Kilo',
    heading: 'Chinese on Kilo',
    categories: [
      {
        id: 'chinese-on-kilo',
        title: 'Chinese on Kilo',
        items: [
          { name: 'Manchurian Dry', options: halfKilo(120, 230) },
          { name: 'Manchurian Fried Rice', options: halfKilo(120, 230) },
          { name: 'Veg Fried Rice', options: halfKilo(130, 250) },
          { name: 'Hakka Noodles', options: halfKilo(150, 270) },
          { name: 'Chinese Bhel', options: halfKilo(160, 300) },
        ],
      },
    ],
  },
  {
    id: 'punjabi',
    label: 'Punjabi',
    heading: 'Punjabi',
    categories: [
      {
        id: 'punjabi-veg-tadka',
        title: 'Punjabi Veg. Tadka',
        note: 'One price for every dish in this list. Just pick your portion.',
        sharedOptions: [
          { label: '300 gm', serves: '2–3 persons', price: 180 },
          { label: '500 gm', serves: '3–4 persons', price: 280 },
          { label: '1 kg', serves: '5–6 persons', price: 550 },
        ],
        items: [
          { name: 'Veg Masala' },
          { name: 'Veg Kadai' },
          { name: 'Veg Kolhapuri' },
          { name: 'Veg Hyderabadi' },
          { name: 'Veg Jaipuri' },
          { name: 'Veg Chatpata' },
          { name: 'Chana Masala' },
          { name: 'Veg Korma' },
          { name: 'Mix Veg' },
          { name: 'Veg Angara' },
          { name: 'Aloo Palak' },
          { name: 'Aloo Mutter' },
          { name: 'Dum Aloo' },
          { name: 'Veg Kofta' },
          { name: 'Veg Handi' },
        ],
      },
      {
        id: 'punjabi-paneer',
        title: 'Punjabi Paneer Specials',
        note: 'One price for every dish in this list. Just pick your portion.',
        sharedOptions: [
          { label: '300 gm', serves: '1–2 persons', price: 200 },
          { label: '500 gm', serves: '2–3 persons', price: 300 },
          { label: '1 kg', serves: '3–4 persons', price: 580 },
        ],
        items: [
          { name: 'Paneer Tikka Masala' },
          { name: 'Paneer Butter Masala' },
          { name: 'Paneer Kadai' },
          { name: 'Paneer Tawa Masala' },
          { name: 'Paneer Rajwadi' },
          { name: 'Paneer Kolhapuri' },
          { name: 'Paneer Angara' },
          { name: 'Paneer Bhuna Masala' },
          { name: 'Mutter Paneer' },
          { name: 'Palak Paneer' },
          { name: 'Shahi Paneer' },
          { name: 'Paneer Chatpata' },
          { name: 'Paneer Lababdar' },
          { name: 'Paneer Korma' },
          { name: 'Malai Kofta' },
          { name: 'Paneer Toofani' },
          { name: 'Paneer Kadhai' },
          { name: 'Paneer Handi' },
        ],
      },
      {
        id: 'kaju-delights',
        title: 'Kaju Delights',
        note: 'One price for every dish in this list. Just pick your portion.',
        sharedOptions: [
          { label: '300 gm', price: 210 },
          { label: '500 gm', price: 330 },
          { label: '1 kg', price: 620 },
        ],
        items: [
          { name: 'Kaju Curry', tag: 'Spicy' },
          { name: 'Kaju Masala' },
          { name: 'Kaju Butter Masala' },
          { name: 'Kaju Paneer Masala' },
          { name: 'Kaju Kofta', tag: 'Sweet' },
          { name: 'Khoya Kaju', tag: 'Sweet' },
        ],
      },
    ],
  },
  {
    id: 'dal-rice',
    label: 'Dal & Rice',
    heading: 'Dal & Rice',
    categories: [
      {
        id: 'dal',
        title: 'Dal',
        items: [
          { name: 'Dal Fry', options: threeSizes(150, 230, 450) },
          { name: 'Dal Tadka', options: threeSizes(170, 250, 480) },
          { name: 'Dal Tadka Butter', options: threeSizes(170, 280, 530) },
          { name: 'Dal Khichdi', options: threeSizes(150, 230, 450) },
        ],
      },
      {
        id: 'rice',
        title: 'Rice',
        items: [
          { name: 'Plain Rice', options: threeSizes(80, 150, 280) },
          { name: 'Jeera Rice', options: threeSizes(100, 180, 350) },
          { name: 'Veg Biryani', options: threeSizes(140, 260, 500) },
          { name: 'Hyderabadi Biryani', options: threeSizes(160, 270, 530) },
        ],
      },
    ],
  },
  {
    id: 'breads',
    label: 'Roti & Bread',
    heading: 'Roti & Bread',
    categories: [
      {
        id: 'roti-bread',
        title: 'Roti & Bread',
        items: [
          { name: 'Plain Tawa Roti', price: 10 },
          { name: 'Butter Tawa Roti', price: 15 },
          { name: 'Paratha', price: 30 },
          { name: 'Butter Paratha', price: 35 },
        ],
      },
    ],
  },
  {
    id: 'beverages',
    label: 'Beverages',
    heading: 'Beverages',
    categories: [
      {
        id: 'beverages-list',
        title: 'Beverages',
        items: [
          { name: 'Thums Up', price: 20 },
          { name: 'Fanta', price: 20 },
          { name: 'Sprite', price: 20 },
          { name: 'Water Bottle (500 ml)', price: 10 },
          { name: 'Water Bottle (1 Ltr)', price: 20 },
        ],
      },
    ],
  },
];

export const familyCombos = menuGroups
  .find((g) => g.id === 'combos')
  .categories[0];

/** Lowest price (and its portion label, if any) across the given categories, for "from ₹…" labels. */
export function startingOffer(categoryIds) {
  const offers = menuGroups
    .flatMap((g) => g.categories)
    .filter((c) => categoryIds.includes(c.id))
    .flatMap((c) =>
      c.sharedOptions
        ? c.sharedOptions
        : c.items.flatMap((i) => i.options ?? [{ label: null, price: i.price }]),
    );
  return offers.reduce((best, o) => (o.price < best.price ? o : best));
}

export function findItemPrice(categoryId, itemName) {
  const category = menuGroups.flatMap((g) => g.categories).find((c) => c.id === categoryId);
  return category?.items.find((i) => i.name === itemName)?.price;
}

export const formatPrice = (n) => `₹${n}`;

/** Keeps a quantity and its unit on the same line: "1 kg" -> "1\u00A0kg". */
export const keepUnits = (text) => text.replace(/(\d) (gm|kg|pcs)\b/g, '$1\u00A0$2');
