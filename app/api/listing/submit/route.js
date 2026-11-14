import { db, fail, json, authUser, getProfile, mail, ADMIN_EMAIL, decideLink, esc, btn, origin } from '@/lib/server';
import { imgToken } from '@/lib/imgtoken';
import { TYPES, topicsFor, cap } from '@/lib/config';
// Хэрэгсэл / сургалт / коммюнити санал → pending, админд и-мэйл
export async function POST(req) {
  const d = db(); if (!d) return fail('Систем тохируулагдаж байна, түр хүлээгээрэй', 503);
  const b = await req.json().catch(() => ({}));
  if (!TYPES[b.type]) return fail('Төрлөө сонго');
  const name = cap(b.name).slice(0, 80); if (name.length < 2) return fail('Нэрээ оруул');
  let url; try { url = new URL(/^https?:\/\//.test(b.url || '') ? b.url : 'https://' + (b.url || '')); if (!url.hostname.includes('.')) throw 0; url = url.toString(); } catch { return fail('Линкээ зөв оруул'); }
  const topics = (Array.isArray(b.topics) ? b.topics : []).filter(t => topicsFor(b.type)[t]).slice(0, 3); if (!topics.length) return fail('1–3 сэдэв сонго');
  const description = String(b.description || '').trim().slice(0, 200); if (description.length < 10) return fail('Товч тайлбар бич (10+ тэмдэгт)');
  const u = b.mine ? await authUser(req, d) : null;
  const row = { owner_id: null, type: b.type, name, url, topics, description, maker: String(b.maker || '').trim().slice(0, 60) || null, price: String(b.price || '').trim().slice(0, 40) || null, contact: String(b.contact || '').trim().slice(0, 80) || null,
    ...(b.type === 'course' ? { starts_at: /^\d{4}-\d{2}-\d{2}$/.test(b.starts_at || '') ? b.starts_at : null, schedule: String(b.schedule || '').trim().slice(0, 80) || null } : {}) };
  const { data: ex } = await d.from('listings').select('id').eq('url', url).maybeSingle();
  if (ex) return fail('Энэ линк аль хэдийн нэмэгдсэн байна');
  const { data, error } = await d.from('listings').insert(row).select('id').single();
  if (error) return fail('Хадгалж чадсангүй', 500);
  const o = origin(req);
  await mail(ADMIN_EMAIL(), `Шинэ ${TYPES[b.type].label.toLowerCase()}: ${name}`, `<p><b>${esc(name)}</b> · ${TYPES[b.type].label}${row.price ? ' · ' + esc(row.price) : ''}<br>${esc(description)}<br><a href="${esc(url)}">${esc(url)}</a>${row.contact ? '<br>Холбоо барих: ' + esc(row.contact) : ''}${u ? `<br><b>Эзэмшигч гэж мэдүүлсэн:</b> ${esc(u.email)} — нийтэлбэл энэ хүнийх болно` : ''}</p><p>${btn(await decideLink(o, 'listing', data.id, 'approve'), 'Нийтлэх', '#2FB344')}${btn(await decideLink(o, 'listing', data.id, 'reject'), 'Татгалзах', '#E8452A')}</p>`);
  if (u) { // өөрийнхөө профайл: утас баталгаажсан бол эзэмших хүсэлтийг шууд үүсгэнэ
    const p = await getProfile(d, u);
    if (p?.phone_verified_at) { await d.from('item_claims').insert({ kind: 'listing', item_id: data.id, user_id: u.id, phone: p.phone, note: 'Өөрөө (нэмэхдээ)', proof: '' }); return json({ ok: true, claimed: true }); }
    return json({ ok: true, own: 'listing:' + data.id, img: await imgToken('listing', data.id) });
  }
  return json({ ok: true, img: data?.id ? await imgToken('listing', data.id) : null });
}
