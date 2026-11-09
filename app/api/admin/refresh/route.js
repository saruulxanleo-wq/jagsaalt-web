import { db, fail, json, authUser, isAdmin } from '@/lib/server';
import { enrichAgency } from '@/lib/fbpage';
import { SUPABASE_URL } from '@/lib/config';
// Админ: FB-ээс дагагч, сүүлийн пост, (хоосон бол) лого, утсыг шинэчилнэ. Нэг дуудалтад 6 агентлаг.
export async function POST(req) {
  const d = db(); if (!d) return fail('Систем тохируулагдаж байна', 503);
  const u = await authUser(req, d); if (!isAdmin(u)) return fail('Зөвхөн админ', 403);
  const { offset = 0 } = await req.json().catch(() => ({}));
  const { data: list, count } = await d.from('agencies').select('id,slug,fb_url,logo_url,phone_public', { count: 'exact' }).eq('status', 'approved').not('fb_url', 'is', null).order('slug').range(offset, offset + 5);
  const res = [];
  for (const ag of list || []) { const r = await enrichAgency(d, ag, SUPABASE_URL).catch(() => null); res.push({ slug: ag.slug, ok: !!r, followers: r?.followers ?? null, last: r?.last_post_at ?? null }); }
  return json({ ok: true, total: count, next: offset + (list?.length || 0), done: offset + (list?.length || 0) >= count, res });
}
