import { useEffect, useState } from 'react';

/** True while the element behind `ref` intersects the viewport (grown by `rootMargin`). */
export default function useInView(ref, rootMargin = '0px', initial = true) {
  const [inView, setInView] = useState(initial);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    if (!('IntersectionObserver' in window)) {
      setInView(true);
      return undefined;
    }
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { rootMargin });
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, rootMargin]);

  return inView;
}
