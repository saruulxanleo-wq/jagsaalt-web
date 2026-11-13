import Link from 'next/link';
import { TYPES, DIY } from '@/lib/config';
import { listListings } from '@/lib/db';
export const dynamic = 'force-dynamic';
export const metadata = { title: 'Маркетингаа өөрөө хийх: хэрэгсэл, сургалт, коммюнити', description: 'Агентлаг хөлслөхгүйгээр өөрөө хийх гэж байгаа бол — маркетингийн хэрэгсэл, сургалт, маркетерын коммюнитиуд нэг дор.' };
const KEYS = ['tool', 'course', 'community'];
export default async function Page() {
  const lists = await Promise.all(KEYS.map(k => listListings(k).catch(() => [])));
  return <section className="wrap" style={{ marginTop: 10 }}>
    <h1 className="h" style={{ fontSize: 'clamp(28px,3.6vw,42px)', fontWeight: 800, marginTop: 22 }}>{DIY.label}</h1>
    <p style={{ color: 'var(--mute)', fontSize: 17, marginTop: 8, maxWidth: 680 }}>Агентлаг хөлслөхийн оронд өөрөө хийх гэж байгаа бол эндээс эхэл: хэрэгслүүд, сургалтууд, асуулт асуух коммюнитиуд.</p>
    <div className="grid" style={{ marginTop: 22 }}>{KEYS.map((k, i) => { const t = TYPES[k]; const n = lists[i].length; return <Link key={k} href={t.path} className="card" style={{ display: 'block', padding: 24 }}>
      <div style={{ fontSize: 34 }}>{t.icon}</div>
      <h2 className="h" style={{ fontSize: 24, fontWeight: 800, marginTop: 10 }}>{t.label}</h2>
      <p style={{ color: 'var(--mute)', marginTop: 6 }}>{t.sub}</p>
      <p style={{ marginTop: 14, fontWeight: 700 }}>{n ? `${n} ${t.label.toLowerCase()} →` : 'Үзэх →'}</p>
    </Link>; })}</div>
  </section>;
}
