import { listAgencies } from '@/lib/db';
import { siteUrl } from '@/lib/config';
export const dynamic = 'force-dynamic';
export default async function sitemap() {
  const base = siteUrl(); const list = await listAgencies().catch(() => []);
  return [{ url: base + '/', changeFrequency: 'daily', priority: 1 }, { url: base + '/nemeh', priority: 0.5 },
    ...list.map(a => ({ url: `${base}/a/${a.slug}`, changeFrequency: 'weekly', priority: a.verified ? 0.9 : 0.7 }))];
}
