'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { sb, api } from '@/lib/sbclient';
import { NICHES, fmtNum, PARTNER, PSTATUS } from '@/lib/config';
const fmtD = t => { if (!t) return ''; const d = new Date(t), p = x => String(x).padStart(2, '0'); return `${d.getFullYear()}.${p(d.getMonth() + 1)}.${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`; };
const ISTAT = { pending: ['Хүлээгдэж буй', '#B26A00', '#FFF4DB'], approved: ['Нийтэд харагдаж буй', '#1F7A3A', '#E5F5E8'], hidden: ['Нуусан', '#555B6E', '#EEEFF3'], rejected: ['Татгалзсан', '#8A2A2A', '#F6E7E7'] };
const PCOL = { new: '#3451B2', contacted: '#7A5AF8', quoted: '#B26A00', won: '#1F7A3A', lost: '#8A8F9C' };
const ACT = { lead_update: 'Хүсэлт шинэчилсэн', inf_approve: 'Профайл баталсан', inf_reject: 'Профайл татгалзсан', inf_hide: 'Профайл нуусан', inf_show: 'Профайл ил болгосон', inf_edit: 'Профайл зассан', inf_badge_on: 'Шошго тавьсан', inf_badge_off: 'Шошго авсан', undo: 'Буцаасан', access_add: 'Эрх нэмсэн', access_remove: 'Эрх хассан' };
const FL = { pstatus: 'Төлөв', deal_amount: 'Дүн', paid_at: 'Төлөгдсөн', pnote: 'Тэмдэглэл', status: 'Төлөв', badge: 'Шошго', name: 'Нэр', bio: 'Тайлбар', niches: 'Ангилал', ig: 'IG', ig_followers: 'IG дагагч', fb_url: 'FB', fb_followers: 'FB дагагч', tiktok: 'TikTok', tiktok_followers: 'TikTok дагагч', youtube: 'YouTube', yt_followers: 'YT дагагч' };
const fv = (k, v) => v == null || v === '' ? '—' : k === 'pstatus' ? PSTATUS[v] || v : k === 'status' ? (ISTAT[v]?.[0] || v) : Array.isArray(v) ? v.join(', ') : String(v);
const Pill = ({ c, bg, children }) => <span style={{ display: 'inline-block', fontSize: 12.5, fontWeight: 600, color: c, background: bg, borderRadius: 999, padding: '3px 10px', whiteSpace: 'nowrap' }}>{children}</span>;
const box = { background: '#fff', borderRadius: 20, padding: 18, border: '1px solid var(--line)' };
const mnt = n => n == null ? '' : Number(n).toLocaleString('en-US').replace(/,/g, "'") + '₮';

