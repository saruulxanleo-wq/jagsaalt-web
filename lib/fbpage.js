// Facebook-ийн нийтэд нээлттэй Page Plugin-оос хуудасны мэдээллийг уншина (нэвтрэлт, токен шаардлагагүй).
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36';
const unj = s => { try { return JSON.parse('"' + s + '"'); } catch { return s; } };
export function parseCount(s) {
  if (!s) return null; const m = String(s).replace(/,/g, '').match(/([\d.]+)\s*([KМM]?)/i); if (!m) return null;
  const n = parseFloat(m[1]); const k = m[2].toUpperCase();
  return Math.round(k === 'K' ? n * 1e3 : k === 'M' || k === 'М' ? n * 1e6 : n);
}
export async function fbPage(fbUrl) {
  const u = `https://www.facebook.com/plugins/page.php?href=${encodeURIComponent(fbUrl)}&tabs=timeline&width=500&height=800&small_header=true&hide_cover=true&locale=en_US`;
  const r = await fetch(u, { headers: { 'User-Agent': UA, 'Accept-Language': 'en-US,en;q=0.9', Accept: 'text/html' }, redirect: 'follow' });
  if (!r.ok) return null;
  const h = await r.text();
  const str = k => { const m = h.match(new RegExp('"' + k + '":"((?:[^"\\\\]|\\\\.)*)"')); return m ? unj(m[1]) : null; };
  const name = str('pageName');
  if (name) { // шинэ хэлбэр (JSON)
    const times = [...h.matchAll(/"createdTime":(\d{9,})/g)].map(m => +m[1]);
    const last = times.length ? new Date(Math.max(...times) * 1000).toISOString().slice(0, 10) : null;
    return { name, followers: parseCount(str('followerCountFormatted')), phone: str('pagePhone'), picture: str('profilePicURL'), last_post_at: last };
  }
  // хуучин хэлбэр (HTML): нэр, дагагч, зураг байна; постын огноо байхгүй
  const dec = t => t.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&#x([0-9a-f]+);/gi, (_, x) => String.fromCodePoint(parseInt(x, 16))).replace(/&#(\d+);/g, (_, x) => String.fromCodePoint(+x));
  const t = h.match(/<a [^>]*title="([^"]{1,120})"/); const f = h.match(/>([\d.,]+\s*[KM]?) followers</);
  if (!t || !f) return null;
  const img = h.match(/<img[^>]+src="(https:\/\/scontent[^"]+)"/);
  return { name: dec(t[1]), followers: parseCount(f[1]), phone: null, picture: img ? dec(img[1]) : null, last_post_at: null };
}
// FB-ийн зургийн линк хугацаатай тул өөрсдийн санд хуулж хадгална
export async function storePicture(d, agencyId, picUrl, supabaseUrl) {
  if (!picUrl) return null;
  const r = await fetch(picUrl, { headers: { 'User-Agent': UA } }); if (!r.ok) return null;
  const type = (r.headers.get('content-type') || 'image/jpeg').split(';')[0];
  if (!/^image\/(jpeg|png|webp)$/.test(type)) return null;
  const path = `fb/${agencyId}-${Date.now().toString(36)}.${type.split('/')[1]}`;
  const { error } = await d.storage.from('logos').upload(path, await r.arrayBuffer(), { contentType: type, upsert: true });
  return error ? null : `${supabaseUrl}/storage/v1/object/public/logos/${path}`;
}
// Агентлагийн мөрийг FB мэдээллээр баяжуулна. force=false үед зөвхөн хоосон лого/утсыг бөглөнө.
function graphPic(fbUrl) {
  try { const u = new URL(fbUrl); const id = u.searchParams.get('id') || u.pathname.split('/').filter(Boolean)[0]; return id ? `https://graph.facebook.com/${encodeURIComponent(id)}/picture?type=large&width=400&height=400` : null; } catch { return null; }
}
export async function enrichAgency(d, ag, supabaseUrl, { logo = false } = {}) {
  let p = await fbPage(ag.fb_url).catch(() => null);
  if (!p) { // plugin уншигдахгүй үед ядаж логог Graph-аас авна
    if (ag.logo_url && !logo) return null;
    const url = await storePicture(d, ag.id, graphPic(ag.fb_url), supabaseUrl).catch(() => null);
    if (url) await d.from('agencies').update({ logo_url: url, updated_at: new Date().toISOString() }).eq('id', ag.id);
    return url ? { logo_url: url } : null;
  }
  const up = { updated_at: new Date().toISOString() };
  if (p.followers != null) up.followers = p.followers;
  if (p.last_post_at) up.last_post_at = p.last_post_at;
  if (!ag.phone_public && p.phone) up.phone_public = p.phone.slice(0, 20);
  if ((logo || !ag.logo_url) && p.picture) { const url = await storePicture(d, ag.id, p.picture, supabaseUrl).catch(() => null); if (url) up.logo_url = url; }
  await d.from('agencies').update(up).eq('id', ag.id);
  return { ...p, ...up };
}
