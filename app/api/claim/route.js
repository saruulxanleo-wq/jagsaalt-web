import { db, fail, json, authUser, getProfile, mail, ADMIN_EMAIL, decideLink, esc, btn, origin, pickCats } from '@/lib/server';
import { imgToken } from '@/lib/imgtoken';
import { fbLinkError, normFb, slugify } from '@/lib/fb';
import { CATS, SUPABASE_URL } from '@/lib/config';
import { enrichAgency } from '@/lib/fbpage';
export async function POST(req) {
  const d = db(); if (!d) return fail('Систем тохируулагдаж байна', 503);
  const u = await authUser(req, d); if (!u) return fail('Нэвтрээгүй байна', 401);
  const p = await getProfile(d, u);
  if (!p.phone_verified_at) return fail('Эхлээд утсаа баталгаажуул');
  const { data: mem } = await d.from('agency_members').select('agency_id').eq('user_id', u.id).maybeSingle();
  if (mem) return fail('Чи аль хэдийн нэг агентлаг удирдаж байна');
  const { data: pend } = await d.from('claims').select('id').eq('user_id', u.id).eq('status', 'pending').maybeSingle();
  if (pend) return fail('Чиний өмнөх хүсэлт шалгагдаж байна');
  const b = await req.json().catch(() => ({}));
  const note = String(b.note || '').trim().slice(0, 300);
  if (note.length < 3) return fail('Агентлагт ямар албан тушаалтай вэ гэдгээ бич');
  let ag;
  if (b.slug) {
    ({ data: ag } = await d.from('agencies').select('id,name,slug,fb_url,verified').eq('slug', b.slug).maybeSingle());
    if (!ag) return fail('Агентлаг олдсонгүй', 404);
  } else {
    { const e = fbLinkError(b.fb_url || ''); if (e) return fail(e); }
    const fb = normFb(b.fb_url || ''); if (!fb) return fail('Facebook хуудасны зөв линк оруул');
    ({ data: ag } = await d.from('agencies').select('id,name,slug,fb_url,verified').eq('fb_url', fb).maybeSingle());
    if (!ag) {
      const name = (b.name || '').trim().slice(0, 80); if (name.length < 2) return fail('Агентлагийн нэрээ оруул');
      const cats = pickCats(b.categories); if (!cats) return fail('1-3 ангилал сонго');
      let slug = slugify(fb.split('/').pop().replace('profile.php?id=', ''));
      const { data: dup } = await d.from('agencies').select('id').eq('slug', slug).maybeSingle(); if (dup) slug += '-' + Date.now().toString(36).slice(-4);
      ({ data: ag } = await d.from('agencies').insert({ slug, name, category: cats[0], categories: cats, fb_url: fb, status: 'pending', added_by: 'owner' }).select('id,name,slug,fb_url,verified,logo_url,phone_public').single());
      await enrichAgency(d, ag, SUPABASE_URL).catch(() => null);
    }
  }
  const { data: owners } = await d.from('agency_members').select('user_id').eq('agency_id', ag.id);
  if (owners?.length) return fail('Энэ агентлагийг өөр хүн удирдаж байна. Тэднээс урилга ав эсвэл бидэнтэй холбогд.');
  const { data: c, error } = await d.from('claims').insert({ agency_id: ag.id, user_id: u.id, phone: p.phone, note, status: 'pending' }).select('id').single();
  if (error) return fail('Хадгалж чадсангүй', 500);
  await mail(ADMIN_EMAIL(), `Эзэмших хүсэлт: ${ag.name}`, `<p><b>${esc(p.full_name || '')}</b> (${esc(u.email)}, утас ${esc(p.phone)})<br>«<b>${esc(ag.name)}</b>» агентлагийг эзэмших хүсэлт илгээлээ.</p><p>Албан тушаал / тайлбар: ${esc(note)}</p><p><a href="${ag.fb_url || ''}">${esc(ag.fb_url || '')}</a></p><p>${btn(await decideLink(origin(req), 'claim', c.id, 'approve'), 'Батлах', '#2FB344')}${btn(await decideLink(origin(req), 'claim', c.id, 'reject'), 'Татгалзах', '#E8452A')}</p>`);
  return json({ ok: true, img: ag.logo_url ? null : await imgToken('agency', ag.id) });
}
