import { listAgencies, listListings } from '@/lib/db';
import { SELF_SERVE } from '@/lib/config';
import Directory from '../Directory';
export const dynamic = 'force-dynamic';
export const metadata = { title: 'Дизайн, контентын студиуд', description: 'Монголын дизайн, брэндингийн студиуд — лого, брэнд айдентити, график дизайн. Ангиллаар шүүж, идэвхтэйг нь сонго.', alternates: { canonical: '/studi' } };
export default async function Page() {
  const [list, hub] = await Promise.all([listAgencies(), listListings()]);
  return <Directory list={list} tools={hub.filter(l => SELF_SERVE.includes(l.type))} initialCat="design" title={<>Дизайн, контентын студиуд <span style={{ color: 'var(--v)' }}>нэг дор</span></>} />;
}
