import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { CartProvider } from './context/CartContext.jsx';
import { CustomizeProvider } from './context/CustomizeContext.jsx';
import { MenuProvider } from './context/MenuContext.jsx';
import './styles/fonts.css';
import './styles/global.css';
import App from './App.jsx';

/** GitHub Pages project site lives under /the-kilogram/ — keep /track/:id working there. */
function routerBasename() {
  if (typeof window === 'undefined') return undefined;
  const seg = window.location.pathname.split('/').filter(Boolean)[0];
  return seg === 'the-kilogram' ? '/the-kilogram' : undefined;
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter basename={routerBasename()}>
      <MenuProvider>
        <CartProvider>
          <CustomizeProvider>
            <App />
          </CustomizeProvider>
        </CartProvider>
      </MenuProvider>
    </BrowserRouter>
  </StrictMode>,
);
