import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { CartProvider } from './context/CartContext.jsx';
import { CustomizeProvider } from './context/CustomizeContext.jsx';
import { MenuProvider } from './context/MenuContext.jsx';
import './styles/fonts.css';
import './styles/global.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
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
