'use client';
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CATS } from '@/lib/config';
async function post(url, body) { const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }); return { ok: r.ok, ...(await r.json().catch(() => ({}))) }; }
export default function AddForm() {
  const claim = useSearchParams().get('claim');
  const [mode, setMode] = useState(claim ? 'owner' : 'user');
  const [f, setF] = useState({ fb_url: '', name: '', category: 'full', phone: '' });
  const [step, setStep] = useState('form'); const [msg, setMsg] = useState(null); const [busy, setBusy] = useState(false);
  const [claimId, setClaimId] = useState(null); const [code, setCode] = useState('');
  const set = k => e => setF({ ...f, [k]: e.target.value });
  async function submit(e) {
    e.preventDefault(); setBusy(true); setMsg(null);
    const r = await post('/api/submit', { ...f, mode, claim });
    setBusy(false);
    if (!r.ok) return setMsg({ err: r.error || 'Алдаа гарлаа' });
    if (mode === 'user') { setStep('done'); return; }
    setClaimId(r.claim_id); setStep('code');
  }
  async function verify(e) {
    e.preventDefault(); setBusy(true); setMsg(null);
    const r = await post('/api/claim/check', { claim_id: claimId, code });
    setBusy(false);
    if (!r.ok) return setMsg({ err: r.error || 'Код буруу байна' });
    setStep('verified');
  }
  const Opt = ({ v, t, d }) => <button type="button" role="radio" aria-checked={mode === v} onClick={() => setMode(v)} className="panel" style={{ textAlign: 'left', padding: '20px 22px', boxShadow: mode === v ? 'inset 0 0 0 3px var(--v)' : 'inset 0 0 0 1.5px var(--line)' }}>
    <b className="h" style={{ fontSize: 17, fontWeight: 700 }}>{t}</b><br /><span style={{ color: 'var(--mute)', fontSize: 15 }}>{d}</span></button>;
  return <section className="wrap" style={{ marginTop: 20, maxWidth: 860 }}>
    <h1 className="h" style={{ fontSize: 'clamp(32px,5vw,44px)', fontWeight: 800 }}>{claim ? 'Агентлагаа баталгаажуулах' : 'Агентлаг нэмэх'}</h1>
    <p style={{ color: 'var(--mute)', marginTop: 10, fontSize: 18 }}>Хэн ч нэмж болно, жагсаалтад адилхан орно. Эзэн нь баталгаажвал профайлаа өөрөө удирдана.</p>
    {step === 'form' && <>
      {!claim && <div role="radiogroup" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 14, marginTop: 24 }}>
        <Opt v="user" t="Би хэрэглэгч" d="Мэддэг агентлагаа нэмнэ. Линк хийгээд л болоо." />
        <Opt v="owner" t="Энэ миний агентлаг" d="Нэмээд SMS-ээр баталгаажуулна." /></div>}
      <form onSubmit={submit} className="panel" style={{ marginTop: 22, display: 'grid', gap: 18 }}>
        {!claim && <>
          <div><label htmlFor="fb" className="lab">Facebook хуудасны линк</label><input id="fb" required className="field" placeholder="facebook.com/..." value={f.fb_url} onChange={set('fb_url')} /></div>
          <div><label htmlFor="nm" className="lab">Агентлагийн нэр</label><input id="nm" required className="field" value={f.name} onChange={set('name')} /></div>
          <div><span className="lab">Ангилал</span><div className="row" style={{ marginTop: 9 }}>{Object.entries(CATS).map(([k, c]) => <button type="button" key={k} className={'chip' + (f.category === k ? ' on' : '')} onClick={() => setF({ ...f, category: k })}>{c.label}</button>)}</div></div>
        </>}
        {mode === 'owner' && <div><label htmlFor="ph" className="lab">Facebook хуудсан дээр бичээстэй утасны дугаар</label>
          <input id="ph" required className="field" inputMode="numeric" placeholder="99112233" value={f.phone} onChange={set('phone')} />
          <p style={{ fontSize: 13.5, color: 'var(--mute)', marginTop: 6 }}>Энэ дугаар хуудасны холбоо барих мэдээлэлтэй таарч байх ёстой. Таарахгүй бол баталгаажуулалт цуцлагдана.</p></div>}
        {msg?.err && <div className="err">{msg.err}</div>}
        <button className="btn dark" disabled={busy} style={{ padding: 16 }}>{busy ? 'Түр хүлээ…' : mode === 'owner' ? 'SMS код авах →' : 'Илгээх →'}</button>
      </form></>}
    {step === 'code' && <form onSubmit={verify} className="panel" style={{ marginTop: 24, background: 'var(--ink)', color: '#fff', display: 'grid', gap: 16 }}>
      <h2 className="h" style={{ fontSize: 28, fontWeight: 800 }}>Кодоо оруул</h2>
      <p style={{ color: '#CFCAE6' }}>{f.phone || 'Бүртгэлтэй дугаар'} руу 4 оронтой код явууллаа. 5 минут хүчинтэй.</p>
      <input aria-label="SMS код" required maxLength={4} inputMode="numeric" value={code} onChange={e => setCode(e.target.value.replace(/\D/g, ''))} style={{ width: 220, fontFamily: 'var(--font-unbounded)', fontSize: 40, fontWeight: 800, letterSpacing: '.4em', padding: '12px 18px', borderRadius: 18, border: '2px solid var(--l)', background: '#ffffff14', color: '#fff' }} />
      {msg?.err && <div className="err">{msg.err}</div>}
      <button className="btn lime" disabled={busy || code.length < 4} style={{ padding: 15, maxWidth: 320 }}>{busy ? 'Шалгаж байна…' : 'Баталгаажуулах'}</button>
    </form>}
    {step === 'done' && <div className="panel ok" style={{ marginTop: 24, fontSize: 17 }}>Баярлалаа! Админ шалгаад 1–2 өдөрт жагсаалтад нэмнэ.</div>}
    {step === 'verified' && <div className="panel ok" style={{ marginTop: 24, fontSize: 17 }}>Баталгаажлаа ✓ Админ дугаарыг хуудастай тулгаад "Баталгаажсан" тэмдгийг идэвхжүүлнэ.</div>}
  </section>;
}
