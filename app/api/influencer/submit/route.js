import { db, fail, json, authUser, getProfile, mail, ADMIN_EMAIL, decideLink, esc, btn, origin, partnerEmails } from '@/lib/server';
import { NICHES, cap } from '@/lib/config';
import { fbLinkError, normFb } from '@/lib/fb';
import { fbPage } from '@/lib/fbpage';
const handle = (v, re) => { v = String(v || '').trim(); if (!v) return null; const m = v.match(re); return (m ? m[1] : v).replace(/^@/, '').replace(/[/?#].*$/, '').slice(0, 60) || null; };
const num = v => { const n = parseInt(String(v || '').replace(/[^\d]/g, ''), 10); return Number.isFinite(n) && n > 0 && n < 5e8 ? n : null; };
const TR = Object.fromEntries([...'абвгдеёжзийклмноөпрстуүфхцчшщъыьэюя'].map((c, i) => [c, ['a','b','v','g','d','e','yo','j','z','i','i','k','l','m','n','o','o','p','r','s','t','u','u','f','kh','ts','ch','sh','sh','','y','','e','yu','ya'][i]]));
const slug = s => [...s.toLowerCase()].map(c => TR[c] ?? c).join('').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'i-' + Date.now().toString(36);
export async function POST(req) {
  const d = db(); if (!d) return fail('Систем тохируулагдаж байна, түр хүлээгээрэй', 503);
  const b = await req.json().catch(() => ({}));
  const name = cap(b.name).slice(0, 80); if (name.length < 2) return fail('Нэрээ оруул');
  if (b.fb) { const e = fbLinkError(b.fb); if (e) return fail(e); }
  const fb_url = b.fb ? normFb(b.fb) : null; if (b.fb && !fb_url) return fail('Facebook линк буруу байна');
  const ig = handle(b.ig, /instagram\.com\/([^/?#]+)/i), tiktok = handle(b.tiktok, /tiktok\.com\/@?([^/?#]+)/i);
  let youtube = String(b.youtube || '').trim() || null; if (youtube && !/^https?:\/\//.test(youtube)) youtube = 'https://' + youtube;
  if (!fb_url && !ig && !tiktok && !youtube) return fail('Ядаж нэг сошиал хаяг оруул');
  const niches = (Array.isArray(b.niches) ? b.niches : []).filter(k => NICHES[k]).slice(0, 3); if (!niches.length) return fail('1–3 чиглэл сонго');
  const u = b.mine ? await authUser(req, d) : null;
  const row = { owner_id: null, name, fb_url, ig, tiktok, youtube, niches, bio: String(b.bio || '').trim().slice(0, 160) || null, contact: String(b.contact || '').trim().slice(0, 80) || null,
    ig_followers: num(b.ig_followers), tiktok_followers: num(b.tiktok_followers), yt_followers: num(b.yt_followers), fb_followers: null };
  if (fb_url) { const { data: ex } = await d.from('influencers').select('id').eq('fb_url', fb_url).maybeSingle(); if (ex) return fail('Энэ Facebook хаяг аль хэдийн бүртгэлтэй'); const p = await fbPage(fb_url).catch(() => null); if (p?.followers) row.fb_followers = p.followers; }
  if (ig) { const { data: ex } = await d.from('influencers').select('id').eq('ig', ig).maybeSingle(); if (ex) return fail('Энэ Instagram хаяг аль хэдийн бүртгэлтэй'); }
  let s = slug(name); const { data: taken } = await d.from('influencers').select('slug').like('slug', s + '%'); if (taken?.length) s += '-' + (taken.length + 1);
  const { data, error } = await d.from('influencers').insert({ ...row, slug: s }).select('id').single();
  if (error) return fail('Хадгалж чадсангүй', 500);
  const o = origin(req);
  await mail(ADMIN_EMAIL(), `Шинэ инфлүэнсер: ${name}`, `<p><b>${esc(name)}</b> · ${niches.map(k => NICHES[k]).join(', ')}<br>${[fb_url && `FB: ${esc(fb_url)} (${row.fb_followers ?? '?'})`, ig && `IG: @${esc(ig)} (${row.ig_followers ?? '?'})`, tiktok && `TikTok: @${esc(tiktok)} (${row.tiktok_followers ?? '?'})`, youtube && `YouTube: ${esc(youtube)}`].filter(Boolean).join('<br>')}${row.contact ? '<br>Холбоо барих: ' + esc(row.contact) : ''}${u ? `<br><b>Өөрийнх гэж мэдүүлсэн:</b> ${esc(u.email)} — нийтэлбэл энэ хүнийх болно` : ''}</p><p>${btn(await decideLink(o, 'influencer', data.id, 'approve'), 'Нийтлэх', '#2FB344')}${btn(await decideLink(o, 'influencer', data.id, 'reject'), 'Татгалзах', '#E8452A')}</p>`);
  for (const e of await partnerEmails(d).catch(() => [])) await mail(e, `Шинэ инфлүэнсер бүртгүүллээ: ${name} | brief.mn`, `<p><b>${esc(name)}</b> brief.mn-д инфлүэнсерээр бүртгүүллээ. Самбараас батлах эсвэл татгалзана.</p><p>${btn(origin(req) + '/partner', 'Самбар нээх', '#16161D')}</p>`);
  if (u) { // өөрийнхөө профайл: утас баталгаажсан бол эзэмших хүсэлтийг шууд үүсгэнэ
    const p = await getProfile(d, u);
    if (p?.phone_verified_at) { await d.from('item_claims').insert({ kind: 'influencer', item_id: data.id, user_id: u.id, phone: p.phone, note: 'Өөрөө (нэмэхдээ)', proof: '' }); return json({ ok: true, claimed: true }); }
    return json({ ok: true, own: 'influencer:' + data.id });
  }
  return json({ ok: true });
}
