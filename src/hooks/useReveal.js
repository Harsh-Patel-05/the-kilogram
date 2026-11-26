import { useEffect } from 'react';

function revealEl(el) {
  el.classList.add('is-visible');
}

function inViewport(el) {
  const rect = el.getBoundingClientRect();
  const vh = window.innerHeight || document.documentElement.clientHeight;
  return rect.bottom > 0 && rect.top < vh * 0.95;
}

function revealHashTarget() {
  const id = window.location.hash.replace(/^#/, '');
  if (!id) return;
  const section = document.getElementById(id);
  if (!section) return;
  section.querySelectorAll('[data-reveal]').forEach(revealEl);
  // Also reveal the section itself if marked
  if (section.hasAttribute('data-reveal')) revealEl(section);
}

/** Fades in every [data-reveal] element the first time it scrolls into view. */
export default function useReveal() {
  useEffect(() => {
    const root = document.documentElement;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || !('IntersectionObserver' in window)) {
      // Ensure content is never left invisible
      document.querySelectorAll('[data-reveal]').forEach(revealEl);
      return undefined;
    }

    root.classList.add('reveal-ready');

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            revealEl(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '0px 0px -4% 0px', threshold: 0.05 },
    );

    const watch = (el) => {
      if (el.classList.contains('is-visible')) return;
      if (inViewport(el)) {
        revealEl(el);
        return;
      }
      observer.observe(el);
    };

    document.querySelectorAll('[data-reveal]').forEach(watch);
    // Deep links like /#contact must not land on an invisible card
    revealHashTarget();
    requestAnimationFrame(revealHashTarget);

    const mo = new MutationObserver((mutations) => {
      mutations.forEach((m) => {
        m.addedNodes.forEach((node) => {
          if (!(node instanceof Element)) return;
          if (node.hasAttribute?.('data-reveal')) watch(node);
          node.querySelectorAll?.('[data-reveal]').forEach(watch);
        });
      });
    });
    mo.observe(document.body, { childList: true, subtree: true });

    const onHash = () => {
      revealHashTarget();
    };
    window.addEventListener('hashchange', onHash);

    return () => {
      observer.disconnect();
      mo.disconnect();
      window.removeEventListener('hashchange', onHash);
      root.classList.remove('reveal-ready');
    };
  }, []);
}
