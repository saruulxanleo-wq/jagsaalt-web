import { NextResponse } from 'next/server';
import { admin } from '@/lib/db';
import { sendCode } from '@/lib/wesend';
import { CATS } from '@/lib/config';
const bad = (error, s = 400) => NextResponse.json({ error }, { status: s });
function normFb(u) {
  try { const x = new URL(u.startsWith('http') ? u : 'https://' + u); if (!/facebook\.com$/.test(x.hostname.replace('www.', '').replace('m.', ''))) return null;
    const id = x.searchParams.get('id'); return id ? `https://www.facebook.com/profile.php?id=${id}` : `https://www.facebook.com/${x.pathname.split('/').filter(Boolean)[0]}`; } catch { return null; }
}
const slugify = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'a-' + Date.now().toString(36);
export async function POST(req) {
  const b = await req.json().catch(() => ({}));
  let db; try { db = admin(); } catch { return NextResponse.json({ error: "Систем тохируулагдаж байна, түр хүлээгээрэй" }, { status: 503 }); }
  let agency;
  if (b.claim) {
    const { data } = await db.from('agencies').select('id,name,verified').eq('slug', b.claim).maybeSingle();
    if (!data) return bad('Агентлаг олдсонгүй', 404);
    if (data.verified) return bad('Энэ агентлаг аль хэдийн баталгаажсан байна');
    agency = data;
  } else {
    const fb = normFb(b.fb_url || ''); if (!fb) return bad('Facebook хуудасны зөв линк оруул');
    const name = (b.name || '').trim().slice(0, 80); if (name.length < 2) return bad('Нэрээ оруул');
    if (!CATS[b.category]) return bad('Ангилал сонго');
    const { data: ex } = await db.from('agencies').select('id,name,slug,verified').eq('fb_url', fb).maybeSingle();
    if (ex && b.mode !== 'owner') return bad(`"${ex.name}" жагсаалтад аль хэдийн байна`);
    if (ex) agency = ex;
    else {
      let slug = slugify(fb.split('/').pop().replace('profile.php?id=', ''));
      const { data, error } = await db.from('agencies').insert({ slug, name, category: b.category, fb_url: fb, status: 'pending', added_by: b.mode === 'owner' ? 'owner' : 'user' }).select('id,name').single();
      if (error) return bad('Хадгалж чадсангүй: ' + error.message, 500);
      agency = data;
    }
  }
  if (b.mode !== 'owner') return NextResponse.json({ ok: true });
  const phone = String(b.phone || '').replace(/\D/g, '').slice(-8);
  if (!/^[5-9]\d{7}$/.test(phone)) return bad('8 оронтой утасны дугаар оруул');
  const s = await sendCode(phone, 'jagsaalt');
  if (!s.ok) return bad(s.data?.error?.message || s.data?.error || 'SMS явуулж чадсангүй', 502);
  const { data: c } = await db.from('claims').insert({ agency_id: agency.id, phone, wesend_id: s.data.id }).select('id').single();
  return NextResponse.json({ ok: true, claim_id: c.id });
}
