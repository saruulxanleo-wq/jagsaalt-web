'use client';
import { track } from '@/lib/track';
import { useState } from 'react';
import { SUB_ROLES } from '@/lib/config';
// Маркетингийнхны имэйл бүртгэл. variant: 'footer' (бараан дэвсгэр) | 'card'
export default function Subscribe({ source = 'site', variant = 'card' }) {
  const [email, setEmail] = useState(''); const [role, setRole] = useState(''); const [st, setSt] = useState(null); const [busy, setBusy] = useState(false);
  const dark = variant === 'footer';
  async function go(e) {
    e.preventDefault(); setBusy(true); setSt(null);
    const r = await fetch('/api/subscribe', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, role, source }) });
    const j = await r.json().catch(() => ({})); setBusy(false);
    setSt(r.ok ? (j.already ? 'already' : 'sent') : (j.error || 'Алдаа гарлаа'));
    if (r.ok) track('CompleteRegistration', { content_name: 'newsletter_' + source });
  }
  return <div className={'subbox' + (dark ? ' dark' : '')}>
    <div><b className="h" style={{ fontSize: dark ? 18 : 20 }}>Маркетингийн сар бүрийн тойм</b>
      <p style={{ marginTop: 6, fontSize: 14.5, opacity: .8 }}>Монголын зарын зах зээлийн тоо, шинэ агентлаг, хэрэгсэл, ажлын байр — сард нэг имэйл. Үнэгүй.</p></div>
    {st === 'sent' ? <p style={{ fontWeight: 700 }}>✓ Баталгаажуулах линкийг {email} руу илгээлээ. Имэйлээ шалгаарай.</p>
      : st === 'already' ? <p style={{ fontWeight: 700 }}>✓ Та аль хэдийн бүртгэлтэй байна.</p>
      : <form onSubmit={go} className="row" style={{ gap: 8 }}>
        <input className="field" type="email" required placeholder="И-мэйл хаяг" value={email} onChange={e => setEmail(e.target.value)} aria-label="И-мэйл" style={{ marginTop: 0, flex: '2 1 200px' }} />
        <select className="field" value={role} onChange={e => setRole(e.target.value)} aria-label="Та хэн бэ" style={{ marginTop: 0, flex: '1 1 160px' }}><option value="">Би бол…</option>{Object.entries(SUB_ROLES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
        <button className={dark ? 'btn lime' : 'btn dark'} disabled={busy}>{busy ? '…' : 'Бүртгүүлэх'}</button>
        {st && <div className="err" style={{ flexBasis: '100%' }}>{st}</div>}
      </form>}
  </div>;
}
