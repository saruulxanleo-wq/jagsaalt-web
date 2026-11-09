import { db, fail, json, authUser, isAdmin, mail, esc, origin } from '@/lib/server';
export async function POST(req) {
  const d = db(); if (!d) return fail('Систем тохируулагдаж байна', 503);
  const u = await authUser(req, d); if (!isAdmin(u)) return fail('Зөвхөн админ', 403);
  const { kind, id, action } = await req.json().catch(() => ({}));
  const now = new Date().toISOString();
  if (kind === 'agency') {
    if (action === 'approve') await d.from('agencies').update({ status: 'approved', updated_at: now }).eq('id', id);
    else if (action === 'reject' || action === 'hide') await d.from('agencies').update({ status: 'rejected', updated_at: now }).eq('id', id);
    else if (action === 'delete') await d.from('agencies').delete().eq('id', id);
    else return fail('Буруу үйлдэл');
  } else if (kind === 'report') {
    await d.from('reports').update({ resolved: true }).eq('id', id);
  } else if (kind === 'claim') {
    const { data: c } = await d.from('claims').select('id,status,user_id,agency_id,agencies(name)').eq('id', id).single();
    if (!c || c.status !== 'pending') return fail('Хүсэлт олдсонгүй эсвэл шийдэгдсэн');
    if (action === 'approve') {
      const { error } = await d.from('agency_members').insert({ agency_id: c.agency_id, user_id: c.user_id, role: 'owner' });
      if (error) return fail('Хэрэглэгч өөр агентлагтай эсвэл агентлаг өөр эзэнтэй');
      await d.from('agencies').update({ verified: true, verified_at: now, status: 'approved', updated_at: now }).eq('id', c.agency_id);
    }
    await d.from('claims').update({ status: action === 'approve' ? 'approved' : 'rejected', decided_at: now }).eq('id', id);
    const { data: { user } } = await d.auth.admin.getUserById(c.user_id);
    if (user?.email) await mail(user.email, `«${c.agencies.name}» ${action === 'approve' ? 'баталгаажлаа' : 'хүсэлтийн хариу'}`,
      action === 'approve' ? `<p>«<b>${esc(c.agencies.name)}</b>»-ийг удирдах эрх чинь баталгаажлаа.</p><p><a href="${origin(req)}/minii">Миний агентлаг →</a></p>` : `<p>«${esc(c.agencies.name)}»-ийг эзэмших хүсэлтийг баталгаажуулж чадсангүй. Асуух зүйл байвал энэ и-мэйлд хариу бичээрэй.</p>`);
  } else return fail('Буруу төрөл');
  return json({ ok: true });
}