function LeadRow({ l, onSaved }) {
  const [f, setF] = useState({ pstatus: l.pstatus || 'new', deal_amount: l.deal_amount ?? '', paid_at: l.paid_at || '', pnote: l.pnote || '' });
  const [busy, setBusy] = useState(false); const [msg, setMsg] = useState('');
  const dirty = f.pstatus !== (l.pstatus || 'new') || String(f.deal_amount) !== String(l.deal_amount ?? '') || f.paid_at !== (l.paid_at || '') || f.pnote !== (l.pnote || '');
  async function save() { setBusy(true); setMsg(''); const r = await api('/api/partner/action', { kind: 'lead', id: l.id, set: f }); setBusy(false); if (r.ok) { setMsg('Хадгаллаа'); onSaved(); } else setMsg(r.error || 'Алдаа'); }
  const a = l.answers || {};
  return <div style={{ ...box, display: 'grid', gridTemplateColumns: 'minmax(240px,1.2fr) minmax(260px,1fr)', gap: 18 }} className="plead">
    <div>
      <div className="row" style={{ gap: 8, alignItems: 'center' }}><b style={{ fontSize: 17 }}>{l.name}</b>{l.company && <span style={{ color: 'var(--mute)' }}>· {l.company}</span>}</div>
      <div style={{ fontSize: 13, color: 'var(--mute)', marginTop: 2 }}>{fmtD(l.created_at)} · Инфлүэнсер: <a href={'/influencer?q=' + encodeURIComponent(a.influencer_name || '')} target="_blank" style={{ fontWeight: 600 }}>{a.influencer_name || a.influencer || '—'}</a></div>
      <div className="row" style={{ gap: 14, marginTop: 8, fontSize: 14.5 }}>{l.phone && <a href={'tel:' + l.phone.replace(/\s/g, '')} style={{ fontWeight: 600 }}>📞 {l.phone}</a>}{l.email && <a href={'mailto:' + l.email} style={{ fontWeight: 600 }}>✉ {l.email}</a>}</div>
      {l.note && <p style={{ marginTop: 8, fontSize: 14.5, background: 'var(--bg)', borderRadius: 12, padding: '8px 12px' }}>{l.note}</p>}
      {l.pupdated_at && <div style={{ fontSize: 12, color: 'var(--mute)', marginTop: 6 }}>Сүүлд шинэчилсэн: {fmtD(l.pupdated_at)}</div>}
    </div>
    <div style={{ display: 'grid', gap: 8, alignContent: 'start' }}>
      <select className="field" style={{ marginTop: 0, fontWeight: 600, color: PCOL[f.pstatus] }} value={f.pstatus} onChange={e => setF({ ...f, pstatus: e.target.value })} aria-label="Төлөв">{Object.entries(PSTATUS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
      <div className="row" style={{ gap: 8 }}>
        <input className="field" style={{ marginTop: 0, flex: 1 }} inputMode="numeric" placeholder="Гэрээний дүн, ₮ (НӨАТ-гүй)" value={f.deal_amount} onChange={e => setF({ ...f, deal_amount: e.target.value.replace(/[^\d]/g, '') })} aria-label="Гэрээний дүн" />
        <input className="field" style={{ marginTop: 0, width: 160 }} type="date" value={f.paid_at} onChange={e => setF({ ...f, paid_at: e.target.value })} aria-label="Төлөгдсөн огноо" title="Төлбөр орсон огноо" />
      </div>
      <textarea className="field" style={{ marginTop: 0 }} rows={2} placeholder="Тэмдэглэл" value={f.pnote} onChange={e => setF({ ...f, pnote: e.target.value })} aria-label="Тэмдэглэл" />
      <div className="row" style={{ gap: 10, alignItems: 'center' }}><button className="btn dark" disabled={!dirty || busy} onClick={save}>{busy ? '…' : 'Хадгалах'}</button>{f.deal_amount && <span style={{ fontSize: 13, color: 'var(--mute)' }}>{mnt(f.deal_amount)}</span>}{msg && <span style={{ fontSize: 13, color: msg === 'Хадгаллаа' ? '#1F7A3A' : '#8A2A2A' }}>{msg}</span>}</div>
    </div>
  </div>;
}

const EF = [['name', 'Нэр'], ['bio', 'Тайлбар'], ['ig', 'Instagram хаяг'], ['ig_followers', 'Instagram дагагч'], ['fb_url', 'Facebook холбоос'], ['fb_followers', 'Facebook дагагч'], ['tiktok', 'TikTok хаяг'], ['tiktok_followers', 'TikTok дагагч'], ['youtube', 'YouTube холбоос'], ['yt_followers', 'YouTube дагагч']];
function InfRow({ x, admin, onSaved }) {
  const [ed, setEd] = useState(false); const [f, setF] = useState(null); const [busy, setBusy] = useState(false); const [err, setErr] = useState('');
  async function act(op, set) { setBusy(true); setErr(''); const r = await api('/api/partner/action', { kind: 'inf', id: x.id, op, set }); setBusy(false); if (r.ok) { setEd(false); onSaved(); } else setErr(r.error || 'Алдаа'); }
  const st = ISTAT[x.status] || [x.status, '#555', '#eee']; const locked = x.verified && !admin;
  return <div style={box}>
    <div className="row" style={{ gap: 12, alignItems: 'center', justifyContent: 'space-between' }}>
      <div className="row" style={{ gap: 12, alignItems: 'center', minWidth: 0 }}>
        {x.photo_url ? <img src={x.photo_url} alt="" style={{ width: 46, height: 46, borderRadius: '50%', objectFit: 'cover' }} /> : <div style={{ width: 46, height: 46, borderRadius: '50%', background: 'var(--b2)', display: 'grid', placeItems: 'center', fontWeight: 700, color: 'var(--b)' }}>{(x.name || '?')[0]}</div>}
        <div style={{ minWidth: 0 }}><div className="row" style={{ gap: 6, alignItems: 'center' }}><b>{x.name}</b>{x.verified && <Pill c="#1F7A3A" bg="#E5F5E8">✓ Эзэнтэй</Pill>}{x.badge === PARTNER.key && <Pill c="#2B4499" bg="#E8EDFC">{PARTNER.name}</Pill>}</div>
          <div style={{ fontSize: 13, color: 'var(--mute)' }}>{fmtNum(x.reach)} дагагч · {(x.niches || []).map(k => NICHES[k] || k).join(', ')} · {fmtD(x.created_at)}</div></div>
      </div>
      <div className="row" style={{ gap: 6, alignItems: 'center' }}><Pill c={st[1]} bg={st[2]}>{st[0]}</Pill>
        {x.status === 'pending' && <><button className="btn dark" disabled={busy} onClick={() => act('approve')}>Батлах</button><button className="btn ghost" disabled={busy} onClick={() => act('reject')}>Татгалзах</button></>}
        {x.status === 'approved' && <button className="btn ghost" disabled={busy} onClick={() => act('hide')}>Нуух</button>}
        {(x.status === 'hidden' || x.status === 'rejected') && <button className="btn ghost" disabled={busy} onClick={() => act('show')}>Ил болгох</button>}
        <button className="btn ghost" disabled={busy} onClick={() => act(x.badge === PARTNER.key ? 'badge_off' : 'badge_on')}>{x.badge === PARTNER.key ? 'Шошго авах' : 'Шошго тавих'}</button>
        <button className="btn ghost" disabled={busy || locked} title={locked ? 'Эзэнтэй профайлыг эзнийх нь зөвшөөрөлгүй засахгүй' : ''} onClick={() => { setF(Object.fromEntries(EF.map(([k]) => [k, x[k] ?? '']).concat([['niches', x.niches || []]]))); setEd(!ed); }}>Засах</button>
      </div>
    </div>
    {err && <div className="err" style={{ marginTop: 8 }}>{err}</div>}
    {ed && f && <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 8 }}>
      {EF.map(([k, lab]) => <label key={k} style={{ fontSize: 12.5, color: 'var(--mute)', fontWeight: 600 }}>{lab}<input className="field" style={{ marginTop: 3 }} value={f[k]} onChange={e => setF({ ...f, [k]: e.target.value })} /></label>)}
      <div style={{ gridColumn: '1/-1' }}><div style={{ fontSize: 12.5, color: 'var(--mute)', fontWeight: 600, marginBottom: 4 }}>Ангилал (1–3)</div><div className="row" style={{ gap: 6 }}>{Object.entries(NICHES).map(([k, v]) => <button key={k} type="button" className={'chip' + (f.niches.includes(k) ? ' on' : '')} onClick={() => setF({ ...f, niches: f.niches.includes(k) ? f.niches.filter(n => n !== k) : [...f.niches, k].slice(0, 3) })}>{v}</button>)}</div></div>
      <div className="row" style={{ gap: 8, gridColumn: '1/-1' }}><button className="btn dark" disabled={busy} onClick={() => act('edit', f)}>Хадгалах</button><button className="btn ghost" onClick={() => setEd(false)}>Болих</button></div>
    </div>}
  </div>;
}

