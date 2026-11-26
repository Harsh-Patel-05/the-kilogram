import { useCallback, useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Loader from './components/Loader.jsx';
import Header from './components/Header.jsx';
import Hero from './components/Hero.jsx';
import Highlights from './components/Highlights.jsx';
import PopularItems from './components/PopularItems.jsx';
import FamilyCombos from './components/FamilyCombos.jsx';
import MenuSection from './components/MenuSection.jsx';
import About from './components/About.jsx';
import WhyUs from './components/WhyUs.jsx';
import Reviews from './components/Reviews.jsx';
import Contact from './components/Contact.jsx';
import MobileOrderBar from './components/MobileOrderBar.jsx';
import Footer from './components/Footer.jsx';
import FloatingActions from './components/FloatingActions.jsx';
import OnlineOrderingBanner from './components/OnlineOrderingBanner.jsx';
import OrderingUI from './components/ordering/OrderingUI.jsx';
import OrderTracking from './components/ordering/OrderTracking.jsx';
import useReveal from './hooks/useReveal.js';
import { lockBody, unlockBody } from './lib/bodyLock.js';

const INTRO_KEY = 'kg-intro-seen';

function shouldShowIntro() {
  // Deep links (#contact, #menu) should land on content, not the splash.
  if (typeof window !== 'undefined' && window.location.hash) return false;
  try {
    return !sessionStorage.getItem(INTRO_KEY);
  } catch {
    return false;
  }
}

function HomePage({ onOpenCart }) {
  const [showIntro, setShowIntro] = useState(shouldShowIntro);
  useReveal();

  const finishIntro = useCallback(() => {
    // Always mark loaded BEFORE unmounting the splash so hero isn't opacity:0 under a fading loader
    document.documentElement.classList.add('is-loaded');
    try {
      sessionStorage.setItem(INTRO_KEY, '1');
    } catch {
      /* storage unavailable */
    }
    setShowIntro(false);
  }, []);

  useEffect(() => {
    if (!showIntro) {
      document.documentElement.classList.add('is-loaded');
      return undefined;
    }
    lockBody();
    return () => unlockBody();
  }, [showIntro]);

  // Hard failsafe — never leave users on a black splash
  useEffect(() => {
    if (!showIntro) return undefined;
    const t = setTimeout(finishIntro, 2800);
    return () => clearTimeout(t);
  }, [showIntro, finishIntro]);

  return (
    <>
      {showIntro && <Loader onDone={finishIntro} />}
      <a className="skip-link" href="#menu">
        Skip to menu
      </a>
      <Header onOpenCart={onOpenCart} />
      <OnlineOrderingBanner />
      <main>
        <Hero />
        <Highlights />
        <PopularItems />
        <FamilyCombos />
        <MenuSection />
        <About />
        <WhyUs />
        <Reviews />
        <Contact />
      </main>
      <Footer />
      <MobileOrderBar onOpenCart={onOpenCart} />
      <FloatingActions />
    </>
  );
}

export default function App() {
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage onOpenCart={() => setCartOpen(true)} />} />
        <Route path="/track/:orderId" element={<OrderTracking />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <OrderingUI cartOpen={cartOpen} setCartOpen={setCartOpen} />
    </>
  );
}
