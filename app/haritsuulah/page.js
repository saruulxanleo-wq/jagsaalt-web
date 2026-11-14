import Link from 'next/link';
import { listAgencies } from '@/lib/db';
import { catsOf, catLabel, fmtNum, isActive, fmtPrice } from '@/lib/config';
import { SPEED } from '@/lib/reviews';
import { Logo } from '../Card';
import QuoteBox from '../a/[slug]/QuoteBox';
import ShortBtn from '../ShortBtn';
export const dynamic = 'force-dynamic';
export const metadata = { title: 'Агентлагуудыг харьцуулах', robots: { index: false } };
const minPrice = a => { const v = (a.packages || []).filter(p => p.type !== 'negotiable' && p.min).map(p => p.min); return v.length ? Math.min(...v) : null; };
// Сонгосон 2–4 агентлагийг мөр мөрөөр нь харьцуулах, бүгдээс нь нэг дор үнийн санал авах
export default async function Page({ searchParams }) {
  const slugs = String((await searchParams).a || '').split(',').map(s => s.trim()).filter(Boolean).slice(0, 4);
  const all = await listAgencies();
  const L = slugs.map(s => all.find(a => a.slug === s)).filter(Boolean);
  if (L.length < 2) return <section className="wrap" style={{ marginTop: 10, maxWidth: 720 }}>
    <h1 className="h" style={{ fontSize: 34, fontWeight: 800 }}>Агентлагуудыг харьцуулах</h1>
    <p style={{ color: 'var(--mute)', fontSize: 17, marginTop: 10 }}>Агентлагийн карт дээрх <b>+ Харьцуулах</b> товчоор 2–4 агентлаг сонговол энд зэрэгцүүлж харуулна.</p>
    <Link href="/" className="btn v" style={{ marginTop: 20 }}>Агентлаг сонгох →</Link></section>;
  const rows = [
    ['Чиглэл', a => catsOf(a).map(catLabel).join(', ')],
    ['Баталгаажсан', a => a.verified ? '✓ Тийм' : '—'],
    ['Facebook идэвх', a => ({ true: 'Идэвхтэй', false: 'Сүүлд идэвхгүй', null: '—' })[String(isActive(a))]],
    ['Харилцагчийн үнэлгээ', a => a.rv?.avg ? `★ ${String(a.rv.avg).replace('.', ',')} (${a.rv.rated})` : '—'],
    ['Хариу өгөх хурд', a => a.rv?.speed ? `${SPEED[a.rv.speed]} (${a.rv.fast}/${a.rv.asked})` : 'Мэдээлэл хангалтгүй'],
    ['Доод үнэ', a => minPrice(a) ? fmtPrice({ min: minPrice(a) }) + '-өөс' : '—'],
    ['Багц', a => (a.packages || []).map(p => p.title).filter(Boolean).join(', ') || '—'],
    ['Үйлчилгээ', a => (a.services || []).slice(0, 8).join(', ') || '—'],
    ['Харилцагч брэнд', a => (a.clients || []).slice(0, 8).join(', ') || '—'],
    ['Кейс', a => a.cases?.length ? a.cases.length + ' кейс' : '—'],
    ['Баг', a => a.team_size ? a.team_size + ' хүн' : '—'],
    ['Байгуулагдсан', a => a.founded || '—'],
    ['FB дагагч', a => a.followers != null ? fmtNum(a.followers) : '—'],
  ];
  return <section className="wrap" style={{ marginTop: 10 }}>
    <Link href="/" style={{ color: 'var(--mute)', fontWeight: 600, fontSize: 14.5 }}>← Агентлагууд</Link>
    <h1 className="h" style={{ fontSize: 'clamp(26px,3.4vw,38px)', fontWeight: 800, marginTop: 14 }}>{L.length} агентлагийг харьцуулах</h1>
    <div style={{ overflowX: 'auto', marginTop: 20, background: '#fff', borderRadius: 24, boxShadow: '0 10px 30px -18px #0b3a2040' }}>
      <table className="cmp"><thead><tr><th />{L.map(a => <th key={a.slug}><Link href={`/a/${a.slug}`} style={{ display: 'grid', gap: 8, justifyItems: 'start' }}><Logo a={a} size={48} radius={12} /><b>{a.name}</b></Link><div style={{ marginTop: 8 }}><ShortBtn slug={a.slug} big /></div></th>)}</tr></thead>
        <tbody>{rows.map(([l, f]) => <tr key={l}><td>{l}</td>{L.map(a => <td key={a.slug}>{f(a)}</td>)}</tr>)}</tbody></table>
    </div>
    <div style={{ maxWidth: 560, marginTop: 28 }}><QuoteBox targets={L.map(a => ({ slug: a.slug, name: a.name }))} openInit /></div>
  </section>;
}
