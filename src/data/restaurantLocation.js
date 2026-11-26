/**
 * Verified restaurant coordinates + delivery policy.
 * Update latitude/longitude here — never invent values.
 */
export const restaurantLocation = {
  name: 'The Kilogram',
  /** Verified store latitude (Jagatpur, Ahmedabad) */
  latitude: 23.107234,
  /** Verified store longitude */
  longitude: 72.550806,
  /** Hard max delivery distance (km) — beyond this we do not deliver */
  deliveryRadiusKm: 2,
  /** Free delivery when cart ≥ this amount AND distance ≤ freeDeliveryMaxKm */
  freeDeliveryMinSubtotal: 500,
  /** Free delivery only inside this radius (km) when cart unlocks free delivery */
  freeDeliveryMaxKm: 1.5,
  /**
   * Distance-based delivery fee slabs (km → ₹).
   * ≤0.5 → 20 · ≤1.0 → 40 · ≤2.0 → 50
   */
  deliveryFeeSlabs: [
    { maxKm: 0.5, fee: 20 },
    { maxKm: 1.0, fee: 40 },
    { maxKm: 2.0, fee: 50 },
  ],
  /** Shown when estimating arrival after confirmation */
  estimatedDeliveryMinutes: { min: 35, max: 55 },
  /** Minimum ETA owner can set when accepting (minutes) */
  minAcceptEtaMinutes: 20,
  /** Bias Photon search toward Ahmedabad */
  searchBias: {
    lat: 23.107234,
    lon: 72.550806,
    bbox: '72.52,23.08,72.58,23.13',
  },
};

export const DELIVERY_PHONE_DISPLAY = '+91 90999 33459';
export const DELIVERY_PHONE_HREF = 'tel:+919099933459';
