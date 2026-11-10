import { db, fail, json, authUser, isAdmin } from '@/lib/server';
import { KINDS, parseOwn, getItem, cleanPatch } from '@/lib/owners';
// Эзэмшигч (эсвэл админ) өөрийн зүйлийн мэдээллийг засна
export async function POST(req) {
  const d = db(); if (!d) return fail('Систем тохируулагдаж байна', 503);
  const u = await authUser(req, d); if (!u) return fail('Нэвтрээгүй байна', 401);
  const b = await req.json().catch(() => ({}));
  const t = parseOwn(b.own); if (!t) return fail('Буруу хүсэлт');
  const it = await getItem(d, t.kind, t.id); if (!it) return fail('Олдсонгүй', 404);
  if (it.owner_id !== u.id && !isAdmin(u)) return fail('Энэ чинийх биш', 403);
  const r = cleanPatch(t.kind, b.data || {}); if (r.error) return fail(r.error);
  if (t.kind === 'listing' && r.patch.url !== it.url) {
    const { data: dup } = await d.from('listings').select('id').eq('url', r.patch.url).neq('id', t.id).maybeSingle();
    if (dup) return fail('Энэ линк өөр карт дээр бүртгэлтэй байна');
  }
  const { error } = await d.from(KINDS[t.kind].table).update({ ...r.patch, updated_at: new Date().toISOString() }).eq('id', t.id);
  if (error) return fail('Хадгалж чадсангүй', 500);
  return json({ ok: true });
}
