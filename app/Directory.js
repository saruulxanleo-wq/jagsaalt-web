'use client';
import { Fragment, useEffect, useMemo, useState } from 'react';
import ToolStrip from './ToolStrip';
import Link from 'next/link';
import Card from './Card';
import { CATS, CAT_TOPIC, isActive, catsOf, catLabel, isFeatured, rankScore, TYPES, DIY } from '@/lib/config';
const shuffle = a => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
export default function Directory({ list, tools = [], initialCat = 'all', title }) {
  const [seed, setSeed] = useState(null); useEffect(() => setSeed(shuffle(tools)), [tools]);
  const [q, setQ] = useState(''); const [cat, setCat] = useState(initialCat); const [sort, setSort] = useState('rank'); const [n, setN] = useState(24);
  const counts = useMemo(() => list.reduce((m, a) => (catsOf(a).forEach(k => m[k] = (m[k] || 0) + 1), m), {}), [list]);
  const shown = useMemo(() => {
    const s = q.trim().toLowerCase();
    let r = list.filter(a => (cat === 'all' || catsOf(a).includes(cat)) && (!s || (a.name + ' ' + (a.description || '') + ' ' + (a.clients || []).join(' ') + ' ' + (a.services || []).join(' ')).toLowerCase().includes(s)));
    if (sort === 'name') r = [...r].sort((x, y) => x.name.localeCompare(y.name));
    else if (sort === 'followers') r = [...r].sort((x, y) => (y.followers || 0) - (x.followers || 0));
    else r = [...r].sort((x, y) => rankScore(y) - rankScore(x)); // баталгаажсан + профайлын бүрдэл + дагагч
    // Онцлох агентлагууд эхэнд (хуудас ачаалах бүрт дараалал нь солигдоно)
    const f = (seed ? shuffle(r.filter(isFeatured)) : r.filter(isFeatured));
    return f.length ? [...f, ...r.filter(a => !isFeatured(a))] : r;
  }, [list, q, cat, sort, seed]);
  // Хэрэгслийн мөр: эхний 6 картын дараа, дараа нь 12 карт тутамд. Онцлох → ангилалд таарах → бусад
  const pool = useMemo(() => { const base = seed || tools, tp = CAT_TOPIC[cat];
    const rank = l => (l.sponsored ? 0 : 2) + (tp && (l.topics || []).includes(tp) ? 0 : 1);
    return [...base].sort((x, y) => rank(x) - rank(y)); }, [seed, tools, cat]);
  const stripAt = i => pool.length >= 3 && !q.trim() && (i === 5 || (i > 5 && (i - 5) % 12 === 0));
  const stripItems = i => { const k = i === 5 ? 0 : (i - 5) / 12; return [0, 1, 2].map(j => pool[(k * 3 + j) % pool.length]).filter((l, j, a) => a.indexOf(l) === j); };
  const active = list.filter(a => isActive(a)).length, verified = list.filter(a => a.verified).length;
  return <>
    <header className="wrap hero" style={{ paddingTop: 20, paddingBottom: 28, position: 'relative' }}>
      <div className="deco" aria-hidden>
        <i style={{ right: 30, top: 0, width: 150, height: 150, borderRadius: '50%', background: 'var(--l)' }} />
        <i style={{ right: 140, top: 80, width: 96, height: 96, borderRadius: 26, background: 'var(--b)', transform: 'rotate(14deg)' }} />
        <i style={{ right: 0, top: 100, width: 86, height: 86, borderRadius: '50%', background: 'var(--v)' }} />
        {list.filter(a => a.logo_url).slice(0, 3).map((a, i) => <img key={a.slug} src={a.logo_url} alt="" style={[{ right: 70, top: 30, width: 58, height: 58, transform: 'rotate(-8deg)', borderRadius: 16 }, { right: 160, top: 100, width: 52, height: 52, transform: 'rotate(6deg)', borderRadius: 14 }, { right: 18, top: 118, width: 48, height: 48, borderRadius: 14 }][i]} />)}
      </div>
      <h1 className="h" style={{ fontSize: 'clamp(28px,3.6vw,46px)', fontWeight: 800, maxWidth: 760 }}>{title || <>Монголын маркетингийн агентлагууд <span style={{ color: 'var(--v)' }}>нэг дор</span></>}</h1>
      <div style={{ marginTop: 18, display: 'flex', gap: 10, background: '#fff', borderRadius: 999, padding: '6px 6px 6px 22px', maxWidth: 640, boxShadow: '0 16px 40px -24px #0b8a3e66, inset 0 0 0 2px var(--ink)' }}>
        <label htmlFor="q" style={{ position: 'absolute', left: -9999 }}>Хайх</label>
        <input id="q" value={q} onChange={e => { setQ(e.target.value); setN(24); }} placeholder="Агентлаг, үйлчилгээ эсвэл харилцагч брэндээр хайх…" style={{ flex: 1, border: 0, outline: 0, fontSize: 17, background: 'transparent', minWidth: 0 }} />
        <span className="btn v" style={{ padding: '11px 22px' }}>Хайх</span>
      </div>
      <div className="row" style={{ marginTop: 12, gap: 18, color: 'var(--mute)', fontWeight: 600, fontSize: 14.5 }}>
        <span><b style={{ color: 'var(--ink)' }}>{list.length}</b> агентлаг</span>
        {active > 0 && <span><span className="dot" />&nbsp;<b style={{ color: 'var(--ink)' }}>{active}</b> идэвхтэй</span>}{verified > 0 && <span><b style={{ color: 'var(--ink)' }}>{verified}</b> баталгаажсан</span>}
      </div>
      {!title && <div className="paths">
        <Link href="/songoh" className="path hot"><span aria-hidden>🎯</span><b>Агентлаг хөлслөх</b><small>1 минутын асуулгаар тохирох 3–5 агентлаг, үнийн санал нэг дор</small><i>Эхлэх →</i></Link>
        <Link href={TYPES.freelancer.path} className="path"><span aria-hidden>🧑‍💻</span><b>Мэргэжилтэн, эксперт</b><small>Фрилансер дизайнер, SMM, зар тохируулагч, маркетингийн зөвлөх</small><i>Үзэх →</i></Link>
        <Link href="/influencer" className="path"><span aria-hidden>⭐</span><b>Инфлүэнсер</b><small>Дагагч, чиглэлээр нь шүүж, хамтран ажиллах санал илгээ</small><i>Үзэх →</i></Link>
        <Link href={DIY.path} className="path"><span aria-hidden>🛠</span><b>Өөрөө хийх</b><small>Хэрэгсэл, сургалт, коммюнити — төсөв багатай үед</small><i>Үзэх →</i></Link>
      </div>}
    </header>
    <section className="wrap">
      <div className="row chips" style={{ gap: 10 }}>
        <button className={'chip' + (cat === 'all' ? ' on' : '')} onClick={() => setCat('all')}>Бүгд<span>{list.length}</span></button>
        {[...Object.keys(CATS).filter(k => counts[k]), ...Object.keys(counts).filter(k => !CATS[k]).sort((x, y) => counts[y] - counts[x])].map(k => <button key={k} className={'chip' + (cat === k ? ' on' : '')} onClick={() => { setCat(k); setN(24); }}>{catLabel(k)}<span>{counts[k]}</span></button>)}
      </div>
      <div className="row" style={{ justifyContent: 'space-between', margin: '22px 0 16px' }}>
        <h2 className="h" style={{ fontSize: 24, fontWeight: 700 }}>{cat === 'all' ? 'Бүх агентлаг' : catLabel(cat)} <span style={{ color: 'var(--mute)', fontSize: 18 }}>{shown.length}</span></h2>
        <label className="row" style={{ background: '#fff', padding: '9px 14px', borderRadius: 12, boxShadow: 'inset 0 0 0 1.5px var(--line)', fontWeight: 600, fontSize: 14.5 }}>Эрэмбэ:
          <select value={sort} onChange={e => setSort(e.target.value)} style={{ border: 0, background: 'transparent', fontWeight: 600 }}><option value="rank">Санал болгох</option><option value="followers">Дагагчаар</option><option value="name">Нэрээр</option></select></label>
      </div>
      <div className="grid">{shown.slice(0, n).map((a, i) => <Fragment key={a.slug}><Card a={a} />{stripAt(i) && i < shown.slice(0, n).length - 1 && <ToolStrip items={stripItems(i)} />}</Fragment>)}</div>
      {shown.length === 0 && <p style={{ textAlign: 'center', color: 'var(--mute)', padding: 40 }}>Олдсонгүй. <Link href="/nemeh" style={{ color: 'var(--v)', fontWeight: 700 }}>Нэмэх үү?</Link></p>}
      {shown.length > n && <div style={{ textAlign: 'center', marginTop: 28 }}><button className="btn ghost" onClick={() => setN(n + 24)}>Цааш үзэх · {shown.length - n} үлдсэн</button></div>}
      <div style={{ marginTop: 64, borderRadius: 36, background: 'var(--v)', color: '#fff', padding: '48px 40px', position: 'relative', overflow: 'hidden' }}>
        <div aria-hidden style={{ position: 'absolute', right: -60, bottom: -90, width: 300, height: 300, borderRadius: '50%', background: 'var(--l)' }} />
        <div style={{ position: 'relative', maxWidth: 620 }}>
          <h2 className="h" style={{ fontSize: 'clamp(28px,4vw,40px)', fontWeight: 800 }}>Агентлаг чинь жагсаалтад алга уу?</h2>
          <p style={{ fontSize: 18, marginTop: 14, color: '#E1F4E7' }}>Хэн ч нэмж болно. Агентлагийн эзэн бол SMS-ээр баталгаажаад <b style={{ color: '#fff' }}>Баталгаажсан</b> тэмдэг аваарай.</p>
          <Link href="/nemeh" className="btn lime" style={{ marginTop: 24, padding: '15px 26px' }}>+ Агентлагаа нэмэх</Link>
        </div>
      </div>
    </section>
  </>;
}
