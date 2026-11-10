import { NextResponse } from 'next/server';
import { admin } from './db';
export const json = (d, s = 200) => NextResponse.json(d, { status: s });
export const fail = (error, s = 400) => json({ error }, s);
export function db() { try { return admin(); } catch { return null; } }
export async function authUser(req, d) {
  const t = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  if (!t) return null;
  const { data } = await d.auth.getUser(t);
  return data?.user || null;
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
export async function mail(to, subject, html) {
  const r = await fetch('https://api.wesend.mn/v1/email', { method: 'POST', headers: { Authorization: `Bearer ${process.env.WESEND_API_KEY}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ to, subject, html, from_name: 'brief.mn' }) });
  return r.ok;
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
