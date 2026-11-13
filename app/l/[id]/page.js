import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getListing, listListings } from '@/lib/db';
import { TYPES, topicLabel, host, siteUrl } from '@/lib/config';
import ListingCard from '../../ListingCard';
import GoButton from './GoButton';
export const dynamic = 'force-dynamic';
export async function generateMetadata({ params }) {
  const l = await getListing((await params).id); if (!l) return {};
  const t = TYPES[l.type] || TYPES.tool;
  const description = (l.description || `${l.name} — ${t.label}`).slice(0, 160);
  return { title: `${l.name} · ${t.label}`, description, alternates: { canonical: `/l/${l.id}` }, openGraph: { title: `${l.name} | brief.mn`, description, images: l.logo_url ? [{ url: l.logo_url }] : undefined } };
}
export default async function Page({ params }) {
  const l = await getListing((await params).id); if (!l) notFound();
  const t = TYPES[l.type] || TYPES.tool; const round = l.type === 'freelancer';
  const more = (await listListings(l.type)).filter(x => x.id !== l.id && (x.topics || []).some(k => (l.topics || []).includes(k))).slice(0, 3);
  const ld = { '@context': 'https://schema.org', '@type': round ? 'Person' : 'Organization', name: l.name, description: l.description || undefined, url: siteUrl() + '/l/' + l.id, sameAs: [l.url], image: l.logo_url || undefined };
  return <section className="wrap" style={{ maxWidth: 860, marginTop: 10 }}>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
    <Link href={t.path || '/'} style={{ color: 'var(--mute)', fontWeight: 600 }}>← {t.label}</Link>
    <div className="panel" style={{ marginTop: 14, display: 'grid', gap: 18 }}>
      <div className="row" style={{ gap: 20, alignItems: 'center', flexWrap: 'nowrap' }}>
        {l.logo_url ? <img src={l.logo_url} alt={l.name} style={{ width: 96, height: 96, objectFit: 'cover', borderRadius: round ? '50%' : 22, flexShrink: 0 }} />
          : <span className="logoimg licon" style={{ width: 96, height: 96, borderRadius: round ? '50%' : 22, fontSize: 40, flexShrink: 0 }}>{l.name.trim()[0]}</span>}
        <div style={{ minWidth: 0 }}>
          <h1 className="h" style={{ fontSize: 'clamp(26px,5vw,38px)', fontWeight: 800, lineHeight: 1.1 }}>{l.name}</h1>
          <div style={{ color: 'var(--mute)', fontWeight: 600, marginTop: 4 }}>{l.maker || host(l.url)}</div>
        </div>
      </div>
      <div className="row" style={{ gap: 6 }}>
        <span className={'cat ' + t.tone}>{t.icon} {t.label}</span>
        {l.verified && <span className="vbadge">✓ Баталгаажсан</span>}
        {l.sponsored && <span className="badge b-off">Онцлох</span>}
        {(l.topics || []).map(k => <span key={k} className="badge b-off">{topicLabel(k)}</span>)}
      </div>
      {l.description && <p style={{ fontSize: 17, lineHeight: 1.6 }}>{l.description}</p>}
      {l.price && <div><div className="lab">Үнэ</div><b style={{ fontSize: 20 }}>{l.price}</b></div>}
      <div className="row" style={{ gap: 10 }}>
        <GoButton id={l.id} url={l.url} label={round ? 'Холбогдох' : 'Үзэх'} />
        {!l.verified && <Link href={`/minii?own=listing:${l.id}`} className="btn ghost">Энэ минийх</Link>}
      </div>
      <p style={{ fontSize: 13.5, color: 'var(--mute)' }}>Холбоос: {host(l.url)}</p>
    </div>
    {more.length > 0 && <><h2 className="h" style={{ fontSize: 22, fontWeight: 700, margin: '28px 0 12px' }}>Төстэй {(t.plural || t.label).toLowerCase()}</h2>
      <div className="grid">{more.map(x => <ListingCard key={x.id} l={x} />)}</div></>}
  </section>;
}
