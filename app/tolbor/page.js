import { listListings } from '@/lib/db';
import Pay from './Pay';
export const dynamic = 'force-dynamic';
export const metadata = { title: 'Төлбөр' };
export default async function Page({ searchParams }) {
  const sp = await searchParams; const listings = sp.product === 'listing_sponsor' ? await listListings() : [];
  return <Pay product={sp.product} target={sp.target || ''} slug={sp.slug || ''} listings={listings.map(l => ({ id: l.id, name: l.name, type: l.type }))} />;
}
