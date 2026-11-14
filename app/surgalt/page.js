import Link from 'next/link';
import { listListings } from '@/lib/db';
import { TYPES } from '@/lib/config';
import Hub from '../Hub';
export const dynamic = 'force-dynamic';
export const metadata = { title: TYPES.course.title, description: TYPES.course.sub };
const MON = ['1-р сар', '2-р сар', '3-р сар', '4-р сар', '5-р сар', '6-р сар', '7-р сар', '8-р сар', '9-р сар', '10-р сар', '11-р сар', '12-р сар'];
// Удахгүй эхлэх сургалтын хуваарь (starts_at өнөөдрөөс хойш)
function Calendar({ list }) {
  const today = new Date(Date.now() + 8 * 36e5).toISOString().slice(0, 10);
  const up = list.filter(l => l.starts_at && l.starts_at >= today).sort((a, b) => a.starts_at.localeCompare(b.starts_at));
  return <div id="huvaari" className="strip" style={{ marginTop: 22 }}>
    <b className="h" style={{ fontSize: 18 }}>📅 Удахгүй эхлэх сургалтууд</b>
    {up.length ? <div style={{ display: 'grid', gap: 8, marginTop: 12 }}>{up.slice(0, 12).map(l => { const [, m, d] = l.starts_at.split('-');
      return <Link key={l.id} href={`/l/${l.id}`} className="row" style={{ gap: 14, flexWrap: 'nowrap', background: '#fff', borderRadius: 16, padding: '10px 14px' }}>
        <span style={{ textAlign: 'center', minWidth: 52 }}><b className="h" style={{ fontSize: 22, display: 'block', lineHeight: 1 }}>{+d}</b><small style={{ color: 'var(--mute)', fontWeight: 700 }}>{MON[+m - 1]}</small></span>
        <span style={{ minWidth: 0 }}><b>{l.name}</b><div style={{ color: 'var(--mute)', fontSize: 14 }}>{[l.maker, l.schedule, l.price].filter(Boolean).join(' · ')}</div></span></Link>; })}</div>
      : <p style={{ color: 'var(--mute)', marginTop: 8, fontSize: 14.5 }}>Одоогоор огноо зарласан сургалт алга. Сургалт явуулдаг бол <Link href="/nemeh?type=course" style={{ textDecoration: 'underline' }}>дараагийн ангийнхаа огноог нэм</Link> — энд гарна.</p>}
  </div>;
}
export default async function Page() { const list = await listListings('course'); return <Hub type="course" list={list} top={<Calendar list={list} />} />; }
