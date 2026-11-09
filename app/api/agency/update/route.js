import { db, fail, json, authUser } from '@/lib/server';
import { CATS } from '@/lib/config';
export async function POST(req) {
  const d = db(); if (!d) return fail('Систем тохируулагдаж байна', 503);
  const u = await authUser(req, d); if (!u) return fail('Нэвтрээгүй байна', 401);
  const { data: m } = await d.from('agency_members').select('agency_id').eq('user_id', u.id).maybeSingle();
  if (!m) return fail('Чамд засах эрх алга', 403);
  const b = await req.json().catch(() => ({}));
  const up = { updated_at: new Date().toISOString() };
  if (typeof b.description === 'string') up.description = b.description.trim().slice(0, 400) || null;
  if (typeof b.website === 'string') { const w = b.website.trim(); up.website = !w ? null : /^https?:\/\//.test(w) ? w.slice(0, 200) : 'https://' + w.slice(0, 200); }
  if (typeof b.phone_public === 'string') up.phone_public = b.phone_public.replace(/[^\d+ ]/g, '').slice(0, 20) || null;
  if (Array.isArray(b.services)) up.services = b.services.map(s => String(s).trim().slice(0, 40)).filter(Boolean).slice(0, 12);
  if (b.category && CATS[b.category]) up.category = b.category;
  const { error } = await d.from('agencies').update(up).eq('id', m.agency_id);
  if (error) return fail('Хадгалж чадсангүй', 500);
  return json({ ok: true });
}
