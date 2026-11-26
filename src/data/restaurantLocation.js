/**
 * Verified restaurant coordinates + delivery policy.
 * Update latitude/longitude here (or via admin settings) — never invent values.
 */
export const restaurantLocation = {
  name: 'The Kilogram',
  /** Verified store latitude (Jagatpur, Ahmedabad) */
  latitude: 23.107234,
  /** Verified store longitude */
  longitude: 72.550806,
  /** Maximum straight-line delivery distance in kilometres */
  deliveryRadiusKm: 3,
  /** Flat delivery fee when eligible (₹). Set 0 for free delivery. */
  deliveryCharge: 0,
  /** Free delivery when cart subtotal is at or above this (₹). null = never auto-free. */
  freeDeliveryMinSubtotal: null,
  /** Shown when estimating arrival after confirmation */
  estimatedDeliveryMinutes: { min: 35, max: 55 },
  /** Bias Photon search toward Ahmedabad */
  searchBias: {
    lat: 23.107234,
    lon: 72.550806,
    /** Approx. 3 km bounding box used only to bias suggestions */
    bbox: '72.52,23.08,72.58,23.13',
  },
};
