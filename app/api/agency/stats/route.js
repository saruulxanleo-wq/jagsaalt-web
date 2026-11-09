import { db, fail, json, authUser, editableAgency } from '@/lib/server';
// Сүүлийн 30 хоногийн үзэлт, дарсан тоо (эзэн эсвэл админ)
export async function GET(req) {
  const d = db(); if (!d) return fail('Систем тохируулагдаж байна', 503);
  const u = await authUser(req, d); if (!u) return fail('Нэвтрээгүй байна', 401);
  const ag = await editableAgency(d, u, new URL(req.url).searchParams.get('slug')); if (!ag) return fail('Эрх алга', 403);
  const since = new Date(Date.now() - 30 * 864e5);
  const { data } = await d.from('events').select('kind,created_at').eq('agency_id', ag.id).gte('created_at', since.toISOString()).limit(20000);
  const totals = {}; const days = {};
  for (const e of data || []) { totals[e.kind] = (totals[e.kind] || 0) + 1; if (e.kind === 'view') { const k = e.created_at.slice(0, 10); days[k] = (days[k] || 0) + 1; } }
  const daily = [...Array(30)].map((_, i) => { const k = new Date(since.getTime() + (i + 1) * 864e5).toISOString().slice(0, 10); return [k, days[k] || 0]; });
  return json({ totals, daily });
}
