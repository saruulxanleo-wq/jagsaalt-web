import Link from 'next/link';
import { isActive, fmtNum, catsOf, catLabel, catTone, isFeatured, fmtMnt } from '@/lib/config';
const minPrice = a => { const v = (a.packages || []).filter(p => p.type !== 'negotiable' && p.min).map(p => p.min); return v.length ? Math.min(...v) : null; };
const short = n => n >= 1e6 ? (Math.round(n / 1e5) / 10 + ' сая').replace('.', ',') : Math.round(n / 1e3) + ' мянга';
export function Logo({ a, size = 60, radius = 16 }) {
  const st = { width: size, height: size, borderRadius: radius };
  return a.logo_url ? <img className="logoimg" style={st} src={a.logo_url} alt={a.name + ' лого'} loading="lazy" />
    : <span className="logoimg" style={{ ...st, background: 'var(--v)', fontSize: size * 0.38 }}>{a.name.trim()[0]}</span>;
}
export function Badges({ a }) {
  const act = isActive(a);
  return <div className="row">
    {isFeatured(a) && <span className="badge b-feat">⭐ Онцлох</span>}
    {a.verified && <span className="badge b-ver">✓ Баталгаажсан</span>}
    {act === true && <span className="badge b-act"><span className="dot" />Идэвхтэй</span>}
    {act === false && <span className="badge b-off">Сүүлд идэвхгүй</span>}
    {a.team_size && <span className="badge b-off">👥 {a.team_size} хүн</span>}
    {a.cases?.length > 0 && <span className="badge b-off">📁 {a.cases.length} кейс</span>}
  </div>;
}
export default function Card({ a }) {
  return <Link href={`/a/${a.slug}`} className={'card' + (isFeatured(a) ? ' feat' : '')}>
    <div className="top"><Logo a={a} /><div><h3>{a.name}</h3><div className="row" style={{ marginTop: 6, gap: 6 }}>{catsOf(a).map(k => <span key={k} className={`cat ${catTone(k)}`}>{catLabel(k)}</span>)}</div></div></div>
    <p className="cdesc" title={a.description || undefined}>{a.description || ''}</p>
    <Badges a={a} />
    {minPrice(a) && <div className="price"><b>{short(minPrice(a))}₮</b>-өөс эхэлнэ · {a.packages.length} багц</div>}
    <div className="meta"><span>{a.followers != null ? <><b>{fmtNum(a.followers)}</b> дагагч</> : a.founded ? <><b>{a.founded}</b> оноос</> : ''}</span><span style={{ color: 'var(--v)' }}>Профайл →</span></div>
  </Link>;
}
