const addressLines = [
  'G-5, Savvy Studios,',
  'Vandemataram,',
  'Godrej Garden City Rd,',
  'Jagatpur,',
  'Ahmedabad, Gujarat 382481',
];

const addressOneLine =
  'G-5, Savvy Studios, Vandemataram, Godrej Garden City Rd, Jagatpur, Ahmedabad, Gujarat 382481';

const placeQuery = encodeURIComponent('The Kilogram Jagatpur Ahmedabad');

export const site = {
  name: 'The Kilogram',
  phoneCountryCode: '+91',
  phoneLocal: '90999 33459',
  phoneDisplay: '+91 90999 33459',
  phoneHref: 'tel:+919099933459',
  whatsappHref: `https://wa.me/919099933459?text=${encodeURIComponent(
    'Hello The Kilogram, I came across your website and would like to know more about your menu and place an order. Could you please help me with the details? Thank you!',
  )}`,
  addressLines,
  addressOneLine,
  geo: { lat: 23.107234, lng: 72.550806 },
  directionsHref: `https://www.google.com/maps/dir/?api=1&destination=${placeQuery}`,
  mapsHref: `https://www.google.com/maps/search/?api=1&query=${placeQuery}`,
  mapEmbedSrc: `https://maps.google.com/maps?q=${placeQuery}&ll=23.107234,72.550806&z=16&output=embed`,
};

/** Same hours every day, in IST. Minutes from midnight; slots in time order. */
export const hours = {
  daysLabel: 'All 7 days',
  slots: [
    { open: 11 * 60, close: 14 * 60, openLabel: '11 AM', closeLabel: '2 PM' },
    { open: 18 * 60, close: 23 * 60, openLabel: '6 PM', closeLabel: '11 PM' },
  ],
};

export const delivery = [
  {
    id: 'swiggy',
    name: 'Swiggy',
    href: 'https://www.swiggy.com/city/ahmedabad/the-kilogram-gota-rest1256036',
  },
  {
    id: 'zomato',
    name: 'Zomato',
    href: 'https://www.zomato.com/ahmedabad/the-kilogram-gota/order',
  },
  {
    id: 'toing',
    name: 'Toing',
    // Toing is app-only; this landing page links to the Play Store and App Store.
    href: 'https://www.toingit.com/',
  },
];

export const ratings = {
  google: { score: 4.7, countLabel: '200+', href: site.mapsHref },
  zomatoReviewsHref: 'https://www.zomato.com/ahmedabad/the-kilogram-gota/reviews',
};

/** Real customer reviews from our Zomato page. Spelling tidied, wording kept. */
export const reviews = [
  {
    name: 'Hiren',
    stars: 5,
    source: 'Zomato',
    text: 'Totally new concept in bhaji pav / pulav by kg and half kg. Very affordable price for all. Very delicious food.',
  },
  {
    name: 'Deepti Tekchandani',
    stars: 5,
    source: 'Zomato',
    text: 'Yesterday I ordered from The Kilogram and the taste was really good. Quality and quantity were also very good.',
  },
  {
    name: 'Ravi Vadher',
    stars: 5,
    source: 'Zomato',
    text: 'Enjoyed The Kilogram pav bhaji with my family. Awesome taste, nice restro! Good quality of bun, taste toh zabardast. Service… awesome.',
  },
  {
    name: 'Pratik Jani',
    stars: 5,
    source: 'Zomato',
    text: 'One of the finest restaurants in Ahmedabad, with the best food quality and service.',
  },
];

export const navLinks = [
  { href: '#home', label: 'Home' },
  { href: '#menu', label: 'Menu' },
  { href: '#about', label: 'About' },
  { href: '#reviews', label: 'Reviews' },
  { href: '#contact', label: 'Contact' },
];
