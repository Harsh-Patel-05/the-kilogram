import { createContext, useContext, useEffect, useReducer, useCallback, useState } from 'react';

const CartContext = createContext(null);
const STORAGE_KEY = 'kg-cart-v1';

function loadCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { items: [] };
    const parsed = JSON.parse(raw);
    return { items: Array.isArray(parsed.items) ? parsed.items : [] };
  } catch {
    return { items: [] };
  }
}

function persist(items) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ items }));
  } catch {
    /* private mode */
  }
}

function reducer(state, action) {
  switch (action.type) {
    case 'ADD': {
      const { item } = action;
      const existing = state.items.find((i) => i.id === item.id);
      let items;
      if (existing) {
        items = state.items.map((i) =>
          i.id === item.id ? { ...i, qty: i.qty + (item.qty || 1) } : i,
        );
      } else {
        items = [...state.items, { ...item, qty: item.qty || 1 }];
      }
      return { ...state, items, lastAdded: item };
    }
    case 'SET_QTY': {
      const qty = Math.max(0, Number(action.qty) || 0);
      const items =
        qty === 0
          ? state.items.filter((i) => i.id !== action.id)
          : state.items.map((i) => (i.id === action.id ? { ...i, qty } : i));
      return { ...state, items };
    }
    case 'REMOVE':
      return { ...state, items: state.items.filter((i) => i.id !== action.id) };
    case 'CLEAR':
      return { ...state, items: [], lastAdded: null };
    case 'CLEAR_TOAST':
      return { ...state, lastAdded: null };
    case 'HYDRATE':
      return { ...state, items: action.items || [] };
    case 'SYNC_LINES': {
      // Replace cart with validated/repriced lines from live menu.
      const items = Array.isArray(action.items) ? action.items : [];
      return { ...state, items };
    }
    default:
      return state;
  }
}

export function cartLineId(categoryId, name, optionLabel) {
  return [categoryId || 'menu', name, optionLabel || 'default'].join('|');
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, null, () => ({ ...loadCart(), lastAdded: null }));
  const [toastOpen, setToastOpen] = useState(false);

  useEffect(() => {
    persist(state.items);
  }, [state.items]);

  useEffect(() => {
    if (!state.lastAdded) return undefined;
    setToastOpen(true);
    const t = setTimeout(() => {
      setToastOpen(false);
      dispatch({ type: 'CLEAR_TOAST' });
    }, 2600);
    return () => clearTimeout(t);
  }, [state.lastAdded]);

  const addItem = useCallback((item) => dispatch({ type: 'ADD', item }), []);
  const setQty = useCallback((id, qty) => dispatch({ type: 'SET_QTY', id, qty }), []);
  const removeItem = useCallback((id) => dispatch({ type: 'REMOVE', id }), []);
  const clearCart = useCallback(() => dispatch({ type: 'CLEAR' }), []);
  const syncLines = useCallback((items) => dispatch({ type: 'SYNC_LINES', items }), []);
  const dismissToast = useCallback(() => {
    setToastOpen(false);
    dispatch({ type: 'CLEAR_TOAST' });
  }, []);

  const itemCount = state.items.reduce((s, i) => s + i.qty, 0);
  const subtotal = state.items.reduce((s, i) => s + i.unitPrice * i.qty, 0);

  const value = {
    items: state.items,
    itemCount,
    subtotal,
    lastAdded: state.lastAdded,
    toastOpen,
    addItem,
    setQty,
    removeItem,
    clearCart,
    syncLines,
    dismissToast,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
