'use client';
import { useState } from 'react';
import Link from 'next/link';
import { sb, api } from '@/lib/sbclient';
import { catsOf, completeness, TEAM_SIZES, SOCIALS, SERVICES, cap } from '@/lib/config';
import TagInput from '../TagInput';
import Avatar, { AVATARS, MemberPhoto } from '../Avatar';
import CatPicker from '../CatPicker';
import { Logo } from '../Card';
async function resize(file, wide) {
  const img = await createImageBitmap(file); const c = document.createElement('canvas');
  if (wide) { // кейс: 1200×750 (16:10) болгож тайрна
    const W = 1200, H = 750, r = Math.max(W / img.width, H / img.height); c.width = W; c.height = H;
    const sw = W / r, sh = H / r; c.getContext('2d').drawImage(img, (img.width - sw) / 2, (img.height - sh) / 2, sw, sh, 0, 0, W, H);
  } else { const S = 400, s = Math.min(img.width, img.height); c.width = c.height = S; c.getContext('2d').drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, S, S); }
  return await new Promise(r => c.toBlob(r, 'image/webp', 0.84));
}
async function uploadImg(file, kind, slug) {
  const blob = await resize(file, kind === 'case'); const fd = new FormData();
  fd.append('file', new File([blob], 'img.webp', { type: 'image/webp' })); fd.append('kind', kind); if (slug) fd.append('slug', slug);
  const { data } = await sb().auth.getSession();
  const r = await fetch('/api/agency/logo', { method: 'POST', headers: { Authorization: 'Bearer ' + data.session?.access_token }, body: fd });
  const j = await r.json(); if (!r.ok) throw new Error(j.error || 'Хадгалж чадсангүй'); return j.url;
}
const Sec = ({ title, hint, children, open }) => <details open={open} style={{ borderTop: '1.5px dashed var(--line)', paddingTop: 14 }}>
  <summary style={{ cursor: 'pointer', fontWeight: 700, fontSize: 16 }}>{title} <span style={{ color: 'var(--mute)', fontWeight: 500, fontSize: 14 }}>· {hint}</span></summary>
  <div style={{ display: 'grid', gap: 14, marginTop: 14 }}>{children}</div></details>;
