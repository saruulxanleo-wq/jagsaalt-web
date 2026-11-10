import { json } from '@/lib/server';
import { pub } from '@/lib/db';
import { score } from '@/lib/match';
export async function POST(req) {
  const q = await req.json().catch(() => ({}));
  let list;
  if (process.env.MOCK) list = (await import('@/lib/mock.json')).default;
  else ({ data: list } = await pub().from('agencies').select('slug,name,category,categories,logo_url,followers,last_post_at,verified,description,services,packages,team_size,clients,cases,featured_until').eq('status', 'approved'));
  const ranked = (list || []).map(a => ({ a, r: score(a, q) })).filter(x => x.r).sort((x, y) => y.r.s - x.r.s).slice(0, 5)
    .map(({ a, r }) => ({ slug: a.slug, name: a.name, logo_url: a.logo_url, categories: a.categories?.length ? a.categories : [a.category], followers: a.followers, verified: a.verified, why: r.why.length ? r.why : ['Таны хэрэгцээтэй чиглэлээр ажилладаг'] }));
  return json({ results: ranked });
}
