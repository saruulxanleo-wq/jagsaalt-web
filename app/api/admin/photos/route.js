import { db, fail, json, authUser, isAdmin } from '@/lib/server';
import { SUPABASE_URL } from '@/lib/config';
import { findPhoto } from '@/lib/avatar';
// Админ: зураггүй инфлүэнсер (photo_url) / мэргэжилтний (logo_url) зургийг нийтэд ил профайлаас татна. Нэг дуудалтад 5.
// skip = энэ удаад олдоогүй тул алгассан мөрийн тоо (амжилттай нь жагсаалтаас гарна).
export async function POST(req) {
  const d = db(); if (!d) return fail('Систем тохируулагдаж байна', 503);
  const u = await authUser(req, d); if (!isAdmin(u)) return fail('Зөвхөн админ', 403);
  const { kind = 'inf', skip = 0 } = await req.json().catch(() => ({}));
  const inf = kind === 'inf';
  const col = inf ? 'photo_url' : 'logo_url';
  let q = inf ? d.from('influencers').select('id,slug,name,fb_url,ig,tiktok,youtube', { count: 'exact' }).eq('status', 'approved').or('photo_url.is.null,photo_url.eq.')
    : d.from('listings').select('id,name,url', { count: 'exact' }).eq('type', 'freelancer').eq('status', 'approved').or('logo_url.is.null,logo_url.eq.');
  const { data: list, count, error } = await q.order('id').range(skip, skip + 4);
  if (error) return fail(error.message, 500);
  const res = [];
  for (const r of list || []) {
    const f = await findPhoto(d, r, (inf ? 'inf-' : 'fl-') + r.id, SUPABASE_URL);
    if (f) await d.from(inf ? 'influencers' : 'listings').update({ [col]: f.url, updated_at: new Date().toISOString() }).eq('id', r.id);
    res.push({ name: r.name, ok: !!f, src: f?.src || null });
  }
  const failed = res.filter(x => !x.ok).length;
  return json({ ok: true, left: count, next: skip + failed, done: (list?.length || 0) < 5 && true, res });
}
