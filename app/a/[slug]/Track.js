'use client';
import { useEffect } from 'react';
const send = (slug, kind) => { const body = JSON.stringify({ slug, kind }); if (!(navigator.sendBeacon && navigator.sendBeacon('/api/track', new Blob([body], { type: 'application/json' })))) fetch('/api/track', { method: 'POST', body, headers: { 'Content-Type': 'application/json' }, keepalive: true }).catch(() => {}); };
// Үзэлтийг нэг сешнд нэг удаа, data-track бүхий холбоос дээр дарсныг бүртгэнэ
export default function Track({ slug }) {
  useEffect(() => {
    try { if (!sessionStorage.getItem('v:' + slug)) { sessionStorage.setItem('v:' + slug, '1'); send(slug, 'view'); } } catch { send(slug, 'view'); }
    const on = e => { const a = e.target.closest?.('[data-track]'); if (a) send(slug, a.getAttribute('data-track')); };
    document.addEventListener('click', on); return () => document.removeEventListener('click', on);
  }, [slug]);
  return null;
}
