import { listAgencies, listListings } from '@/lib/db';
import { SELF_SERVE } from '@/lib/config';
import Directory from './Directory';
export const dynamic = "force-dynamic";
export default async function Home() {
  const [list, hub] = await Promise.all([listAgencies(), listListings()]);
  return <Directory list={list} tools={hub.filter(l => SELF_SERVE.includes(l.type))} />;
}
