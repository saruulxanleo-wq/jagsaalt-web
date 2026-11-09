import { db, json } from '@/lib/server';
const KINDS = ['view', 'phone', 'fb', 'website', 'social', 'email'];
const BOT = /bot|crawl|spider|slurp|facebookexternalhit|preview|headless|lighthouse/i;
// Профайл үзэлт, товч дарсныг бүртгэнэ (нэвтрэлт шаардахгүй, bot-ыг алгасна)
export async function POST(req) {
  if (BOT.test(req.headers.get('user-agent') || '')) return json({ ok: true });
  const d = db(); if (!d) return json({ ok: false });
  const b = await req.json().catch(() => null) || await req.text().then(t => { try { return JSON.parse(t); } catch { return {}; } }).catch(() => ({}));
  if (!KINDS.includes(b.kind) || typeof b.slug !== 'string') return json({ ok: false });
  const { data: ag } = await d.from('agencies').select('id').eq('slug', b.slug.slice(0, 80)).maybeSingle();
  if (ag) await d.from('events').insert({ agency_id: ag.id, kind: b.kind });
  return json({ ok: true });
}
