import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

/**
 * Same Firebase project as RestaurantPilot (admin/POS).
 * Uses Firestore (this project does not use Realtime Database).
 * Only the public web config belongs in frontend code — never admin secrets.
 */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? 'AIzaSyAJOjwJ94w5hYtux2pCT68vZN4b7_dscP4',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? 'kilogram-expance-trakker.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? 'kilogram-expance-trakker',
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ?? 'kilogram-expance-trakker.firebasestorage.app',
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

/** Anonymous session so create rules can require auth without customer accounts. */
export async function ensureCustomerAuth() {
  if (auth.currentUser) return auth.currentUser;
  const cred = await signInAnonymously(auth);
  return cred.user;
}
