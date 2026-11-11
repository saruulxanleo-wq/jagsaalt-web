'use client';
import { track } from '@/lib/track';
import { useState } from 'react';
import { api } from '@/lib/sbclient';
import Link from 'next/link';
import { NICHES } from '@/lib/config';
const S = { color: 'var(--mute)', fontWeight: 500 };
export default function InfluencerForm({ self }) {
  const [f, setF] = useState({ name: '', fb: '', ig: '', ig_followers: '', tiktok: '', tiktok_followers: '', youtube: '', bio: '', niches: [], contact: '' });
  const mine = !!self; const [msg, setMsg] = useState(null); const [busy, setBusy] = useState(false); const [done, setDone] = useState(false);
  const set = k => e => setF({ ...f, [k]: e.target.value });
  const tog = k => setF({ ...f, niches: f.niches.includes(k) ? f.niches.filter(x => x !== k) : f.niches.length >= 3 ? f.niches : [...f.niches, k] });
  async function submit(e) {
    e.preventDefault(); setBusy(true); setMsg(null);
    const r = await api('/api/influencer/submit', { ...f, mine }); setBusy(false); if (r.ok && r.own) { location.href = '/minii?own=' + r.own; return; } if (r.claimed) setMsg(null); r.ok ? (setDone(true), track('SubmitApplication', { content_name: 'influencer' })) : setMsg(r.error || 'Алдаа гарлаа');
  }
  if (done) return <div className="panel ok" style={{ marginTop: 22, fontSize: 17 }}>{self ? 'Баярлалаа! Бид шалгаад нийтэлж, «✓ Баталгаажсан» болгоно. Батлагдмагц и-мэйлээр мэдэгдэнэ.' : 'Баярлалаа! Админ шалгаад нийтэлнэ.'} <Link href="/influencer" style={{ textDecoration: 'underline' }}>Инфлүэнсерүүд →</Link></div>;
  const pair = (k, lab, ph, nk) => <div className="row" style={{ gap: 10, alignItems: 'flex-end' }}>
    <div style={{ flex: 2, minWidth: 200 }}><label htmlFor={k} className="lab">{lab}</label><input id={k} className="field" placeholder={ph} value={f[k]} onChange={set(k)} /></div>
    {nk && <div style={{ flex: 1, minWidth: 120 }}><label htmlFor={nk} className="lab">Дагагч</label><input id={nk} className="field" inputMode="numeric" placeholder="25000" value={f[nk]} onChange={set(nk)} /></div>}</div>;
  return <form onSubmit={submit} className="panel" style={{ marginTop: 18, display: 'grid', gap: 18 }}>
    <div><label htmlFor="in" className="lab">Нэр</label><input id="in" required className="field" maxLength={80} placeholder="Нэр эсвэл хочоо" value={f.name} onChange={set('name')} /></div>
    <p style={{ color: 'var(--mute)', margin: 0 }}>Ядаж нэг хаяг оруул. Facebook-ийн дагагчийг автоматаар татна.</p>
    {pair('fb', 'Facebook', 'facebook.com/…')}
    {pair('ig', 'Instagram', '@хаяг', 'ig_followers')}
    {pair('tiktok', 'TikTok', '@хаяг', 'tiktok_followers')}
    {pair('youtube', 'YouTube', 'youtube.com/@…')}
    <div><span className="lab">Чиглэл <span style={S}>· 1–3 ({f.niches.length}/3)</span></span>
      <div className="row" style={{ marginTop: 9 }}>{Object.entries(NICHES).map(([k, v]) => { const on = f.niches.includes(k); return <button type="button" key={k} aria-pressed={on} className={'chip' + (on ? ' on' : '')} onClick={() => tog(k)}>{on && '✓ '}{v}</button>; })}</div></div>
    <div><label htmlFor="ib" className="lab">Товч танилцуулга <span style={S}>· заавал биш</span></label><input id="ib" className="field" maxLength={160} value={f.bio} onChange={set('bio')} /></div>
    <div><label htmlFor="ic" className="lab">Хамтран ажиллах утас эсвэл и-мэйл <span style={S}>· зөвхөн админ харна</span></label><input id="ic" className="field" maxLength={80} value={f.contact} onChange={set('contact')} /></div>
    {msg && <div className="err">{msg}</div>}
    <button className="btn dark" disabled={busy || !f.niches.length} style={{ padding: 16 }}>{busy ? 'Түр хүлээ…' : self ? 'Үргэлжлүүлэх: баталгаажуулах →' : 'Санал болгох →'}</button>
  </form>;
}
