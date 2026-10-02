import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import useScrolled from '../hooks/useScrolled.js';
import { site } from '../data/site.js';
import './FloatingActions.css';

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.47 14.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.65.07-.3-.15-1.25-.46-2.38-1.47-.88-.79-1.47-1.76-1.65-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.09 1.75-.72 2-1.41.25-.69.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35zM12.05 21.5h-.01a9.45 9.45 0 0 1-4.82-1.32l-.35-.21-3.58.94.96-3.49-.23-.36a9.43 9.43 0 0 1-1.45-5.03c0-5.22 4.25-9.46 9.48-9.46a9.4 9.4 0 0 1 6.7 2.78 9.4 9.4 0 0 1 2.77 6.69c0 5.22-4.25 9.46-9.47 9.46zm8.06-17.53A11.33 11.33 0 0 0 12.05.63C5.77.63.66 5.73.66 12.01c0 2 .52 3.96 1.52 5.69L.57 23.6l6.04-1.58a11.4 11.4 0 0 0 5.44 1.38h.01c6.28 0 11.39-5.1 11.39-11.38 0-3.04-1.18-5.9-3.34-8.05z" />
    </svg>
  );
}

function useTuckOnScrollDown() {
  const [tucked, setTucked] = useState(false);

  useEffect(() => {
    let lastY = window.scrollY;
    let ticking = false;
    const update = () => {
      const y = window.scrollY;
      const atBottom = window.innerHeight + y >= document.documentElement.scrollHeight - 80;
      if (atBottom || y < lastY - 6) setTucked(false);
      else if (y > lastY + 6) setTucked(true);
      if (Math.abs(y - lastY) > 6) lastY = y;
      ticking = false;
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return tucked;
}

export default function FloatingActions() {
  const showTop = useScrolled(700);
  const pastHeroCtas = useScrolled(320);
  const tucked = useTuckOnScrollDown();

  const toTop = () => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    document.querySelector('.header a')?.focus({ preventScroll: true });
  };

  return (
    <div className={`fab${tucked ? ' fab--tucked' : ''}`}>
      <button
        type="button"
        className={`fab__btn fab__btn--top${showTop ? ' is-shown' : ''}`}
        onClick={toTop}
        aria-label="Back to top"
      >
        <ArrowUp aria-hidden="true" />
      </button>
      <a
        className={`fab__btn fab__btn--wa${pastHeroCtas ? ' is-shown' : ''}`}
        href={site.whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with us on WhatsApp (opens in a new tab)"
      >
        <WhatsAppIcon />
        <span className="fab__tip" aria-hidden="true">
          Chat on WhatsApp
        </span>
      </a>
    </div>
  );
}
