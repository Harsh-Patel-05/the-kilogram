import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { subscribeMenuCatalog } from '../lib/menuLive.js';
import { findFamilyCombosCategory } from '../lib/menuBuild.js';

const MenuContext = createContext({
  menuGroups: [],
  loading: true,
  source: 'loading',
  error: null,
  familyCombos: null,
  itemCount: 0,
});

export function MenuProvider({ children }) {
  const [liveGroups, setLiveGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsub = subscribeMenuCatalog(({ groups, error: err }) => {
      if (err) {
        setError(err);
        setLiveGroups([]);
        setLoading(false);
        return;
      }
      setError(null);
      setLiveGroups(Array.isArray(groups) ? groups : []);
      setLoading(false);
    });
    return unsub;
  }, []);

  const value = useMemo(() => {
    const itemCount = liveGroups.reduce(
      (n, g) => n + g.categories.reduce((m, c) => m + (c.items?.length || 0), 0),
      0,
    );
    return {
      menuGroups: liveGroups,
      loading,
      source: loading ? 'loading' : error ? 'error' : 'firestore',
      error,
      familyCombos: findFamilyCombosCategory(liveGroups),
      itemCount,
    };
  }, [liveGroups, loading, error]);

  return <MenuContext.Provider value={value}>{children}</MenuContext.Provider>;
}

export function useMenu() {
  return useContext(MenuContext);
}
