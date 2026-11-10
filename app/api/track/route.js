import { db, json } from '@/lib/server';
const KINDS = ['view', 'phone', 'fb', 'website', 'social', 'email'];
const BOT = /bot|crawl|spider|slurp|facebookexternalhit|preview|headless|lighthouse/i;
// Профайл үзэлт, товч дарсныг бүртгэнэ (нэвтрэлт шаардахгүй, bot-ыг алгасна)
export async function POST(req) {
  if (BOT.test(req.headers.get('user-agent') || '')) return json({ ok: true });
  const d = db(); if (!d) return json({ ok: false });
  const b = await req.json().catch(() => null) || await req.text().then(t => { try { return JSON.parse(t); } catch { return {}; } }).catch(() => ({}));
  if (b.kind === 'click' && typeof b.lid === 'string' && /^[0-9a-f-]{36}$/.test(b.lid)) { await d.from('events').insert({ listing_id: b.lid, kind: 'click' }); return json({ ok: true }); }
  if (typeof b.iid === 'string' && /^[0-9a-f-]{36}$/.test(b.iid)) { await d.from('events').insert({ influencer_id: b.iid, kind: b.kind === 'dm' ? 'dm' : 'social' }); return json({ ok: true }); }
  if (!KINDS.includes(b.kind) || typeof b.slug !== 'string') return json({ ok: false });
  const { data: ag } = await d.from('agencies').select('id').eq('slug', b.slug.slice(0, 80)).maybeSingle();
  if (ag) await d.from('events').insert({ agency_id: ag.id, kind: b.kind });
  return json({ ok: true });
}
