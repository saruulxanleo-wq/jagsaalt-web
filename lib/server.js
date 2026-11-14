import { SITE_URL } from './config';
import { NextResponse } from 'next/server';
import { admin } from './db';
export const json = (d, s = 200) => NextResponse.json(d, { status: s });
export const fail = (error, s = 400) => json({ error }, s);
export function db() { try { return admin(); } catch { return null; } }
// Токеноор хэрэглэгчийг шалгах нь Supabase Auth руу нэг хүсэлт. Ижил токенийг isolate-д 60 секунд санана.
const AU = new Map();
export async function authUser(req, d) {
  const t = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  if (!t) return null;
  const h = AU.get(t); if (h && Date.now() - h.at < 60e3) return h.u;
  const { data } = await d.auth.getUser(t);
  const u = data?.user || null;
  if (u) { if (AU.size > 500) AU.clear(); AU.set(t, { u, at: Date.now() }); }
  return u;
}
export async function getProfile(d, u) {
  let { data } = await d.from('profiles').select('*').eq('id', u.id).maybeSingle();
  if (!data) ({ data } = await d.from('profiles').insert({ id: u.id, email: u.email, full_name: u.user_metadata?.full_name || u.user_metadata?.name || null }).select('*').single());
  return data;
}
async function hmac(msg) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(process.env.SUPABASE_SECRET_KEY || 'x'), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(msg));
  return [...new Uint8Array(sig)].slice(0, 16).map(b => b.toString(16).padStart(2, '0')).join('');
}
export const sign = hmac;
export const origin = req => new URL(req.url).origin;
export async function decideLink(base, kind, id, action) {
  return `${base}/api/admin/decide?k=${kind}&id=${id}&a=${action}&t=${await hmac(`${kind}:${id}:${action}`)}`;
}
export const ADMIN_EMAIL = () => process.env.ADMIN_EMAIL || 'saruulxanleo@gmail.com';
// Бүх имэйлийг brief.mn-ийн лого, хүрээтэй загварт оруулж илгээнэ
const layout = html => `<!doctype html><html><body style="margin:0;padding:0;background:#F3F8F4">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F3F8F4;padding:28px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px">
<tr><td style="padding:0 6px 18px"><a href="${SITE_URL}" style="text-decoration:none"><img src="${SITE_URL}/logo.png" alt="brief.mn" width="150" height="25" style="display:block;border:0;width:150px;height:auto"></a></td></tr>
<tr><td style="background:#ffffff;border-radius:18px;padding:28px 28px 24px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;font-size:15.5px;line-height:1.6;color:#16161D;border:1px solid #DCEAE0">${html}</td></tr>
<tr><td style="padding:18px 6px 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;font-size:12.5px;line-height:1.5;color:#6B7280">
<a href="${SITE_URL}" style="color:#0B8A3E;font-weight:700;text-decoration:none">brief.mn</a> — Монголын маркетингийн хаб: агентлаг, мэргэжилтэн, инфлүэнсер нэг дор.</td></tr>
</table></td></tr></table></body></html>`;
export async function mail(to, subject, html) {
  const r = await fetch('https://api.wesend.mn/v1/email', { method: 'POST', headers: { Authorization: `Bearer ${process.env.WESEND_API_KEY}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ to, subject, html: layout(html), from_name: 'brief.mn' }) }).catch(() => null);
  return !!r?.ok;
}
export const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
import { CATS, cap } from './config';
// Бэлэн ангиллын түлхүүр эсвэл өөрөө бичсэн ангилал (2–30 тэмдэгт). 1–3 ширхэг.
export const pickCats = v => {
  const a = [...new Set((Array.isArray(v) ? v : [v]).map(k => CATS[k] ? k : cap(String(k || '').slice(0, 30))).filter(k => CATS[k] || k.length >= 2))];
  return a.length >= 1 && a.length <= 3 ? a : null;
};
export const btn = (href, label, bg) => `<a href="${href}" style="display:inline-block;padding:12px 22px;border-radius:999px;background:${bg};color:#fff;text-decoration:none;font-weight:700;margin-right:8px">${label}</a>`;

export const isAdmin = u => !!u?.email && u.email.toLowerCase() === ADMIN_EMAIL().toLowerCase();
// Засах эрхтэй агентлаг: админ бол slug-аар, бусад нь өөрийн агентлаг
export async function editableAgency(d, u, slug) {
  if (slug && isAdmin(u)) { const { data } = await d.from('agencies').select('*').eq('slug', slug).maybeSingle(); return data; }
  const { data: m } = await d.from('agency_members').select('agencies(*)').eq('user_id', u.id).maybeSingle();
  return m?.agencies || null;
}

// Түнш (инфлүэнсерийн самбар): админ эсвэл partner_access-д бүртгэлтэй имэйл
export async function partnerRole(d, u) {
  if (!u?.email) return null;
  if (isAdmin(u)) return 'admin';
  const { data } = await d.from('partner_access').select('scope').eq('email', u.email.toLowerCase()).maybeSingle();
  return data?.scope === 'influencer' ? 'partner' : null;
}
export async function partnerEmails(d) {
  const { data } = await d.from('partner_access').select('email').eq('scope', 'influencer');
  return (data || []).map(r => r.email);
}
