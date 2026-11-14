import { db, fail, json } from '@/lib/server';
import { SUPABASE_URL } from '@/lib/config';
import { checkImgToken } from '@/lib/imgtoken';
// Маягтаар дөнгөж үүссэн бүртгэлд зураг/лого хавсаргана (submit-ээс ирсэн түр эрхээр).
const T = { listing: ['listings', 'logo_url'], influencer: ['influencers', 'photo_url'], agency: ['agencies', 'logo_url'] };
export async function POST(req) {
  const d = db(); if (!d) return fail('Систем тохируулагдаж байна', 503);
  const fd = await req.formData().catch(() => null); if (!fd) return fail('Файл алга');
  const tok = { k: fd.get('k'), id: fd.get('id'), ts: fd.get('ts'), t: fd.get('t') };
  if (!T[tok.k] || !/^[0-9a-f-]{36}$/.test(tok.id || '') || !(await checkImgToken(tok))) return fail('Хугацаа дууссан. Зургаа «Миний самбар»-аас оруулна уу.', 403);
  const f = fd.get('file');
  if (!f || typeof f === 'string' || !/^image\/(webp|jpeg|png)$/.test(f.type) || f.size > 1_500_000) return fail('Зураг 1.5MB-аас бага webp/jpg/png байх ёстой');
  const [table, col] = T[tok.k];
  const { data: it } = await d.from(table).select(`id,${col}`).eq('id', tok.id).maybeSingle(); if (!it) return fail('Олдсонгүй', 404);
  if (tok.k === 'agency' && it[col]) return json({ ok: true, skipped: true }); // FB-ээс лого аль хэдийн ирсэн
  const path = `items/${tok.k}-${tok.id}-${Date.now().toString(36)}.${f.type.split('/')[1]}`;
  const { error } = await d.storage.from('logos').upload(path, await f.arrayBuffer(), { contentType: f.type, upsert: true });
  if (error) return fail('Хадгалж чадсангүй', 500);
  const url = `${SUPABASE_URL}/storage/v1/object/public/logos/${path}`;
  await d.from(table).update({ [col]: url }).eq('id', tok.id);
  return json({ ok: true, url });
}
