import { collection, onSnapshot } from 'firebase/firestore';
import { db, ensureCustomerAuth } from './firebase.js';
import { buildMenuGroupsFromItems } from './menuBuild.js';

export const MENU_ITEMS = 'menuItems';

function mapSnapshot(snap) {
  const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  return { groups: buildMenuGroupsFromItems(items), items, error: null };
}

function withTimeout(promise, ms, label) {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error(`${label} timed out`)), ms);
    promise.then(
      (v) => {
        clearTimeout(t);
        resolve(v);
      },
      (e) => {
        clearTimeout(t);
        reject(e);
      },
    );
  });
}

/**
 * Live subscription to Firestore `menuItems` (same collection the admin
 * Menu page writes). Returns an unsubscribe function.
 *
 * Tries public read, then anonymous auth retry. Always settles so the UI
 * can show an empty/error state if Firestore is unreachable.
 *
 * @param {(payload: { groups: any[], items: any[], error: Error | null }) => void} onChange
 */
export function subscribeMenuCatalog(onChange) {
  let unsubSnap = null;
  let cancelled = false;
  let gotData = false;

  const push = (payload) => {
    if (cancelled) return;
    gotData = true;
    clearTimeout(timeout);
    onChange(payload);
  };

  const fail = (error) => {
    if (cancelled || gotData) return;
    gotData = true;
    clearTimeout(timeout);
    console.error('[menu]', error);
    onChange({ groups: [], items: [], error });
  };

  const timeout = setTimeout(() => {
    fail(new Error('Menu load timed out'));
  }, 6000);

  (async () => {
    try {
      // Attempt 1: public read (after menuItems allow read: if true).
      const first = await new Promise((resolve) => {
        let resolved = false;
        unsubSnap = onSnapshot(
          collection(db, MENU_ITEMS),
          (snap) => {
            if (resolved) {
              push(mapSnapshot(snap));
              return;
            }
            resolved = true;
            resolve({ ok: true, snap });
          },
          (err) => {
            if (resolved) return;
            resolved = true;
            resolve({ ok: false, err });
          },
        );
      });

      if (cancelled) return;

      if (first.ok) {
        push(mapSnapshot(first.snap));
        return;
      }

      if (unsubSnap) {
        unsubSnap();
        unsubSnap = null;
      }

      // Attempt 2: anonymous auth (legacy rules: any signed-in user can read).
      try {
        await withTimeout(ensureCustomerAuth(), 4000, 'Anonymous auth');
      } catch (authErr) {
        fail(authErr);
        return;
      }
      if (cancelled) return;

      unsubSnap = onSnapshot(
        collection(db, MENU_ITEMS),
        (snap) => push(mapSnapshot(snap)),
        (err) => fail(err),
      );
    } catch (err) {
      fail(err);
    }
  })();

  return () => {
    cancelled = true;
    clearTimeout(timeout);
    if (unsubSnap) unsubSnap();
  };
}
