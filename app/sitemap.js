import { listAgencies, listListings } from '@/lib/db';
import { siteUrl } from '@/lib/config';
export const dynamic = 'force-dynamic';
export default async function sitemap() {
  const base = siteUrl(); const list = await listAgencies().catch(() => []); const ls = await listListings().catch(() => []);
  return [{ url: base + '/', changeFrequency: 'daily', priority: 1 }, { url: base + '/nemeh', priority: 0.5 }, ...['/freelancer', '/media', '/studi', '/produkshn', '/influencer', '/hereglsel', '/surgalt', '/kommyuniti', '/ooroo-hiih', '/ajil', '/songoh'].map(u => ({ url: base + u, changeFrequency: 'weekly', priority: 0.8 })),
    ...list.map(a => ({ url: `${base}/a/${a.slug}`, changeFrequency: 'weekly', priority: a.verified ? 0.9 : 0.7 })),
    ...ls.map(l => ({ url: `${base}/l/${l.id}`, changeFrequency: 'weekly', priority: 0.6 }))];
}
