import { db, fail, json, authUser, isAdmin } from '@/lib/server';
import { SUPABASE_URL } from '@/lib/config';
import { KINDS, parseOwn, getItem } from '@/lib/owners';
// Эзэмшигч (эсвэл админ) жагсаалт / инфлүэнсерийн зургийг файлаар оруулна — шууд хадгална
export async function POST(req) {
  const d = db(); if (!d) return fail('Систем тохируулагдаж байна', 503);
  const u = await authUser(req, d); if (!u) return fail('Нэвтрээгүй байна', 401);
  const fd = await req.formData().catch(() => null); if (!fd) return fail('Файл алга');
  const t = parseOwn(fd.get('own')); if (!t) return fail('Буруу хүсэлт');
  const it = await getItem(d, t.kind, t.id); if (!it) return fail('Олдсонгүй', 404);
  if (it.owner_id !== u.id && !isAdmin(u)) return fail('Энэ чинийх биш', 403);
  const f = fd.get('file');
  if (!f || typeof f === 'string' || !/^image\/(webp|jpeg|png)$/.test(f.type) || f.size > 1_500_000) return fail('Зураг 1.5MB-аас бага webp/jpg/png байх ёстой');
  const path = `items/${t.kind}-${t.id}-${Date.now().toString(36)}.${f.type.split('/')[1]}`;
  const { error } = await d.storage.from('logos').upload(path, await f.arrayBuffer(), { contentType: f.type, upsert: true });
  if (error) return fail('Хадгалж чадсангүй: ' + error.message, 500);
  const url = `${SUPABASE_URL}/storage/v1/object/public/logos/${path}`;
  const col = t.kind === 'listing' ? 'logo_url' : 'photo_url';
  await d.from(KINDS[t.kind].table).update({ [col]: url, updated_at: new Date().toISOString() }).eq('id', t.id);
  return json({ ok: true, url });
}
