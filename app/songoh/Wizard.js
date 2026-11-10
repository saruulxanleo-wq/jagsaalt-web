'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { NEEDS, BUDGETS, SIZES, PRIORITIES } from '@/lib/match';
import { catLabel, catTone, fmtNum } from '@/lib/config';
import { Logo } from '../Card';
const px = (ev, data) => { try { window.fbq && window.fbq('track', ev, data); } catch {} };
const Opt = ({ on, onClick, children, disabled }) => <button type="button" onClick={onClick} disabled={disabled} aria-pressed={on}
  style={{ textAlign: 'left', padding: '16px 18px', borderRadius: 18, fontSize: 16.5, fontWeight: 600, background: on ? 'var(--ink)' : '#fff', color: on ? '#fff' : 'var(--ink)', boxShadow: on ? 'none' : 'inset 0 0 0 1.5px var(--line)', opacity: disabled ? .45 : 1, display: 'flex', alignItems: 'center', gap: 10 }}>
  <span style={{ width: 22, height: 22, borderRadius: 7, flex: 'none', display: 'grid', placeItems: 'center', background: on ? 'var(--l)' : 'var(--bg)', color: 'var(--ink)', fontSize: 14 }}>{on ? '✓' : ''}</span>{children}</button>;
const U = (base, extra = '') => `${base}${base.includes('?') ? '&' : '?'}utm_source=jagsaalt&utm_medium=songoh${extra}`;
// Агентлаг сонгохоос өмнөх алхам: SARUUL Score (9 000₮) ба SARUUL Framework (98 000₮)
function Before({ q }) {
  const runsAds = q.ads === 'yes' || q.ads === 'some';
  const fb = /facebook\.com\/./i.test(q.fb || '') ? q.fb.trim() : '';
  const Card = ({ tag, title, text, href, cta, hot }) => <a href={href} target="_blank" rel="noopener" onClick={() => px('Contact', { content_name: tag })} className="card" style={{ gap: 8, boxShadow: hot ? 'inset 0 0 0 2.5px var(--l), 0 10px 30px -18px #2a1a6e40' : undefined }}>
    <span className="cat p" style={{ alignSelf: 'flex-start' }}>{tag}</span><h3>{title}</h3><p style={{ color: 'var(--mute)', fontSize: 14.5 }}>{text}</p>
    <span style={{ color: 'var(--v)', fontWeight: 700, marginTop: 'auto' }}>{cta} →</span></a>;
  return <div style={{ marginTop: 18 }}>
    <b style={{ fontSize: 16 }}>Агентлагт мөнгө зарахаасаа өмнө</b>
    <div className="grid" style={{ marginTop: 10, gridTemplateColumns: 'repeat(auto-fit,minmax(250px,1fr))' }}>
      <Card tag="9 000₮ · 5 минутад" title="SARUUL Score — хуудсаа үнэлүүл" text={(fb ? 'Таны хуудсыг' : 'Facebook хуудсаа') + ' 0–100 оноогоор үнэлүүлж, юуг нь засахыг мэд. QPay-ээр төлөөд хариугаа 5 минутад авна.'}
        href={U('https://score.saruul.work/' + (fb ? '?url=' + encodeURIComponent(fb) : ''))} cta="QPay-ээр төлөөд оноогоо авах" hot={!runsAds} />
      <Card tag="98 000₮" title="SARUUL Framework — зарын мөнгөө шалга" text={runsAds ? 'Зар явуулдаг юм байна. Нэг шинэ хэрэглэгчид хэдээс илүү зарцуулж болохгүйг, мөнгө хаана үрэгдэж байгааг тоогоор гаргана.' : 'Зар эхлүүлэхээсээ өмнө нэг хэрэглэгчид зарцуулах дээд дүн, эхний 30 хоногийн төлөвлөгөөгөө тоогоор гарга.'}
        href={U('https://saruul.work/framework')} cta="Дэлгэрэнгүй" hot={runsAds} />
    </div></div>;
}
export default function Wizard() {
  const sp = useSearchParams();
  const [step, setStep] = useState(0);
  const [q, setQ] = useState({ needs: [], budget: '', size: '', priority: '', industry: '', fb: '', ads: '' });
  const [res, setRes] = useState(null); const [pick, setPick] = useState([]);
  const [f, setF] = useState({ name: '', phone: '', email: '', company: '', note: '' }); const [sent, setSent] = useState(false); const [err, setErr] = useState(null); const [busy, setBusy] = useState(false);
  const utm = Object.fromEntries([...sp.entries()].filter(([k]) => /^(utm_|fbclid)/.test(k)).map(([k, v]) => [k, v.slice(0, 100)]));
  const steps = [
    { t: 'Юунд туслалцаа хэрэгтэй вэ?', h: '3 хүртэл сонгоно', ok: q.needs.length > 0, body: <div style={{ display: 'grid', gap: 10 }}>{Object.entries(NEEDS).map(([k, n]) => { const on = q.needs.includes(k); return <Opt key={k} on={on} disabled={!on && q.needs.length >= 3} onClick={() => setQ({ ...q, needs: on ? q.needs.filter(x => x !== k) : [...q.needs, k] })}>{n.label}</Opt>; })}</div> },
    { t: 'Сард маркетингт хэр зарцуулах боломжтой вэ?', h: 'Агентлагийн үйлчилгээний төсөв (зар сурталчилгааны төлбөрөөс тусдаа)', ok: !!q.budget, auto: true, body: <div style={{ display: 'grid', gap: 10 }}>{Object.entries(BUDGETS).map(([k, b]) => <Opt key={k} on={q.budget === k} onClick={() => { setQ({ ...q, budget: k }); setTimeout(() => setStep(2), 180); }}>{b[0]}</Opt>)}</div> },
    { t: 'Бизнес тань ямар хэмжээтэй вэ?', ok: !!q.size, body: <div style={{ display: 'grid', gap: 10 }}>{Object.entries(SIZES).map(([k, l]) => <Opt key={k} on={q.size === k} onClick={() => { setQ({ ...q, size: k }); setTimeout(() => setStep(3), 180); }}>{l}</Opt>)}</div> },
    { t: 'Хамгийн их юуг чухалчлах вэ?', ok: !!q.priority, body: <div style={{ display: 'grid', gap: 10 }}>{Object.entries(PRIORITIES).map(([k, l]) => <Opt key={k} on={q.priority === k} onClick={() => { setQ({ ...q, priority: k }); setTimeout(() => setStep(4), 180); }}>{l}</Opt>)}</div> },
    { t: 'Одоо Facebook-т зар сурталчилгаа явуулж байна уу?', ok: !!q.ads, body: <div style={{ display: 'grid', gap: 10 }}>{[['yes', 'Тийм, тогтмол явуулдаг'], ['some', 'Хааяа boost хийдэг'], ['no', 'Үгүй, одоогоор явуулахгүй байна']].map(([k, l]) => <Opt key={k} on={q.ads === k} onClick={() => { setQ({ ...q, ads: k }); setTimeout(() => setStep(5), 180); }}>{l}</Opt>)}</div> },
    { t: 'Ямар салбарт үйл ажиллагаа явуулдаг вэ?', h: 'Заавал биш', ok: true, body: <><input className="field" style={{ fontSize: 17 }} placeholder="Жишээ нь: ресторан, гоо сайхан, боловсрол" value={q.industry} maxLength={80} onChange={e => setQ({ ...q, industry: e.target.value })} />
      <label htmlFor="fbp" className="lab" style={{ display: 'block', marginTop: 18 }}>Facebook хуудасны линк <span style={{ color: 'var(--mute)', fontWeight: 500 }}>· заавал биш, хуудсаа үнэгүй үнэлүүлэх боломжтой</span></label>
      <input id="fbp" className="field" placeholder="facebook.com/..." value={q.fb} maxLength={200} onChange={e => setQ({ ...q, fb: e.target.value })} />
      <div className="row" style={{ marginTop: 10, gap: 6 }}>{['Хоол, ресторан', 'Гоо сайхан', 'Боловсрол', 'Үл хөдлөх', 'Жижиглэн худалдаа', 'Эрүүл мэнд', 'Санхүү'].map(s => <button type="button" key={s} className="chip" onClick={() => setQ({ ...q, industry: s })}>{s}</button>)}</div></> },
  ];
  async function finish() {
    setStep(6); setRes(null);
    const r = await fetch('/api/match', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(q) }); const j = await r.json();
    setRes(j.results || []); setPick((j.results || []).slice(0, 3).map(x => x.slug)); px('ViewContent', { content_name: 'agency_match' });
  }
  async function send(e) {
    e.preventDefault(); setBusy(true); setErr(null);
    const r = await fetch('/api/lead', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...f, answers: q, agencies: pick, utm }) });
    const j = await r.json().catch(() => ({})); setBusy(false);
    if (r.ok) { setSent(true); px('Lead', { content_name: 'agency_match' }); } else setErr(j.error || 'Алдаа гарлаа');
  }
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, [step]);
  if (step < 6) { const s = steps[step]; return <section className="wrap" style={{ maxWidth: 640, marginTop: 10 }}>
    {step === 0 && <div style={{ marginBottom: 22 }}><h1 className="h" style={{ fontSize: 'clamp(28px,6vw,40px)', fontWeight: 800 }}>Ямар агентлагтай хамтрах вэ?</h1>
      <p style={{ color: 'var(--mute)', fontSize: 17, marginTop: 8 }}>6 асуултад хариулаад өөрт тохирох агентлагуудаа 1 минутад ол. Үнэгүй, бүртгэл шаардахгүй.</p></div>}
    <div style={{ display: 'flex', gap: 6 }}>{steps.map((_, i) => <span key={i} style={{ flex: 1, height: 6, borderRadius: 9, background: i <= step ? 'var(--v)' : 'var(--line)' }} />)}</div>
    <div className="panel" style={{ marginTop: 16, padding: '26px 22px' }}>
      <span style={{ color: 'var(--mute)', fontWeight: 600, fontSize: 14 }}>{step + 1} / {steps.length}</span>
      <h2 className="h" style={{ fontSize: 24, fontWeight: 800, marginTop: 4 }}>{s.t}</h2>{s.h && <p style={{ color: 'var(--mute)', fontSize: 14.5, marginTop: 4 }}>{s.h}</p>}
      <div style={{ marginTop: 18 }}>{s.body}</div>
      <div className="row" style={{ justifyContent: 'space-between', marginTop: 22 }}>
        {step > 0 ? <button type="button" className="btn ghost" onClick={() => setStep(step - 1)}>← Буцах</button> : <span />}
        {(step === 0 || step === 5) && <button type="button" className="btn v" disabled={!s.ok} style={{ padding: '14px 26px' }} onClick={() => step === 5 ? finish() : setStep(step + 1)}>{step === 5 ? 'Агентлагуудаа харах →' : 'Үргэлжлүүлэх →'}</button>}
      </div>
    </div></section>; }
  return <section className="wrap" style={{ maxWidth: 820, marginTop: 10 }}>
    <h1 className="h" style={{ fontSize: 'clamp(26px,5vw,36px)', fontWeight: 800 }}>Танд тохирох агентлагууд</h1>
    <p style={{ color: 'var(--mute)', marginTop: 6 }}>{q.needs.map(k => NEEDS[k].label).join(' · ')} · {BUDGETS[q.budget]?.[0]} / сар</p>
    <Before q={q} />
    {!res ? <p style={{ marginTop: 24 }}>Тулгаж байна…</p> : res.length === 0 ? <div className="panel" style={{ marginTop: 18 }}>Тохирох агентлаг олдсонгүй. <Link href="/" style={{ color: 'var(--v)' }}>Бүх жагсаалтыг үзэх →</Link></div> : <>
      <div style={{ display: 'grid', gap: 12, marginTop: 18 }}>{res.map((a, i) => { const on = pick.includes(a.slug); return <div key={a.slug} className="panel" style={{ padding: 18, display: 'flex', gap: 14, alignItems: 'flex-start', boxShadow: on ? 'inset 0 0 0 2.5px var(--v)' : undefined }}>
        <Logo a={a} size={56} radius={14} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="row" style={{ justifyContent: 'space-between', gap: 8 }}><b className="h" style={{ fontSize: 18, fontWeight: 700 }}>{i + 1}. {a.name}</b><span className="row" style={{ gap: 6 }}>{a.featured_until && new Date(a.featured_until) > new Date() && <span className="badge b-feat">⭐ Онцлох</span>}{a.verified && <span className="badge b-ver">✓ Баталгаажсан</span>}</span></div>
          <div className="row" style={{ gap: 6, marginTop: 6 }}>{a.categories.slice(0, 3).map(k => <span key={k} className={`cat ${catTone(k)}`}>{catLabel(k)}</span>)}{a.followers ? <span style={{ color: 'var(--mute)', fontSize: 13.5, fontWeight: 600 }}>{fmtNum(a.followers)} дагагч</span> : null}</div>
          <ul style={{ listStyle: 'none', padding: 0, marginTop: 10, display: 'grid', gap: 4, fontSize: 14.5 }}>{a.why.map(w => <li key={w}><span style={{ color: '#2FB344', fontWeight: 800 }}>✓</span> {w}</li>)}</ul>
          <div className="row" style={{ marginTop: 10, gap: 8 }}>
            <button type="button" className={'chip' + (on ? ' on' : '')} onClick={() => setPick(on ? pick.filter(x => x !== a.slug) : [...pick, a.slug])}>{on ? '✓ Үнийн санал авна' : '+ Үнийн санал авах'}</button>
            <Link href={`/a/${a.slug}`} target="_blank" className="chip">Профайл үзэх ↗</Link></div>
        </div></div>; })}</div>
      <div className="panel" style={{ marginTop: 22, background: 'var(--ink)', color: '#fff' }}>
        {sent ? <div><h2 className="h" style={{ fontSize: 24, fontWeight: 800 }}>Баярлалаа! ✓</h2><p style={{ color: '#CFCAE6', marginTop: 8 }}>Хүсэлтийг тань хүлээн авлаа. Ажлын 1 өдөрт тантай холбогдож, сонгосон агентлагуудаас үнийн санал авахад тусална.</p></div> :
        <form onSubmit={send} style={{ display: 'grid', gap: 12 }}>
          <h2 className="h" style={{ fontSize: 22, fontWeight: 800 }}>Сонгосон {pick.length} агентлагаас үнийн санал авах</h2>
          <p style={{ color: '#CFCAE6', fontSize: 15 }}>Мэдээллээ үлдээгээрэй. Хэрэгцээг тань сонгосон болон тохирох 3 хүртэлх агентлагт дамжуулж, үнийн санал авахуулна. Танд үнэгүй.</p>
          <div className="row" style={{ gap: 10 }}>
            <input aria-label="Нэр" className="field" style={{ flex: 1, minWidth: 200, marginTop: 0 }} placeholder="Нэр *" value={f.name} onChange={e => setF({ ...f, name: e.target.value })} required />
            <input aria-label="Байгууллага" className="field" style={{ flex: 1, minWidth: 200, marginTop: 0 }} placeholder="Байгууллага" value={f.company} onChange={e => setF({ ...f, company: e.target.value })} /></div>
          <div className="row" style={{ gap: 10 }}>
            <input aria-label="Утас" className="field" style={{ flex: 1, minWidth: 200, marginTop: 0 }} inputMode="tel" placeholder="Утас *" value={f.phone} onChange={e => setF({ ...f, phone: e.target.value })} />
            <input aria-label="И-мэйл" className="field" style={{ flex: 1, minWidth: 200, marginTop: 0 }} type="email" placeholder="И-мэйл" value={f.email} onChange={e => setF({ ...f, email: e.target.value })} /></div>
          <textarea aria-label="Нэмэлт мэдээлэл" className="field" style={{ marginTop: 0 }} rows={2} placeholder="Нэмэлт мэдээлэл (заавал биш)" value={f.note} onChange={e => setF({ ...f, note: e.target.value })} />
          {err && <div className="err">{err}</div>}
          <button className="btn lime" disabled={busy || !pick.length} style={{ padding: 16, fontSize: 16 }}>{busy ? 'Илгээж байна…' : 'Үнийн санал авах →'}</button>
          <p style={{ color: '#A9A3C4', fontSize: 13 }}>Мэдээллийг зөвхөн үнийн санал авахад ашиглаж, 3-аас илүү агентлагт өгөхгүй. <Link href="/nuuts" style={{ textDecoration: 'underline' }}>Нууцлал</Link></p>
        </form>}
      </div>
      <button type="button" className="btn ghost" style={{ marginTop: 14 }} onClick={() => { setStep(0); setSent(false); }}>↺ Дахин эхлэх</button>
    </>}
  </section>;
}
