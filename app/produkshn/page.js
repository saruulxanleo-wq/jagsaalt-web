import { listAgencies, listListings } from '@/lib/db';
import { SELF_SERVE } from '@/lib/config';
import Directory from '../Directory';
export const dynamic = 'force-dynamic';
export const metadata = { title: 'Фото, видео продакшн', description: 'Монголын контент, фото, видео продакшнууд — сурталчилгааны видео, зураг авалт, reels. Ангиллаар шүүж, идэвхтэйг нь сонго.', alternates: { canonical: '/produkshn' } };
export default async function Page() {
  const [list, hub] = await Promise.all([listAgencies(), listListings()]);
  return <Directory list={list} tools={hub.filter(l => SELF_SERVE.includes(l.type))} initialCat="content" title={<>Фото, видео продакшн <span style={{ color: 'var(--v)' }}>нэг дор</span></>} />;
}
