'use client';
import { useState } from 'react';
import { PickImg, uploadImg } from './PickImg';
import Link from 'next/link';
import CatPicker from '../CatPicker';
import FbPreview from '../FbPreview';
import ListingForm from './ListingForm';
import InfluencerForm from './InfluencerForm';
import { TYPES } from '@/lib/config';
import Who from './Who';
import { useSearchParams } from 'next/navigation';
export default function AddForm({ type: t0 }) {
  const [type, setType] = useState(TYPES[t0] || t0 === 'influencer' ? t0 : 'agency');
  const [who, setWho] = useState(useSearchParams().get('who') === 'self' ? 'self' : null);
  const [f, setF] = useState({ fb_url: '', name: '', categories: [] });
  const [img, setImg] = useState(null); const [msg, setMsg] = useState(null); const [busy, setBusy] = useState(false); const [done, setDone] = useState(false);
  const set = k => e => setF({ ...f, [k]: e.target.value });
  async function submit(e) {
    e.preventDefault(); setBusy(true); setMsg(null);
    const r = await fetch('/api/submit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(f) });
    const j = await r.json().catch(() => ({})); if (r.ok) await uploadImg(j.img, img); setBusy(false);
    r.ok ? setDone(true) : setMsg(j.error || 'Алдаа гарлаа');
  }
  return <section className="wrap" style={{ marginTop: 20, maxWidth: 860 }}>
    <h1 className="h" style={{ fontSize: 'clamp(32px,5vw,44px)', fontWeight: 800 }}>Жагсаалтад нэмэх</h1>
    <p style={{ color: 'var(--mute)', marginTop: 10, fontSize: 18 }}>Үнэгүй. Хэн ч санал болгож болно, админ шалгаад нийтэлнэ.</p>
    <div className="row" style={{ marginTop: 20, gap: 8 }}>{[['agency', '🏢 Агентлаг'], ['influencer', '⭐ Инфлүэнсер'], ...Object.entries(TYPES).map(([k, v]) => [k, v.icon + ' ' + v.label])].map(([k, l]) => <button key={k} type="button" className={'chip' + (type === k ? ' on' : '')} onClick={() => { setType(k); history.replaceState(null, '', k === 'agency' ? '/nemeh' : '/nemeh?type=' + k); }}>{l}</button>)}</div>
    <Who key={type} type={type} who={who} setWho={setWho}>
    {type === 'influencer' ? <InfluencerForm self={who === 'self'} /> : type !== 'agency' ? <ListingForm key={type} type={type} self={who === 'self'} /> : <>
    {done ? <div className="panel ok" style={{ marginTop: 22, fontSize: 17 }}>Баярлалаа! Админ шалгаад жагсаалтад нэмнэ.</div> :
    <form onSubmit={submit} className="panel" style={{ marginTop: 18, display: 'grid', gap: 18 }}>
      <div><label htmlFor="fb" className="lab">Facebook хуудасны линк</label><input id="fb" required className="field" placeholder="facebook.com/..." value={f.fb_url} onChange={set('fb_url')} /><FbPreview url={f.fb_url} onName={n => setF(f => f.name ? f : { ...f, name: n })} /></div>
      <div><label htmlFor="nm" className="lab">Агентлагийн нэр</label><input id="nm" required className="field" value={f.name} onChange={set('name')} /></div>
      <CatPicker value={f.categories} onChange={v => setF({ ...f, categories: v })} />
      <PickImg file={img} onChange={setImg} label="Лого" hint="Facebook хуудаснаас лого автоматаар татна. Татаж чадахгүй бол энэ зургийг ашиглана." />
        {msg && <div className="err">{msg}</div>}
      <button className="btn dark" disabled={busy || !f.categories.length} style={{ padding: 16 }}>{busy ? 'Түр хүлээ…' : 'Санал болгох →'}</button>
    </form>}</>}
    </Who>
  </section>;
}
