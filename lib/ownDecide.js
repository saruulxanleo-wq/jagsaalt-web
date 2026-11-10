import { mail, esc } from './server';
import { getItem } from './owners';
// Эзэмших хүсэлтийг батлах/татгалзах — decide линк болон админ самбар хоёул ашиглана
export async function decideOwn(d, id, approve, base) {
  const { data: c } = await d.from('item_claims').select('*').eq('id', id).maybeSingle();
  if (!c) return { error: 'Хүсэлт олдсонгүй' };
  if (c.status !== 'pending') return { error: `Энэ хүсэлтийг өмнө нь шийдсэн (${c.status})` };
  const it = await getItem(d, c.kind, c.item_id); if (!it) return { error: 'Зүйл нь устсан байна' };
  const now = new Date().toISOString();
  if (approve) {
    if (it.owner_id && it.owner_id !== c.user_id) return { error: 'Өөр хүнд аль хэдийн баталгаажсан' };
    await d.from(c.kind === 'listing' ? 'listings' : 'influencers').update({ owner_id: c.user_id, updated_at: now }).eq('id', c.item_id);
    // Ижил зүйлийн бусад хүлээгдэж буй хүсэлтийг хаана
    await d.from('item_claims').update({ status: 'rejected', decided_at: now }).eq('kind', c.kind).eq('item_id', c.item_id).eq('status', 'pending').neq('id', id);
  }
  await d.from('item_claims').update({ status: approve ? 'approved' : 'rejected', decided_at: now }).eq('id', id);
  const { data: { user } } = await d.auth.admin.getUserById(c.user_id);
  if (user?.email) await mail(user.email, approve ? `«${it.name}» баталгаажлаа` : `«${it.name}» хүсэлтийн хариу`,
    approve ? `<p>Сайн уу! «<b>${esc(it.name)}</b>» одоо чинийх боллоо — «Баталгаажсан» тэмдэгтэй харагдана. Мэдээллээ өөрөө засаж, хүсвэл «Ивээн тэтгэсэн» байршил авч болно. Баталгаажуулах кодыг одоо устгаж болно.</p><p><a href="${base}/minii">Миний самбар →</a></p>`
      : `<p>Сайн уу! «${esc(it.name)}»-ийг эзэмших хүсэлтийг баталгаажуулж чадсангүй — код харагдаагүй эсвэл нотолгоо хангалтгүй байсан байж магадгүй. Дахин илгээж эсвэл энэ и-мэйлд хариу бичээрэй.</p>`);
  return { ok: true, name: it.name };
}
