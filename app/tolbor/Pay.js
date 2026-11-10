'use client';
import { useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/sbclient';
import { PRODUCTS, priceFor, fmtMnt, TYPES } from '@/lib/config';
export function BankBox({ r }) {
  const b = r.bank || {}; const copy = t => navigator.clipboard?.writeText(t);
  return <div className="panel ok" style={{ display: 'grid', gap: 10 }}>
    <b className="h" style={{ fontSize: 20 }}>Захиалга үүслээ ✓</b>
    {b.account ? <>
      <div>Банк: <b>{b.name}</b></div>
      <div>Данс: <b>{b.account}</b> <button type="button" className="btn ghost" style={{ padding: '4px 10px' }} onClick={() => copy(b.account)}>Хуулах</button></div>
      <div>Хүлээн авагч: <b>{b.holder}</b></div>
    </> : <div>Дансны мэдээллийг удахгүй и-мэйлээр илгээнэ.</div>}
    <div>Дүн: <b>{fmtMnt(r.amount)}</b></div>
    <div>Гүйлгээний утга: <b className="h" style={{ fontSize: 22, letterSpacing: 1 }}>{r.code}</b> <button type="button" className="btn ghost" style={{ padding: '4px 10px' }} onClick={() => copy(r.code)}>Хуулах</button></div>
    <p style={{ color: 'var(--mute)', margin: 0 }}>Гүйлгээний утгад заавал <b>{r.code}</b> гэж бичээрэй. Төлбөр орсны дараа ажлын цагаар 1–2 цагт идэвхжинэ.</p>
  </div>;
}
export default function Pay({ product, target, slug, listings }) {
  const P = PRODUCTS[product]; const [t, setT] = useState(target || ''); const [m, setM] = useState(1); const [contact, setContact] = useState('');
  const [busy, setBusy] = useState(false); const [err, setErr] = useState(null); const [res, setRes] = useState(null);
  if (!P) return <section className="wrap" style={{ marginTop: 20 }}><Link href="/une" className="btn dark">Үнийн санал үзэх →</Link></section>;
  async function go(e) {
    e.preventDefault(); setBusy(true); setErr(null);
    const r = await api('/api/order', { product, target: t, slug, months: m, contact }); setBusy(false);
    r.ok ? setRes(r) : setErr(r.error === 'Нэвтэрнэ үү' ? 'Эхлээд «Миний агентлаг» хэсгээр нэвтэрнэ үү.' : r.error);
  }
  return <section className="wrap" style={{ marginTop: 10, maxWidth: 640 }}>
    <h1 className="h" style={{ fontSize: 32, fontWeight: 800 }}>{P.icon} {P.label}</h1>
    {res ? <div style={{ marginTop: 18 }}><BankBox r={res} /></div> : <form onSubmit={go} className="panel" style={{ marginTop: 18, display: 'grid', gap: 16 }}>
      {product === 'listing_sponsor' && <div><label htmlFor="tl" className="lab">Аль хэрэгсэл, сургалт вэ?</label>
        <select id="tl" className="field" required value={t} onChange={e => setT(e.target.value)}><option value="">Сонгох…</option>{listings.map(l => <option key={l.id} value={l.id}>{l.name} · {TYPES[l.type]?.label}</option>)}</select>
        <p style={{ color: 'var(--mute)', fontSize: 14, marginTop: 6 }}>Жагсаалтад байхгүй бол эхлээд <Link href="/nemeh?type=tool" style={{ textDecoration: 'underline' }}>нэмээрэй</Link> (үнэгүй).</p></div>}
      {P.monthly && <div><span className="lab">Хугацаа</span><div className="row" style={{ marginTop: 8 }}>
        {[1, 3].map(x => <button type="button" key={x} className={'chip' + (m === x ? ' on' : '')} onClick={() => setM(x)}>{x} сар · {fmtMnt(priceFor(product, x))}{x === 3 && ' (−15%)'}</button>)}</div></div>}
      <div><label htmlFor="pc" className="lab">Холбоо барих утас эсвэл и-мэйл</label><input id="pc" className="field" maxLength={100} required={product === 'listing_sponsor'} value={contact} onChange={e => setContact(e.target.value)} /></div>
      <div style={{ fontSize: 18 }}>Төлөх дүн: <b>{fmtMnt(priceFor(product, m))}</b></div>
      {err && <div className="err">{err}</div>}
      <button className="btn dark" disabled={busy} style={{ padding: 16 }}>{busy ? 'Түр хүлээ…' : 'Захиалах →'}</button>
    </form>}
  </section>;
}
