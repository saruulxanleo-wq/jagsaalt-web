'use client';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import Card from './Card';
import { CATS, isActive, catsOf } from '@/lib/config';
export default function Directory({ list }) {
  const [q, setQ] = useState(''); const [cat, setCat] = useState('all'); const [sort, setSort] = useState('followers'); const [n, setN] = useState(24);
  const counts = useMemo(() => list.reduce((m, a) => (catsOf(a).forEach(k => m[k] = (m[k] || 0) + 1), m), {}), [list]);
  const shown = useMemo(() => {
    const s = q.trim().toLowerCase();
    let r = list.filter(a => (cat === 'all' || catsOf(a).includes(cat)) && (!s || a.name.toLowerCase().includes(s) || (a.description || '').toLowerCase().includes(s)));
    if (sort === 'name') r = [...r].sort((x, y) => x.name.localeCompare(y.name));
    return r;
  }, [list, q, cat, sort]);
  const active = list.filter(a => isActive(a)).length, verified = list.filter(a => a.verified).length;
  return <>
    <header className="wrap hero" style={{ paddingTop: 20, paddingBottom: 28, position: 'relative' }}>
      <div className="deco" aria-hidden>
        <i style={{ right: 30, top: 0, width: 150, height: 150, borderRadius: '50%', background: 'var(--l)' }} />
        <i style={{ right: 140, top: 80, width: 96, height: 96, borderRadius: 26, background: 'var(--c)', transform: 'rotate(14deg)' }} />
        <i style={{ right: 0, top: 100, width: 86, height: 86, borderRadius: '50%', background: 'var(--v)' }} />
        {list.filter(a => a.logo_url).slice(0, 3).map((a, i) => <img key={a.slug} src={a.logo_url} alt="" style={[{ right: 70, top: 30, width: 58, height: 58, transform: 'rotate(-8deg)', borderRadius: 16 }, { right: 160, top: 100, width: 52, height: 52, transform: 'rotate(6deg)', borderRadius: 14 }, { right: 18, top: 118, width: 48, height: 48, borderRadius: 14 }][i]} />)}
      </div>
      <h1 className="h" style={{ fontSize: 'clamp(28px,3.6vw,46px)', fontWeight: 800, maxWidth: 760 }}>Монголын маркетингийн агентлагууд <span style={{ color: 'var(--v)' }}>нэг дор</span></h1>
      <div style={{ marginTop: 18, display: 'flex', gap: 10, background: '#fff', borderRadius: 999, padding: '6px 6px 6px 22px', maxWidth: 640, boxShadow: '0 16px 40px -24px #6a3df066, inset 0 0 0 2px var(--ink)' }}>
        <label htmlFor="q" style={{ position: 'absolute', left: -9999 }}>Хайх</label>
        <input id="q" value={q} onChange={e => { setQ(e.target.value); setN(24); }} placeholder="Агентлагийн нэрээр хайх…" style={{ flex: 1, border: 0, outline: 0, fontSize: 17, background: 'transparent', minWidth: 0 }} />
        <span className="btn v" style={{ padding: '11px 22px' }}>Хайх</span>
      </div>
      <div className="row" style={{ marginTop: 12, gap: 18, color: 'var(--mute)', fontWeight: 600, fontSize: 14.5 }}>
        <span><b style={{ color: 'var(--ink)' }}>{list.length}</b> агентлаг</span>
        {active > 0 && <span><span className="dot" />&nbsp;<b style={{ color: 'var(--ink)' }}>{active}</b> идэвхтэй</span>}{verified > 0 && <span><b style={{ color: 'var(--ink)' }}>{verified}</b> баталгаажсан</span>}
        <Link href="/nemeh" style={{ color: 'var(--v)' }}>Жагсаалтад алга уу? Нэмэх →</Link>
      </div>
    </header>
    <section className="wrap">
      <div className="row chips" style={{ gap: 10 }}>
        <button className={'chip' + (cat === 'all' ? ' on' : '')} onClick={() => setCat('all')}>Бүгд<span>{list.length}</span></button>
        {Object.entries(CATS).filter(([k]) => counts[k]).map(([k, c]) => <button key={k} className={'chip' + (cat === k ? ' on' : '')} onClick={() => { setCat(k); setN(24); }}>{c.label}<span>{counts[k]}</span></button>)}
      </div>
      <div className="row" style={{ justifyContent: 'space-between', margin: '22px 0 16px' }}>
        <h2 className="h" style={{ fontSize: 24, fontWeight: 700 }}>{cat === 'all' ? 'Бүх агентлаг' : CATS[cat].label} <span style={{ color: 'var(--mute)', fontSize: 18 }}>{shown.length}</span></h2>
        <label className="row" style={{ background: '#fff', padding: '9px 14px', borderRadius: 12, boxShadow: 'inset 0 0 0 1.5px var(--line)', fontWeight: 600, fontSize: 14.5 }}>Эрэмбэ:
          <select value={sort} onChange={e => setSort(e.target.value)} style={{ border: 0, background: 'transparent', fontWeight: 600 }}><option value="followers">Дагагчаар</option><option value="name">Нэрээр</option></select></label>
      </div>
      <div className="grid">{shown.slice(0, n).map(a => <Card key={a.slug} a={a} />)}</div>
      {shown.length === 0 && <p style={{ textAlign: 'center', color: 'var(--mute)', padding: 40 }}>Олдсонгүй. <Link href="/nemeh" style={{ color: 'var(--v)', fontWeight: 700 }}>Нэмэх үү?</Link></p>}
      {shown.length > n && <div style={{ textAlign: 'center', marginTop: 28 }}><button className="btn ghost" onClick={() => setN(n + 24)}>Цааш үзэх · {shown.length - n} үлдсэн</button></div>}
      <div style={{ marginTop: 64, borderRadius: 36, background: 'var(--v)', color: '#fff', padding: '48px 40px', position: 'relative', overflow: 'hidden' }}>
        <div aria-hidden style={{ position: 'absolute', right: -60, bottom: -90, width: 300, height: 300, borderRadius: '50%', background: 'var(--l)' }} />
        <div style={{ position: 'relative', maxWidth: 620 }}>
          <h2 className="h" style={{ fontSize: 'clamp(28px,4vw,40px)', fontWeight: 800 }}>Агентлаг чинь жагсаалтад алга уу?</h2>
          <p style={{ fontSize: 18, marginTop: 14, color: '#EDE6FF' }}>Хэн ч нэмж болно. Агентлагийн эзэн бол SMS-ээр баталгаажаад <b style={{ color: '#fff' }}>Баталгаажсан</b> тэмдэг аваарай.</p>
          <Link href="/nemeh" className="btn lime" style={{ marginTop: 24, padding: '15px 26px' }}>+ Агентлагаа нэмэх</Link>
        </div>
      </div>
    </section>
  </>;
}
