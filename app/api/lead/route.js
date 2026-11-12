import { db, fail, json, mail, ADMIN_EMAIL, esc, origin, btn, partnerEmails } from '@/lib/server';
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
  const { data: ins, error } = await d.from('leads').insert(row).select('id').single();
  if (error) return fail('Хадгалж чадсангүй', 500);
  const o = origin(req);
  await mail(ADMIN_EMAIL(), `Шинэ клиент: ${name}${row.company ? ' · ' + row.company : ''}`, `<p><b>${esc(name)}</b>${row.company ? ' · ' + esc(row.company) : ''}<br>${esc(phone)} ${esc(email)}</p>
<p>Хэрэгцээ: ${esc((q.needs || []).map(k => NEEDS[k]?.label).filter(Boolean).join(', '))}<br>Төсөв: ${esc(BUDGETS[q.budget]?.[0] || '-')} / сар<br>Хэмжээ: ${esc(SIZES[q.size] || '-')}<br>Брэнд: ${esc(BRANDS[q.brands] || '-')}${q.source === 'profile' ? '<br>Эх сурвалж: агентлагийн профайл' : q.source === 'influencer' ? '<br><b>Инфлүэнсертэй хамтрах хүсэлт: ' + esc(q.influencer_name || q.influencer) + '</b>' : ''}<br>Чухалчлах: ${esc(PRIORITIES[q.priority] || '-')}${q.industry ? '<br>Салбар: ' + esc(q.industry) : ''}<br>Зар: ${esc(ADS[q.ads] || '-')}${q.fb ? '<br>FB: ' + esc(q.fb) : ''}</p>
${row.note ? `<p>Нэмэлт: ${esc(row.note)}</p>` : ''}<p>Сонгосон агентлагууд: ${row.agencies.map(s => `<a href="${o}/a/${s}">${esc(s)}</a>`).join(', ')}</p><p>UTM: ${esc(JSON.stringify(row.utm))}</p><p><a href="${o}/admin">Админ →</a></p>`);
  // Эзэнтэй агентлаг бүрт үнийн саналыг шууд имэйлээр дамжуулна (эзэнгүйг админ гараар дамжуулна)
  if (row.agencies.length) {
    const { data: ags } = await d.from('agencies').select('id,slug,name').in('slug', row.agencies);
    const sent = {};
    for (const a of ags || []) {
      const { data: mem } = await d.from('agency_members').select('user_id').eq('agency_id', a.id);
      const others = row.agencies.length - 1;
      const tr = (k, v) => v ? `<tr><td style="padding:6px 12px 6px 0;color:#667;white-space:nowrap;vertical-align:top">${k}</td><td style="padding:6px 0"><b>${v}</b></td></tr>` : '';
      const body = `<p>Сайн байна уу!</p><p>brief.mn-ээр «<b>${esc(a.name)}</b>»-д үнийн санал авах хүсэлт ирлээ. Харилцагч жагсаалтаас танай агентлагийг сонгосон.</p>
<table style="border-collapse:collapse;font-size:15px">${tr('Нэр', esc(name))}${tr('Байгууллага', esc(row.company || ''))}${tr('Утас', esc(phone))}${tr('И-мэйл', esc(email))}${tr('Хэрэгцээ', esc((q.needs || []).map(k => NEEDS[k]?.label).filter(Boolean).join(', ')))}${tr('Сарын төсөв', esc(BUDGETS[q.budget]?.[0] || ''))}${tr('Бизнесийн хэмжээ', esc(SIZES[q.size] || ''))}${tr('Юуг чухалчилдаг', esc(PRIORITIES[q.priority] || ''))}${tr('Салбар', esc(q.industry || ''))}${tr('Нэмэлт', esc(row.note || ''))}</table>
${others > 0 ? `<p style="color:#667">Энэ харилцагч өөр ${others} агентлагаас ч санал авч байгаа тул эрт холбогдвол давуу талтай.</p>` : ''}
<p>${phone ? btn('tel:' + phone.replace(/\s/g, ''), 'Залгах', '#0B8A3E') : ''}${email ? btn('mailto:' + email, 'Имэйл бичих', '#16161D') : ''}</p>
<p style="color:#667;font-size:13px">Энэ хүсэлтийг brief.mn дээр «${esc(a.name)}»-ийг удирддаг хүнд илгээв. Бүх хүсэлтээ <a href="${o}/minii">Миний самбар</a>-аас харна.</p>`;
      let ok = false;
      for (const m of mem || []) { const { data: { user } } = await d.auth.admin.getUserById(m.user_id); if (user?.email) ok = (await mail(user.email, `Шинэ үнийн санал: ${name}${row.company ? ' · ' + row.company : ''} | brief.mn`, body)) || ok; }
      if (ok) sent[a.slug] = new Date().toISOString();
    }
    if (ins?.id && Object.keys(sent).length) await d.from('leads').update({ sent }).eq('id', ins.id);
  }
  // Баталгаажсан инфлүэнсерт хамтрах саналыг шууд дамжуулна
  if (q.source === 'influencer' && q.influencer) {
    const { data: inf } = await d.from('influencers').select('name,owner_id').eq('slug', String(q.influencer)).maybeSingle();
    if (inf?.owner_id) { const { data: { user } } = await d.auth.admin.getUserById(inf.owner_id);
      if (user?.email) await mail(user.email, `Хамтран ажиллах санал: ${name}${row.company ? ' · ' + row.company : ''}`, `<p>Сайн уу! ${esc(o.replace(/^https?:\/\//, ''))}-ээр дамжуулан «${esc(inf.name)}» профайлд хамтран ажиллах санал ирлээ.</p><p><b>${esc(name)}</b>${row.company ? ' · ' + esc(row.company) : ''}<br>${esc(phone)} ${esc(email)}</p>${row.note ? `<p>«${esc(row.note)}»</p>` : ''}`); }
  }
  // Инфлүэнсерийн хүсэлтийг түнш агентлагт (самбар + имэйл) мэдэгдэнэ
  if (q.source === 'influencer') {
    const to = await partnerEmails(d).catch(() => []);
    const body = `<p>Инфлүэнсерийн цэсээр шинэ хүсэлт ирлээ.</p><p><b>${esc(name)}</b>${row.company ? ' · ' + esc(row.company) : ''}<br>${esc(phone)} ${esc(email)}</p><p>Инфлүэнсер: <a href="${o}/influencer">${esc(q.influencer_name || q.influencer || '')}</a></p>${row.note ? `<p>${esc(row.note)}</p>` : ''}<p>${btn(o + '/partner', 'Самбар нээх', '#16161D')}</p>`;
    for (const e of to) await mail(e, `Шинэ инфлүэнсерийн хүсэлт: ${name}${row.company ? ' · ' + row.company : ''} | brief.mn`, body);
  }
  return json({ ok: true });
}