function Access({ partners, onSaved }) {
  const [email, setEmail] = useState(''); const [err, setErr] = useState('');
  async function go(op, e) { setErr(''); const r = await api('/api/partner/action', { kind: 'partner', op, email: e }); if (r.ok) { setEmail(''); onSaved(); } else setErr(r.error || 'Алдаа'); }
  return <div style={{ ...box, marginTop: 14 }}>
    <b>Самбарын эрх ({partners.length}/3)</b><p style={{ fontSize: 13.5, color: 'var(--mute)', marginTop: 4 }}>{PARTNER.name}-гийн ажилтнуудын Google имэйл. Энэ хэсгийг зөвхөн brief.mn-ийн админ харна.</p>
    {partners.map(p => <div key={p.email} className="row" style={{ gap: 10, alignItems: 'center', marginTop: 8 }}><span style={{ fontWeight: 600 }}>{p.email}</span><span style={{ fontSize: 12.5, color: 'var(--mute)' }}>{fmtD(p.added_at)}</span><button className="btn ghost" onClick={() => go('remove', p.email)}>Хасах</button></div>)}
    {partners.length < 3 && <form className="row" style={{ gap: 8, marginTop: 10 }} onSubmit={e => { e.preventDefault(); go('add', email); }}><input className="field" style={{ marginTop: 0, flex: 1, maxWidth: 340 }} type="email" placeholder="ner@contento.mn" value={email} onChange={e => setEmail(e.target.value)} /><button className="btn dark">Эрх өгөх</button></form>}
    {err && <div className="err" style={{ marginTop: 8 }}>{err}</div>}
  </div>;
}

