import { useEffect, useState } from 'react';
import logoMark from '../assets/logo/logo-mark.webp';
import logoWordmark from '../assets/logo/logo-wordmark.webp';
import './Loader.css';

const VISIBLE_MS = 1650;
const VISIBLE_MS_REDUCED = 600;
const EXIT_MS = 450;

export default function Loader({ onDone }) {
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const showFor = reduce ? VISIBLE_MS_REDUCED : VISIBLE_MS;
    const t1 = setTimeout(() => setLeaving(true), showFor);
    const t2 = setTimeout(onDone, showFor + (reduce ? 0 : EXIT_MS));
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [onDone]);

  return (
    <div className={`loader${leaving ? ' is-leaving' : ''}`} role="status" aria-live="polite">
      <span className="visually-hidden">Loading The Kilogram</span>
      <div className="loader__inner" aria-hidden="true">
        <img className="loader__mark" src={logoMark} alt="" width="414" height="272" />
        <img className="loader__word" src={logoWordmark} alt="" width="397" height="49" />
        <span className="loader__line">
          <i />
          <i />
          <i />
        </span>
      </div>
    </div>
  );
}
