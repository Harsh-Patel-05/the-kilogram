import { useCallback, useEffect, useState } from 'react';
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
import Gallery from './components/Gallery.jsx';
import Contact from './components/Contact.jsx';
import MobileOrderBar from './components/MobileOrderBar.jsx';
import Footer from './components/Footer.jsx';
import FloatingActions from './components/FloatingActions.jsx';
import useReveal from './hooks/useReveal.js';

const INTRO_KEY = 'kg-intro-seen';

function shouldShowIntro() {
  try {
    return !sessionStorage.getItem(INTRO_KEY);
  } catch {
    return false;
  }
}

export default function App() {
  const [showIntro, setShowIntro] = useState(shouldShowIntro);

  useReveal();

  const finishIntro = useCallback(() => {
    try {
      sessionStorage.setItem(INTRO_KEY, '1');
    } catch {
      /* storage unavailable (private mode) — intro simply shows again next time */
    }
    setShowIntro(false);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    document.body.classList.toggle('is-locked', showIntro);
    if (!showIntro) root.classList.add('is-loaded');
  }, [showIntro]);

  return (
    <>
      {showIntro && <Loader onDone={finishIntro} />}
      <a className="skip-link" href="#menu">
        Skip to menu
      </a>
      <Header />
      <main>
        <Hero />
        <Highlights />
        <PopularItems />
        <FamilyCombos />
        <MenuSection />
        <About />
        <WhyUs />
        <Reviews />
        <Gallery />
        <Contact />
      </main>
      <Footer />
      <MobileOrderBar />
      <FloatingActions />
    </>
  );
}
