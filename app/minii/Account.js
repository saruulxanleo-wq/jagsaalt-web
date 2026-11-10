'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { sb, api } from '@/lib/sbclient';
import { catsOf } from '@/lib/config';
import CatPicker from '../CatPicker';
import EditAgency from './EditAgency';
import Monetize from './Monetize';
import Subscribe from '../Subscribe';
import FbPreview from '../FbPreview';
import Owned, { ClaimItem } from './Owned';
const Step = ({ n, title, done, active, children }) => (
  <div className="panel" style={{ marginTop: 18, opacity: active || done ? 1 : .55 }}>
    <div className="row" style={{ gap: 12 }}>
      <span className="h" style={{ width: 36, height: 36, borderRadius: 12, display: 'grid', placeItems: 'center', background: done ? 'var(--l)' : active ? 'var(--v)' : 'var(--bg)', color: done ? 'var(--ink)' : active ? '#fff' : 'var(--mute)', fontWeight: 800 }}>{done ? '✓' : n}</span>
      <h2 className="h" style={{ fontSize: 20, fontWeight: 700 }}>{title}</h2>
    </div>
    {active && <div style={{ marginTop: 18 }}>{children}</div>}
  </div>);
export default function Account() {
  const q = useSearchParams(); const claimSlug = q.get('claim'); const editSlug = q.get('edit'); const ownQ = q.get('own');
  const [agOpen, setAgOpen] = useState(!!claimSlug);
  const [session, setSession] = useState(undefined);
  const [me, setMe] = useState(null);
  const [err, setErr] = useState(null); const [busy, setBusy] = useState(false);
  const [phone, setPhone] = useState(''); const [sent, setSent] = useState(false); const [code, setCode] = useState('');
  const [cl, setCl] = useState({ fb_url: '', name: '', categories: [], note: '' });
  const [ed, setEd] = useState(null); const [saved, setSaved] = useState(false);
  useEffect(() => {
    sb().auth.getSession().then(({ data }) => setSession(data.session));
    const { data: s } = sb().auth.onAuthStateChange((_e, s) => setSession(s));
    return () => s.subscription.unsubscribe();
  }, []);
  async function load() { const qs = new URLSearchParams(); if (editSlug) qs.set('edit', editSlug); if (ownQ) qs.set('own', ownQ); const r = await api('/api/me' + (qs.toString() ? '?' + qs : '')); if (r.ok) { setMe(r); if (r.agency) setEd({ description: r.agency.description || '', website: r.agency.website || '', phone_public: r.agency.phone_public || '', services: (r.agency.services || []).join(', '), categories: catsOf(r.agency) }); } else setErr(r.error); }
  useEffect(() => { if (session) load(); }, [session]);
  const run = async (fn) => { setBusy(true); setErr(null); try { await fn(); } finally { setBusy(false); } };
  const login = () => sb().auth.signInWithOAuth({ provider: 'google', options: { redirectTo: location.origin + '/minii' + (claimSlug ? '?claim=' + claimSlug : ownQ ? '?own=' + ownQ : ''), queryParams: { prompt: 'select_account' } } });
  if (session === undefined) return <section className="wrap" style={{ padding: 60 }}>Түр хүлээ…</section>;
  if (!session) return <section className="wrap" style={{ marginTop: 30, maxWidth: 560 }}>
    <div className="panel" style={{ textAlign: 'center', padding: 44 }}>
      <h1 className="h" style={{ fontSize: 34, fontWeight: 800 }}>{ownQ ? 'Эзэмших' : 'Миний самбар'}</h1>
      <p style={{ color: 'var(--mute)', marginTop: 12, fontSize: 17 }}>Агентлаг, фрилансер профайл, сургалт, коммюнити, хэрэгсэл, инфлүэнсер профайл — эзэмшдэг бүхнээ нэг дороос удирд. Gmail-ээрээ нэвтэрч, утсаа баталгаажуулаад эзэмших хүсэлт илгээ.</p>
      <button className="btn dark" onClick={login} style={{ marginTop: 26, padding: '15px 28px', fontSize: 16 }}>
        <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden><path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-3.9z"/><path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.6-.4-3.9z"/></svg>
        Google-ээр нэвтрэх</button>
    </div></section>;
  if (!me) return <section className="wrap" style={{ padding: 60 }}>{err ? <div className="err">{err}</div> : 'Ачаалж байна…'}</section>;
  if (me.edit_agency) return <section className="wrap" style={{ marginTop: 20, maxWidth: 860 }}>
    <h1 className="h" style={{ fontSize: 34, fontWeight: 800 }}>Админ: {me.edit_agency.name}</h1>
    <div className="panel" style={{ marginTop: 18 }}><EditAgency agency={me.edit_agency} adminSlug={me.edit_agency.slug} /></div><Monetize agency={me.edit_agency} slug={me.edit_agency.slug} /></section>;
  const step = !me.phone_verified ? 1 : 2;
  const pending = me.claim?.status === 'pending';
  return <section className="wrap" style={{ marginTop: 20, maxWidth: 860 }}>
    <div className="row" style={{ justifyContent: 'space-between' }}>
      <div><h1 className="h" style={{ fontSize: 'clamp(30px,5vw,42px)', fontWeight: 800 }}>Миний самбар</h1><p style={{ color: 'var(--mute)', marginTop: 6 }}>{me.name || me.email}</p></div>
      <div className="row">{me.is_admin && <Link href="/admin" className="btn v">Админ</Link>}<button className="btn ghost" onClick={() => sb().auth.signOut()}>Гарах</button></div>
    </div>
    {err && <div className="err" style={{ marginTop: 16 }}>{err}</div>}
    <Step n={1} title={me.phone_verified ? `Утас баталгаажсан · ${me.phone}` : 'Утсаа баталгаажуул'} done={me.phone_verified} active={step === 1}>
      {!sent ? <form onSubmit={e => { e.preventDefault(); run(async () => { const r = await api('/api/phone/start', { phone }); r.ok ? setSent(true) : setErr(r.error); }); }} className="row" style={{ alignItems: 'flex-end' }}>
        <div style={{ flex: 1, minWidth: 220 }}><label htmlFor="ph" className="lab">Утасны дугаар</label><input id="ph" className="field" inputMode="numeric" placeholder="99112233" value={phone} onChange={e => setPhone(e.target.value)} required /></div>
        <button className="btn dark" disabled={busy} style={{ padding: '14px 22px' }}>{busy ? '…' : 'Код авах'}</button></form>
      : <form onSubmit={e => { e.preventDefault(); run(async () => { const r = await api('/api/phone/check', { code }); r.ok ? load() : setErr(r.error); }); }} className="row" style={{ alignItems: 'flex-end' }}>
        <div><label htmlFor="cd" className="lab">{phone} руу ирсэн код</label><input id="cd" className="field" inputMode="numeric" maxLength={8} value={code} onChange={e => setCode(e.target.value.replace(/\D/g, ''))} style={{ fontSize: 24, letterSpacing: '.3em', width: 200 }} required /></div>
        <button className="btn v" disabled={busy || code.length < 4} style={{ padding: '14px 22px' }}>Баталгаажуулах</button>
        <button type="button" className="btn ghost" onClick={() => { setSent(false); setCode(''); }}>Дугаар солих</button></form>}
    </Step>
    {me.phone_verified && me.own && <ClaimItem own={me.own} onDone={load} />}
    {me.phone_verified && <Owned me={me} reload={load} />}
    <h2 className="h" style={{ fontSize: 24, fontWeight: 800, marginTop: 30 }}>Агентлаг</h2>
    {me.phone_verified && !me.agency && !pending && !agOpen ? <div className="panel row" style={{ marginTop: 14, justifyContent: 'space-between' }}><span style={{ color: 'var(--mute)' }}>Агентлаг эзэмшдэг үү? Баталгаажсан тэмдэг, клиентийн хүсэлт, «Онцлох» байршил авна.</span><button className="btn v" onClick={() => setAgOpen(true)}>Агентлагаа эзэмших</button></div> :
    <Step n={2} title={me.agency ? `Агентлаг: ${me.agency.name}` : pending ? `Хүсэлт шалгагдаж байна · ${me.claim.agencies?.name}` : 'Агентлагаа эзэмших хүсэлт илгээ'} done={!!me.agency} active={step === 2 && !me.agency}>
      {pending ? <div className="ok">Хүсэлт чинь админд очсон. Батлагдмагц и-мэйлээр мэдэгдэнэ.</div> :
      <form onSubmit={e => { e.preventDefault(); run(async () => { const r = await api('/api/claim', claimSlug ? { slug: claimSlug, note: cl.note } : cl); r.ok ? load() : setErr(r.error); }); }} style={{ display: 'grid', gap: 16 }}>
        {me.claim?.status === 'rejected' && <div className="err">Өмнөх хүсэлт батлагдаагүй. Дахин илгээж болно.</div>}
        {claimSlug ? <div className="ok">Эзэмших агентлаг: <b>{claimSlug}</b> · <Link href="/minii" style={{ textDecoration: 'underline' }}>өөр агентлаг</Link></div> : <>
          <div><label htmlFor="fb" className="lab">Агентлагийн Facebook хуудасны линк</label><input id="fb" className="field" placeholder="facebook.com/..." value={cl.fb_url} onChange={e => setCl({ ...cl, fb_url: e.target.value })} required />
            <FbPreview url={cl.fb_url} onName={n => setCl(c => c.name ? c : { ...c, name: n })} />
            <p style={{ fontSize: 13.5, color: 'var(--mute)', marginTop: 6 }}>Жагсаалтад байгаа бол линкээр нь таниад холбоно. Байхгүй бол доорх мэдээллээр шинээр нэмнэ.</p></div>
          <div><label htmlFor="nm" className="lab">Агентлагийн нэр</label><input id="nm" className="field" value={cl.name} onChange={e => setCl({ ...cl, name: e.target.value })} /></div>
          <CatPicker value={cl.categories} onChange={v => setCl({ ...cl, categories: v })} />
        </>}
        <div><label htmlFor="nt" className="lab">Агентлагт ямар албан тушаалтай вэ?</label><input id="nt" className="field" placeholder="Жишээ нь: Үүсгэн байгуулагч, гүйцэтгэх захирал" value={cl.note} onChange={e => setCl({ ...cl, note: e.target.value })} required /></div>
        <button className="btn dark" disabled={busy} style={{ padding: 15 }}>{busy ? 'Илгээж байна…' : 'Хүсэлт илгээх →'}</button>
      </form>}
    </Step>}
    {me.agency && <div className="panel" style={{ marginTop: 18 }}><EditAgency agency={me.agency} /></div>}
    {me.agency && <Monetize agency={me.agency} />}
    {me.phone_verified && <div style={{ marginTop: 26 }}><Subscribe source="account" /></div>}
  </section>;
}
