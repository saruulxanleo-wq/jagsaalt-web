'use client';
import { track } from '@/lib/track';
import { useState } from 'react';
import Link from 'next/link';
// Үнийн санал авах. targets: заавал очих агентлагууд, suggest: хамт илгээж болох төстэй агентлагууд (сонгогдсон байдлаар эхэлнэ)
export default function QuoteBox({ slug, name, targets, suggest = [], openInit = false }) {
  const T = targets || [{ slug, name }];
  const [open, setOpen] = useState(openInit); const [f, setF] = useState({ name: '', company: '', phone: '', email: '', note: '' });
  const [extra, setExtra] = useState(suggest.map(s => s.slug));
  const [busy, setBusy] = useState(false); const [err, setErr] = useState(null); const [sent, setSent] = useState(null);
  const set = k => e => setF({ ...f, [k]: e.target.value });
  const title = T.length === 1 ? T[0].name + '-аас үнийн санал авах' : T.length + ' агентлагаас үнийн санал авах';
  async function send(e) {
    e.preventDefault(); setBusy(true); setErr(null);
    const agencies = [...T.map(t => t.slug), ...extra].slice(0, 5);
    const r = await fetch('/api/lead', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...f, answers: { source: 'profile' }, agencies }) });
    const j = await r.json().catch(() => ({})); setBusy(false);
    if (r.ok) { setSent(agencies.length); track('Lead', { content_name: agencies.length > 1 ? 'multi_quote' : 'profile_quote', num_items: agencies.length }); } else setErr(j.error || 'Алдаа гарлаа');
  }
  if (sent) return <div className="panel ok" style={{ padding: 18 }}><b>Хүсэлт {sent} агентлагт илгээгдлээ ✓</b><p style={{ marginTop: 6 }}>Агентлагууд тантай шууд холбогдоно. 3 хоногийн дараа «холбогдсон уу» гэж и-мэйлээр асууж, хариулт чинь бусдад аль агентлаг хурдан болохыг харуулна.</p></div>;
  if (!open) return <button className="btn lime" style={{ padding: 16, fontSize: 16 }} onClick={() => setOpen(true)} data-track="social">{T.length > 1 ? `${T.length} агентлагаас үнийн санал авах →` : 'Үнийн санал авах →'}</button>;
  return <form onSubmit={send} className="panel" style={{ padding: 18, display: 'grid', gap: 10, boxShadow: 'inset 0 0 0 2px var(--l)' }}>
    <b className="h" style={{ fontSize: 17 }}>{title}</b>
    <input className="field" style={{ marginTop: 0 }} placeholder="Нэр *" required value={f.name} onChange={set('name')} aria-label="Нэр" />
    <input className="field" style={{ marginTop: 0 }} placeholder="Байгууллага" value={f.company} onChange={set('company')} aria-label="Байгууллага" />
    <input className="field" style={{ marginTop: 0 }} placeholder="Утас *" inputMode="tel" value={f.phone} onChange={set('phone')} aria-label="Утас" />
    <input className="field" style={{ marginTop: 0 }} placeholder="И-мэйл (хариу хурдыг асуухад)" type="email" value={f.email} onChange={set('email')} aria-label="И-мэйл" />
    <textarea className="field" style={{ marginTop: 0 }} rows={3} placeholder="Юу хэрэгтэй байна? (брэнд, ажил, төсөв)" value={f.note} onChange={set('note')} aria-label="Хэрэгцээ" />
    {suggest.length > 0 && <div style={{ background: 'var(--bg)', borderRadius: 14, padding: '10px 12px', display: 'grid', gap: 6 }}>
      <span style={{ fontWeight: 700, fontSize: 14 }}>Харьцуулахын тулд эднээс ч санал ав</span>
      {suggest.map(s => <label key={s.slug} className="row" style={{ gap: 8, flexWrap: 'nowrap', fontSize: 14.5 }}><input type="checkbox" checked={extra.includes(s.slug)} onChange={e => setExtra(x => e.target.checked ? [...x, s.slug] : x.filter(y => y !== s.slug))} />{s.name}{s.badge && <span className="badge b-act">{s.badge}</span>}</label>)}
    </div>}
    {err && <div className="err">{err}</div>}
    <button className="btn dark" disabled={busy}>{busy ? 'Илгээж байна…' : `Илгээх${T.length + extra.length > 1 ? ` (${T.length + extra.length} агентлаг)` : ''} →`}</button>
    <p style={{ color: 'var(--mute)', fontSize: 13, margin: 0 }}>Үнэгүй. Мэдээллийг зөвхөн сонгосон агентлагуудад дамжуулна.{T.length === 1 && <> <Link href="/songoh" style={{ textDecoration: 'underline' }}>Хэрэгцээгээр нь тохирохыг олох</Link></>}</p>
  </form>;
}
