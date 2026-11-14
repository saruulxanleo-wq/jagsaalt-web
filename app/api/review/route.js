import { db, fail, json, mail, ADMIN_EMAIL, esc, btn, origin, decideLink } from '@/lib/server';
import { surveyToken } from '@/lib/survey';
import { CONTACT, HIRED } from '@/lib/reviews';
// Асуулгын хариу → reviews. Сэтгэгдэлгүй бол шууд тооцогдоно, сэтгэгдэлтэйг админ баталсны дараа нийтэлнэ.
export async function POST(req) {
  const d = db(); if (!d) return fail('Систем тохируулагдаж байна', 503);
  const b = await req.json().catch(() => ({}));
  if (!/^[0-9a-f-]{36}$/.test(b.id || '') || b.t !== await surveyToken(b.id)) return fail('Линк хүчингүй байна', 403);
  const { data: l } = await d.from('leads').select('id,name,company,agencies').eq('id', b.id).maybeSingle(); if (!l) return fail('Хүсэлт олдсонгүй', 404);
  const { data: ags } = await d.from('agencies').select('id,slug,name').in('slug', l.agencies || []);
  const author = (l.company || '').trim().slice(0, 60) || 'Баталгаат харилцагч';
  const o = origin(req), rows = [];
  for (const it of (Array.isArray(b.items) ? b.items : []).slice(0, 5)) {
    const a = (ags || []).find(x => x.slug === it.slug); if (!a || !CONTACT[it.contacted]) continue;
    const met = it.contacted !== 'no';
    const draft = met ? String(it.comment || '').trim().slice(0, 400) : '';
    const row = { lead_id: l.id, agency_id: a.id, contacted: it.contacted, hired: met && HIRED[it.hired] ? it.hired : null,
      rating: met && +it.rating >= 1 && +it.rating <= 5 ? Math.round(+it.rating) : null, draft: draft || null, author, status: draft ? 'pending' : 'approved' };
    const { data, error } = await d.from('reviews').insert(row).select('id').single();
    if (!error) rows.push({ ...row, id: data.id, name: a.name, slug: a.slug });
  }
  if (!rows.length) return fail('Хадгалах хариулт алга');
  const parts = await Promise.all(rows.map(async r => `<p><b><a href="${o}/a/${r.slug}">${esc(r.name)}</a></b>: ${esc(CONTACT[r.contacted])}${r.hired ? ' · ' + esc(HIRED[r.hired]) : ''}${r.rating ? ' · ' + '★'.repeat(r.rating) : ''}${r.draft ? `<br>«${esc(r.draft)}»<br>${btn(await decideLink(o, 'review', r.id, 'approve'), 'Сэтгэгдлийг нийтлэх', '#2FB344')}${btn(await decideLink(o, 'review', r.id, 'reject'), 'Нуух', '#E8452A')}` : ''}</p>`));
  await mail(ADMIN_EMAIL(), `Харилцагчийн үнэлгээ: ${rows.map(r => r.name).join(', ')}`, `<p>${esc(l.name)}${l.company ? ' · ' + esc(l.company) : ''} асуулгад хариуллаа.</p>${parts.join('')}`);
  return json({ ok: true });
}
