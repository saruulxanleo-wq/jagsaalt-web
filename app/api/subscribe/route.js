import { db, fail, json, mail, sign, origin, esc } from '@/lib/server';
import { SUB_ROLES } from '@/lib/config';
const page = (o, t) => `<p>Сайн байна уу!</p><p>${t}</p>`;
export async function POST(req) {
  const d = db(); if (!d) return fail('Систем тохируулагдаж байна', 503);
  const b = await req.json().catch(() => ({}));
  const email = String(b.email || '').trim().toLowerCase().slice(0, 120);
  if (!/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/.test(email)) return fail('И-мэйл хаягаа зөв бичнэ үү');
  const role = SUB_ROLES[b.role] ? b.role : null, source = String(b.source || '').slice(0, 40) || null;
  const { data: ex } = await d.from('subscribers').select('id,status').eq('email', email).maybeSingle();
  if (ex?.status === 'active') return json({ ok: true, already: true });
  if (ex) await d.from('subscribers').update({ role: role || undefined, status: 'pending' }).eq('id', ex.id);
  else { const { error } = await d.from('subscribers').insert({ email, role, source }); if (error) return fail('Хадгалж чадсангүй', 500); }
  const o = origin(req), t = await sign('sub:' + email);
  await mail(email, 'И-мэйлээ баталгаажуулна уу', page(o, `Маркетингийн сар бүрийн тоймд бүртгүүлсэнд баярлалаа. Доорх товчийг дарж баталгаажуулаарай:</p><p><a href="${o}/api/subscribe/confirm?e=${encodeURIComponent(email)}&t=${t}" style="display:inline-block;padding:12px 22px;border-radius:999px;background:#0B8A3E;color:#fff;text-decoration:none;font-weight:700">Баталгаажуулах</a></p><p style="color:#888;font-size:13px">Хэрэв та бүртгүүлээгүй бол энэ имэйлийг үл тоомсорлоорой.`));
  return json({ ok: true });
}
