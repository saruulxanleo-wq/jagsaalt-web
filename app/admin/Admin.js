'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { sb, api } from '@/lib/sbclient';
import { catsOf, catLabel, TYPES, TOPICS, host, NICHES, fmtNum, PRODUCTS, fmtMnt, SUB_ROLES } from '@/lib/config';
import { NEEDS, BUDGETS, SIZES, PRIORITIES } from '@/lib/match';
const ago = t => { const h = Math.round((Date.now() - new Date(t)) / 36e5); return h < 1 ? 'дөнгөж сая' : h < 24 ? `${h} цагийн өмнө` : `${Math.round(h / 24)} өдрийн өмнө`; };
const Box = ({ title, n, children, fold }) => { const [o, setO] = useState(!fold); return <div className="panel" style={{ marginTop: 18 }}><h2 className="h" onClick={fold ? () => setO(!o) : undefined} style={{ fontSize: 20, fontWeight: 700, cursor: fold ? 'pointer' : undefined, display: 'flex', justifyContent: 'space-between', gap: 12 }}><span>{title} <span style={{ color: 'var(--mute)' }}>{n}</span></span>{fold && <span style={{ color: 'var(--mute)', flexShrink: 0 }}>{o ? '▲' : '▼'}</span>}</h2>{o && <div style={{ display: 'grid', gap: 12, marginTop: 14 }}>{n ? children : <p style={{ color: 'var(--mute)' }}>Хоосон.</p>}</div>}</div>; };
const Row = ({ children, actions }) => <div className="row" style={{ background: 'var(--bg)', borderRadius: 16, padding: '12px 14px', justifyContent: 'space-between', gap: 12 }}><div style={{ flex: 1, minWidth: 240 }}>{children}</div><div className="row" style={{ gap: 6 }}>{actions}</div></div>;
function SubStats() {
  const [s, setS] = useState(null);
  useEffect(() => { api('/api/admin/subscribers').then(r => r.ok && setS(r)); }, []);
  async function csv() { const { data } = await sb().auth.getSession(); const r = await fetch('/api/admin/subscribers?csv=1', { headers: { Authorization: 'Bearer ' + data.session?.access_token } }); const b = await r.blob(); const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = 'subscribers.csv'; a.click(); }
  if (!s) return null;
  return <div className="panel" style={{ marginTop: 18 }}><div className="row" style={{ justifyContent: 'space-between' }}><h2 className="h" style={{ fontSize: 20, fontWeight: 700 }}>✉ Имэйл бүртгэл</h2><button className="btn ghost" onClick={csv}>CSV татах (идэвхтэй)</button></div>
    <div className="row" style={{ gap: 18, marginTop: 10 }}><div><b className="h" style={{ fontSize: 28 }}>{s.active}</b> баталгаажсан</div><div style={{ color: 'var(--mute)' }}>{s.pending} хүлээгдэж буй · {s.unsub} цуцалсан</div></div>
    <div style={{ marginTop: 8, fontSize: 14, color: 'var(--mute)' }}>{Object.entries(s.byRole).map(([k, v]) => `${SUB_ROLES[k] || k}: ${v}`).join(' · ')}</div>
    <div style={{ marginTop: 4, fontSize: 14, color: 'var(--mute)' }}>Эх сурвалж: {Object.entries(s.bySource).map(([k, v]) => `${k} ${v}`).join(' · ')}</div></div>;
}
export default function Admin() {
  const [rf, setRf] = useState(null);
  async function refresh() {
    let off = 0, ok = 0, tot = 0; setRf('Эхэлж байна…');
    while (true) { const r = await api('/api/admin/refresh', { offset: off }); if (!r.ok) { setRf('Алдаа: ' + r.error); return; }
      ok += r.res.filter(x => x.ok).length; tot = r.total; off = r.next; setRf(`${off}/${tot} шалгасан · ${ok} амжилттай`); if (r.done) break; }
    setRf(`Дууслаа: ${tot}-аас ${ok} агентлагийн мэдээлэл шинэчлэгдлээ`);
  }
  const [s, setS] = useState(undefined); const [data, setData] = useState(null); const [err, setErr] = useState(null); const [q, setQ] = useState('');
  useEffect(() => { sb().auth.getSession().then(({ data }) => setS(data.session)); }, []);
  const load = async () => { const r = await api('/api/admin/list'); r.ok ? setData(r) : setErr(r.error); };
  useEffect(() => { if (s) load(); }, [s]);
  const act = async (kind, id, action, confirmText) => {
    if (confirmText && !window.confirm(confirmText)) return;
    const r = await api('/api/admin/action', { kind, id, action }); r.ok ? load() : setErr(r.error);
  };
  if (s === undefined) return <section className="wrap" style={{ padding: 40 }}>…</section>;
  if (!s) return <section className="wrap" style={{ padding: 40 }}><Link href="/minii" className="btn dark">Нэвтрэх</Link></section>;
  if (err && !data) return <section className="wrap" style={{ padding: 40, display: 'grid', gap: 14 }}><div className="err">{err}{err === 'Зөвхөн админ' && <> · Одоо <b>{s.user?.email || 'тодорхойгүй'}</b> бүртгэлээр нэвтэрсэн байна.</>}</div>
    <button className="btn ghost" style={{ justifySelf: 'start' }} onClick={async () => { await sb().auth.signOut(); location.href = '/minii'; }}>Гараад өөр бүртгэлээр нэвтрэх</button></section>;
  if (!data) return <section className="wrap" style={{ padding: 40 }}>Ачаалж байна…</section>;
  return <section className="wrap" style={{ maxWidth: 980, marginTop: 10 }}>
    <div className="row" style={{ justifyContent: 'space-between' }}>
      <h1 className="h" style={{ fontSize: 34, fontWeight: 800 }}>Админ</h1>
      <span style={{ color: 'var(--mute)', fontWeight: 600 }}>Жагсаалтад {data.total} агентлаг</span>
    </div>
    {err && <div className="err" style={{ marginTop: 12 }}>{err}</div>}
    <Box title="Клиентийн хүсэлт (үнийн санал)" n={data.leads.length}>{data.leads.map(l => <Row key={l.id} actions={<a className="btn v" href={`tel:${l.phone || ''}`}>Залгах</a>}>
      <b>{l.name}</b>{l.company && ` · ${l.company}`} <span style={{ color: 'var(--mute)' }}>· {l.phone} {l.email} · {ago(l.created_at)}</span>
      <div style={{ fontSize: 14 }}>{(l.answers?.needs || []).map(k => NEEDS[k]?.label).join(', ')} · {BUDGETS[l.answers?.budget]?.[0]} · {SIZES[l.answers?.size]} · {PRIORITIES[l.answers?.priority]}{l.answers?.industry && ` · ${l.answers.industry}`}</div>
      <div style={{ fontSize: 14 }}>Агентлаг: {l.agencies.map(s => <Link key={s} href={`/a/${s}`} style={{ color: 'var(--v)', marginRight: 8 }}>{s}</Link>)}{l.utm?.utm_campaign && <span style={{ color: 'var(--mute)' }}> · кампанит: {l.utm.utm_campaign}</span>}</div>
      {l.note && <div style={{ fontSize: 14, color: 'var(--mute)' }}>«{l.note}»</div>}</Row>)}</Box>
    <SubStats />
    <Box title="Захиалга — төлбөр хүлээгдэж буй" n={data.orders.filter(o => o.status === 'pending').length}>{data.orders.filter(o => o.status === 'pending').map(o => <Row key={o.id}
      actions={<><button className="btn v" onClick={() => act('order', o.id, 'approve', `${o.code}: ${fmtMnt(o.amount)} дансанд орсон уу? Идэвхжүүлэх үү?`)}>Төлбөр орсон</button><button className="btn ghost" onClick={() => act('order', o.id, 'reject')}>Цуцлах</button></>}>
      <b>{o.code}</b> · {PRODUCTS[o.product]?.label}{o.months > 1 && ` · ${o.months} сар`} · <b>{fmtMnt(o.amount)}</b> <span style={{ color: 'var(--mute)' }}>· {o.target_name} · {o.contact} · {ago(o.created_at)}</span></Row>)}</Box>
    <Box title={`Төлөгдсөн захиалга · нийт ${fmtMnt(data.orders.filter(o => o.status === 'paid').reduce((s, o) => s + o.amount, 0))}`} n={data.orders.filter(o => o.status === 'paid').length}>{data.orders.filter(o => o.status === 'paid').map(o => <Row key={o.id}>
      <b>{o.code}</b> · {PRODUCTS[o.product]?.label} · {fmtMnt(o.amount)} <span style={{ color: 'var(--mute)' }}>· {o.target_name} · {ago(o.paid_at)}</span></Row>)}</Box>
    <Box title="Инфлүэнсер — шинэ санал" n={data.infPending.length}>{data.infPending.map(l => <Row key={l.id}
      actions={<><button className="btn v" onClick={() => act('influencer', l.id, 'approve')}>Нийтлэх</button><button className="btn ghost" onClick={() => act('influencer', l.id, 'reject')}>Татгалзах</button></>}>
      <b>{l.name}</b> <span style={{ color: 'var(--mute)' }}>· {(l.niches || []).map(k => NICHES[k]).join(', ')} · {ago(l.created_at)}</span>
      <div style={{ fontSize: 14 }}>{l.fb_url && <a href={l.fb_url} target="_blank" rel="noopener" style={{ color: 'var(--v)' }}>FB {l.fb_followers ? fmtNum(l.fb_followers) : ''}</a>}{l.ig && <> · <a href={'https://www.instagram.com/' + l.ig} target="_blank" rel="noopener" style={{ color: 'var(--v)' }}>IG @{l.ig} {l.ig_followers ? fmtNum(l.ig_followers) : ''}</a></>}{l.tiktok && <> · <a href={'https://www.tiktok.com/@' + l.tiktok} target="_blank" rel="noopener" style={{ color: 'var(--v)' }}>TikTok {l.tiktok_followers ? fmtNum(l.tiktok_followers) : ''}</a></>}{l.contact && <span style={{ color: 'var(--mute)' }}> · холбоо: {l.contact}</span>}</div></Row>)}</Box>
    <Box title="Инфлүэнсер — хамгийн их дарагдсан (30 хоног)" n={data.infTop.length}>{data.infTop.map(l => <Row key={l.id}
      actions={<><button className="btn ghost" onClick={() => act('influencer', l.id, 'hide')}>Нуух</button><button className="btn ghost" onClick={() => act('influencer', l.id, 'delete', `«${l.name}»-ийг бүр устгах уу? Буцаах боломжгүй.`)}>Устгах</button></>}>
      <b>{l.name}</b> <span style={{ color: 'var(--mute)' }}>· <b style={{ color: 'var(--ink)' }}>{l.clicks}</b> дарсан</span></Row>)}</Box>
    <Box title="Фрилансер, хэрэгсэл, сургалт, коммюнити — шинэ санал" n={data.listings.filter(l => l.status === 'pending').length}>{data.listings.filter(l => l.status === 'pending').map(l => <Row key={l.id}
      actions={<><button className="btn v" onClick={() => act('listing', l.id, 'approve')}>Нийтлэх</button><button className="btn ghost" onClick={() => act('listing', l.id, 'reject')}>Татгалзах</button></>}>
      <b>{l.name}</b> <span style={{ color: 'var(--mute)' }}>· {TYPES[l.type]?.label} · {(l.topics || []).map(k => TOPICS[k]).join(', ')}{l.price && ' · ' + l.price} · {ago(l.created_at)}</span>
      <div style={{ fontSize: 14 }}>{l.description}</div>
      <div style={{ fontSize: 14 }}><a href={l.url} target="_blank" rel="noopener" style={{ color: 'var(--v)' }}>{host(l.url)}</a>{l.maker && ' · ' + l.maker}{l.contact && <span style={{ color: 'var(--mute)' }}> · холбоо: {l.contact}</span>}</div></Row>)}</Box>
    <Box fold title="Нийтлэгдсэн фрилансер, хэрэгсэл, сургалт, коммюнити (30 хоногийн дарсан тоо)" n={data.listings.filter(l => l.status === 'approved').length}>{data.listings.filter(l => l.status === 'approved').sort((a, b) => b.clicks - a.clicks).map(l => <Row key={l.id}
      actions={<><button className="btn ghost" onClick={() => act('listing', l.id, l.sponsored ? 'unsponsor' : 'sponsor')}>{l.sponsored ? 'Ивээн тэтгэлэг болиулах' : 'Ивээн тэтгэсэн болгох'}</button><button className="btn ghost" onClick={() => act('listing', l.id, 'hide')}>Нуух</button><button className="btn ghost" onClick={() => act('listing', l.id, 'delete', `«${l.name}»-ийг бүр устгах уу? Буцаах боломжгүй.`)}>Устгах</button></>}>
      <b>{l.name}</b> <span style={{ color: 'var(--mute)' }}>· {TYPES[l.type]?.label} · <b style={{ color: 'var(--ink)' }}>{l.clicks}</b> дарсан{l.sponsored && ' · ивээн тэтгэсэн'}{l.verified && ' · ✓ эзэнтэй'}{l.contact && ' · ' + l.contact}</span></Row>)}</Box>
    <Box fold title={`Хамгийн их үзэлттэй (30 хоног · нийт ${data.totalViews} үзэлт, ${data.totalClicks} дарсан)`} n={data.top.length}>
      {data.top.map((a, i) => <Row key={a.slug} actions={<Link className="btn ghost" href={`/minii?edit=${a.slug}`}>Статистик</Link>}><b>{i + 1}. {a.name}</b> <span style={{ color: 'var(--mute)' }}>· {a.views} үзэлт · {a.clicks} дарсан</span></Row>)}
    </Box>
    <Box title="Эзэмших хүсэлт — фрилансер, сургалт, коммюнити, хэрэгсэл, инфлүэнсер" n={(data.ownClaims || []).length}>{(data.ownClaims || []).map(c => { const link = c.item?.url || c.item?.fb_url || (c.item?.ig && 'https://www.instagram.com/' + c.item.ig); return <Row key={c.id}
      actions={<><button className="btn v" onClick={() => act('own', c.id, 'approve')}>Батлах</button><button className="btn ghost" onClick={() => act('own', c.id, 'reject', 'Татгалзах уу?')}>Татгалзах</button></>}>
      <b>{c.item?.name}</b> <span style={{ color: 'var(--mute)' }}>· {c.kind === 'influencer' ? 'Инфлүэнсер' : TYPES[c.item?.type]?.label}</span> ← {c.user?.full_name || c.user?.email} <span style={{ color: 'var(--mute)' }}>· {c.user?.email} · {c.phone}</span>
      <div style={{ fontSize: 14 }}>«{c.note}» · код <b>{c.code}</b>{link && <> · <a href={link} target="_blank" rel="noopener" style={{ color: 'var(--v)' }}>шалгах</a></>}{c.proof && <> · нотолгоо: {/^https?:/.test(c.proof) ? <a href={c.proof} target="_blank" rel="noopener" style={{ color: 'var(--v)' }}>линк</a> : c.proof}</>} · <span style={{ color: 'var(--mute)' }}>{ago(c.created_at)}</span></div></Row>; })}</Box>
    <Box title="Агентлаг эзэмших хүсэлт" n={data.claims.length}>{data.claims.map(c => <Row key={c.id}
      actions={<><button className="btn v" onClick={() => act('claim', c.id, 'approve')}>Батлах</button><button className="btn ghost" onClick={() => act('claim', c.id, 'reject', 'Татгалзах уу?')}>Татгалзах</button></>}>
      <b>{c.agencies?.name}</b> ← {c.user?.full_name || c.user?.email} <span style={{ color: 'var(--mute)' }}>· {c.user?.email} · {c.phone}</span>
      <div style={{ fontSize: 14 }}>«{c.note}» · <a href={c.agencies?.fb_url} target="_blank" rel="noopener" style={{ color: 'var(--v)' }}>FB</a> · <span style={{ color: 'var(--mute)' }}>{ago(c.created_at)}</span></div></Row>)}</Box>
    <Box title="Шинэ агентлагийн санал" n={data.pending.length}>{data.pending.map(a => <Row key={a.id}
      actions={<><button className="btn v" onClick={() => act('agency', a.id, 'approve')}>Нэмэх</button><button className="btn ghost" onClick={() => act('agency', a.id, 'reject')}>Татгалзах</button></>}>
      <b>{a.name}</b> <span style={{ color: 'var(--mute)' }}>· {catsOf(a).map(catLabel).join(', ')} · {a.added_by === 'owner' ? 'эзэн нэмсэн' : 'хэрэглэгч санал болгосон'}</span>
      <div style={{ fontSize: 14 }}>{a.fb_url ? <a href={a.fb_url} target="_blank" rel="noopener" style={{ color: 'var(--v)' }}>{a.fb_url.replace('https://www.', '')}</a> : 'линкгүй'} · <span style={{ color: 'var(--mute)' }}>{ago(a.created_at)}</span></div></Row>)}</Box>
    <Box title="Алдаа, буруу мэдээллийн гомдол" n={data.reports.length}>{data.reports.length > 0 && <p style={{ color: 'var(--mute)', fontSize: 14, margin: 0 }}>Хүмүүс агентлагийн мэдээлэл буруу гэж мэдээлсэн. «Профайлыг засах» дээр дарж ангилал, тайлбарыг засаад, дараа нь «Засагдсан, хаах» дар.</p>}{data.reports.map(r => <Row key={r.id}
      actions={<>{r.agencies && <Link className="btn ghost" href={`/minii?edit=${r.agencies.slug}`}>✏️ Профайлыг засах</Link>}<button className="btn ghost" onClick={() => act('report', r.id, 'resolve', 'Засаж дууссан уу? Гомдлыг жагсаалтаас хасна.')}>✓ Засагдсан, хаах</button></>}>
      <b>{r.agencies?.name || 'Сайтын алдаа'}</b> <span style={{ color: 'var(--mute)' }}>· {ago(r.created_at)}</span><div style={{ fontSize: 14, whiteSpace: 'pre-wrap' }}>{r.message}</div></Row>)}</Box>
    <div className="panel" style={{ marginTop: 18 }}>
      <h2 className="h" style={{ fontSize: 20, fontWeight: 700 }}>Facebook мэдээлэл шинэчлэх</h2>
      <p style={{ color: 'var(--mute)', marginTop: 6 }}>Бүх агентлагийн дагагч, сүүлийн пост (идэвхтэй эсэх), логогүй бол логог FB-ээс татна. 3–5 минут болно, хуудсаа бүү хаа.</p>
      <div className="row" style={{ marginTop: 10 }}><button className="btn v" disabled={rf && !rf.startsWith('Дууслаа') && !rf.startsWith('Алдаа')} onClick={refresh}>Шинэчлэх</button>{rf && <span style={{ fontWeight: 600 }}>{rf}</span>}</div>
    </div>
    <div className="panel" style={{ marginTop: 18 }}>
      <h2 className="h" style={{ fontSize: 20, fontWeight: 700 }}>Агентлаг засах / нуух</h2>
      <p style={{ color: 'var(--mute)', marginTop: 6 }}>Аль ч агентлагийн профайл руу ороод «✎ Профайл засах» дар. Эсвэл slug-аар нь шууд:</p>
      <form className="row" style={{ marginTop: 10 }} onSubmit={e => { e.preventDefault(); if (q) location.href = '/minii?edit=' + encodeURIComponent(q.trim()); }}>
        <input className="field" style={{ marginTop: 0, flex: 1 }} placeholder="жишээ нь spotagency" value={q} onChange={e => setQ(e.target.value)} /><button className="btn dark">Засах</button></form>
    </div>
  </section>;
}