const F = ({ id, label, ...p }) => <div style={{ flex: 1, minWidth: 200 }}><label htmlFor={id} className="lab">{label}</label><input id={id} className="field" {...p} /></div>;
export default function EditAgency({ agency, adminSlug }) {
  const [a, setA] = useState(agency);
  const [ed, setEd] = useState({
    description: agency.description || '', website: agency.website || '', phone_public: agency.phone_public || '',
    services: (agency.services || []).map(cap), categories: catsOf(agency),
    founded: agency.founded || '', team_size: agency.team_size || '', min_budget: agency.min_budget || '',
    socials: { instagram: '', linkedin: '', tiktok: '', youtube: '', email: '', ...(agency.socials || {}) },
    clients: (agency.clients || []).join(', '), cases: agency.cases || [], team: agency.team || [],
  });
  const [busy, setBusy] = useState(false); const [msg, setMsg] = useState(null); const [up, setUp] = useState(false);
  const set = k => e => setEd({ ...ed, [k]: e.target.value });
  const list = (k, i, f) => e => setEd({ ...ed, [k]: ed[k].map((x, j) => j === i ? { ...x, [f]: e.target.value } : x) });
  async function save(e) {
    e.preventDefault(); setBusy(true); setMsg(null);
    const body = { ...ed, slug: adminSlug, clients: ed.clients.split(',') };
    const r = await api('/api/agency/update', body); setBusy(false);
    if (r.ok) { setMsg({ ok: 'Хадгаллаа ✓' }); setA({ ...a, ...body, clients: body.clients.map(s => s.trim()).filter(Boolean) }); } else setMsg({ err: r.error });
  }
  async function logo(e) {
    const file = e.target.files?.[0]; if (!file) return; setUp(true); setMsg(null);
    try {
      const url = await uploadImg(file, 'logo', adminSlug); setA({ ...a, logo_url: url });
    } catch (x) { setMsg({ err: x.message || 'Зураг уншиж чадсангүй' }); } finally { setUp(false); e.target.value = ''; }
  }
  const [upIdx, setUpIdx] = useState(null);
  async function itemImg(e, k, i, f) {
    const file = e.target.files?.[0]; if (!file) return; setUpIdx(k + i); setMsg(null);
    try { const url = await uploadImg(file, k === 'cases' ? 'case' : 'team', adminSlug); setEd(ed => ({ ...ed, [k]: ed[k].map((x, j) => j === i ? { ...x, [f]: url } : x) })); }
    catch (x) { setMsg({ err: x.message }); } finally { setUpIdx(null); e.target.value = ''; }
  }
  const setItem = (k, i, f, v) => setEd(ed => ({ ...ed, [k]: ed[k].map((x, j) => j === i ? { ...x, [f]: v } : x) }));
  const pct = completeness({ ...a, ...ed, clients: ed.clients.split(',').filter(s => s.trim()), socials: Object.fromEntries(Object.entries(ed.socials).filter(([, v]) => v)) });
  return <form onSubmit={save} style={{ display: 'grid', gap: 16 }}>
    <div className="row" style={{ gap: 16, alignItems: 'center' }}>
      <Logo a={a} size={84} radius={22} />
      <div style={{ flex: 1 }}>
        <label className="btn ghost" style={{ cursor: 'pointer' }}>{up ? 'Хуулж байна…' : 'Лого солих'}<input type="file" accept="image/png,image/jpeg,image/webp" onChange={logo} style={{ display: 'none' }} disabled={up} /></label>
        <p style={{ fontSize: 13, color: 'var(--mute)', marginTop: 6 }}>Дөрвөлжин зураг тохиромжтой. Автоматаар 400×400 болно.</p>
      </div>
      <div style={{ minWidth: 180 }}>
        <div className="row" style={{ justifyContent: 'space-between', fontSize: 14, fontWeight: 700 }}><span>Профайл бүрэн</span><span>{pct}%</span></div>
        <div style={{ height: 8, borderRadius: 99, background: 'var(--bg)', marginTop: 6 }}><div style={{ width: pct + '%', height: '100%', borderRadius: 99, background: pct >= 80 ? '#2FB344' : 'var(--v)' }} /></div>
      </div>
    </div>
    <div><label htmlFor="ds" className="lab">Товч тайлбар</label><textarea id="ds" rows={3} maxLength={400} className="field" style={{ resize: 'vertical' }} value={ed.description} onChange={set('description')} /></div>
    <TagInput id="sv" label="Үйлчилгээ" value={ed.services} onChange={v => setEd({ ...ed, services: v })} suggestions={SERVICES} placeholder="Жагсаалтаас сонго эсвэл өөрөө бичээд Enter дар" />
    <CatPicker value={ed.categories} onChange={v => setEd({ ...ed, categories: v })} />
    <div className="row" style={{ gap: 14 }}><F id="wb" label="Вэбсайт" value={ed.website} onChange={set('website')} /><F id="pp" label="Утас" value={ed.phone_public} onChange={set('phone_public')} /></div>
    <Sec title="Товч баримт" hint="он, баг, төсөв" open={!!(ed.founded || ed.team_size || ed.min_budget)}>
      <div className="row" style={{ gap: 14 }}>
        <F id="fd" label="Байгуулагдсан он" inputMode="numeric" placeholder="2017" value={ed.founded} onChange={set('founded')} />
        <div style={{ flex: 1, minWidth: 200 }}><label htmlFor="ts" className="lab">Багийн хэмжээ</label><select id="ts" className="field" value={ed.team_size} onChange={set('team_size')}><option value="">—</option>{TEAM_SIZES.map(s => <option key={s} value={s}>{s} хүн</option>)}</select></div>
        <F id="mb" label="Төслийн доод төсөв" placeholder="1 сая ₮-өөс" value={ed.min_budget} onChange={set('min_budget')} />
      </div>
    </Sec>
    <Sec title="Сошиал" hint="линкүүд" open={Object.values(agency.socials || {}).some(Boolean)}>
      <div className="row" style={{ gap: 14 }}>
        {Object.entries(SOCIALS).map(([k, l]) => <F key={k} id={'s' + k} label={l} placeholder={`${k}.com/...`} value={ed.socials[k]} onChange={e => setEd({ ...ed, socials: { ...ed.socials, [k]: e.target.value } })} />)}
        <F id="sem" label="И-мэйл" type="email" value={ed.socials.email} onChange={e => setEd({ ...ed, socials: { ...ed.socials, email: e.target.value } })} />
      </div>
    </Sec>
    <Sec title="Харилцагч брэндүүд" hint="таслалаар" open={!!agency.clients?.length}>
      <F id="cl" label="Ажилласан брэндүүд" placeholder="Unitel, Khan Bank, Gobi" value={ed.clients} onChange={set('clients')} />
    </Sec>
    <Sec title="Кейс" hint={`${ed.cases.length}/6`} open={!!agency.cases?.length}>
      {ed.cases.map((c, i) => <div key={i} style={{ background: 'var(--bg)', borderRadius: 18, padding: 16, display: 'grid', gap: 10 }}>
        <div className="row" style={{ gap: 12 }}><F id={'ct' + i} label="Гарчиг" value={c.title} onChange={list('cases', i, 'title')} required /><F id={'cc' + i} label="Клиент" value={c.client} onChange={list('cases', i, 'client')} /></div>
        <F id={'cr' + i} label="Үр дүн (нэг өгүүлбэр)" placeholder="3 сард борлуулалт 40% өссөн" value={c.result} onChange={list('cases', i, 'result')} />
        <div className="row" style={{ gap: 12 }}>
          {c.image ? <img src={c.image} alt="" style={{ width: 160, height: 100, objectFit: 'cover', borderRadius: 12 }} /> : <span style={{ width: 160, height: 100, borderRadius: 12, background: '#fff', border: '1.5px dashed var(--line)', display: 'grid', placeItems: 'center', color: 'var(--mute)', fontSize: 13 }}>Зураггүй</span>}
          <label className="btn ghost" style={{ cursor: 'pointer' }}>{upIdx === 'cases' + i ? 'Хуулж байна…' : c.image ? 'Зураг солих' : '+ Зураг (заавал биш)'}<input type="file" accept="image/png,image/jpeg,image/webp" style={{ display: 'none' }} onChange={e => itemImg(e, 'cases', i, 'image')} /></label>
          {c.image && <button type="button" className="btn ghost" onClick={() => setItem('cases', i, 'image', '')}>Зураг хасах</button>}
        </div>
        <div className="row" style={{ gap: 12, alignItems: 'flex-end' }}><F id={'ck' + i} label="Линк (заавал биш)" value={c.link} onChange={list('cases', i, 'link')} />
          <button type="button" className="btn ghost" onClick={() => setEd({ ...ed, cases: ed.cases.filter((_, j) => j !== i) })}>Хасах</button></div>
      </div>)}
      {ed.cases.length < 6 && <button type="button" className="btn ghost" style={{ justifySelf: 'start' }} onClick={() => setEd({ ...ed, cases: [...ed.cases, { title: '', client: '', result: '', link: '', image: '' }] })}>+ Кейс нэмэх</button>}
    </Sec>
    <Sec title="Баг" hint={`${ed.team.length}/12`} open={!!agency.team?.length}>
      {ed.team.map((m, i) => <div key={i} style={{ background: 'var(--bg)', borderRadius: 18, padding: 14, display: 'grid', gap: 10 }}>
        <div className="row" style={{ gap: 12, alignItems: 'flex-end' }}>
          <MemberPhoto m={m} size={52} />
          <F id={'tn' + i} label="Нэр" value={m.name} onChange={list('team', i, 'name')} required /><F id={'tr' + i} label="Албан тушаал" value={m.role} onChange={list('team', i, 'role')} />
          <button type="button" className="btn ghost" onClick={() => setEd({ ...ed, team: ed.team.filter((_, j) => j !== i) })}>Хасах</button></div>
        <div className="row" style={{ gap: 6 }}>
          <span style={{ fontSize: 13, color: 'var(--mute)', fontWeight: 600 }}>Зураг (заавал биш):</span>
          {Object.keys(AVATARS).map(k => <button type="button" key={k} aria-label={'Дүрслэл ' + k} aria-pressed={m.photo === 'avatar:' + k} onClick={() => setItem('team', i, 'photo', 'avatar:' + k)} style={{ padding: 2, borderRadius: '50%', background: 'none', boxShadow: m.photo === 'avatar:' + k ? '0 0 0 3px var(--v)' : 'none' }}><Avatar id={k} size={34} /></button>)}
          <label className="chip" style={{ cursor: 'pointer', padding: '6px 12px', fontSize: 13.5 }}>{upIdx === 'team' + i ? 'Хуулж байна…' : '↑ Зураг'}<input type="file" accept="image/png,image/jpeg,image/webp" style={{ display: 'none' }} onChange={e => itemImg(e, 'team', i, 'photo')} /></label>
          {m.photo && <button type="button" className="chip" style={{ padding: '6px 12px', fontSize: 13.5 }} onClick={() => setItem('team', i, 'photo', '')}>Хасах</button>}
        </div></div>)}
      {ed.team.length < 12 && <button type="button" className="btn ghost" style={{ justifySelf: 'start' }} onClick={() => setEd({ ...ed, team: [...ed.team, { name: '', role: '', photo: '' }] })}>+ Хүн нэмэх</button>}
    </Sec>
    {msg?.err && <div className="err">{msg.err}</div>}
    {msg?.ok && <div className="ok">{msg.ok} <Link href={`/a/${agency.slug}`} style={{ textDecoration: 'underline' }}>Профайлаа харах</Link></div>}
    <button className="btn v" disabled={busy || !ed.categories.length} style={{ padding: 15, position: 'sticky', bottom: 12, boxShadow: '0 10px 30px -10px #6a3df0aa' }}>{busy ? 'Хадгалж байна…' : 'Хадгалах'}</button>
    {adminSlug && <div className="row" style={{ borderTop: '1.5px dashed var(--line)', paddingTop: 14, gap: 8 }}>
      <span style={{ color: 'var(--mute)', fontWeight: 600, fontSize: 14 }}>Админ:</span>
      <button type="button" className="btn ghost" onClick={async () => { const r = await api('/api/admin/action', { kind: 'agency', id: agency.id, action: 'hide' }); setMsg(r.ok ? { ok: 'Жагсаалтаас нуулаа' } : { err: r.error }); }}>Жагсаалтаас нуух</button>
      <button type="button" className="btn ghost" onClick={async () => { const r = await api('/api/admin/action', { kind: 'agency', id: agency.id, action: 'approve' }); setMsg(r.ok ? { ok: 'Жагсаалтад харагдаж байна' } : { err: r.error }); }}>Жагсаалтад харуулах</button>
      <button type="button" className="btn ghost" style={{ color: '#A3260F' }} onClick={async () => { if (!window.confirm(`«${agency.name}»-ийг бүр мөсөн устгах уу? Буцаах боломжгүй.`)) return; const r = await api('/api/admin/action', { kind: 'agency', id: agency.id, action: 'delete' }); r.ok ? (location.href = '/admin') : setMsg({ err: r.error }); }}>Бүр устгах</button>
    </div>}
  </form>;
}
