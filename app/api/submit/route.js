import { db, fail, json, mail, ADMIN_EMAIL, decideLink, esc, btn, origin, pickCats } from '@/lib/server';
import { imgToken } from '@/lib/imgtoken';
import { fbLinkError, normFb, slugify } from '@/lib/fb';
import { CATS, SUPABASE_URL } from '@/lib/config';
import { enrichAgency } from '@/lib/fbpage';
// Хэрэглэгч (нэвтрээгүй ч болно) агентлаг санал болгоно → pending, админд и-мэйл.
export async function POST(req) {
  const d = db(); if (!d) return fail('Систем тохируулагдаж байна, түр хүлээгээрэй', 503);
  const b = await req.json().catch(() => ({}));
  { const e = fbLinkError(b.fb_url || ''); if (e) return fail(e); }
  const fb = normFb(b.fb_url || ''); if (!fb) return fail('Facebook хуудасны зөв линк оруул');
  const name = (b.name || '').trim().slice(0, 80); if (name.length < 2) return fail('Нэрээ оруул');
  const cats = pickCats(b.categories); if (!cats) return fail('1-3 ангилал сонго');
  const { data: ex } = await d.from('agencies').select('name').eq('fb_url', fb).maybeSingle();
  if (ex) return fail(`"${ex.name}" жагсаалтад аль хэдийн байна`);
  let slug = slugify(fb.split('/').pop().replace('profile.php?id=', ''));
  const { data: dup } = await d.from('agencies').select('id').eq('slug', slug).maybeSingle();
  if (dup) slug += '-' + Date.now().toString(36).slice(-4);
  const { data, error } = await d.from('agencies').insert({ slug, name, category: cats[0], categories: cats, fb_url: fb, status: 'pending', added_by: 'user' }).select('id,fb_url,logo_url,phone_public').single();
  if (error) return fail('Хадгалж чадсангүй', 500);
  const en = await enrichAgency(d, data, SUPABASE_URL).catch(() => null);
  await mail(ADMIN_EMAIL(), `Шинэ агентлаг санал: ${name}`, `<p><b>${esc(name)}</b> (${esc(cats.map(k => CATS[k]?.label || k).join(', '))})<br><a href="${fb}">${fb}</a></p><p>${btn(await decideLink(origin(req), 'agency', data.id, 'approve'), 'Жагсаалтад нэмэх', '#2FB344')}${btn(await decideLink(origin(req), 'agency', data.id, 'reject'), 'Татгалзах', '#E8452A')}</p>`);
  return json({ ok: true, img: await imgToken('agency', data.id) });
}
