import { sign } from './server';
import { TOPICS, NICHES, cap } from './config';
// Эзэмших боломжтой зүйлс: хаб (listings) болон инфлүэнсер
export const KINDS = {
  listing: { table: 'listings', cols: 'id,type,name,maker,description,price,url,logo_url,topics,status,sponsored,sponsored_until,owner_id,verified' },
  influencer: { table: 'influencers', cols: 'id,slug,name,bio,photo_url,niches,ig,ig_followers,fb_url,fb_followers,tiktok,tiktok_followers,youtube,yt_followers,reach,status,owner_id,verified,dm_url' },
};
export const parseOwn = s => { const [kind, id] = String(s || '').split(':'); return KINDS[kind] && /^[0-9a-f-]{36}$/.test(id || '') ? { kind, id } : null; };
// Хүн болгонд тогтмол баталгаажуулах код — группийн тайлбар, пост, bio-д тавиулна
export const ownCode = async (uid, kind, id) => 'JAG-' + (await sign(`own:${uid}:${kind}:${id}`)).slice(0, 5).toUpperCase();
export const getItem = async (d, kind, id) => { const K = KINDS[kind]; const { data } = await d.from(K.table).select(K.cols).eq('id', id).maybeSingle(); return data; };
const str = (v, n) => { const s = String(v ?? '').trim().slice(0, n); return s || null; };
const url = v => { const s = String(v || '').trim(); if (!s) return null; try { const u = new URL(/^https?:\/\//.test(s) ? s : 'https://' + s); if (!u.hostname.includes('.')) return undefined; return u.toString(); } catch { return undefined; } };
const handle = v => str(String(v || '').replace(/^https?:\/\/(www\.)?(instagram\.com|tiktok\.com)\/@?/i, '').replace(/^@/, '').replace(/[/?#].*$/, ''), 60);
// Шууд холбоо барих: линк, утас (→ tel:), имэйл (→ mailto:)
export const dmLink = v => { const s = String(v || '').trim(); if (!s) return null; if (/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(s)) return 'mailto:' + s; const ph = s.replace(/[\s-]/g, ''); if (/^\+?\d{8,12}$/.test(ph)) return 'tel:' + (ph.startsWith('+') ? ph : '+976' + ph.slice(-8)); const u = url(s); return u || undefined; };
// Эзэмшигчийн засах талбарууд — баталгаажуулалт
export function cleanPatch(kind, b) {
  if (kind === 'listing') {
    const p = { name: cap(b.name).slice(0, 80), maker: str(b.maker, 60), description: str(b.description, 200), price: str(b.price, 40), url: url(b.url), logo_url: url(b.logo_url), topics: (Array.isArray(b.topics) ? b.topics : []).filter(t => TOPICS[t]).slice(0, 3) };
    if (p.name.length < 2) return { error: 'Нэрээ оруул' };
    if (!p.url) return { error: 'Линкээ зөв оруул' };
    if (p.logo_url === undefined) return { error: 'Логоны линк буруу' };
    if (!p.topics.length) return { error: '1–3 сэдэв сонго' };
    return { patch: p };
  }
  const p = { bio: str(b.bio, 160), photo_url: url(b.photo_url), niches: (Array.isArray(b.niches) ? b.niches : []).filter(t => NICHES[t]).slice(0, 3), ig: handle(b.ig), tiktok: handle(b.tiktok), fb_url: url(b.fb_url), youtube: url(b.youtube), dm_url: dmLink(b.dm_url) };
  if (p.photo_url === undefined || p.fb_url === undefined || p.youtube === undefined) return { error: 'Линк буруу байна' };
  if (p.dm_url === undefined) return { error: 'Холбоо барих суваг буруу: Messenger/WhatsApp линк, утас эсвэл имэйл оруул' };
  if (!p.niches.length) return { error: '1–3 чиглэл сонго' };
  return { patch: p };
}
