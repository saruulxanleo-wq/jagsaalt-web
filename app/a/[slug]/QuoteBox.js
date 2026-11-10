'use client';
import { useState } from 'react';
import Link from 'next/link';
// Профайл дээрээс шууд үнийн санал авах (хүсэлт /api/lead-ээр энэ агентлагт очно)
export default function QuoteBox({ slug, name }) {
  const [open, setOpen] = useState(false); const [f, setF] = useState({ name: '', company: '', phone: '', email: '', note: '' });
  const [busy, setBusy] = useState(false); const [err, setErr] = useState(null); const [sent, setSent] = useState(false);
  const set = k => e => setF({ ...f, [k]: e.target.value });
  async function send(e) {
    e.preventDefault(); setBusy(true); setErr(null);
    const r = await fetch('/api/lead', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...f, answers: { source: 'profile' }, agencies: [slug] }) });
    const j = await r.json().catch(() => ({})); setBusy(false);
    if (r.ok) { setSent(true); try { window.fbq && window.fbq('track', 'Lead', { content_name: 'profile_quote' }); } catch {} } else setErr(j.error || 'Алдаа гарлаа');
  }
  if (sent) return <div className="panel ok" style={{ padding: 18 }}><b>Хүсэлт илгээгдлээ ✓</b><p style={{ marginTop: 6 }}>Ажлын 1 өдөрт тантай холбогдож, {name}-аас үнийн санал авахад тусална.</p></div>;
  if (!open) return <button className="btn lime" style={{ padding: 16, fontSize: 16 }} onClick={() => setOpen(true)} data-track="social">Үнийн санал авах →</button>;
  return <form onSubmit={send} className="panel" style={{ padding: 18, display: 'grid', gap: 10, boxShadow: 'inset 0 0 0 2px var(--l)' }}>
    <b className="h" style={{ fontSize: 17 }}>{name}-аас үнийн санал авах</b>
    <input className="field" style={{ marginTop: 0 }} placeholder="Нэр *" required value={f.name} onChange={set('name')} aria-label="Нэр" />
    <input className="field" style={{ marginTop: 0 }} placeholder="Байгууллага" value={f.company} onChange={set('company')} aria-label="Байгууллага" />
    <input className="field" style={{ marginTop: 0 }} placeholder="Утас *" inputMode="tel" value={f.phone} onChange={set('phone')} aria-label="Утас" />
    <input className="field" style={{ marginTop: 0 }} placeholder="И-мэйл" type="email" value={f.email} onChange={set('email')} aria-label="И-мэйл" />
    <textarea className="field" style={{ marginTop: 0 }} rows={3} placeholder="Юу хэрэгтэй байна? (брэнд, ажил, төсөв)" value={f.note} onChange={set('note')} aria-label="Хэрэгцээ" />
    {err && <div className="err">{err}</div>}
    <button className="btn dark" disabled={busy}>{busy ? 'Илгээж байна…' : 'Илгээх →'}</button>
    <p style={{ color: 'var(--mute)', fontSize: 13, margin: 0 }}>Үнэгүй. Мэдээллийг зөвхөн энэ агентлагт дамжуулна. <Link href="/songoh" style={{ textDecoration: 'underline' }}>Олон агентлагтай харьцуулах</Link></p>
  </form>;
}
