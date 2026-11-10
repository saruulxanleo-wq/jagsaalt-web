'use client';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { NICHES, REACH, fbPic, withUtm } from '@/lib/config';
const fmtNum = n => n >= 1e6 ? (n / 1e6).toFixed(1).replace('.0', '') + 'M' : n >= 1e3 ? Math.round(n / 1e3) + 'K' : String(n || 0);
const track = (id, kind) => { if (!/^[0-9a-f-]{36}$/.test(id)) return; const body = JSON.stringify({ iid: id, kind }); navigator.sendBeacon?.('/api/track', new Blob([body], { type: 'application/json' })); };
const PL = [['fb', 'Facebook', l => l.fb_url, l => l.fb_followers], ['ig', 'Instagram', l => l.ig && 'https://www.instagram.com/' + l.ig, l => l.ig_followers], ['tt', 'TikTok', l => l.tiktok && 'https://www.tiktok.com/@' + l.tiktok, l => l.tiktok_followers], ['yt', 'YouTube', l => l.youtube, l => l.yt_followers]];
function Photo({ l }) {
  const [bad, setBad] = useState(false); const src = l.photo_url || (l.fb_url && fbPic(l.fb_url));
  return src && !bad ? <img src={src} alt="" loading="lazy" onError={() => setBad(true)} className="logoimg" style={{ width: 56, height: 56, borderRadius: '50%' }} />
    : <span className="logoimg licon" style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--v)', color: '#fff', fontSize: 22 }}>{l.name.trim()[0]}</span>;
}
function Card({ l }) {
  return <div className="card">
    <div className="top"><Photo l={l} /><div style={{ minWidth: 0 }}><h3>{l.name}</h3><div style={{ fontSize: 14, color: 'var(--mute)', fontWeight: 600 }}>Нийт {fmtNum(l.reach)} дагагч</div></div></div>
    <div className="row" style={{ gap: 6 }}>{(l.niches || []).map(k => <span key={k} className="badge b-off">{NICHES[k] || k}</span>)}</div>
    <div className="pls">{PL.map(([k, lab, url, n]) => url(l) && <a key={k} href={withUtm(url(l), 'influencer')} target="_blank" rel="noopener" className={'pl pl-' + k} onClick={() => track(l.id, 'social')}><b>{lab}</b><span>{n(l) ? fmtNum(n(l)) : '—'}</span></a>)}</div>
  </div>;
}
export default function Influencers({ list }) {
  const [q, setQ] = useState(''); const [ni, setNi] = useState('all'); const [rc, setRc] = useState('all'); const [pf, setPf] = useState('all'); const [n, setN] = useState(36);
  const counts = useMemo(() => list.reduce((m, l) => ((l.niches || []).forEach(k => m[k] = (m[k] || 0) + 1), m), {}), [list]);
  const R = REACH.find(r => r[0] === rc);
  const shown = list.filter(l => (ni === 'all' || (l.niches || []).includes(ni)) && l.reach >= R[2] && l.reach < R[3]
    && (pf === 'all' || (pf === 'fb' ? l.fb_url : pf === 'ig' ? l.ig : l.tiktok))
    && (!q.trim() || (l.name + ' ' + (l.ig || '') + ' ' + (l.bio || '')).toLowerCase().includes(q.trim().toLowerCase())));
  return <section className="wrap" style={{ marginTop: 10 }}>
    <h1 className="h" style={{ fontSize: 'clamp(28px,3.6vw,42px)', fontWeight: 800 }}>Монголын инфлүэнсерүүд</h1>
    <p style={{ color: 'var(--mute)', fontSize: 17, marginTop: 8, maxWidth: 720 }}>Facebook, Instagram, TikTok-д 10 000-аас дээш дагагчтай {list.length} бүтээгч. Чиглэл, хүрээгээр шүүгээд шууд хуудас руу нь ороорой.</p>
    <div className="row" style={{ marginTop: 18, gap: 10 }}>
      <input className="field" style={{ marginTop: 0, maxWidth: 340, borderRadius: 999 }} placeholder="Нэрээр хайх…" value={q} onChange={e => setQ(e.target.value)} aria-label="Хайх" />
      <select className="field" style={{ marginTop: 0, width: 'auto', borderRadius: 999 }} value={rc} onChange={e => setRc(e.target.value)} aria-label="Дагагч">{REACH.map(r => <option key={r[0]} value={r[0]}>{r[0] === 'all' ? 'Дагагч: бүгд' : r[1]}</option>)}</select>
      <select className="field" style={{ marginTop: 0, width: 'auto', borderRadius: 999 }} value={pf} onChange={e => setPf(e.target.value)} aria-label="Платформ"><option value="all">Платформ: бүгд</option><option value="fb">Facebook</option><option value="ig">Instagram</option><option value="tt">TikTok</option></select>
      <Link href="/nemeh?type=influencer" className="btn dark">+ Инфлүэнсер нэмэх</Link>
    </div>
    <div className="row chips" style={{ gap: 8, marginTop: 16 }}>
      <button className={'chip' + (ni === 'all' ? ' on' : '')} onClick={() => setNi('all')}>Бүгд<span>{list.length}</span></button>
      {Object.keys(NICHES).filter(k => counts[k]).map(k => <button key={k} className={'chip' + (ni === k ? ' on' : '')} onClick={() => setNi(k)}>{NICHES[k]}<span>{counts[k]}</span></button>)}
    </div>
    <div className="grid" style={{ marginTop: 20 }}>{shown.slice(0, n).map(l => <Card key={l.slug} l={l} />)}</div>
    {shown.length > n && <div style={{ textAlign: 'center', marginTop: 24 }}><button className="btn ghost" onClick={() => setN(n + 36)}>Цааш үзэх ({shown.length - n})</button></div>}
    {!shown.length && <div className="panel" style={{ marginTop: 20, textAlign: 'center' }}>Олдсонгүй.</div>}
    <p style={{ color: 'var(--mute)', fontSize: 14, marginTop: 28, maxWidth: 760 }}>Дагагчийн тоог нийтэд нээлттэй эх сурвалжаас авсан, бодит тооноос зөрж болно. Энэ таны профайл бөгөөд засуулах эсвэл хасуулах бол <Link href="/aldaa" style={{ textDecoration: 'underline' }}>энд мэдэгдээрэй</Link>.</p>
  </section>;
}
