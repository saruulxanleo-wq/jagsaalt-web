// Нийтэд ил профайлын зургийг олж, өөрсдийн санд (logos bucket) хуулж хадгална.
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36';
const fbId = u => { try { const x = new URL(u); return x.searchParams.get('id') || x.pathname.split('/').filter(Boolean)[0] || null; } catch { return null; } };
const graph = u => { const id = fbId(u); return id ? `https://graph.facebook.com/${encodeURIComponent(id)}/picture?type=large&width=400&height=400` : null; };
const unav = (net, h) => h ? `https://unavatar.io/${net}/${encodeURIComponent(h)}?fallback=false` : null;
async function html(u) { const r = await fetch(u, { headers: { 'User-Agent': UA, 'Accept-Language': 'en-US,en;q=0.9', Accept: 'text/html' }, redirect: 'follow' }); return r.ok ? r.text() : null; }
const og = h => { const m = h && (h.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) || h.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i)); return m ? m[1].replace(/&amp;/g, '&') : null; };
async function behance(u) {
  const h = await html(u); if (!h) return null; const t = h.replace(/\\\//g, '/');
  const all = [...t.matchAll(/https:\/\/mir-s3-cdn-cf\.behance\.net\/user\/(\d+)\/[^"'\s)]+/g)];
  if (!all.length) return null; all.sort((a, b) => +b[1] - +a[1]); return all[0][0];
}
// Нэг мөрийн хувьд зургийн эх сурвалжуудыг дарааллаар нь буцаана
export function sources(row) {
  const out = [];
  const u = row.url || '';
  if (row.fb_url) out.push(['fb', graph(row.fb_url)]);
  if (/facebook\.com/.test(u)) out.push(['fb', graph(u)]);
  if (/behance\.net/.test(u)) out.push(['behance', () => behance(u)]);
  if (row.ig) out.push(['ig', unav('instagram', row.ig)]);
  if (row.tiktok) out.push(['tiktok', unav('tiktok', row.tiktok)]);
  if (row.youtube) out.push(['yt', async () => og(await html(row.youtube))]);
  if (u && !/facebook\.com|behance\.net/.test(u)) out.push(['og', async () => og(await html(u))]);
  return out.filter(([, s]) => s);
}
export async function storeImage(d, key, picUrl, supabaseUrl) {
  if (!picUrl) return null;
  const r = await fetch(picUrl, { headers: { 'User-Agent': UA }, redirect: 'follow' }); if (!r.ok) return null;
  const type = (r.headers.get('content-type') || '').split(';')[0];
  if (!/^image\/(jpeg|png|webp)$/.test(type)) return null;
  const buf = await r.arrayBuffer(); if (buf.byteLength < 3000) return null; // FB-ийн хоосон дүрс зэргийг алгасна
  const path = `auto/${key}-${Date.now().toString(36)}.${type.split('/')[1]}`;
  const { error } = await d.storage.from('logos').upload(path, buf, { contentType: type, upsert: true });
  return error ? null : `${supabaseUrl}/storage/v1/object/public/logos/${path}`;
}
export async function findPhoto(d, row, key, supabaseUrl) {
  for (const [src, s] of sources(row)) {
    try { const pic = typeof s === 'function' ? await s() : s; const url = await storeImage(d, key, pic, supabaseUrl); if (url) return { url, src }; } catch {}
  }
  return null;
}
