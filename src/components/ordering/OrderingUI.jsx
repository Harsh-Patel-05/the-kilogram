import { Suspense, lazy, useCallback, useState } from 'react';
import CartDrawer from './CartDrawer.jsx';
import CartToast from './CartToast.jsx';
import AddToCartModal from './AddToCartModal.jsx';
import CartMenuSync from './CartMenuSync.jsx';
import { useMenu } from '../../context/MenuContext.jsx';

const Checkout = lazy(() => import('./Checkout.jsx'));

export default function OrderingUI({ cartOpen, setCartOpen }) {
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const { loading, error, itemCount } = useMenu();
  const menuReady = !loading && !error && itemCount > 0;

  const openCheckout = useCallback(() => {
    if (!menuReady) return;
    setCartOpen(false);
    setCheckoutOpen(true);
  }, [setCartOpen, menuReady]);

  const backToCart = useCallback(() => {
    setCheckoutOpen(false);
    setCartOpen(true);
  }, [setCartOpen]);

  return (
    <>
      <CartMenuSync />
      <AddToCartModal />
      <CartToast onOpenCart={() => setCartOpen(true)} />
      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        onCheckout={openCheckout}
        menuReady={menuReady}
      />
      {checkoutOpen && (
        <Suspense fallback={null}>
          <Checkout
            open={checkoutOpen}
            onClose={() => setCheckoutOpen(false)}
            onBackToCart={backToCart}
            menuReady={menuReady}
          />
        </Suspense>
      )}
    </>
  );
}
