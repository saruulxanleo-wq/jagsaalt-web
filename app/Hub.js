'use client';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import ListingCard from './ListingCard';
import { TYPES, TOPICS } from '@/lib/config';
export default function Hub({ type, list }) {
  const t = TYPES[type]; const [q, setQ] = useState(''); const [tp, setTp] = useState('all');
  const counts = useMemo(() => list.reduce((m, l) => ((l.topics || []).forEach(k => m[k] = (m[k] || 0) + 1), m), {}), [list]);
  const shown = list.filter(l => (tp === 'all' || (l.topics || []).includes(tp)) && (!q.trim() || (l.name + ' ' + (l.maker || '') + ' ' + (l.description || '')).toLowerCase().includes(q.trim().toLowerCase())));
  return <section className="wrap" style={{ marginTop: 10 }}>
    <div className="row hubtabs" style={{ gap: 8 }}>{Object.entries(TYPES).filter(([, v]) => v.group === t.group).length > 1 && Object.entries(TYPES).filter(([, v]) => v.group === t.group).map(([k, v]) => <Link key={k} href={v.path} className={'chip' + (k === type ? ' on' : '')}>{v.icon} {v.label}</Link>)}</div>
    <h1 className="h" style={{ fontSize: 'clamp(28px,3.6vw,42px)', fontWeight: 800, marginTop: 22 }}>{t.title}</h1>
    <p style={{ color: 'var(--mute)', fontSize: 17, marginTop: 8, maxWidth: 680 }}>{t.sub}</p>
    <div className="row" style={{ marginTop: 18, gap: 10 }}>
      <input className="field" style={{ marginTop: 0, maxWidth: 360, borderRadius: 999 }} placeholder={t.label + ' хайх…'} value={q} onChange={e => setQ(e.target.value)} aria-label="Хайх" />
      <Link href={'/nemeh?type=' + type} className="btn dark">+ {t.label} нэмэх</Link>
    </div>
    {Object.keys(counts).length > 1 && <div className="row chips" style={{ gap: 8, marginTop: 16 }}>
      <button className={'chip' + (tp === 'all' ? ' on' : '')} onClick={() => setTp('all')}>Бүгд<span>{list.length}</span></button>
      {Object.keys(TOPICS).filter(k => counts[k]).map(k => <button key={k} className={'chip' + (tp === k ? ' on' : '')} onClick={() => setTp(k)}>{TOPICS[k]}<span>{counts[k]}</span></button>)}
    </div>}
    <div className="grid" style={{ marginTop: 20 }}>{shown.map(l => <ListingCard key={l.id} l={l} />)}</div>
    {shown.length === 0 && <div className="panel" style={{ marginTop: 20, textAlign: 'center' }}>
      <p style={{ fontSize: 17 }}>{list.length ? 'Олдсонгүй.' : `Одоогоор ${t.label.toLowerCase()} нэмэгдээгүй байна.`}</p>
      <Link href={'/nemeh?type=' + type} className="btn v" style={{ marginTop: 14 }}>Эхнийх нь болж нэмэх →</Link></div>}
    <p style={{ color: 'var(--mute)', fontSize: 14, marginTop: 28 }}>Жагсаалтад нэмэх үнэгүй. «Онцлох» гэсэн тэмдэгтэй нь төлбөртэй байршил.</p>
  </section>;
}
