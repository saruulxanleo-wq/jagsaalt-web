import { db, fail, json, authUser, getProfile, mail, ADMIN_EMAIL, decideLink, esc, btn, origin } from '@/lib/server';
import { KINDS, parseOwn, ownCode, getItem } from '@/lib/owners';
import { TYPES } from '@/lib/config';
// Фрилансер, хэрэгсэл, сургалт, коммюнити, инфлүэнсерийг эзэмших хүсэлт
export async function POST(req) {
  const d = db(); if (!d) return fail('Систем тохируулагдаж байна', 503);
  const u = await authUser(req, d); if (!u) return fail('Нэвтрээгүй байна', 401);
  const p = await getProfile(d, u);
  if (!p.phone_verified_at) return fail('Эхлээд утсаа баталгаажуул');
  const b = await req.json().catch(() => ({}));
  const t = parseOwn(b.own); if (!t) return fail('Буруу хүсэлт');
  const it = await getItem(d, t.kind, t.id); if (!it) return fail('Олдсонгүй', 404);
  if (it.owner_id === u.id) return fail('Энэ аль хэдийн чинийх');
  if (it.owner_id) return fail('Энэ өөр хүнд баталгаажсан байна. Алдаа гэж үзвэл бидэнтэй холбогд.');
  const note = String(b.note || '').trim().slice(0, 300); if (note.length < 3) return fail('Ямар холбоотой вэ гэдгээ бич');
  const proof = String(b.proof || '').trim().slice(0, 300);
  const { data: c, error } = await d.from('item_claims').insert({ kind: t.kind, item_id: t.id, user_id: u.id, phone: p.phone, note, proof }).select('id').single();
  if (error) return fail(error.code === '23505' ? 'Хүсэлт чинь аль хэдийн шалгагдаж байна' : 'Хадгалж чадсангүй', error.code === '23505' ? 400 : 500);
  const code = await ownCode(u.id, t.kind, t.id); const o = origin(req);
  const label = t.kind === 'influencer' ? 'Инфлүэнсер' : TYPES[it.type]?.label;
  const link = t.kind === 'influencer' ? (it.fb_url || (it.ig && 'https://www.instagram.com/' + it.ig) || '') : it.url;
  await mail(ADMIN_EMAIL(), `Эзэмших хүсэлт: ${it.name} (${label})`, `<p><b>${esc(p.full_name || '')}</b> (${esc(u.email)}, утас ${esc(p.phone)})<br>${esc(label)} «<b>${esc(it.name)}</b>»-ийг эзэмших хүсэлт илгээлээ.</p><p>Холбоо: ${esc(note)}<br>Нотолгоо: ${esc(proof || '—')}<br>Шалгах код: <b>${code}</b> — <a href="${esc(link)}">${esc(link)}</a> дээр энэ код харагдаж байгаа эсэхийг шалга.</p><p>${btn(await decideLink(o, 'own', c.id, 'approve'), 'Батлах', '#2FB344')}${btn(await decideLink(o, 'own', c.id, 'reject'), 'Татгалзах', '#E8452A')}</p>`);
  return json({ ok: true });
}
