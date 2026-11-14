'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Logo } from '../../Card';
import { CONTACT, HIRED } from '@/lib/reviews';
const Pick = ({ opts, v, on }) => <div className="row" style={{ gap: 8, marginTop: 8 }}>{Object.entries(opts).map(([k, l]) => <button type="button" key={k} className={'chip' + (v === k ? ' on' : '')} onClick={() => on(k)}>{l}</button>)}</div>;
export default function SurveyForm({ id, t, agencies }) {
  const [f, setF] = useState(Object.fromEntries(agencies.map(a => [a.slug, { contacted: null, hired: null, rating: 0, comment: '' }])));
  const [busy, setBusy] = useState(false); const [err, setErr] = useState(null); const [sent, setSent] = useState(false);
  const set = (s, k, v) => setF(x => ({ ...x, [s]: { ...x[s], [k]: v } }));
  const todo = agencies.filter(a => !a.done);
  async function send(e) {
    e.preventDefault(); setErr(null);
    const items = todo.map(a => ({ slug: a.slug, ...f[a.slug] })).filter(x => x.contacted);
    if (!items.length) return setErr('Ядаж нэг агентлагийн хувьд «холбогдсон уу»-д хариулаарай');
    setBusy(true);
    const r = await fetch('/api/review', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, t, items }) });
    const j = await r.json().catch(() => ({})); setBusy(false);
    if (r.ok) setSent(true); else setErr(j.error || 'Алдаа гарлаа');
  }
  if (sent || !todo.length) return <div className="panel ok" style={{ marginTop: 24, padding: 24 }}><b style={{ fontSize: 18 }}>Баярлалаа ✓</b><p style={{ marginTop: 6 }}>Хариулт тань бүртгэгдлээ. Өөр агентлаг харьцуулах бол <Link href="/songoh" style={{ textDecoration: 'underline' }}>энд</Link>.</p></div>;
  return <form onSubmit={send} style={{ display: 'grid', gap: 16, marginTop: 24 }}>
    {todo.map(a => { const v = f[a.slug]; return <div key={a.slug} className="panel" style={{ padding: 22 }}>
      <div className="row" style={{ gap: 12, flexWrap: 'nowrap' }}><Logo a={a} size={44} radius={12} /><b className="h" style={{ fontSize: 19 }}>{a.name}</b></div>
      <div style={{ marginTop: 16 }}><span className="lab">Холбогдсон уу?</span><Pick opts={CONTACT} v={v.contacted} on={x => set(a.slug, 'contacted', x)} /></div>
      {v.contacted && v.contacted !== 'no' && <>
        <div style={{ marginTop: 16 }}><span className="lab">Ажил болсон уу?</span><Pick opts={HIRED} v={v.hired} on={x => set(a.slug, 'hired', x)} /></div>
        <div style={{ marginTop: 16 }}><span className="lab">Харилцаа, саналын чанарыг үнэл</span>
          <div className="row" style={{ gap: 4, marginTop: 6 }}>{[1, 2, 3, 4, 5].map(n => <button type="button" key={n} aria-label={n + ' од'} onClick={() => set(a.slug, 'rating', n)} style={{ fontSize: 30, lineHeight: 1, background: 'none', border: 0, cursor: 'pointer', color: n <= v.rating ? '#F5B301' : '#D9D6E3' }}>★</button>)}</div></div>
        <div style={{ marginTop: 14 }}><label className="lab" htmlFor={'c' + a.slug}>Сэтгэгдэл <span style={{ color: 'var(--mute)', fontWeight: 500 }}>· заавал биш, нийтэд харагдана</span></label>
          <textarea id={'c' + a.slug} className="field" rows={2} maxLength={400} placeholder="Юу нь таалагдсан, юу нь дутсан бэ?" value={v.comment} onChange={e => set(a.slug, 'comment', e.target.value)} /></div>
      </>}
    </div>; })}
    {err && <div className="err">{err}</div>}
    <button className="btn dark" disabled={busy} style={{ justifySelf: 'start', padding: '15px 28px' }}>{busy ? 'Илгээж байна…' : 'Илгээх →'}</button>
  </form>;
}
