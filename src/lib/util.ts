import { useEffect, useRef, useState } from 'react';

export const uid = () => Math.random().toString(36).slice(2, 10);

export const fmtTime = (ts: number) =>
  new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

export function useNow(ms = 1000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const i = setInterval(() => setNow(Date.now()), ms);
    return () => clearInterval(i);
  }, [ms]);
  return now;
}

export function ago(ts: number | null, now: number) {
  if (!ts) return '—';
  const s = Math.max(0, Math.round((now - ts) / 1000));
  if (s < 5) return 'just now';
  if (s < 60) return `${s}s ago`;
  return `${Math.round(s / 60)} min ago`;
}

/** Smoothly animates a number toward `target` (instant when `instant` is true). */
export function useTween(target: number, ms = 650, instant = false) {
  const [value, setValue] = useState(target);
  const cur = useRef(target);
  useEffect(() => {
    if (instant) {
      cur.current = target;
      setValue(target);
      return;
    }
    const start = cur.current;
    const t0 = performance.now();
    let raf = 0;
    const step = (t: number) => {
      const p = Math.min(1, (t - t0) / ms);
      const e = 1 - Math.pow(1 - p, 3);
      cur.current = start + (target - start) * e;
      setValue(cur.current);
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, ms, instant]);
  return value;
}

export const clamp = (n: number, a: number, b: number) => Math.min(b, Math.max(a, n));

export const mmss = (ms: number) => {
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};
