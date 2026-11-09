import { listAgencies, listListings } from '@/lib/db';
import Directory from './Directory';
export const dynamic = "force-dynamic";
export default async function Home() {
  const [list, hub] = await Promise.all([listAgencies(), listListings()]);
  return <Directory list={list} tools={hub.filter(l => l.type !== 'community')} />;
}
