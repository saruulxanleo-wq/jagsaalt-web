import { db, fail, json, mail, ADMIN_EMAIL, decideLink, esc, btn } from '@/lib/server';
import { normFb, slugify } from '@/lib/fb';
import { CATS } from '@/lib/config';
// Хэрэглэгч (нэвтрээгүй ч болно) агентлаг санал болгоно → pending, админд и-мэйл.
export async function POST(req) {
  const d = db(); if (!d) return fail('Систем тохируулагдаж байна, түр хүлээгээрэй', 503);
  const b = await req.json().catch(() => ({}));
  const fb = normFb(b.fb_url || ''); if (!fb) return fail('Facebook хуудасны зөв линк оруул');
  const name = (b.name || '').trim().slice(0, 80); if (name.length < 2) return fail('Нэрээ оруул');
  if (!CATS[b.category]) return fail('Ангилал сонго');
  const { data: ex } = await d.from('agencies').select('name').eq('fb_url', fb).maybeSingle();
  if (ex) return fail(`"${ex.name}" жагсаалтад аль хэдийн байна`);
  let slug = slugify(fb.split('/').pop().replace('profile.php?id=', ''));
  const { data: dup } = await d.from('agencies').select('id').eq('slug', slug).maybeSingle();
  if (dup) slug += '-' + Date.now().toString(36).slice(-4);
  const { data, error } = await d.from('agencies').insert({ slug, name, category: b.category, fb_url: fb, status: 'pending', added_by: 'user' }).select('id').single();
  if (error) return fail('Хадгалж чадсангүй', 500);
  await mail(ADMIN_EMAIL(), `Шинэ агентлаг санал: ${name}`, `<p><b>${esc(name)}</b> (${esc(CATS[b.category].label)})<br><a href="${fb}">${fb}</a></p><p>${btn(await decideLink('agency', data.id, 'approve'), 'Жагсаалтад нэмэх', '#2FB344')}${btn(await decideLink('agency', data.id, 'reject'), 'Татгалзах', '#E8452A')}</p>`);
  return json({ ok: true });
}
