import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAgency, listAgencies } from '@/lib/db';
import { fmtNum, catsOf, catLabel, catTone, cap, SOCIALS, host, fmtPrice } from '@/lib/config';
import OwnerTools from './OwnerTools';
import ReportButton from './ReportButton';
import Track from './Track';
import { MemberPhoto } from '../../Avatar';
import Card, { Logo, Badges } from '../../Card';
export const dynamic = "force-dynamic";
export async function generateMetadata({ params }) {
  const a = await getAgency((await params).slug);
  if (!a) return {};
  const description = a.description || `${a.name} — ${catsOf(a).map(catLabel).join(', ')}. Монголын маркетингийн агентлагуудын жагсаалт.`;
  return { title: a.name, description, alternates: { canonical: `/a/${a.slug}` }, openGraph: { title: `${a.name} | jagsaalt.mn`, description, images: a.logo_url ? [{ url: a.logo_url, width: 400, height: 400 }] : undefined }, twitter: { card: a.logo_url ? 'summary' : 'summary_large_image' } };
}
export default async function Profile({ params }) {
  const { slug } = await params;
  const a = await getAgency(slug);
  if (!a) notFound();
  const c = { label: catLabel(catsOf(a)[0]) };
  const similar = (await listAgencies()).filter(x => x.slug !== a.slug && catsOf(x).some(k => catsOf(a).includes(k))).slice(0, 3);
  return <section className="wrap" style={{ marginTop: 10 }}>
    <Track slug={a.slug} />
    <Link href="/" style={{ color: 'var(--mute)', fontWeight: 600, fontSize: 14.5 }}>← Агентлагууд / {c.label}</Link>
    <div className="panel" style={{ padding: 0, overflow: 'hidden', marginTop: 18 }}>
      <div style={{ height: 160, background: 'radial-gradient(circle at 15% 30%,var(--l) 0 100px,transparent 101px),radial-gradient(circle at 80% 120%,var(--c) 0 160px,transparent 161px),var(--v)' }} />
      <div style={{ padding: '0 32px 36px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 32 }}>
        <div>
          <div style={{ marginTop: -56, display: 'inline-block', border: '6px solid #fff', borderRadius: 34, background: '#fff' }}><Logo a={a} size={112} radius={28} /></div>
          <h1 className="h" style={{ fontSize: 'clamp(30px,4vw,44px)', fontWeight: 800, marginTop: 12 }}>{a.name}</h1>
          <div className="row" style={{ marginTop: 12 }}>{catsOf(a).map(k => <span key={k} className={`cat ${catTone(k)}`}>{catLabel(k)}</span>)}<Badges a={a} /></div>
          <p style={{ fontSize: 18, color: 'var(--mute)', marginTop: 20, maxWidth: 640 }}>{a.description || 'Тайлбар хараахан нэмэгдээгүй. Агентлагийн эзэн баталгаажаад өөрөө бөглөнө.'}</p>
          {a.services?.length > 0 && <><h2 className="h" style={{ fontSize: 19, fontWeight: 700, marginTop: 30 }}>Үйлчилгээ</h2><div className="row" style={{ marginTop: 12 }}>{a.services.map(s => <span key={s} className="chip">{cap(s)}</span>)}</div></>}
          {a.clients?.length > 0 && <><h2 className="h" style={{ fontSize: 19, fontWeight: 700, marginTop: 30 }}>Харилцагч брэндүүд</h2><div className="row" style={{ marginTop: 12 }}>{a.clients.map(s => <span key={s} style={{ padding: '10px 16px', borderRadius: 14, background: 'var(--bg)', fontWeight: 700 }}>{s}</span>)}</div></>}
          {a.team?.length > 0 && <><h2 className="h" style={{ fontSize: 19, fontWeight: 700, marginTop: 30 }}>Баг</h2><div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(210px,1fr))', gap: 10, marginTop: 12 }}>{a.team.map((m, i) => <div key={i} className="row" style={{ background: 'var(--bg)', borderRadius: 16, padding: '10px 12px', gap: 12, flexWrap: 'nowrap' }}><MemberPhoto m={m} size={48} /><div><b>{m.name}</b><div style={{ color: 'var(--mute)', fontSize: 14 }}>{m.role}</div></div></div>)}</div></>}
        </div>
        <aside style={{ marginTop: 24, display: 'grid', gap: 14, alignContent: 'start' }}>
          <OwnerTools slug={a.slug} />
          <div style={{ background: 'var(--bg)', borderRadius: 24, padding: 22, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {[[a.founded, 'Байгуулагдсан'], [a.team_size && a.team_size + ' хүн', 'Баг'], [a.followers != null && fmtNum(a.followers), 'FB дагагч'], [a.min_budget, 'Доод төсөв']].filter(([v]) => v).slice(0, 4).map(([v, l]) =>
              <div key={l}><div className="h" style={{ fontSize: String(v).length > 8 ? 18 : 26, fontWeight: 800 }}>{v}</div><div style={{ color: 'var(--mute)', fontSize: 14, fontWeight: 600 }}>{l}</div></div>)}
          </div>
          {a.fb_url && <a href={a.fb_url} target="_blank" rel="noopener" className="btn v" data-track="fb">Facebook хуудас</a>}
          {a.phone_public && <a href={`tel:${a.phone_public}`} className="btn ghost" data-track="phone">☎ {a.phone_public}</a>}
          {a.website && <a href={a.website} target="_blank" rel="noopener" className="btn ghost" data-track="website">🌐 {host(a.website)}</a>}
          {a.socials && Object.keys(a.socials).length > 0 && <div className="row" style={{ gap: 8 }}>
            {Object.entries(SOCIALS).filter(([k]) => a.socials[k]).map(([k, l]) => <a key={k} href={a.socials[k]} target="_blank" rel="noopener" className="chip" data-track="social">{l}</a>)}
            {a.socials.email && <a href={`mailto:${a.socials.email}`} className="chip" data-track="email">✉ {a.socials.email}</a>}</div>}
          <ReportButton slug={a.slug} />
          {!a.verified && <div className="ok">Энэ агентлагийг удирддаг уу? <Link href={`/minii?claim=${a.slug}`} style={{ textDecoration: 'underline' }}>Эзэмших хүсэлт илгээ</Link></div>}
        </aside>
      </div>
    </div>
    {a.packages?.length > 0 && <><h2 className="h" style={{ fontSize: 24, fontWeight: 700, margin: '44px 0 18px' }}>Үйлчилгээ, үнийн санал</h2>
      <div className="grid">{a.packages.map((p, i) => <div key={i} className="card" style={{ gap: 12 }}>
        <h3>{p.title}</h3>
        {p.items?.length > 0 && <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: 7 }}>{p.items.map((x, j) => <li key={j} className="row" style={{ gap: 8, flexWrap: 'nowrap', alignItems: 'flex-start', fontSize: 15 }}><span style={{ color: '#2FB344', fontWeight: 800 }}>✓</span>{x}</li>)}</ul>}
        <div className="meta" style={{ fontSize: 17 }}><b className="h" style={{ fontSize: p.type === 'negotiable' ? 16 : 19, color: p.type === 'negotiable' ? 'var(--mute)' : 'var(--ink)' }}>{fmtPrice(p)}</b></div>
      </div>)}</div></>}
    {a.cases?.length > 0 && <><h2 className="h" style={{ fontSize: 24, fontWeight: 700, margin: '44px 0 18px' }}>Кейсүүд</h2>
      <div className="grid">{a.cases.map((c, i) => { const In = <>{c.image && <img src={c.image} alt={c.title} loading="lazy" style={{ width: 'calc(100% + 44px)', margin: '-22px -22px 4px', aspectRatio: '16/10', objectFit: 'cover', borderRadius: '24px 24px 0 0' }} />}<span className="cat v" style={{ alignSelf: 'flex-start' }}>{c.client || 'Кейс'}</span><h3>{c.title}</h3>{c.result && <p style={{ fontSize: 16, fontWeight: 600 }}>{c.result}</p>}{c.link && <span style={{ color: 'var(--v)', fontWeight: 600, fontSize: 14, marginTop: 'auto' }}>Дэлгэрэнгүй →</span>}</>;
        return c.link ? <a key={i} href={c.link} target="_blank" rel="noopener" className="card">{In}</a> : <div key={i} className="card">{In}</div>; })}</div></>}
    {similar.length > 0 && <><h2 className="h" style={{ fontSize: 24, fontWeight: 700, margin: '44px 0 18px' }}>Төстэй агентлагууд</h2><div className="grid">{similar.map(x => <Card key={x.slug} a={x} />)}</div></>}
  </section>;
}
