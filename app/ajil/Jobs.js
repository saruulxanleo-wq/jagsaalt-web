'use client';
import { useState } from 'react';
import Link from 'next/link';
import { TOPICS, topicLabel, TYPES } from '@/lib/config';
const KIND = { project: 'Төсөл, гэрээт ажил', job: 'Ажлын байр' };
const ago = t => { const d = Math.floor((Date.now() - new Date(t)) / 864e5); return d < 1 ? 'Өнөөдөр' : d < 7 ? d + ' өдрийн өмнө' : Math.floor(d / 7) + ' 7 хоногийн өмнө'; };
function Form({ onDone }) {
  const [f, setF] = useState({ kind: 'project', title: '', company: '', description: '', budget: '', location: '', contact: '', url: '', deadline: '', topics: [] });
  const [busy, setBusy] = useState(false), [err, setErr] = useState(null);
  const set = k => e => setF({ ...f, [k]: e.target.value });
  async function send(e) {
    e.preventDefault(); setBusy(true); setErr(null);
    const r = await fetch('/api/job/submit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(f) });
    const j = await r.json().catch(() => ({})); setBusy(false); r.ok ? onDone() : setErr(j.error || 'Алдаа гарлаа');
  }
  return <form onSubmit={send} className="panel" style={{ marginTop: 20, display: 'grid', gap: 14, maxWidth: 760 }}>
    <div className="row" style={{ gap: 8 }}>{Object.entries(KIND).map(([k, l]) => <button type="button" key={k} className={'chip' + (f.kind === k ? ' on' : '')} onClick={() => setF({ ...f, kind: k })}>{l}</button>)}</div>
    <div><label className="lab" htmlFor="jt">Гарчиг *</label><input id="jt" className="field" required maxLength={100} placeholder={f.kind === 'job' ? 'SMM менежер (бүтэн цаг)' : 'Шинэ брэндийн лого, брэндбүк хийлгэх'} value={f.title} onChange={set('title')} /></div>
    <div className="row" style={{ gap: 12 }}>
      <div style={{ flex: '1 1 220px' }}><label className="lab" htmlFor="jc">Байгууллага</label><input id="jc" className="field" maxLength={80} value={f.company} onChange={set('company')} /></div>
      <div style={{ flex: '1 1 220px' }}><label className="lab" htmlFor="jb">{f.kind === 'job' ? 'Цалин' : 'Төсөв'}</label><input id="jb" className="field" maxLength={60} placeholder={f.kind === 'job' ? '2.5–3.5 сая₮' : '1.5 сая₮ орчим'} value={f.budget} onChange={set('budget')} /></div>
    </div>
    <div><label className="lab" htmlFor="jd">Тайлбар *</label><textarea id="jd" className="field" rows={5} required maxLength={1500} placeholder="Юу хийлгэх, ямар туршлага хэрэгтэй, хэзээ гэх мэт" value={f.description} onChange={set('description')} /></div>
    <div><span className="lab">Чиглэл (1–3)</span><div className="row" style={{ gap: 8, marginTop: 8 }}>{Object.entries(TOPICS).map(([k, l]) => <button type="button" key={k} className={'chip' + (f.topics.includes(k) ? ' on' : '')} onClick={() => setF({ ...f, topics: f.topics.includes(k) ? f.topics.filter(x => x !== k) : [...f.topics, k].slice(0, 3) })}>{l}</button>)}</div></div>
    <div className="row" style={{ gap: 12 }}>
      <div style={{ flex: '1 1 220px' }}><label className="lab" htmlFor="jl">Байршил</label><input id="jl" className="field" maxLength={60} placeholder="Улаанбаатар / Зайнаас" value={f.location} onChange={set('location')} /></div>
      <div style={{ flex: '1 1 160px' }}><label className="lab" htmlFor="jdl">Хүлээн авах эцсийн хугацаа</label><input id="jdl" type="date" className="field" value={f.deadline} onChange={set('deadline')} /></div>
    </div>
    <div className="row" style={{ gap: 12 }}>
      <div style={{ flex: '1 1 220px' }}><label className="lab" htmlFor="jct">Холбоо барих *</label><input id="jct" className="field" required maxLength={120} placeholder="Утас, и-мэйл эсвэл FB линк" value={f.contact} onChange={set('contact')} /></div>
      <div style={{ flex: '1 1 220px' }}><label className="lab" htmlFor="ju">Дэлгэрэнгүй линк</label><input id="ju" className="field" maxLength={300} placeholder="заавал биш" value={f.url} onChange={set('url')} /></div>
    </div>
    {err && <div className="err">{err}</div>}
    <button className="btn dark" disabled={busy} style={{ justifySelf: 'start' }}>{busy ? 'Илгээж байна…' : 'Зар илгээх →'}</button>
    <p style={{ color: 'var(--mute)', fontSize: 13.5, margin: 0 }}>Үнэгүй. Шалгасны дараа 1 өдөрт нийтлэгдэнэ. Холбоо барих мэдээлэл нийтэд харагдана.</p>
  </form>;
}
export default function Jobs({ list }) {
  const [k, setK] = useState('all'), [tp, setTp] = useState('all'), [open, setOpen] = useState(false), [done, setDone] = useState(false);
  const shown = list.filter(j => (k === 'all' || j.kind === k) && (tp === 'all' || (j.topics || []).includes(tp)));
  return <section className="wrap" style={{ marginTop: 10 }}>
    <h1 className="h" style={{ fontSize: 'clamp(28px,3.6vw,42px)', fontWeight: 800 }}>Маркетингийн ажил, төсөл</h1>
    <p style={{ color: 'var(--mute)', fontSize: 17, marginTop: 8, maxWidth: 680 }}>Брэнд, агентлагууд фрилансерт өгөх төсөл, ажлын байраа энд тавина. Мэргэжилтэн бол <Link href={TYPES.freelancer.path} style={{ textDecoration: 'underline' }}>профайлаа нэмээрэй</Link>, ажил өгөгчид чамайг олно.</p>
    <div className="row" style={{ marginTop: 18, gap: 10 }}>
      {done ? <div className="ok">Зар илгээгдлээ ✓ Шалгасны дараа нийтлэгдэнэ.</div> : <button className="btn dark" onClick={() => setOpen(!open)}>{open ? 'Хаах' : '+ Ажил, төсөл зарлах'}</button>}
    </div>
    {open && !done && <Form onDone={() => { setDone(true); setOpen(false); }} />}
    <div className="row chips" style={{ gap: 8, marginTop: 22 }}>
      {[['all', 'Бүгд'], ...Object.entries(KIND)].map(([v, l]) => <button key={v} className={'chip' + (k === v ? ' on' : '')} onClick={() => setK(v)}>{l}<span>{v === 'all' ? list.length : list.filter(j => j.kind === v).length}</span></button>)}
      <select className="field" style={{ marginTop: 0, width: 'auto', borderRadius: 999 }} value={tp} onChange={e => setTp(e.target.value)} aria-label="Чиглэл"><option value="all">Бүх чиглэл</option>{Object.entries(TOPICS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
    </div>
    <div style={{ display: 'grid', gap: 12, marginTop: 18, maxWidth: 860 }}>{shown.map(j => <details key={j.id} className="card job">
      <summary><div className="row" style={{ gap: 8 }}><span className={'cat ' + (j.kind === 'job' ? 'c' : 'v')}>{KIND[j.kind]}</span>{(j.topics || []).map(t => <span key={t} className="cat more">{topicLabel(t)}</span>)}<span style={{ marginLeft: 'auto', color: 'var(--mute)', fontSize: 13.5 }}>{ago(j.created_at)}</span></div>
        <h3 style={{ marginTop: 10 }}>{j.title}</h3>
        <div style={{ color: 'var(--mute)', fontSize: 14.5, marginTop: 6 }}>{[j.company, j.budget, j.location, j.deadline && 'Хугацаа: ' + j.deadline.slice(5).replace('-', '.')].filter(Boolean).join(' · ')}</div></summary>
      <p style={{ whiteSpace: 'pre-wrap', fontSize: 15.5 }}>{j.description}</p>
      <div className="row" style={{ gap: 10 }}><span><b>Холбоо барих:</b> {/^https?:\/\//.test(j.contact) ? <a href={j.contact} target="_blank" rel="noopener nofollow" style={{ color: 'var(--v)' }}>{j.contact}</a> : j.contact}</span>{j.url && <a href={j.url} target="_blank" rel="noopener nofollow" className="btn ghost" style={{ padding: '8px 14px' }}>Дэлгэрэнгүй →</a>}</div>
    </details>)}</div>
    {shown.length === 0 && <div className="panel" style={{ marginTop: 18, textAlign: 'center', maxWidth: 860 }}><p style={{ fontSize: 17 }}>{list.length ? 'Энэ шүүлтүүрээр зар алга.' : 'Одоогоор нээлттэй зар алга. Эхний зараа тавиарай — үнэгүй.'}</p></div>}
  </section>;
}
