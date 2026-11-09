import { db, fail, json, authUser, getProfile } from '@/lib/server';
import { sendCode } from '@/lib/wesend';
export async function POST(req) {
  const d = db(); if (!d) return fail('Систем тохируулагдаж байна', 503);
  const u = await authUser(req, d); if (!u) return fail('Нэвтрээгүй байна', 401);
  const { phone: raw } = await req.json().catch(() => ({}));
  const phone = String(raw || '').replace(/\D/g, '').slice(-8);
  if (!/^[5-9]\d{7}$/.test(phone)) return fail('8 оронтой утасны дугаар оруул');
  const { data: taken } = await d.from('profiles').select('id').eq('phone', phone).neq('id', u.id).maybeSingle();
  if (taken) return fail('Энэ дугаар өөр бүртгэлд холбогдсон байна');
  const p = await getProfile(d, u);
  const today = new Date().toISOString().slice(0, 10);
  const cnt = p.sms_day === today ? (p.sms_count || 0) : 0;
  if (cnt >= 3) return fail('Өнөөдөр 3 удаа код авсан байна. Маргааш дахин оролдоорой.', 429);
  await d.from('profiles').update({ sms_day: today, sms_count: cnt + 1 }).eq('id', u.id);
  const s = await sendCode(phone, 'jagsaalt');
  if (!s.ok) return fail(s.data?.error?.message || 'SMS явуулж чадсангүй. Дахин оролдоно уу.', 502);
  await d.from('profiles').update({ pending_phone: phone, pending_verify_id: s.data.id }).eq('id', u.id);
  return json({ ok: true });
}
