import Link from 'next/link';
import { CATS, isActive, fmtNum } from '@/lib/config';
export function Logo({ a, size = 60, radius = 16 }) {
  const st = { width: size, height: size, borderRadius: radius };
  return a.logo_url ? <img className="logoimg" style={st} src={a.logo_url} alt={a.name + ' лого'} loading="lazy" />
    : <span className="logoimg" style={{ ...st, background: 'var(--c)', fontSize: size * 0.38 }}>{a.name.trim()[0]}</span>;
}
export function Badges({ a }) {
  const act = isActive(a);
  return <div className="row">
    {a.verified && <span className="badge b-ver">✓ Баталгаажсан</span>}
    {act === true && <span className="badge b-act"><span className="dot" />Идэвхтэй</span>}
    {act === false && <span className="badge b-off">Сүүлд идэвхгүй</span>}
  </div>;
}
export default function Card({ a }) {
  const c = CATS[a.category] || { label: a.category, tone: 'v' };
  return <Link href={`/a/${a.slug}`} className="card">
    <div className="top"><Logo a={a} /><div><h3>{a.name}</h3><div className="row" style={{ marginTop: 6 }}><span className={`cat ${c.tone}`}>{c.label}</span></div></div></div>
    {a.description && <p style={{ color: 'var(--mute)', fontSize: 14.5 }}>{a.description}</p>}
    <Badges a={a} />
    <div className="meta"><span><b>{fmtNum(a.followers)}</b> дагагч</span><span style={{ color: 'var(--v)' }}>Профайл →</span></div>
  </Link>;
}
