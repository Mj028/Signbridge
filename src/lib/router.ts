import { useEffect, useState } from 'react';

/** Tiny hash router: works on Vercel (or any static host) with no rewrite rules. */
const read = () => window.location.hash.replace(/^#/, '') || '/';

export function navigate(path: string) {
  if (read() === path) return;
  window.location.hash = path;
}

export function useRoute() {
  const [route, setRoute] = useState(read);
  useEffect(() => {
    const onChange = () => {
      setRoute(read());
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return route;
}
