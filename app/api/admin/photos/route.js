import { db, fail, json, authUser, isAdmin } from '@/lib/server';
import { SUPABASE_URL } from '@/lib/config';
import { findPhoto, storeImage } from '@/lib/avatar';
// Админ: зураггүй инфлүэнсер (photo_url) / мэргэжилтний (logo_url) зургийг нийтэд ил профайлаас татна. Нэг дуудалтад 5.
// skip = энэ удаад олдоогүй тул алгассан мөрийн тоо (амжилттай нь жагсаалтаас гарна).
export async function POST(req) {
  const d = db(); if (!d) return fail('Систем тохируулагдаж байна', 503);
  const u = await authUser(req, d); if (!isAdmin(u)) return fail('Зөвхөн админ', 403);
  const b = await req.json().catch(() => ({}));
  const { kind = 'inf', skip = 0 } = b;
  const inf = kind === 'inf';
  // list: зураггүй үлдсэн мөрүүд (хөтчөөс зураг олоход)
  if (b.list) {
    const [a, l] = await Promise.all([
      d.from('influencers').select('id,fb_url,ig,tiktok,youtube').eq('status', 'approved').or('photo_url.is.null,photo_url.eq.'),
      d.from('listings').select('id,url').eq('type', 'freelancer').eq('status', 'approved').or('logo_url.is.null,logo_url.eq.')]);
    return json({ ok: true, inf: a.data || [], fl: l.data || [] });
  }
  // set: [{kind, id, pic}] — хөтчөөс олсон нийтэд ил зургийн линкийг хадгална
  if (Array.isArray(b.set)) {
    const out = [];
    for (const x of b.set.slice(0, 8)) {
      if (!/^[0-9a-f-]{36}$/.test(x.id || '') || !/^https:\/\//.test(x.pic || '')) { out.push({ id: x.id, ok: false }); continue; }
      const fi = x.kind === 'inf';
      const url = await storeImage(d, (fi ? 'inf-' : 'fl-') + x.id, x.pic, SUPABASE_URL).catch(() => null);
      if (url) await d.from(fi ? 'influencers' : 'listings').update({ [fi ? 'photo_url' : 'logo_url']: url, updated_at: new Date().toISOString() }).eq('id', x.id).or(fi ? 'photo_url.is.null,photo_url.eq.' : 'logo_url.is.null,logo_url.eq.');
      out.push({ id: x.id, ok: !!url });
    }
    return json({ ok: true, res: out });
  }
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
