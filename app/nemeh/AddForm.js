'use client';
import { useState } from 'react';
import Link from 'next/link';
import CatPicker from '../CatPicker';
import FbPreview from '../FbPreview';
import ListingForm from './ListingForm';
import InfluencerForm from './InfluencerForm';
import { TYPES } from '@/lib/config';
export default function AddForm({ type: t0 }) {
  const [type, setType] = useState(TYPES[t0] || t0 === 'influencer' ? t0 : 'agency');
  const [f, setF] = useState({ fb_url: '', name: '', categories: [] });
  const [msg, setMsg] = useState(null); const [busy, setBusy] = useState(false); const [done, setDone] = useState(false);
  const set = k => e => setF({ ...f, [k]: e.target.value });
  async function submit(e) {
    e.preventDefault(); setBusy(true); setMsg(null);
    const r = await fetch('/api/submit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(f) });
    const j = await r.json().catch(() => ({})); setBusy(false);
    r.ok ? setDone(true) : setMsg(j.error || 'Алдаа гарлаа');
  }
  return <section className="wrap" style={{ marginTop: 20, maxWidth: 860 }}>
    <h1 className="h" style={{ fontSize: 'clamp(32px,5vw,44px)', fontWeight: 800 }}>Жагсаалтад нэмэх</h1>
    <p style={{ color: 'var(--mute)', marginTop: 10, fontSize: 18 }}>Хэн ч санал болгож болно, үнэгүй. Админ шалгаад нийтэлнэ.</p>
    <div className="row" style={{ marginTop: 20, gap: 8 }}>{[['agency', '🏢 Агентлаг'], ['influencer', '⭐ Инфлүэнсер'], ...Object.entries(TYPES).map(([k, v]) => [k, v.icon + ' ' + v.label])].map(([k, l]) => <button key={k} type="button" className={'chip' + (type === k ? ' on' : '')} onClick={() => { setType(k); history.replaceState(null, '', k === 'agency' ? '/nemeh' : '/nemeh?type=' + k); }}>{l}</button>)}</div>
    {type === 'influencer' ? <InfluencerForm /> : type !== 'agency' ? <ListingForm key={type} type={type} /> : <>
    <Link href="/minii" className="panel row" style={{ marginTop: 22, padding: '20px 24px', boxShadow: 'inset 0 0 0 3px var(--v)', justifyContent: 'space-between' }}>
      <span><b className="h" style={{ fontSize: 17, fontWeight: 700 }}>Энэ миний агентлаг уу?</b><br /><span style={{ color: 'var(--mute)' }}>Нэвтэрч утсаа баталгаажуулаад эзэмших хүсэлт илгээ. Баталгаажсан тэмдэг авч, профайлаа өөрөө засна.</span></span>
      <span className="btn v">Нэвтрэх →</span></Link>
    {done ? <div className="panel ok" style={{ marginTop: 22, fontSize: 17 }}>Баярлалаа! Админ шалгаад жагсаалтад нэмнэ.</div> :
    <form onSubmit={submit} className="panel" style={{ marginTop: 18, display: 'grid', gap: 18 }}>
      <div><label htmlFor="fb" className="lab">Facebook хуудасны линк</label><input id="fb" required className="field" placeholder="facebook.com/..." value={f.fb_url} onChange={set('fb_url')} /><FbPreview url={f.fb_url} onName={n => setF(f => f.name ? f : { ...f, name: n })} /></div>
      <div><label htmlFor="nm" className="lab">Агентлагийн нэр</label><input id="nm" required className="field" value={f.name} onChange={set('name')} /></div>
      <CatPicker value={f.categories} onChange={v => setF({ ...f, categories: v })} />
      {msg && <div className="err">{msg}</div>}
      <button className="btn dark" disabled={busy || !f.categories.length} style={{ padding: 16 }}>{busy ? 'Түр хүлээ…' : 'Санал болгох →'}</button>
    </form>}</>}
  </section>;
}
