'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { sb, api } from '@/lib/sbclient';
import { catsOf, catLabel, TYPES, TOPICS, host, NICHES, fmtNum, PRODUCTS, fmtMnt, SUB_ROLES } from '@/lib/config';
import { NEEDS, BUDGETS, SIZES, PRIORITIES } from '@/lib/match';
const fmtD = t => { const d = new Date(t), n = new Date(), p = x => String(x).padStart(2, '0'); return (d.getFullYear() !== n.getFullYear() ? d.getFullYear() + '.' : '') + p(d.getMonth() + 1) + '.' + p(d.getDate()) + ' ' + p(d.getHours()) + ':' + p(d.getMinutes()); };
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
  const [tab, setTab] = useState('inbox'); const [fs, setFs] = useState('pending'); const [ft, setFt] = useState('all'); const [open, setOpen] = useState(null);
  const [seen, setSeen] = useState({});
  useEffect(() => { try { setSeen(JSON.parse(localStorage.getItem('brief_admin_read') || '{}')); } catch {} }, []);
  const saveSeen = x => { setSeen(x); try { localStorage.setItem('brief_admin_read', JSON.stringify(x)); } catch {} };
  const markRead = k => { if (!seen[k]) saveSeen({ ...seen, [k]: 1 }); };
  const markAll = list => saveSeen(Object.fromEntries(list.map(i => [i.key, 1])));
  const typeSel = l => <select className="field" aria-label="Төрөл солих" style={{ marginTop: 0, width: 'auto', padding: '9px 12px' }} value={l.type} onChange={e => act('listing', l.id, 'type:' + e.target.value, `«${l.name}»-ийг «${TYPES[e.target.value]?.label}» руу зөөх үү?`)}>{Object.entries(TYPES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}</select>;
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

  const L = data.log || {};
  const A = (kind, id, action, c) => act(kind, id, action, c);
  const lnk = (href, t) => href ? <a href={href} target="_blank" rel="noopener" style={{ color: 'var(--v)' }}>{t}</a> : null;
  const ST = { pending: ['Шийдвэр хүлээж буй', '#B45309', '#FEF3C7'], approved: ['Батлагдсан', '#08662D', '#E1F4E7'], rejected: ['Татгалзсан', '#9F1239', '#FFE4E6'], done: ['Шийдэгдсэн', '#475569', '#E2E8F0'], info: ['Мэдээлэл', '#1D4ED8', '#DBEAFE'] };
  const stOf = s => s === 'approved' || s === 'paid' ? 'approved' : s === 'rejected' || s === 'cancelled' ? 'rejected' : s === 'pending' ? 'pending' : s;
  const items = [
    ...(data.leads || []).map(l => ({ key: 'lead' + l.id, type: 'lead', icon: '🎯', label: 'Үнийн санал', at: l.created_at, st: 'info', title: <>{l.name}{l.company && ` · ${l.company}`}</>, sub: `${l.phone || ''} ${l.email || ''}`,
      body: <><div>{(l.answers?.needs || []).map(k => NEEDS[k]?.label).join(', ')} · {BUDGETS[l.answers?.budget]?.[0]} · {SIZES[l.answers?.size]} · {PRIORITIES[l.answers?.priority]}{l.answers?.industry && ` · ${l.answers.industry}`}</div>
        <div>Агентлаг: {l.agencies.map(s => <Link key={s} href={`/a/${s}`} style={{ color: 'var(--v)', marginRight: 8 }}>{s}</Link>)}{l.utm?.utm_campaign && <span style={{ color: 'var(--mute)' }}> · кампанит: {l.utm.utm_campaign}</span>}</div>{l.note && <div style={{ color: 'var(--mute)' }}>«{l.note}»</div>}</>,
      actions: l.phone && <a className="btn v" href={`tel:${l.phone}`}>Залгах</a> })),
    ...(L.agencies || []).map(a => ({ key: 'ag' + a.id, type: 'agency', icon: '🏢', label: a.added_by === 'owner' ? 'Агентлаг (эзэн нэмсэн)' : 'Агентлаг санал', at: a.created_at, st: stOf(a.status), decided: a.status !== 'pending' && a.updated_at, title: a.name, sub: catsOf(a).map(catLabel).join(', '),
      body: <>{lnk(a.fb_url, a.fb_url?.replace('https://www.', ''))}{a.status === 'approved' && <> · <Link href={`/a/${a.slug}`} style={{ color: 'var(--v)' }}>профайл</Link></>}</>,
      actions: a.status === 'pending' && <><button className="btn v" onClick={() => A('agency', a.id, 'approve')}>Нэмэх</button><button className="btn ghost" onClick={() => A('agency', a.id, 'reject')}>Татгалзах</button></> })),
    ...(L.influencers || []).map(l => ({ key: 'inf' + l.id, type: 'influencer', icon: '⭐', label: 'Инфлүэнсер санал', at: l.created_at, st: stOf(l.status), decided: l.status !== 'pending' && l.updated_at, title: l.name, sub: (l.niches || []).map(k => NICHES[k]).join(', '),
      body: <>{lnk(l.fb_url, 'FB ' + (l.fb_followers ? fmtNum(l.fb_followers) : ''))}{l.ig && <> · {lnk('https://www.instagram.com/' + l.ig, `IG @${l.ig} ${l.ig_followers ? fmtNum(l.ig_followers) : ''}`)}</>}{l.tiktok && <> · {lnk('https://www.tiktok.com/@' + l.tiktok, `TikTok ${l.tiktok_followers ? fmtNum(l.tiktok_followers) : ''}`)}</>}{l.bio && <div style={{ color: 'var(--mute)' }}>{l.bio}</div>}{l.contact && <div style={{ color: 'var(--mute)' }}>холбоо: {l.contact}</div>}</>,
      actions: l.status === 'pending' ? <><button className="btn v" onClick={() => A('influencer', l.id, 'approve')}>Нийтлэх</button><button className="btn ghost" onClick={() => A('influencer', l.id, 'reject')}>Татгалзах</button></>
        : l.status === 'approved' ? <button className="btn ghost" onClick={() => A('influencer', l.id, 'hide')}>Нуух</button> : <button className="btn ghost" onClick={() => A('influencer', l.id, 'approve')}>Нийтлэх</button> })),
    ...(L.listings || []).map(l => ({ key: 'ls' + l.id, type: 'listing', icon: TYPES[l.type]?.icon || '🧩', label: (TYPES[l.type]?.label || 'Жагсаалт') + ' санал', at: l.created_at, st: stOf(l.status), decided: l.status !== 'pending' && l.updated_at, title: l.name, sub: [(l.topics || []).map(k => TOPICS[k]).join(', '), l.price].filter(Boolean).join(' · '),
      body: <><div>{l.description}</div><div>{lnk(l.url, host(l.url))}{l.maker && ' · ' + l.maker}{l.contact && <span style={{ color: 'var(--mute)' }}> · холбоо: {l.contact}</span>}{l.status === 'approved' && <> · <Link href={`/l/${l.id}`} style={{ color: 'var(--v)' }}>профайл</Link></>}</div></>,
      actions: <>{typeSel(l)}{l.status === 'pending' ? <><button className="btn v" onClick={() => A('listing', l.id, 'approve')}>Нийтлэх</button><button className="btn ghost" onClick={() => A('listing', l.id, 'reject')}>Татгалзах</button></> : l.status === 'approved' ? <button className="btn ghost" onClick={() => A('listing', l.id, 'hide')}>Нуух</button> : <button className="btn ghost" onClick={() => A('listing', l.id, 'approve')}>Нийтлэх</button>}</> })),
    ...(L.claims || []).map(c => ({ key: 'cl' + c.id, type: 'claim', icon: '🔑', label: 'Агентлаг эзэмших', at: c.created_at, st: stOf(c.status), decided: c.decided_at, title: <>{c.agencies?.name} ← {c.user?.full_name || c.user?.email}</>, sub: `${c.user?.email || ''} · ${c.phone || ''}`,
      body: <>«{c.note}» · {lnk(c.agencies?.fb_url, 'FB')}{c.phone && <> · <a href={'tel:' + c.phone} style={{ color: 'var(--v)' }}>залгах</a></>}</>,
      actions: c.status === 'pending' && <><button className="btn v" onClick={() => A('claim', c.id, 'approve')}>Батлах</button><button className="btn ghost" onClick={() => A('claim', c.id, 'reject', 'Татгалзах уу?')}>Татгалзах</button></> })),
    ...(L.itemClaims || []).map(c => { const link = c.item?.url || c.item?.fb_url || (c.item?.ig && 'https://www.instagram.com/' + c.item.ig); return { key: 'ic' + c.id, type: 'claim', icon: '🔑', label: (c.kind === 'influencer' ? 'Инфлүэнсер' : TYPES[c.item?.type]?.label || '') + ' эзэмших', at: c.created_at, st: stOf(c.status), decided: c.decided_at, title: <>{c.item?.name} ← {c.user?.full_name || c.user?.email}</>, sub: `${c.user?.email || ''} · ${c.phone || ''}`,
      body: <>«{c.note}»{c.phone && <> · <a href={'tel:' + c.phone} style={{ color: 'var(--v)' }}>залгах</a></>}{link && <> · {lnk(link, 'хуудсаар нь бичих')}</>}{c.proof && <> · нотолгоо: {/^https?:/.test(c.proof) ? lnk(c.proof, 'линк') : c.proof}</>}</>,
      actions: c.status === 'pending' && <><button className="btn v" onClick={() => A('own', c.id, 'approve')}>Батлах</button><button className="btn ghost" onClick={() => A('own', c.id, 'reject', 'Татгалзах уу?')}>Татгалзах</button></> }; }),
    ...(L.reports || []).map(r => ({ key: 'rp' + r.id, type: 'report', icon: '⚠️', label: 'Алдааны мэдээлэл', at: r.created_at, st: r.resolved ? 'done' : 'pending', title: r.agencies?.name || 'Сайтын алдаа', sub: '',
      body: <div style={{ whiteSpace: 'pre-wrap' }}>{r.message}</div>,
      actions: !r.resolved && <>{r.agencies && <Link className="btn ghost" href={`/minii?edit=${r.agencies.slug}`}>✏️ Профайлыг засах</Link>}<button className="btn ghost" onClick={() => A('report', r.id, 'resolve', 'Засаж дууссан уу?')}>✓ Засагдсан, хаах</button></> })),
    ...(L.orders || []).map(o => ({ key: 'or' + o.id, type: 'order', icon: '💳', label: PRODUCTS[o.product]?.label || 'Захиалга', at: o.created_at, st: o.status === 'pending' ? 'pending' : stOf(o.status), decided: o.paid_at, title: <>{o.code} · {fmtMnt(o.amount)}</>, sub: `${o.target_name || ''} · ${o.contact || ''}${o.months > 1 ? ` · ${o.months} сар` : ''}`,
      body: <>{o.status === 'pending' ? 'Төлбөр хүлээгдэж байна. QPay-ээр төлбөл автоматаар батлагдана, дансаар шилжүүлсэн бол гүйлгээний утгад энэ код байгаа эсэхийг шалга.' : o.status === 'paid' ? 'Төлөгдсөн, идэвхжсэн.' : 'Цуцлагдсан.'}</>,
      actions: o.status === 'pending' && <><button className="btn v" onClick={() => A('order', o.id, 'approve', `${o.code}: ${fmtMnt(o.amount)} дансанд орсон уу? Идэвхжүүлэх үү?`)}>Төлбөр орсон</button><button className="btn ghost" onClick={() => A('order', o.id, 'reject')}>Цуцлах</button></> })),
  ].sort((a, b) => String(b.at).localeCompare(String(a.at)));
  const TYPESF = { lead: 'Үнийн санал', agency: 'Агентлаг', influencer: 'Инфлүэнсер', listing: 'Мэргэжилтэн, бусад', claim: 'Эзэмших', report: 'Алдаа', order: 'Захиалга' };
  const pendingN = items.filter(i => i.st === 'pending').length;
  const unreadN = items.filter(i => !seen[i.key]).length;
  const shown = items.filter(i => (fs === 'all' || (fs === 'pending' ? i.st === 'pending' : fs === 'unread' ? !seen[i.key] : i.st !== 'pending' && i.st !== 'info')) && (ft === 'all' || i.type === ft));
  const tabs = [['inbox', '📥 Хүсэлтүүд', pendingN], ['content', '🗂 Нийтлэгдсэн'], ['stats', '📊 Статистик'], ['tools', '🛠 Хэрэгсэл']];
  const chip = (on, k, v, n, f) => <button key={k} type="button" className={'chip' + (on ? ' on' : '')} onClick={f}>{v}{n != null && <span>{n}</span>}</button>;
  return <section className="wrap" style={{ maxWidth: 1040, marginTop: 10 }}>
    <div className="row" style={{ justifyContent: 'space-between' }}>
      <h1 className="h" style={{ fontSize: 34, fontWeight: 800 }}>Админ</h1>
      <span style={{ color: 'var(--mute)', fontWeight: 600 }}>Жагсаалтад {data.total} агентлаг</span>
    </div>
    <div className="row" style={{ gap: 6, marginTop: 14, borderBottom: '1.5px solid var(--line)' }}>
      {tabs.map(([k, v, n]) => <button key={k} type="button" onClick={() => setTab(k)} style={{ background: 'none', border: 0, padding: '10px 14px', fontWeight: 700, fontSize: 15.5, cursor: 'pointer', color: tab === k ? 'var(--ink)' : 'var(--mute)', borderBottom: tab === k ? '3px solid var(--v)' : '3px solid transparent', marginBottom: -1.5 }}>{v}{n ? <b style={{ marginLeft: 6, background: '#E5383B', color: '#fff', borderRadius: 99, padding: '1px 8px', fontSize: 12.5 }}>{n}</b> : null}</button>)}
    </div>
    {err && <div className="err" style={{ marginTop: 12 }}>{err}</div>}
    {tab === 'inbox' && <>
      <div className="row" style={{ gap: 8, marginTop: 16 }}>
        {chip(fs === 'pending', 'p', 'Шийдвэр хүлээж буй', pendingN, () => setFs('pending'))}
        {chip(fs === 'unread', 'u', 'Уншаагүй', unreadN, () => setFs('unread'))}
        {chip(fs === 'all', 'a', 'Бүгд', items.length, () => setFs('all'))}
        {chip(fs === 'done', 'd', 'Шийдэгдсэн', null, () => setFs('done'))}
        <select className="field" style={{ marginTop: 0, width: 'auto', borderRadius: 999, marginLeft: 'auto' }} value={ft} onChange={e => setFt(e.target.value)} aria-label="Төрөл"><option value="all">Бүх төрөл</option>{Object.entries(TYPESF).map(([k, v]) => <option key={k} value={k}>{v} ({items.filter(i => i.type === k).length})</option>)}</select>
        {unreadN > 0 && <button type="button" className="btn ghost" onClick={() => markAll(items)}>Бүгдийг уншсан</button>}
      </div>
      <div className="panel" style={{ marginTop: 14, padding: 0, overflow: 'hidden' }}>
        {!shown.length && <p style={{ color: 'var(--mute)', padding: 22 }}>Энд юу ч алга.</p>}
        {shown.map(i => { const o = open === i.key, u = !seen[i.key], S = ST[i.st] || ST.info; return <div key={i.key} style={{ borderBottom: '1px solid var(--line)', background: o ? 'var(--bg)' : u ? '#fff' : 'transparent' }}>
          <button type="button" onClick={() => { setOpen(o ? null : i.key); markRead(i.key); }} style={{ all: 'unset', cursor: 'pointer', display: 'grid', gridTemplateColumns: '28px 1fr auto', gap: 12, alignItems: 'center', width: '100%', boxSizing: 'border-box', padding: '13px 18px' }}>
            <span style={{ fontSize: 18 }}>{i.icon}</span>
            <span style={{ minWidth: 0 }}>
              <span style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>{u && <i style={{ width: 8, height: 8, borderRadius: 9, background: 'var(--v)', display: 'inline-block' }} />}<span style={{ fontWeight: u ? 800 : 600 }}>{i.title}</span><span style={{ fontSize: 12.5, fontWeight: 700, color: S[1], background: S[2], borderRadius: 99, padding: '2px 9px' }}>{S[0]}</span></span>
              <span style={{ display: 'block', fontSize: 13.5, color: 'var(--mute)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{i.label}{i.sub && ' · ' + i.sub}</span>
            </span>
            <span style={{ fontSize: 13, color: 'var(--mute)', textAlign: 'right', whiteSpace: 'nowrap' }}>{fmtD(i.at)}<br />{ago(i.at)}</span>
          </button>
          {o && <div style={{ padding: '0 18px 16px 58px', display: 'grid', gap: 10, fontSize: 14.5 }}>
            <div style={{ lineHeight: 1.6 }}>{i.body}</div>
            <div style={{ fontSize: 13, color: 'var(--mute)' }}>Ирсэн: {fmtD(i.at)}{i.decided && i.st !== 'pending' && <> · шийдсэн: {fmtD(i.decided)}</>}</div>
            {i.actions && <div className="row" style={{ gap: 6 }}>{i.actions}</div>}
          </div>}
        </div>; })}
      </div>
      <p style={{ fontSize: 13, color: 'var(--mute)', marginTop: 8 }}>Сүүлийн 120 хоногийн хүсэлтүүд. Шийдсэн ч устахгүй — «Шийдэгдсэн»-ээс харна.</p>
    </>}
    {tab === 'content' && <>
      <Box title="Мэргэжилтэн, медиа, хэрэгсэл, сургалт, коммюнити (30 хоногийн дарсан тоо)" n={data.listings.filter(l => l.status === 'approved').length}>{data.listings.filter(l => l.status === 'approved').sort((a, b) => b.clicks - a.clicks).map(l => <Row key={l.id}
        actions={<>{typeSel(l)}<button className="btn ghost" onClick={() => A('listing', l.id, l.sponsored ? 'unsponsor' : 'sponsor')}>{l.sponsored ? 'Онцлохоос хасах' : 'Онцлох болгох'}</button><button className="btn ghost" onClick={() => A('listing', l.id, 'hide')}>Нуух</button><button className="btn ghost" onClick={() => A('listing', l.id, 'delete', `«${l.name}»-ийг бүр устгах уу? Буцаах боломжгүй.`)}>Устгах</button></>}>
        <b>{l.name}</b> <span style={{ color: 'var(--mute)' }}>· {TYPES[l.type]?.label} · <b style={{ color: 'var(--ink)' }}>{l.clicks}</b> дарсан{l.sponsored && ' · онцлох'}{l.verified && ' · ✓ эзэнтэй'}{l.contact && ' · ' + l.contact}</span></Row>)}</Box>
      <Box title="Инфлүэнсер — хамгийн их дарагдсан (30 хоног)" n={data.infTop.length}>{data.infTop.map(l => <Row key={l.id}
        actions={<><button className="btn ghost" onClick={() => A('influencer', l.id, 'hide')}>Нуух</button><button className="btn ghost" onClick={() => A('influencer', l.id, 'delete', `«${l.name}»-ийг бүр устгах уу? Буцаах боломжгүй.`)}>Устгах</button></>}>
        <b>{l.name}</b> <span style={{ color: 'var(--mute)' }}>· <b style={{ color: 'var(--ink)' }}>{l.clicks}</b> дарсан</span></Row>)}</Box>
    </>}
    {tab === 'stats' && <>
      <SubStats />
      <Box title={`Агентлаг — хамгийн их үзэлттэй (30 хоног · нийт ${data.totalViews} үзэлт, ${data.totalClicks} дарсан)`} n={data.top.length}>
        {data.top.map((a, i) => <Row key={a.slug} actions={<Link className="btn ghost" href={`/minii?edit=${a.slug}`}>Статистик</Link>}><b>{i + 1}. {a.name}</b> <span style={{ color: 'var(--mute)' }}>· {a.views} үзэлт · {a.clicks} дарсан</span></Row>)}
      </Box>
      <Box title={`Төлөгдсөн захиалга · нийт ${fmtMnt(data.orders.filter(o => o.status === 'paid').reduce((s, o) => s + o.amount, 0))}`} n={data.orders.filter(o => o.status === 'paid').length}>{data.orders.filter(o => o.status === 'paid').map(o => <Row key={o.id}>
        <b>{o.code}</b> · {PRODUCTS[o.product]?.label} · {fmtMnt(o.amount)} <span style={{ color: 'var(--mute)' }}>· {o.target_name} · {fmtD(o.paid_at)}</span></Row>)}</Box>
    </>}
    {tab === 'tools' && <>
      <div className="panel" style={{ marginTop: 18 }}>
        <h2 className="h" style={{ fontSize: 20, fontWeight: 700 }}>Агентлаг засах / нуух</h2>
        <p style={{ color: 'var(--mute)', marginTop: 6 }}>Аль ч агентлагийн профайл руу ороод «✎ Профайл засах» дар. Эсвэл slug-аар нь шууд:</p>
        <form className="row" style={{ marginTop: 10 }} onSubmit={e => { e.preventDefault(); if (q) location.href = '/minii?edit=' + encodeURIComponent(q.trim()); }}>
          <input className="field" style={{ marginTop: 0, flex: 1 }} placeholder="жишээ нь spotagency" value={q} onChange={e => setQ(e.target.value)} /><button className="btn dark">Засах</button></form>
      </div>
      <div className="panel" style={{ marginTop: 18 }}>
        <h2 className="h" style={{ fontSize: 20, fontWeight: 700 }}>Facebook мэдээлэл шинэчлэх</h2>
        <p style={{ color: 'var(--mute)', marginTop: 6 }}>Бүх агентлагийн дагагч, сүүлийн пост (идэвхтэй эсэх), логогүй бол логог FB-ээс татна. 3–5 минут болно, хуудсаа бүү хаа.</p>
        <div className="row" style={{ marginTop: 10 }}><button className="btn v" disabled={rf && !rf.startsWith('Дууслаа') && !rf.startsWith('Алдаа')} onClick={refresh}>Шинэчлэх</button>{rf && <span style={{ fontWeight: 600 }}>{rf}</span>}</div>
      </div>
    </>}
  </section>;
}
