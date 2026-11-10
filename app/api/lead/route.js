import { db, fail, json, mail, ADMIN_EMAIL, esc, origin } from '@/lib/server';
import { NEEDS, BUDGETS, SIZES, PRIORITIES, ADS, BRANDS } from '@/lib/match';
// Клиентийн "үнийн санал авах" хүсэлт
export async function POST(req) {
  const d = db(); if (!d) return fail('Систем тохируулагдаж байна', 503);
  const b = await req.json().catch(() => ({}));
  const name = String(b.name || '').trim().slice(0, 80), phone = String(b.phone || '').replace(/[^\d+ ]/g, '').slice(0, 20), email = String(b.email || '').trim().slice(0, 100);
  if (name.length < 2) return fail('Нэрээ бичнэ үү');
  if (!/\d{8}/.test(phone.replace(/\D/g, '')) && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return fail('Утас эсвэл и-мэйлээ бичнэ үү');
  const q = b.answers || {};
  const row = { name, phone: phone || null, email: email || null, company: String(b.company || '').trim().slice(0, 100) || null, note: String(b.note || '').trim().slice(0, 1000) || null,
    answers: q, agencies: (b.agencies || []).map(String).slice(0, 5), utm: b.utm && typeof b.utm === 'object' ? b.utm : {} };
  const { error } = await d.from('leads').insert(row);
  if (error) return fail('Хадгалж чадсангүй', 500);
  const o = origin(req);
  await mail(ADMIN_EMAIL(), `Шинэ клиент: ${name}${row.company ? ' · ' + row.company : ''}`, `<p><b>${esc(name)}</b>${row.company ? ' · ' + esc(row.company) : ''}<br>${esc(phone)} ${esc(email)}</p>
<p>Хэрэгцээ: ${esc((q.needs || []).map(k => NEEDS[k]?.label).filter(Boolean).join(', '))}<br>Төсөв: ${esc(BUDGETS[q.budget]?.[0] || '-')} / сар<br>Хэмжээ: ${esc(SIZES[q.size] || '-')}<br>Брэнд: ${esc(BRANDS[q.brands] || '-')}${q.source === 'profile' ? '<br>Эх сурвалж: агентлагийн профайл' : q.source === 'influencer' ? '<br><b>Инфлүэнсертэй хамтрах хүсэлт: ' + esc(q.influencer_name || q.influencer) + '</b>' : ''}<br>Чухалчлах: ${esc(PRIORITIES[q.priority] || '-')}${q.industry ? '<br>Салбар: ' + esc(q.industry) : ''}<br>Зар: ${esc(ADS[q.ads] || '-')}${q.fb ? '<br>FB: ' + esc(q.fb) : ''}</p>
${row.note ? `<p>Нэмэлт: ${esc(row.note)}</p>` : ''}<p>Сонгосон агентлагууд: ${row.agencies.map(s => `<a href="${o}/a/${s}">${esc(s)}</a>`).join(', ')}</p><p>UTM: ${esc(JSON.stringify(row.utm))}</p><p><a href="${o}/admin">Админ →</a></p>`);
  // Баталгаажсан инфлүэнсерт хамтрах саналыг шууд дамжуулна
  if (q.source === 'influencer' && q.influencer) {
    const { data: inf } = await d.from('influencers').select('name,owner_id').eq('slug', String(q.influencer)).maybeSingle();
    if (inf?.owner_id) { const { data: { user } } = await d.auth.admin.getUserById(inf.owner_id);
      if (user?.email) await mail(user.email, `Хамтран ажиллах санал: ${name}${row.company ? ' · ' + row.company : ''}`, `<p>Сайн уу! ${esc(o.replace(/^https?:\/\//, ''))}-ээр дамжуулан «${esc(inf.name)}» профайлд хамтран ажиллах санал ирлээ.</p><p><b>${esc(name)}</b>${row.company ? ' · ' + esc(row.company) : ''}<br>${esc(phone)} ${esc(email)}</p>${row.note ? `<p>«${esc(row.note)}»</p>` : ''}`); }
  }
  return json({ ok: true });
}
