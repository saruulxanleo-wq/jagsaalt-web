import { db, fail, json, authUser } from '@/lib/server';
import { checkCode } from '@/lib/wesend';
const MSG = { invalid_code: 'Код буруу байна', max_attempts_reached: 'Хэт олон удаа буруу оруулсан. Шинэ код ав.', verification_expired: 'Кодын хугацаа дууссан. Шинэ код ав.' };
export async function POST(req) {
  const d = db(); if (!d) return fail('Систем тохируулагдаж байна', 503);
  const u = await authUser(req, d); if (!u) return fail('Нэвтрээгүй байна', 401);
  const { code } = await req.json().catch(() => ({}));
  if (!/^\d{4,8}$/.test(code || '')) return fail('Кодоо оруул');
  const { data: p } = await d.from('profiles').select('pending_phone,pending_verify_id').eq('id', u.id).single();
  if (!p?.pending_verify_id) return fail('Эхлээд код ав');
  const r = await checkCode(p.pending_verify_id, code);
  if (!r.ok) return fail(MSG[r.data?.error?.code || r.data?.error] || 'Шалгаж чадсангүй');
  const { error } = await d.from('profiles').update({ phone: p.pending_phone, phone_verified_at: new Date().toISOString(), pending_phone: null, pending_verify_id: null }).eq('id', u.id);
  if (error) return fail('Энэ дугаар өөр бүртгэлд холбогдсон байна');
  return json({ ok: true });
}
