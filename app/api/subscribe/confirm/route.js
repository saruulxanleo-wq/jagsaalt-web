import { db, sign } from '@/lib/server';
import { subPage } from '@/lib/subpage';
export async function GET(req) {
  const q = new URL(req.url).searchParams; const email = (q.get('e') || '').toLowerCase();
  if (q.get('t') !== await sign('sub:' + email)) return subPage('Линк буруу байна', 'Дахин бүртгүүлээд үзээрэй.', false);
  const d = db(); if (!d) return subPage('Түр алдаа', 'Хэсэг хугацааны дараа дахин оролдоорой.', false);
  await d.from('subscribers').update({ status: 'active', confirmed_at: new Date().toISOString() }).eq('email', email);
  return subPage('Баталгаажлаа', 'Маркетингийн сар бүрийн тойм таны и-мэйлд ирнэ. Хэзээ ч нэг товчоор цуцалж болно.');
}
