import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const CustomizeContext = createContext(null);

/**
 * Opens the add-to-cart customization modal.
 * draft shape:
 * {
 *   name, categoryId, section?,
 *   options: [{ label, price }] | null,  // if null, use basePrice
 *   basePrice?: number,
 *   preselectLabel?: string | null,
 * }
 */
export function CustomizeProvider({ children }) {
  const [draft, setDraft] = useState(null);

  const openCustomize = useCallback((payload) => {
    setDraft(payload);
  }, []);

  const closeCustomize = useCallback(() => {
    setDraft(null);
  }, []);

  const value = useMemo(
    () => ({ draft, openCustomize, closeCustomize }),
    [draft, openCustomize, closeCustomize],
  );

  return <CustomizeContext.Provider value={value}>{children}</CustomizeContext.Provider>;
}

export function useCustomize() {
  const ctx = useContext(CustomizeContext);
  if (!ctx) throw new Error('useCustomize must be used within CustomizeProvider');
  return ctx;
}