export default function Partner() {
  const [s, setS] = useState(undefined); const [data, setData] = useState(null); const [err, setErr] = useState(null);
  const [tab, setTab] = useState('leads'); const [lf, setLf] = useState('open'); const [isf, setIsf] = useState('pending'); const [q, setQ] = useState('');
  useEffect(() => { sb().auth.getSession().then(({ data }) => setS(data.session)); }, []);
  const load = () => api('/api/partner/list').then(r => r.ok ? (setData(r), setErr(null)) : setErr(r.error || 'Алдаа'));
  useEffect(() => { if (s) load(); }, [s]);
  if (s === undefined) return null;
  if (!s) return <section className="wrap" style={{ paddingTop: 40, paddingBottom: 40 }}><h1 className="h" style={{ fontSize: 26 }}>Инфлүэнсерийн самбар</h1><p style={{ color: 'var(--mute)', margin: '8px 0 16px' }}>Эрх олгогдсон Google хаягаараа нэвтэрнэ.</p><Link href="/minii?next=/partner" className="btn dark">Нэвтрэх</Link></section>;
  if (err) return <section className="wrap" style={{ paddingTop: 40, paddingBottom: 40 }}><p className="err">{err}</p><button className="btn ghost" style={{ marginTop: 12 }} onClick={() => sb().auth.signOut().then(() => location.reload())}>Өөр хаягаар нэвтрэх</button></section>;
  if (!data) return <section className="wrap" style={{ paddingTop: 40, paddingBottom: 40 }}>Ачаалж байна…</section>;
  const admin = data.role === 'admin';
  const L = data.leads, I = data.influencers;
  const open = l => !['won', 'lost'].includes(l.pstatus || 'new');
  const leads = L.filter(l => lf === 'all' || (lf === 'open' ? open(l) : (l.pstatus || 'new') === lf));
  const won = L.filter(l => l.pstatus === 'won'); const sum = won.reduce((a, l) => a + (Number(l.deal_amount) || 0), 0);
  const infs = I.filter(x => (isf === 'all' || x.status === isf || (isf === 'badge' && x.badge === PARTNER.key)) && (!q.trim() || (x.name + ' ' + (x.ig || '')).toLowerCase().includes(q.trim().toLowerCase())));
  const ic = k => I.filter(x => k === 'badge' ? x.badge === PARTNER.key : x.status === k).length;
  const T = (k, label, n) => <button type="button" className={'chip' + (tab === k ? ' on' : '')} onClick={() => setTab(k)}>{label}{n != null && <span>{n}</span>}</button>;
  const F = (cur, set, k, label, n) => <button key={k} type="button" className={'chip' + (cur === k ? ' on' : '')} onClick={() => set(k)}>{label}<span>{n}</span></button>;
  return <section className="wrap" style={{ paddingTop: 28, paddingBottom: 60 }}>
    <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
      <div className="row" style={{ gap: 12, alignItems: 'center' }}><img src={PARTNER.logo} alt="" style={{ width: 44, height: 44, borderRadius: '50%' }} /><div><h1 className="h" style={{ fontSize: 24 }}>Инфлүэнсерийн самбар</h1><div style={{ fontSize: 13.5, color: 'var(--mute)' }}>brief.mn × {PARTNER.name} · {data.email}{admin ? ' · админ' : ''}</div></div></div>
      <button className="btn ghost" onClick={() => sb().auth.signOut().then(() => location.reload())}>Гарах</button>
    </div>
    <div className="row" style={{ gap: 12, marginTop: 18 }}>
      {[['Шинэ хүсэлт', L.filter(l => (l.pstatus || 'new') === 'new').length], ['Явагдаж буй', L.filter(open).length], ['Гэрээ байгуулсан', won.length], ['Гэрээний нийт дүн', mnt(sum) || '0₮'], ['Батлах профайл', ic('pending')]].map(([k, v]) => <div key={k} style={{ ...box, padding: '12px 16px', minWidth: 150 }}><div style={{ fontSize: 12.5, color: 'var(--mute)', fontWeight: 600 }}>{k}</div><b className="h" style={{ fontSize: 24 }}>{v}</b></div>)}
    </div>
    <div className="row" style={{ gap: 8, marginTop: 18 }}>{T('leads', '📥 Хүсэлтүүд', L.length)}{T('infs', '👤 Инфлүэнсерүүд', I.length)}{T('log', '🕘 Үйлдлийн түүх', data.log.length)}</div>
    {tab === 'leads' && <>
      <div className="row" style={{ gap: 6, marginTop: 14 }}>{F(lf, setLf, 'open', 'Явагдаж буй', L.filter(open).length)}{Object.entries(PSTATUS).map(([k, v]) => F(lf, setLf, k, v, L.filter(l => (l.pstatus || 'new') === k).length))}{F(lf, setLf, 'all', 'Бүгд', L.length)}</div>
      <p style={{ fontSize: 13, color: 'var(--mute)', marginTop: 8 }}>Төлөв өөрчлөгдсөнөөс хойш 3 ажлын өдөрт шинэчилнэ. Гэрээний дүн, төлбөр орсон огноо нь сарын тайлан, шимтгэлийн тооцоонд ордог.</p>
      <div style={{ display: 'grid', gap: 10, marginTop: 10 }}>{leads.map(l => <LeadRow key={l.id + (l.pupdated_at || '')} l={l} onSaved={load} />)}{!leads.length && <p style={{ color: 'var(--mute)' }}>Хүсэлт алга.</p>}</div>
    </>}
    {tab === 'infs' && <>
      <div className="row" style={{ gap: 6, marginTop: 14 }}>{Object.entries(ISTAT).map(([k, v]) => F(isf, setIsf, k, v[0], ic(k)))}{F(isf, setIsf, 'badge', PARTNER.name + ' шошготой', ic('badge'))}{F(isf, setIsf, 'all', 'Бүгд', I.length)}</div>
      <input className="field" placeholder="Нэр, Instagram-аар хайх…" value={q} onChange={e => setQ(e.target.value)} style={{ marginTop: 10, maxWidth: 420 }} />
      <p style={{ fontSize: 13, color: 'var(--mute)', marginTop: 8 }}>Шошгыг зөвхөн {PARTNER.name}-той хамтрахаар зөвшөөрсөн инфлүэнсерт тавина. Эзэнтэй профайлыг эзнийх нь зөвшөөрөлгүй засахгүй.</p>
      <div style={{ display: 'grid', gap: 10, marginTop: 10 }}>{infs.slice(0, 200).map(x => <InfRow key={x.id + x.status + (x.badge || '')} x={x} admin={admin} onSaved={load} />)}{!infs.length && <p style={{ color: 'var(--mute)' }}>Олдсонгүй.</p>}</div>
    </>}
    {tab === 'log' && <div style={{ ...box, marginTop: 14, overflowX: 'auto' }}><table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
      <thead><tr style={{ textAlign: 'left', color: 'var(--mute)' }}>{['Хэзээ', 'Хэн', 'Үйлдэл', 'Юун дээр', 'Өөрчлөлт', ''].map(h => <th key={h} style={{ padding: '8px 10px', borderBottom: '1.5px solid var(--line)', fontWeight: 600 }}>{h}</th>)}</tr></thead>
      <tbody>{data.log.map(g => <tr key={g.id} style={{ opacity: g.undone ? .5 : 1 }}>
        <td style={{ padding: '8px 10px', borderBottom: '1px solid var(--line)', whiteSpace: 'nowrap' }}>{fmtD(g.created_at)}</td>
        <td style={{ padding: '8px 10px', borderBottom: '1px solid var(--line)' }}>{g.actor}</td>
        <td style={{ padding: '8px 10px', borderBottom: '1px solid var(--line)' }}>{ACT[g.action] || g.action}{g.undone && ' (буцаасан)'}</td>
        <td style={{ padding: '8px 10px', borderBottom: '1px solid var(--line)', fontWeight: 600 }}>{g.label}</td>
        <td style={{ padding: '8px 10px', borderBottom: '1px solid var(--line)', fontSize: 12.5, color: 'var(--mute)' }}>{g.before && Object.keys(g.before).map(k => `${FL[k] || k}: ${fv(k, g.before[k])} → ${fv(k, g.after?.[k])}`).join(' · ')}</td>
        <td style={{ padding: '8px 10px', borderBottom: '1px solid var(--line)' }}>{admin && !g.undone && g.before && g.action !== 'undo' && <button className="btn ghost" onClick={async () => { const r = await api('/api/partner/action', { kind: 'undo', id: g.id }); r.ok ? load() : alert(r.error); }}>Буцаах</button>}</td></tr>)}</tbody></table>
      {!data.log.length && <p style={{ color: 'var(--mute)', padding: 10 }}>Одоогоор үйлдэл алга.</p>}</div>}
    {admin && <Access partners={data.partners || []} onSaved={load} />}
  </section>;
}
