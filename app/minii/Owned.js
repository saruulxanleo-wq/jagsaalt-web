'use client';
import { useState } from 'react';
import Link from 'next/link';
import { api, sb } from '@/lib/sbclient';
import { resize } from './EditAgency';
import { TYPES, TOPICS, NICHES, PRODUCTS, priceFor, fmtMnt } from '@/lib/config';
import { BankBox } from '../tolbor/Pay';
const fmtN = n => n >= 1e6 ? (n / 1e6).toFixed(1).replace('.0', '') + 'M' : n >= 1e3 ? Math.round(n / 1e3) + 'K' : String(n || 0);
const PROOF = {
  community: 'Группийнхээ тайлбар (About) эсвэл админ постонд доорх кодыг түр тавиад, тэр постын линкийг оруул.',
  freelancer: 'Facebook профайл эсвэл портфолиогийнхоо bio-д доорх кодыг түр тавиад линкийг оруул.',
  course: 'Сургалтын FB пэйж эсвэл вэбсайтын хуудсанд кодыг түр тавина уу. Эсвэл тухайн домэйны и-мэйлээр (жишээ нь info@сургалт.mn) бидэнд код илгээ.',
  media: 'Байгууллагынхаа вэбсайт эсвэл FB пэйжид кодыг түр тавина уу. Эсвэл тухайн домэйны и-мэйлээр бидэнд код илгээ.',
  tool: 'Хэрэгслийн вэбсайт эсвэл FB пэйжид кодыг түр тавина уу. Эсвэл тухайн домэйны и-мэйлээр бидэнд код илгээ.',
  influencer: 'Instagram/TikTok bio эсвэл Facebook пост дээрээ кодыг түр тавиад линкийг оруул.',
};
export function ClaimItem({ own, onDone }) {
  const [note, setNote] = useState(''); const [proof, setProof] = useState(''); const [busy, setBusy] = useState(false); const [err, setErr] = useState(null); const [ok, setOk] = useState(false);
  if (own.mine) return <div className="ok" style={{ marginTop: 18 }}>«{own.name}» аль хэдийн чинийх. Доороос засна.</div>;
  if (own.taken) return <div className="err" style={{ marginTop: 18 }}>«{own.name}» өөр хүнд баталгаажсан байна. Алдаа гэж үзвэл бидэнтэй холбогд.</div>;
  if (ok) return <div className="panel ok" style={{ marginTop: 18 }}>Хүсэлт илгээгдлээ. Код болон линкийг шалгаад батлагдмагц и-мэйлээр мэдэгдэнэ.</div>;
  const label = own.kind === 'influencer' ? 'Инфлүэнсер профайл' : TYPES[own.type]?.label;
  return <form className="panel" style={{ marginTop: 18, display: 'grid', gap: 14, boxShadow: 'inset 0 0 0 3px var(--v)' }} onSubmit={async e => { e.preventDefault(); setBusy(true); setErr(null); const r = await api('/api/own/claim', { own: own.kind + ':' + own.id, note, proof }); setBusy(false); r.ok ? (setOk(true), onDone?.()) : setErr(r.error); }}>
    <h2 className="h" style={{ fontSize: 20, fontWeight: 700 }}>Эзэмших: {own.name} <span style={{ color: 'var(--mute)', fontSize: 15 }}>· {label}</span></h2>
    <div style={{ background: 'var(--bg)', borderRadius: 16, padding: 14 }}>
      <div style={{ fontSize: 14, color: 'var(--mute)' }}>Баталгаажуулах код</div>
      <div className="h" style={{ fontSize: 26, fontWeight: 800, letterSpacing: '.08em' }}>{own.code}</div>
      <p style={{ fontSize: 14.5, marginTop: 6 }}>{PROOF[own.type] || PROOF.tool} Батлагдсаны дараа кодыг устгаж болно.</p>
      {own.url && <a href={own.url} target="_blank" rel="noopener" style={{ fontSize: 14, color: 'var(--v)' }}>{own.url} ↗</a>}
    </div>
    <div><label htmlFor="on" className="lab">Ямар холбоотой вэ?</label><input id="on" className="field" required placeholder={own.type === 'community' ? 'Группийн админ / үүсгэн байгуулагч' : own.kind === 'influencer' ? 'Өөрөө / менежер' : 'Үүсгэн байгуулагч, багш…'} value={note} onChange={e => setNote(e.target.value)} /></div>
    <div><label htmlFor="op" className="lab">Код тавьсан линк <span style={{ color: 'var(--mute)', fontWeight: 500 }}>· эсвэл аль и-мэйлээс илгээснээ бич</span></label><input id="op" className="field" value={proof} onChange={e => setProof(e.target.value)} /></div>
    {err && <div className="err">{err}</div>}
    <button className="btn dark" disabled={busy} style={{ padding: 15 }}>{busy ? 'Илгээж байна…' : 'Эзэмших хүсэлт илгээх →'}</button>
  </form>;
}
const chip = (on, k, v, tog) => <button type="button" key={k} aria-pressed={on} className={'chip' + (on ? ' on' : '')} onClick={() => tog(k)}>{on && '✓ '}{v}</button>;
// Зураг файлаар оруулах: 400×400 webp болгож шахаад шууд хадгална
function ImgPick({ own, value, onChange, label, round }) {
  const [busy, setBusy] = useState(false); const [err, setErr] = useState(null);
  async function pick(e) {
    const file = e.target.files?.[0]; e.target.value = ''; if (!file) return;
    setBusy(true); setErr(null);
    try {
      const blob = await resize(file, false); const fd = new FormData();
      fd.append('file', new File([blob], 'img.webp', { type: 'image/webp' })); fd.append('own', own);
      const { data } = await sb().auth.getSession();
      const r = await fetch('/api/own/image', { method: 'POST', headers: { Authorization: 'Bearer ' + data.session?.access_token }, body: fd });
      const j = await r.json(); if (!r.ok) throw new Error(j.error || 'Хадгалж чадсангүй'); onChange(j.url);
    } catch (x) { setErr(x.message); } setBusy(false);
  }
  return <div><label className="lab">{label}</label>
    <div className="row" style={{ gap: 14, marginTop: 6 }}>
      {value ? <img src={value} alt="" style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: round ? '50%' : 14, border: '1.5px solid var(--line)' }} />
        : <div style={{ width: 64, height: 64, borderRadius: round ? '50%' : 14, border: '1.5px dashed var(--line)', display: 'grid', placeItems: 'center', color: 'var(--mute)', fontSize: 22 }}>+</div>}
      <label className="btn ghost" style={{ cursor: 'pointer' }}>{busy ? 'Хуулж байна…' : value ? 'Зураг солих' : 'Зураг оруулах'}<input type="file" accept="image/png,image/jpeg,image/webp" onChange={pick} hidden disabled={busy} /></label>
      {value && !busy && <button type="button" className="btn ghost" onClick={() => onChange('')}>Хасах</button>}
    </div>
    <p style={{ fontSize: 13, color: 'var(--mute)', marginTop: 6 }}>Дөрвөлжин тайрч автоматаар шахна. Хасвал «Хадгалах» дарж баталгаажуул.</p>
    {err && <div className="err" style={{ marginTop: 8 }}>{err}</div>}</div>;
}
function EditListing({ l, onSaved }) {
  const [f, setF] = useState({ name: l.name || '', maker: l.maker || '', description: l.description || '', price: l.price || '', url: l.url || '', logo_url: l.logo_url || '', topics: l.topics || [] });
  const [busy, setBusy] = useState(false); const [msg, setMsg] = useState(null);
  const set = k => e => setF({ ...f, [k]: e.target.value });
  const tog = k => setF({ ...f, topics: f.topics.includes(k) ? f.topics.filter(x => x !== k) : f.topics.length >= 3 ? f.topics : [...f.topics, k] });
  const fl = l.type === 'freelancer';
  return <form style={{ display: 'grid', gap: 12, marginTop: 14 }} onSubmit={async e => { e.preventDefault(); setBusy(true); setMsg(null); const r = await api('/api/own/update', { own: 'listing:' + l.id, data: f }); setBusy(false); setMsg(r.ok ? ['ok', 'Хадгалагдлаа'] : ['err', r.error]); if (r.ok) onSaved?.(); }}>
    <div className="row" style={{ gap: 12, alignItems: 'flex-start' }}>
      <div style={{ flex: 2, minWidth: 220 }}><label className="lab">Нэр</label><input className="field" value={f.name} onChange={set('name')} maxLength={80} /></div>
      <div style={{ flex: 1, minWidth: 180 }}><label className="lab">{fl ? 'Мэргэжил' : l.type === 'media' ? 'Төрөл' : 'Бүтээгч'}</label><input className="field" value={f.maker} onChange={set('maker')} maxLength={60} /></div></div>
    <div><label className="lab">Тайлбар · {f.description.length}/200</label><textarea className="field" rows={3} maxLength={200} value={f.description} onChange={set('description')} /></div>
    <div className="row" style={{ gap: 12, alignItems: 'flex-start' }}>
      <div style={{ flex: 2, minWidth: 220 }}><label className="lab">Линк</label><input className="field" value={f.url} onChange={set('url')} /></div>
      <div style={{ flex: 1, minWidth: 160 }}><label className="lab">Үнэ</label><input className="field" value={f.price} onChange={set('price')} maxLength={40} /></div></div>
    <ImgPick own={'listing:' + l.id} label={fl ? 'Зураг' : 'Лого'} round={fl} value={f.logo_url} onChange={v => setF(x => ({ ...x, logo_url: v }))} />
    <div className="row">{Object.entries(TOPICS).map(([k, v]) => chip(f.topics.includes(k), k, v, tog))}</div>
    {msg && <div className={msg[0]}>{msg[1]}</div>}
    <button className="btn dark" disabled={busy}>{busy ? '…' : 'Хадгалах'}</button>
  </form>;
}
function EditInfluencer({ l, onSaved }) {
  const [f, setF] = useState({ bio: l.bio || '', photo_url: l.photo_url || '', niches: l.niches || [], ig: l.ig || '', tiktok: l.tiktok || '', fb_url: l.fb_url || '', youtube: l.youtube || '', dm_url: (l.dm_url || '').replace(/^(tel:\+976|tel:|mailto:)/, '') });
  const [busy, setBusy] = useState(false); const [msg, setMsg] = useState(null);
  const set = k => e => setF({ ...f, [k]: e.target.value });
  const tog = k => setF({ ...f, niches: f.niches.includes(k) ? f.niches.filter(x => x !== k) : f.niches.length >= 3 ? f.niches : [...f.niches, k] });
  return <form style={{ display: 'grid', gap: 12, marginTop: 14 }} onSubmit={async e => { e.preventDefault(); setBusy(true); setMsg(null); const r = await api('/api/own/update', { own: 'influencer:' + l.id, data: f }); setBusy(false); setMsg(r.ok ? ['ok', 'Хадгалагдлаа'] : ['err', r.error]); if (r.ok) onSaved?.(); }}>
    <div><label className="lab">Товч танилцуулга · {f.bio.length}/160</label><input className="field" maxLength={160} value={f.bio} onChange={set('bio')} /></div>
    <div className="row" style={{ gap: 12, alignItems: 'flex-start' }}>
      <div style={{ flex: 1, minWidth: 180 }}><label className="lab">Instagram</label><input className="field" placeholder="хэрэглэгчийн нэр" value={f.ig} onChange={set('ig')} /></div>
      <div style={{ flex: 1, minWidth: 180 }}><label className="lab">TikTok</label><input className="field" placeholder="хэрэглэгчийн нэр" value={f.tiktok} onChange={set('tiktok')} /></div></div>
    <div className="row" style={{ gap: 12, alignItems: 'flex-start' }}>
      <div style={{ flex: 1, minWidth: 220 }}><label className="lab">Facebook</label><input className="field" value={f.fb_url} onChange={set('fb_url')} /></div>
      <div style={{ flex: 1, minWidth: 220 }}><label className="lab">YouTube</label><input className="field" value={f.youtube} onChange={set('youtube')} /></div></div>
    <div><label className="lab">Хамтын ажлын санал хаашаа ирэх вэ? <span style={{ color: 'var(--mute)', fontWeight: 500 }}>· «Шууд бичих» товч энэ рүү очно</span></label><input className="field" placeholder="m.me/… , wa.me/… , 99112233 эсвэл имэйл" value={f.dm_url} onChange={set('dm_url')} />
      <p style={{ fontSize: 13.5, color: 'var(--mute)', marginTop: 6 }}>Хоосон бол Facebook Messenger эсвэл Instagram DM руу чинь очно. Бөглөвөл картад «✓ Шууд хариулдаг» тэмдэг гарна.</p></div>
    <ImgPick own={'influencer:' + l.id} label="Профайл зураг" round value={f.photo_url} onChange={v => setF(x => ({ ...x, photo_url: v }))} />
    <div className="row">{Object.entries(NICHES).map(([k, v]) => chip(f.niches.includes(k), k, v, tog))}</div>
    <p style={{ fontSize: 13.5, color: 'var(--mute)' }}>Дагагчийн тоог бид нийтэд нээлттэй эх сурвалжаас тогтмол шинэчилнэ.</p>
    {msg && <div className={msg[0]}>{msg[1]}</div>}
    <button className="btn dark" disabled={busy}>{busy ? '…' : 'Хадгалах'}</button>
  </form>;
}
function Sponsor({ l }) {
  const [res, setRes] = useState(null); const [err, setErr] = useState(null); const [busy, setBusy] = useState(false);
  const on = l.sponsored || (l.sponsored_until && new Date(l.sponsored_until) > new Date());
  const order = async m => { setBusy(true); setErr(null); const r = await api('/api/order', { product: 'listing_sponsor', target: l.id, months: m }); setBusy(false); r.ok ? setRes(r) : setErr(r.error); };
  return <div style={{ marginTop: 14, borderTop: '1.5px dashed var(--line)', paddingTop: 14 }}>
    <b>⭐ Онцлох байршил</b>{on && l.sponsored_until && <span style={{ color: 'var(--mute)' }}> · {new Date(l.sponsored_until).toLocaleDateString('mn-MN')} хүртэл</span>}
    <p style={{ color: 'var(--mute)', fontSize: 14.5, marginTop: 4 }}>{PRODUCTS.listing_sponsor.perks.join('. ')}.</p>
    <div className="row" style={{ marginTop: 10 }}>{[1, 3].map(m => <button key={m} type="button" className={m === 3 ? 'btn dark' : 'btn ghost'} disabled={busy} onClick={() => order(m)}>{m} сар · {fmtMnt(priceFor('listing_sponsor', m))}{m === 3 && ' (−15%)'}</button>)}</div>
    {err && <div className="err" style={{ marginTop: 10 }}>{err}</div>}
    {res && <div style={{ marginTop: 10 }}><BankBox r={res} /></div>}
  </div>;
}
function Item({ title, sub, href, badge, children }) {
  const [open, setOpen] = useState(false);
  return <div className="panel" style={{ marginTop: 14 }}>
    <div className="row" style={{ justifyContent: 'space-between' }}>
      <div><div className="row" style={{ gap: 8 }}><b className="h" style={{ fontSize: 17 }}>{title}</b>{badge}</div><div style={{ color: 'var(--mute)', fontSize: 14 }}>{sub}</div></div>
      <div className="row" style={{ gap: 8 }}>{href && <Link href={href} className="btn ghost">Харах</Link>}<button className="btn v" onClick={() => setOpen(!open)}>{open ? 'Хаах' : 'Засах'}</button></div>
    </div>
    {open && children}
  </div>;
}
export default function Owned({ me, reload }) {
  const st = s => s === 'approved' ? null : <span className="badge b-off">{s === 'pending' ? 'Шалгагдаж байна' : 'Нийтлэгдээгүй'}</span>;
  const any = me.listings.length || me.influencers.length || me.item_claims.length;
  return <div style={{ marginTop: 26 }}>
    <div className="row" style={{ justifyContent: 'space-between' }}>
      <h2 className="h" style={{ fontSize: 24, fontWeight: 800 }}>Миний эзэмшдэг</h2>
      <Link href="/nemeh?type=freelancer" className="btn ghost">+ Шинээр нэмэх</Link>
    </div>
    {!any && <p style={{ color: 'var(--mute)', marginTop: 8 }}>Фрилансер профайл, сургалт, коммюнити, хэрэгсэл эсвэл инфлүэнсер профайлтай бол картын доорх «Минийх» дээр дараад эзэмш. Жагсаалтад байхгүй бол шинээр нэм — нэвтэрсэн үед нэмсэн зүйл шууд чинийх болно.</p>}
    {me.item_claims.map(c => <div key={c.id} className="panel" style={{ marginTop: 14 }}>⏳ <b>{c.name}</b> — эзэмших хүсэлт шалгагдаж байна</div>)}
    {me.listings.map(l => { const t = TYPES[l.type]; return <Item key={l.id} title={l.name} sub={`${t?.icon} ${t?.label}${l.price ? ' · ' + l.price : ''}`} href={l.status === 'approved' ? t?.path : null} badge={st(l.status) || <span className="vbadge">✓</span>}>
      <EditListing l={l} onSaved={reload} />{l.status === 'approved' && <Sponsor l={l} />}</Item>; })}
    {me.influencers.map(l => <Item key={l.id} title={l.name} sub={`⭐ Инфлүэнсер · ${fmtN(l.reach)} дагагч`} href={l.status === 'approved' ? '/influencer' : null} badge={st(l.status) || <span className="vbadge">✓</span>}>
      <EditInfluencer l={l} onSaved={reload} /></Item>)}
  </div>;
}
