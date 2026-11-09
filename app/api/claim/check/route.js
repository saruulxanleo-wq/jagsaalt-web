import { NextResponse } from 'next/server';
import { admin } from '@/lib/db';
import { checkCode } from '@/lib/wesend';
export async function POST(req) {
  const { claim_id, code } = await req.json().catch(() => ({}));
  if (!claim_id || !/^\d{4,8}$/.test(code || '')) return NextResponse.json({ error: 'Кодоо оруул' }, { status: 400 });
  let db; try { db = admin(); } catch { return NextResponse.json({ error: "Систем тохируулагдаж байна, түр хүлээгээрэй" }, { status: 503 }); }
  const { data: c } = await db.from('claims').select('id,wesend_id,status').eq('id', claim_id).maybeSingle();
  if (!c) return NextResponse.json({ error: 'Хүсэлт олдсонгүй' }, { status: 404 });
  const r = await checkCode(c.wesend_id, code);
  if (!r.ok) {
    const e = r.data?.error?.code || r.data?.error;
    const m = { invalid_code: 'Код буруу байна', max_attempts_reached: 'Хэт олон удаа буруу оруулсан. Шинэ код ав.', verification_expired: 'Кодын хугацаа дууссан. Шинэ код ав.' }[e] || 'Шалгаж чадсангүй';
    return NextResponse.json({ error: m }, { status: 400 });
  }
  // SMS баталгаажсан. Админ дугаарыг FB хуудастай тулгаад agencies.verified-г асаана.
  await db.from('claims').update({ status: 'phone_verified' }).eq('id', c.id);
  return NextResponse.json({ ok: true });
}
