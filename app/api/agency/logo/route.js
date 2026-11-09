import { db, fail, json, authUser, editableAgency } from '@/lib/server';
import { SUPABASE_URL } from '@/lib/config';
// kind: logo (агентлагийн лого — шууд хадгална) | case | team (URL буцаана, профайлыг "Хадгалах"-аар хадгална)
export async function POST(req) {
  const d = db(); if (!d) return fail('Систем тохируулагдаж байна', 503);
  const u = await authUser(req, d); if (!u) return fail('Нэвтрээгүй байна', 401);
  const fd = await req.formData().catch(() => null); if (!fd) return fail('Файл алга');
  const ag = await editableAgency(d, u, fd.get('slug') || null); if (!ag) return fail('Чамд засах эрх алга', 403);
  const kind = ['case', 'team'].includes(fd.get('kind')) ? fd.get('kind') : 'logo';
  const f = fd.get('file');
  if (!f || typeof f === 'string' || !/^image\/(webp|jpeg|png)$/.test(f.type) || f.size > 1_500_000) return fail('Зураг 1.5MB-аас бага webp/jpg/png байх ёстой');
  const path = `${kind === 'logo' ? '' : kind + '/'}${ag.id}-${Date.now().toString(36)}.${f.type.split('/')[1]}`;
  const { error } = await d.storage.from('logos').upload(path, await f.arrayBuffer(), { contentType: f.type, upsert: true });
  if (error) return fail('Хадгалж чадсангүй: ' + error.message, 500);
  const url = `${SUPABASE_URL}/storage/v1/object/public/logos/${path}`;
  if (kind === 'logo') await d.from('agencies').update({ logo_url: url, updated_at: new Date().toISOString() }).eq('id', ag.id);
  return json({ ok: true, logo_url: url, url });
}
