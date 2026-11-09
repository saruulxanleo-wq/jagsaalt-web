import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAgency, listAgencies } from '@/lib/db';
import { CATS, fmtNum, catsOf } from '@/lib/config';
import Card, { Logo, Badges } from '../../Card';
export const dynamic = "force-dynamic";
export async function generateMetadata({ params }) {
  const a = await getAgency((await params).slug);
  return a ? { title: a.name, description: `${a.name} — ${CATS[a.category]?.label}. Монголын маркетингийн агентлагуудын жагсаалт.` } : {};
}
export default async function Profile({ params }) {
  const { slug } = await params;
  const a = await getAgency(slug);
  if (!a) notFound();
  const c = CATS[a.category] || { label: a.category, tone: 'v' };
  const similar = (await listAgencies()).filter(x => x.slug !== a.slug && catsOf(x).some(k => catsOf(a).includes(k))).slice(0, 3);
  return <section className="wrap" style={{ marginTop: 10 }}>
    <Link href="/" style={{ color: 'var(--mute)', fontWeight: 600, fontSize: 14.5 }}>← Агентлагууд / {c.label}</Link>
    <div className="panel" style={{ padding: 0, overflow: 'hidden', marginTop: 18 }}>
      <div style={{ height: 160, background: 'radial-gradient(circle at 15% 30%,var(--l) 0 100px,transparent 101px),radial-gradient(circle at 80% 120%,var(--c) 0 160px,transparent 161px),var(--v)' }} />
      <div style={{ padding: '0 32px 36px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 32 }}>
        <div>
          <div style={{ marginTop: -56, display: 'inline-block', border: '6px solid #fff', borderRadius: 34, background: '#fff' }}><Logo a={a} size={112} radius={28} /></div>
          <h1 className="h" style={{ fontSize: 'clamp(30px,4vw,44px)', fontWeight: 800, marginTop: 12 }}>{a.name}</h1>
          <div className="row" style={{ marginTop: 12 }}>{catsOf(a).map(k => <span key={k} className={`cat ${CATS[k].tone}`}>{CATS[k].label}</span>)}<Badges a={a} /></div>
          <p style={{ fontSize: 18, color: 'var(--mute)', marginTop: 20, maxWidth: 640 }}>{a.description || 'Тайлбар хараахан нэмэгдээгүй. Агентлагийн эзэн баталгаажаад өөрөө бөглөнө.'}</p>
          {a.services?.length > 0 && <><h2 className="h" style={{ fontSize: 19, fontWeight: 700, marginTop: 30 }}>Үйлчилгээ</h2><div className="row" style={{ marginTop: 12 }}>{a.services.map(s => <span key={s} className="chip">{s}</span>)}</div></>}
        </div>
        <aside style={{ marginTop: 24, display: 'grid', gap: 14, alignContent: 'start' }}>
          <div style={{ background: 'var(--bg)', borderRadius: 24, padding: 22, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div><div className="h" style={{ fontSize: 28, fontWeight: 800 }}>{fmtNum(a.followers)}</div><div style={{ color: 'var(--mute)', fontSize: 14, fontWeight: 600 }}>FB дагагч</div></div>
            <div><div className="h" style={{ fontSize: 28, fontWeight: 800 }}>{a.last_post_at ? a.last_post_at.slice(5).replace('-', '/') : '—'}</div><div style={{ color: 'var(--mute)', fontSize: 14, fontWeight: 600 }}>Сүүлийн пост</div></div>
          </div>
          {a.fb_url && <a href={a.fb_url} target="_blank" rel="noopener" className="btn v">Facebook хуудас</a>}
          {a.phone_public && <a href={`tel:${a.phone_public}`} className="btn ghost">☎ {a.phone_public}</a>}
          {a.website && <a href={a.website} target="_blank" rel="noopener" className="btn ghost">Вэбсайт</a>}
          {!a.verified && <div className="ok">Энэ агентлагийг удирддаг уу? <Link href={`/minii?claim=${a.slug}`} style={{ textDecoration: 'underline' }}>Эзэмших хүсэлт илгээ</Link></div>}
        </aside>
      </div>
    </div>
    {similar.length > 0 && <><h2 className="h" style={{ fontSize: 24, fontWeight: 700, margin: '44px 0 18px' }}>Төстэй агентлагууд</h2><div className="grid">{similar.map(x => <Card key={x.slug} a={x} />)}</div></>}
  </section>;
}
