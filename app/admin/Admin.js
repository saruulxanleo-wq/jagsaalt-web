'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { sb, api } from '@/lib/sbclient';
import { catsOf, catLabel, TYPES, topicLabel, host, NICHES, fmtNum, PRODUCTS, fmtMnt, SUB_ROLES } from '@/lib/config';
import { NEEDS, BUDGETS, SIZES, PRIORITIES } from '@/lib/match';
import { CONTACT, HIRED } from '@/lib/reviews';
const fmtD = t => { const d = new Date(t), n = new Date(), p = x => String(x).padStart(2, '0'); return (d.getFullYear() !== n.getFullYear() ? d.getFullYear() + '.' : '') + p(d.getMonth() + 1) + '.' + p(d.getDate()) + ' ' + p(d.getHours()) + ':' + p(d.getMinutes()); };
const ago = t => { const h = Math.round((Date.now() - new Date(t)) / 36e5); return h < 1 ? 'дөнгөж сая' : h < 24 ? `${h} цагийн өмнө` : `${Math.round(h / 24)} өдрийн өмнө`; };
const Box = ({ title, n, children, fold }) => { const [o, setO] = useState(!fold); return <div className="panel" style={{ marginTop: 18 }}><h2 className="h" onClick={fold ? () => setO(!o) : undefined} style={{ fontSize: 20, fontWeight: 700, cursor: fold ? 'pointer' : undefined, display: 'flex', justifyContent: 'space-between', gap: 12 }}><span>{title} <span style={{ color: 'var(--mute)' }}>{n}</span></span>{fold && <span style={{ color: 'var(--mute)', flexShrink: 0 }}>{o ? '▲' : '▼'}</span>}</h2>{o && <div style={{ display: 'grid', gap: 12, marginTop: 14 }}>{n ? children : <p style={{ color: 'var(--mute)' }}>Хоосон.</p>}</div>}</div>; };
const Row = ({ children, actions }) => <div className="row" style={{ background: 'var(--bg)', borderRadius: 16, padding: '12px 14px', justifyContent: 'space-between', gap: 12 }}><div style={{ flex: 1, minWidth: 240 }}>{children}</div><div className="row" style={{ gap: 6 }}>{actions}</div></div>;
function SubStats() {
  const [s, setS] = useState(null);
  useEffect(() => { api('/api/admin/subscribers').then(r => r.ok && setS(r)); }, []);
  async function csv() { const { data } = await sb().auth.getSession(); const r = await fetch('/api/admin/subscribers?csv=1', { headers: { Authorization: 'Bearer ' + data.session?.access_token } }); const b = await r.blob(); const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = 'subscribers.csv'; a.click(); }
  if (!s) return null;
  return <div className="panel" style={{ marginTop: 18 }}><div className="row" style={{ justifyContent: 'space-between' }}><h2 className="h" style={{ fontSize: 20, fontWeight: 700 }}>✉ Товхимолын бүртгэл</h2><button className="btn ghost" onClick={csv}>CSV татах (идэвхтэй)</button></div>
    <div className="row" style={{ gap: 18, marginTop: 10 }}><div><b className="h" style={{ fontSize: 28 }}>{s.active}</b> баталгаажсан</div><div style={{ color: 'var(--mute)' }}>{s.pending} хүлээгдэж буй · {s.unsub} цуцалсан</div></div>
    <div style={{ marginTop: 8, fontSize: 14, color: 'var(--mute)' }}>{Object.entries(s.byRole).map(([k, v]) => `${k === '—' ? 'Үүрэг сонгоогүй' : SUB_ROLES[k] || k}: ${v}`).join(' · ')}</div>
    <div style={{ marginTop: 4, fontSize: 14, color: 'var(--mute)' }}>Эх сурвалж: {Object.entries(s.bySource).map(([k, v]) => `${k} ${v}`).join(' · ')}</div></div>;
}
const CTAGS = { sub: 'Товхимол', user: 'Бүртгэлтэй хэрэглэгч', agency: 'Агентлагийн эзэн', owner: 'Профайлын эзэн', lead: 'Үнийн санал хүссэн', order: 'Захиалагч' };
function Contacts() {
  const [rows, setRows] = useState(null); const [t, setT] = useState('all'); const [q, setQ] = useState('');
  useEffect(() => { api('/api/admin/contacts').then(r => setRows(r.ok ? r.rows : [])); }, []);
  async function csv() { const { data } = await sb().auth.getSession(); const r = await fetch('/api/admin/contacts?csv=1', { headers: { Authorization: 'Bearer ' + data.session?.access_token } }); const b = await r.blob(); const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = 'brief-contacts.csv'; a.click(); }
  if (!rows) return <div className="panel" style={{ marginTop: 18 }}>Ачаалж байна…</div>;
  const cnt = k => rows.filter(r => r.tags.includes(k)).length;
  const shown = rows.filter(r => (t === 'all' || (t === 'consent' ? r.consent : r.tags.includes(t))) && (!q.trim() || (r.email + ' ' + r.name + ' ' + r.company + ' ' + r.phone).toLowerCase().includes(q.trim().toLowerCase())));
  const fd = x => x ? new Date(x).toISOString().slice(0, 10) : '';
  return <div className="panel" style={{ marginTop: 18 }}>
    <div className="row" style={{ justifyContent: 'space-between' }}><h2 className="h" style={{ fontSize: 20, fontWeight: 700 }}>👥 Бүх имэйл <span style={{ color: 'var(--mute)' }}>{rows.length}</span></h2><button className="btn ghost" onClick={csv}>CSV татах (бүгд)</button></div>
    <p style={{ fontSize: 13.5, color: 'var(--mute)', marginTop: 6 }}>Сайттай ямар нэг байдлаар холбогдсон хүн бүр нэг удаа (давхардалгүй). Масс имэйл зөвхөн «Товхимолд зөвшөөрсөн» хүмүүст явуулна — бусдад нь зөвхөн ажил хэргийн хариу.</p>
    <div className="row" style={{ gap: 8, marginTop: 12 }}>
      <button type="button" className={'chip' + (t === 'all' ? ' on' : '')} onClick={() => setT('all')}>Бүгд<span>{rows.length}</span></button>
      <button type="button" className={'chip' + (t === 'consent' ? ' on' : '')} onClick={() => setT('consent')}>✓ Товхимолд зөвшөөрсөн<span>{rows.filter(r => r.consent).length}</span></button>
      {Object.entries(CTAGS).map(([k, v]) => cnt(k) > 0 && <button key={k} type="button" className={'chip' + (t === k ? ' on' : '')} onClick={() => setT(k)}>{v}<span>{cnt(k)}</span></button>)}
    </div>
    <input className="field" placeholder="Имэйл, нэр, утсаар хайх…" value={q} onChange={e => setQ(e.target.value)} style={{ marginTop: 12 }} />
    <div style={{ marginTop: 12, overflowX: 'auto' }}><table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
      <thead><tr style={{ textAlign: 'left', color: 'var(--mute)' }}>{['Имэйл', 'Нэр / байгууллага', 'Утас', 'Ангилал', 'Сүүлд'].map(h => <th key={h} style={{ padding: '8px 10px', borderBottom: '1.5px solid var(--line)', fontWeight: 600 }}>{h}</th>)}</tr></thead>
      <tbody>{shown.map(r => <tr key={r.email}>
        <td style={{ padding: '9px 10px', borderBottom: '1px solid var(--line)' }}><a href={'mailto:' + r.email} style={{ color: 'var(--ink)', fontWeight: 600 }}>{r.email}</a>{r.consent && <span title="Товхимолд зөвшөөрсөн" style={{ color: 'var(--v)' }}> ✓</span>}</td>
        <td style={{ padding: '9px 10px', borderBottom: '1px solid var(--line)' }}>{[r.name, r.company].filter(Boolean).join(' · ')}{r.note.length > 0 && <div style={{ color: 'var(--mute)', fontSize: 12.5 }}>{r.note.join(', ')}</div>}</td>
        <td style={{ padding: '9px 10px', borderBottom: '1px solid var(--line)', whiteSpace: 'nowrap' }}>{r.phone}</td>
        <td style={{ padding: '9px 10px', borderBottom: '1px solid var(--line)' }}>{r.tags.map(k => <span key={k} className="badge b-off" style={{ marginRight: 4, display: 'inline-block', marginBottom: 2 }}>{CTAGS[k]}</span>)}</td>
        <td style={{ padding: '9px 10px', borderBottom: '1px solid var(--line)', whiteSpace: 'nowrap', color: 'var(--mute)' }}>{fd(r.last)}</td></tr>)}</tbody></table>
      {!shown.length && <p style={{ color: 'var(--mute)', padding: 12 }}>Олдсонгүй.</p>}</div>
  </div>;
}
export default function Admin() {
  const [rf, setRf] = useState(null);
  async function refresh() {
    let off = 0, ok = 0, tot = 0; setRf('Эхэлж байна…');
    while (true) { const r = await api('/api/admin/refresh', { offset: off }); if (!r.ok) { setRf('Алдаа: ' + r.error); return; }
      ok += r.res.filter(x => x.ok).length; tot = r.total; off = r.next; setRf(`${off}/${tot} шалгасан · ${ok} амжилттай`); if (r.done) break; }
    setRf(`Дууслаа: ${tot}-аас ${ok} агентлагийн мэдээлэл шинэчлэгдлээ`);
  }
  const [ph, setPh] = useState(null);
  async function photos() {
    const sum = { inf: [0, 0], fl: [0, 0] };
    for (const kind of ['inf', 'fl']) {
      let skip = 0;
      while (true) { const r = await api('/api/admin/photos', { kind, skip }); if (!r.ok) { setPh('Алдаа: ' + r.error); return; }
        r.res.forEach(x => sum[kind][x.ok ? 0 : 1]++); skip = r.next;
        setPh(`${kind === 'inf' ? 'Инфлүэнсер' : 'Мэргэжилтэн'}: ${sum[kind][0]} зурагтай боллоо · ${sum[kind][1]} олдсонгүй`); if (r.done) break; }
    }
    setPh(`Дууслаа: инфлүэнсер ${sum.inf[0]} зурагтай боллоо (${sum.inf[1]} олдсонгүй) · мэргэжилтэн ${sum.fl[0]} (${sum.fl[1]} олдсонгүй)`);
  }
  const [s, setS] = useState(undefined); let [data, setData] = useState(null); const [err, setErr] = useState(null); const [q, setQ] = useState('');
  const [tab, setTab] = useState('leads'); const [lf, setLf] = useState('all'); const [fs, setFs] = useState('all'); const [ft, setFt] = useState('all'); const [open, setOpen] = useState(null);
  const [seen, setSeen] = useState({});
  useEffect(() => { try { setSeen(JSON.parse(localStorage.getItem('brief_admin_read') || '{}')); } catch {} }, []);
  const saveSeen = x => { setSeen(x); try { localStorage.setItem('brief_admin_read', JSON.stringify(x)); } catch {} };
  const markRead = k => { if (!seen[k]) saveSeen({ ...seen, [k]: 1 }); };
  const markAll = list => saveSeen(Object.fromEntries(list.map(i => [i.key, 1])));
  const typeSel = l => <select className="field" aria-label="Төрөл солих" style={{ marginTop: 0, width: 'auto', padding: '9px 12px' }} value={l.type} onChange={e => act('listing', l.id, 'type:' + e.target.value, `«${l.name}»-ийг «${TYPES[e.target.value]?.label}» руу зөөх үү?`)}>{Object.entries(TYPES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}</select>;
  useEffect(() => { sb().auth.getSession().then(({ data }) => setS(data.session)); }, []);
  // Эхлээд шийдвэр хүлээж буй зүйлс (хурдан), дараа нь 30 хоногийн статистик
  const [st, setSt] = useState(null);
  const load = async () => { const r = await api('/api/admin/list'); r.ok ? setData(r) : setErr(r.error); };
  useEffect(() => { if (s) { load(); api('/api/admin/list?stats=1').then(r => r.ok && setSt(r)); } }, [s]);
  const act = async (kind, id, action, confirmText) => {
    if (confirmText && !window.confirm(confirmText)) return;
    const r = await api('/api/admin/action', { kind, id, action }); r.ok ? load() : setErr(r.error);
  };
  if (s === undefined) return <section className="wrap" style={{ padding: 40 }}>…</section>;
  if (!s) return <section className="wrap" style={{ padding: 40 }}><Link href="/minii" className="btn dark">Нэвтрэх</Link></section>;
  if (err && !data) return <section className="wrap" style={{ padding: 40, display: 'grid', gap: 14 }}><div className="err">{err}{err === 'Зөвхөн админ' && <> · Одоо <b>{s.user?.email || 'тодорхойгүй'}</b> бүртгэлээр нэвтэрсэн байна.</>}</div>
    <button className="btn ghost" style={{ justifySelf: 'start' }} onClick={async () => { await sb().auth.signOut(); location.href = '/minii'; }}>Гараад өөр бүртгэлээр нэвтрэх</button></section>;
  if (!data) return <section className="wrap" style={{ padding: 40 }}>Ачаалж байна…</section>;

  if (st) data = { ...data, top: st.top, totalViews: st.totalViews, totalClicks: st.totalClicks, infTop: st.infTop, listings: data.listings.map(l => ({ ...l, clicks: st.lc[l.id] || 0 })) };
  const L = data.log || {};
  const A = (kind, id, action, c) => act(kind, id, action, c);
  const lnk = (href, t) => href ? <a href={href} target="_blank" rel="noopener" style={{ color: 'var(--v)' }}>{t}</a> : null;
  const ST = { pending: ['Шийдвэр хүлээж буй', '#B45309', '#FEF3C7'], approved: ['Батлагдсан', '#08662D', '#E1F4E7'], rejected: ['Татгалзсан', '#9F1239', '#FFE4E6'], done: ['Шийдэгдсэн', '#475569', '#E2E8F0'], info: ['Мэдээлэл', '#1D4ED8', '#DBEAFE'] };
  const stOf = s => s === 'approved' || s === 'paid' ? 'approved' : s === 'rejected' || s === 'cancelled' ? 'rejected' : s === 'pending' ? 'pending' : s;
  const items = [
    ...(L.agencies || []).map(a => ({ key: 'ag' + a.id, type: 'agency', icon: '🏢', label: a.added_by === 'owner' ? 'Агентлаг (эзэн нэмсэн)' : 'Агентлаг санал', at: a.created_at, st: stOf(a.status), decided: a.status !== 'pending' && a.updated_at, title: a.name, sub: catsOf(a).map(catLabel).join(', '),
      body: <>{lnk(a.fb_url, a.fb_url?.replace('https://www.', ''))}{a.status === 'approved' && <> · <Link href={`/a/${a.slug}`} style={{ color: 'var(--v)' }}>профайл</Link></>}</>,
      actions: a.status === 'pending' && <><button className="btn v" onClick={() => A('agency', a.id, 'approve')}>Нэмэх</button><button className="btn ghost" onClick={() => A('agency', a.id, 'reject')}>Татгалзах</button></> })),
    ...(L.influencers || []).map(l => ({ key: 'inf' + l.id, type: 'influencer', icon: '⭐', label: 'Инфлүэнсер санал', at: l.created_at, st: stOf(l.status), decided: l.status !== 'pending' && l.updated_at, title: l.name, sub: (l.niches || []).map(k => NICHES[k]).join(', '),
      body: <>{lnk(l.fb_url, 'FB ' + (l.fb_followers ? fmtNum(l.fb_followers) : ''))}{l.ig && <> · {lnk('https://www.instagram.com/' + l.ig, `IG @${l.ig} ${l.ig_followers ? fmtNum(l.ig_followers) : ''}`)}</>}{l.tiktok && <> · {lnk('https://www.tiktok.com/@' + l.tiktok, `TikTok ${l.tiktok_followers ? fmtNum(l.tiktok_followers) : ''}`)}</>}{l.bio && <div style={{ color: 'var(--mute)' }}>{l.bio}</div>}{l.contact && <div style={{ color: 'var(--mute)' }}>холбоо: {l.contact}</div>}</>,
      actions: l.status === 'pending' ? <><button className="btn v" onClick={() => A('influencer', l.id, 'approve')}>Нийтлэх</button><button className="btn ghost" onClick={() => A('influencer', l.id, 'reject')}>Татгалзах</button></>
        : l.status === 'approved' ? <button className="btn ghost" onClick={() => A('influencer', l.id, 'hide')}>Нуух</button> : <button className="btn ghost" onClick={() => A('influencer', l.id, 'approve')}>Нийтлэх</button> })),
    ...(L.listings || []).map(l => ({ key: 'ls' + l.id, type: 'listing', icon: TYPES[l.type]?.icon || '🧩', label: (TYPES[l.type]?.label || 'Жагсаалт') + ' санал', at: l.created_at, st: stOf(l.status), decided: l.status !== 'pending' && l.updated_at, title: l.name, sub: [(l.topics || []).map(topicLabel).join(', '), l.price].filter(Boolean).join(' · '),
      body: <><div>{l.description}</div><div>{lnk(l.url, host(l.url))}{l.maker && ' · ' + l.maker}{l.contact && <span style={{ color: 'var(--mute)' }}> · холбоо: {l.contact}</span>}{l.status === 'approved' && <> · <Link href={`/l/${l.id}`} style={{ color: 'var(--v)' }}>профайл</Link></>}</div></>,
      actions: <>{typeSel(l)}{l.status === 'pending' ? <><button className="btn v" onClick={() => A('listing', l.id, 'approve')}>Нийтлэх</button><button className="btn ghost" onClick={() => A('listing', l.id, 'reject')}>Татгалзах</button></> : l.status === 'approved' ? <button className="btn ghost" onClick={() => A('listing', l.id, 'hide')}>Нуух</button> : <button className="btn ghost" onClick={() => A('listing', l.id, 'approve')}>Нийтлэх</button>}</> })),
    ...(L.claims || []).map(c => ({ key: 'cl' + c.id, type: 'claim', icon: '🔑', label: 'Агентлаг эзэмших', at: c.created_at, st: stOf(c.status), decided: c.decided_at, title: <>{c.agencies?.name} ← {c.user?.full_name || c.user?.email}</>, sub: `${c.user?.email || ''} · ${c.phone || ''}`,
      body: <>«{c.note}» · {lnk(c.agencies?.fb_url, 'FB')}{c.phone && <> · <a href={'tel:' + c.phone} style={{ color: 'var(--v)' }}>залгах</a></>}</>,
      actions: c.status === 'pending' && <><button className="btn v" onClick={() => A('claim', c.id, 'approve')}>Батлах</button><button className="btn ghost" onClick={() => A('claim', c.id, 'reject', 'Татгалзах уу?')}>Татгалзах</button></> })),
    ...(L.itemClaims || []).map(c => { const link = c.item?.url || c.item?.fb_url || (c.item?.ig && 'https://www.instagram.com/' + c.item.ig); return { key: 'ic' + c.id, type: 'claim', icon: '🔑', label: (c.kind === 'influencer' ? 'Инфлүэнсер' : TYPES[c.item?.type]?.label || '') + ' эзэмших', at: c.created_at, st: stOf(c.status), decided: c.decided_at, title: <>{c.item?.name} ← {c.user?.full_name || c.user?.email}</>, sub: `${c.user?.email || ''} · ${c.phone || ''}`,
      body: <>«{c.note}»{c.phone && <> · <a href={'tel:' + c.phone} style={{ color: 'var(--v)' }}>залгах</a></>}{link && <> · {lnk(link, 'хуудсаар нь бичих')}</>}{c.proof && <> · нотолгоо: {/^https?:/.test(c.proof) ? lnk(c.proof, 'линк') : c.proof}</>}</>,
      actions: c.status === 'pending' && <><button className="btn v" onClick={() => A('own', c.id, 'approve')}>Батлах</button><button className="btn ghost" onClick={() => A('own', c.id, 'reject', 'Татгалзах уу?')}>Татгалзах</button></> }; }),
    ...(L.reviews || []).map(r => ({ key: 'rv' + r.id, type: 'review', icon: '★', label: 'Харилцагчийн үнэлгээ', at: r.created_at, st: r.draft ? stOf(r.status) : 'info', decided: r.draft && r.status !== 'pending' && r.updated_at, title: <>{r.agencies?.name} · {r.rating ? '★'.repeat(r.rating) : 'үнэлгээгүй'}</>, sub: [CONTACT[r.contacted], HIRED[r.hired], r.author].filter(Boolean).join(' · '),
      body: <>{r.draft && <div>«{r.draft}»</div>}{r.agencies?.slug && <Link href={`/a/${r.agencies.slug}`} style={{ color: 'var(--v)' }}>профайл</Link>}</>,
      actions: r.draft && (r.status === 'approved' ? <button className="btn ghost" onClick={() => A('review', r.id, 'hide')}>Сэтгэгдлийг нуух</button> : <><button className="btn v" onClick={() => A('review', r.id, 'approve')}>Нийтлэх</button>{r.status === 'pending' && <button className="btn ghost" onClick={() => A('review', r.id, 'reject')}>Нуух</button>}</>) })),
    ...(L.jobs || []).map(j => ({ key: 'jb' + j.id, type: 'job', icon: '💼', label: j.kind === 'job' ? 'Ажлын байр' : 'Төсөл, гэрээт ажил', at: j.created_at, st: stOf(j.status === 'closed' ? 'rejected' : j.status), decided: j.status !== 'pending' && j.updated_at, title: j.title, sub: [j.company, j.budget, j.location].filter(Boolean).join(' · '),
      body: <><div style={{ whiteSpace: 'pre-wrap' }}>{j.description}</div><div style={{ color: 'var(--mute)' }}>холбоо: {j.contact}{j.deadline && ' · ' + j.deadline}</div>{j.url && lnk(j.url, host(j.url))}</>,
      actions: j.status === 'pending' ? <><button className="btn v" onClick={() => A('job', j.id, 'approve')}>Нийтлэх</button><button className="btn ghost" onClick={() => A('job', j.id, 'reject')}>Татгалзах</button></> : j.status === 'approved' ? <button className="btn ghost" onClick={() => A('job', j.id, 'close')}>Хаах</button> : <button className="btn ghost" onClick={() => A('job', j.id, 'approve')}>Нийтлэх</button> })),
    ...(L.users || []).map(u => ({ key: 'us' + u.id, type: 'user', icon: '👤', label: 'Шинэ хэрэглэгч бүртгүүлсэн', at: u.created_at, st: 'info', title: u.full_name || u.email || 'Нэргүй', sub: [u.email, u.phone].filter(Boolean).join(' · '),
      body: <span style={{ color: 'var(--mute)' }}>Сайтад бүртгүүлсэн. Агентлаг эзэмших, жагсаалт нэмэх хүсэлт ирвэл тусад нь энд гарна.</span>, actions: null })),
    ...(L.members || []).map(m => ({ key: 'mb' + m.agency_id + m.user_id, type: 'claim', icon: '🔗', label: 'Агентлагт удирдагч нэмэгдсэн', at: m.created_at, st: 'info', title: <>{m.agencies?.name} ← {m.user?.full_name || m.user?.email || ''}</>, sub: m.user?.email || '',
      body: m.agencies?.slug ? <Link href={`/a/${m.agencies.slug}`} style={{ color: 'var(--v)' }}>профайл</Link> : null, actions: null })),
    ...(L.reports || []).map(r => ({ key: 'rp' + r.id, type: 'report', icon: '⚠️', label: 'Алдааны мэдээлэл', at: r.created_at, st: r.resolved ? 'done' : 'pending', title: r.agencies?.name || 'Сайтын алдаа', sub: '',
      body: <div style={{ whiteSpace: 'pre-wrap' }}>{r.message}</div>,
      actions: !r.resolved && <>{r.agencies && <Link className="btn ghost" href={`/minii?edit=${r.agencies.slug}`}>✏️ Профайлыг засах</Link>}<button className="btn ghost" onClick={() => A('report', r.id, 'resolve', 'Засаж дууссан уу?')}>✓ Засагдсан, хаах</button></> })),
    ...(L.orders || []).map(o => ({ key: 'or' + o.id, type: 'order', icon: '💳', label: PRODUCTS[o.product]?.label || 'Захиалга', at: o.created_at, st: o.status === 'pending' ? 'pending' : stOf(o.status), decided: o.paid_at, title: <>{o.code} · {fmtMnt(o.amount)}</>, sub: `${o.target_name || ''} · ${o.contact || ''}${o.months > 1 ? ` · ${o.months} сар` : ''}`,
      body: <>{o.status === 'pending' ? 'Төлбөр хүлээгдэж байна. QPay-ээр төлбөл автоматаар батлагдана, дансаар шилжүүлсэн бол гүйлгээний утгад энэ код байгаа эсэхийг шалга.' : o.status === 'paid' ? 'Төлөгдсөн, идэвхжсэн.' : 'Цуцлагдсан.'}</>,
      actions: o.status === 'pending' && <><button className="btn v" onClick={() => A('order', o.id, 'approve', `${o.code}: ${fmtMnt(o.amount)} дансанд орсон уу? Идэвхжүүлэх үү?`)}>Төлбөр орсон</button><button className="btn ghost" onClick={() => A('order', o.id, 'reject')}>Цуцлах</button></> })),
  ].sort((a, b) => String(b.at).localeCompare(String(a.at)));
  const TYPESF = { review: 'Үнэлгээ', job: 'Ажил, төсөл', user: 'Хэрэглэгч', agency: 'Агентлаг', influencer: 'Инфлүэнсер', listing: 'Мэргэжилтэн, бусад', claim: 'Эзэмших', report: 'Алдаа', order: 'Захиалга' };
  const pendingN = items.filter(i => i.st === 'pending').length;
  const unreadN = items.filter(i => !seen[i.key]).length;
  const shown = items.filter(i => (fs === 'all' || (fs === 'pending' ? i.st === 'pending' : fs === 'unread' ? !seen[i.key] : i.st !== 'pending' && i.st !== 'info')) && (ft === 'all' || i.type === ft));
  const LST = { new: ['Шинэ', '#B45309', '#FEF3C7'], forwarded: ['Дамжуулсан', '#1D4ED8', '#DBEAFE'], won: ['Ажил болсон', '#08662D', '#E1F4E7'], lost: ['Болоогүй', '#475569', '#E2E8F0'] };
  const leadsAll = data.leads || []; const newLeads = leadsAll.filter(l => (l.status || 'new') === 'new').length;
  const lshown = leadsAll.filter(l => lf === 'all' || (l.status || 'new') === lf);
  const tabs = [['leads', '🎯 Үнийн санал', newLeads], ['inbox', '📥 Хүсэлтүүд', pendingN], ['contacts', '👥 Имэйлүүд'], ['content', '🗂 Нийтлэгдсэн'], ['stats', '📊 Статистик'], ['tools', '🛠 Хэрэгсэл']];
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
    {tab === 'leads' && <>
      <div className="row" style={{ gap: 8, marginTop: 16 }}>
        {chip(lf === 'all', 'all', 'Бүгд', leadsAll.length, () => setLf('all'))}
        {Object.entries(LST).map(([k, v]) => chip(lf === k, k, v[0], leadsAll.filter(l => (l.status || 'new') === k).length, () => setLf(k)))}
      </div>
      <p style={{ fontSize: 13.5, color: 'var(--mute)', marginTop: 10 }}>Эзэнтэй агентлагт хүсэлт автоматаар имэйлээр очно. Эзэнгүй бол Messenger-ээр гараар дамжуулаад «Дамжуулсан» гэж тэмдэглэ.</p>
      {!lshown.length && <div className="panel" style={{ marginTop: 14, color: 'var(--mute)' }}>Энд юу ч алга.</div>}
      {lshown.map(l => { const q = l.answers || {}, st = l.status || 'new', S = LST[st] || LST.new;
        const facts = [['Хэрэгцээ', (q.needs || []).map(k => NEEDS[k]?.label).filter(Boolean).join(', ')], ['Төсөв', BUDGETS[q.budget]?.[0]], ['Хэмжээ', SIZES[q.size]], ['Чухалчилдаг', PRIORITIES[q.priority]], ['Салбар', q.industry]].filter(x => x[1]);
        return <div key={l.id} className="panel" style={{ marginTop: 14, display: 'grid', gap: 12 }}>
          <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}><b style={{ fontSize: 18 }}>{l.name}</b>{l.company && <span style={{ fontWeight: 600 }}>· {l.company}</span>}<span style={{ fontSize: 12.5, fontWeight: 700, color: S[1], background: S[2], borderRadius: 99, padding: '2px 9px' }}>{S[0]}</span></div>
              <div style={{ fontSize: 14, color: 'var(--mute)', marginTop: 4 }}>{fmtD(l.created_at)} · {ago(l.created_at)} · {q.source === 'profile' ? 'агентлагийн профайлаас' : q.source === 'influencer' ? 'инфлүэнсерийн хуудаснаас' : 'агентлаг сонгох шалгуураас'}{l.utm?.utm_campaign && ` · кампанит: ${l.utm.utm_campaign}`}</div>
            </div>
            <select className="field" aria-label="Төлөв" style={{ marginTop: 0, width: 'auto', padding: '9px 12px' }} value={st} onChange={e => act('lead', l.id, 'status:' + e.target.value)}>{Object.entries(LST).map(([k, v]) => <option key={k} value={k}>{v[0]}</option>)}</select>
          </div>
          <div className="row" style={{ gap: 8 }}>{l.phone && <a className="btn v" href={'tel:' + l.phone}>📞 {l.phone}</a>}{l.email && <a className="btn ghost" href={'mailto:' + l.email}>✉ {l.email}</a>}</div>
          {(facts.length > 0 || l.note) && <div style={{ background: 'var(--bg)', borderRadius: 14, padding: '12px 14px', fontSize: 14.5, display: 'grid', gap: 4 }}>
            {facts.map(([k, v]) => <div key={k}><span style={{ color: 'var(--mute)' }}>{k}:</span> {v}</div>)}{l.note && <div><span style={{ color: 'var(--mute)' }}>Нэмэлт:</span> «{l.note}»</div>}</div>}
          {q.source === 'influencer' && q.influencer && <div style={{ fontSize: 14.5 }}>Инфлүэнсер: <Link href="/influencer" style={{ color: 'var(--v)' }}>{q.influencer}</Link></div>}
          {(l.agencies || []).length > 0 && <div style={{ display: 'grid', gap: 6 }}>
            <span className="lab" style={{ margin: 0 }}>Сонгосон агентлаг ({l.agencies.length})</span>
            {l.agencies.map(sl => { const a = (data.leadAgencies || {})[sl] || { name: sl }, sent = (l.sent || {})[sl], hand = (l.handled || {})[sl];
              return <div key={sl} className="row" style={{ justifyContent: 'space-between', gap: 10, border: '1.5px solid var(--line)', borderRadius: 14, padding: '10px 12px' }}>
                <div style={{ minWidth: 0 }}><Link href={`/a/${sl}`} style={{ fontWeight: 700 }}>{a.name}</Link>
                  <div style={{ fontSize: 13.5, color: sent || hand ? 'var(--v)' : a.owned ? '#B45309' : 'var(--mute)' }}>
                    {sent ? `✓ Эзэнд нь имэйлээр очсон · ${fmtD(sent)}` : a.owned ? 'Эзэнтэй, гэхдээ имэйл явсангүй' : 'Эзэнгүй — гараар дамжуулах'}{hand && ` · ✓ гараар дамжуулсан ${fmtD(hand)}`}</div></div>
                <div className="row" style={{ gap: 6 }}>{a.fb_url && <a className="btn ghost" href={a.fb_url} target="_blank" rel="noopener">FB хуудас</a>}
                  <button type="button" className={hand ? 'btn ghost' : 'btn dark'} onClick={() => act('lead', l.id, 'mark:' + sl)}>{hand ? 'Тэмдэг арилгах' : 'Дамжуулсан'}</button></div>
              </div>; })}
          </div>}
        </div>; })}
    </>}
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
    {tab === 'contacts' && <Contacts />}
    {tab === 'stats' && <>
      <SubStats />
      <Box title={`Агентлаг — хамгийн их үзэлттэй (30 хоног · нийт ${data.totalViews ?? "…"} үзэлт, ${data.totalClicks ?? "…"} дарсан)`} n={data.top.length}>
        {data.top.map((a, i) => <Row key={a.slug} actions={<Link className="btn ghost" href={`/minii?edit=${a.slug}`}>Статистик</Link>}><b>{i + 1}. {a.name}</b> <span style={{ color: 'var(--mute)' }}>· {a.views} үзэлт · {a.clicks} дарсан</span></Row>)}
      </Box>
      <Box title={`Төлөгдсөн захиалга · нийт ${fmtMnt(data.orders.filter(o => o.status === 'paid').reduce((s, o) => s + o.amount, 0))}`} n={data.orders.filter(o => o.status === 'paid').length}>{data.orders.filter(o => o.status === 'paid').map(o => <Row key={o.id}>
        <b>{o.code}</b> · {PRODUCTS[o.product]?.label} · {fmtMnt(o.amount)} <span style={{ color: 'var(--mute)' }}>· {o.target_name} · {fmtD(o.paid_at)}</span></Row>)}</Box>
    </>}
    {tab === 'tools' && <>
      <div className="panel" style={{ marginTop: 18 }}>
        <h2 className="h" style={{ fontSize: 20, fontWeight: 700 }}>🤝 Инфлүэнсерийн самбар (Contento)</h2>
        <p style={{ color: 'var(--mute)', marginTop: 6 }}>Инфлүэнсерийн хүсэлт, профайл, үйлдлийн түүх, самбарын эрх (хамгийн ихдээ 3 имэйл).</p>
        <Link href="/partner" className="btn dark" style={{ marginTop: 10 }}>Самбар нээх</Link>
      </div>
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
      <div className="panel" style={{ marginTop: 18 }}>
        <h2 className="h" style={{ fontSize: 20, fontWeight: 700 }}>🖼 Профайлын зураг татах</h2>
        <p style={{ color: 'var(--mute)', marginTop: 6 }}>Зураггүй инфлүэнсер, мэргэжилтний зургийг тэдний нийтэд ил профайлаас (Facebook, Instagram, TikTok, YouTube, Behance) татаж хадгална. Аль хэдийн зурагтайг нь хөндөхгүй. Хэдэн минут болно, хуудсаа бүү хаа.</p>
        <div className="row" style={{ marginTop: 10 }}><button className="btn v" disabled={ph && !ph.startsWith('Дууслаа') && !ph.startsWith('Алдаа')} onClick={photos}>Зураг татах</button>{ph && <span style={{ fontWeight: 600 }}>{ph}</span>}</div>
      </div>
    </>}
  </section>;
}
