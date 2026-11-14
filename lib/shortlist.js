'use client';
import { useEffect, useState } from 'react';
// Харьцуулах жагсаалт (энэ төхөөрөмж дээр, бүртгэлгүй). Дээд тал нь 4 агентлаг.
const K = 'brief_short', MAX = 4;
export const getShort = () => { try { return JSON.parse(localStorage.getItem(K) || '[]').filter(x => typeof x === 'string'); } catch { return []; } };
export function toggleShort(slug) {
  let s = getShort(); s = s.includes(slug) ? s.filter(x => x !== slug) : [...s, slug].slice(-MAX);
  try { localStorage.setItem(K, JSON.stringify(s)); } catch {}
  window.dispatchEvent(new Event('brief-short')); return s;
}
export function clearShort() { try { localStorage.removeItem(K); } catch {} window.dispatchEvent(new Event('brief-short')); }
export function useShort() {
  const [s, set] = useState([]);
  useEffect(() => { const f = () => set(getShort()); f(); window.addEventListener('brief-short', f); window.addEventListener('storage', f); return () => { window.removeEventListener('brief-short', f); window.removeEventListener('storage', f); }; }, []);
  return s;
}
