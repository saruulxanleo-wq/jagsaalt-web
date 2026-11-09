import { db, fail, json, authUser, isAdmin } from '@/lib/server';
export async function GET(req) {
  const d = db(); if (!d) return fail('Систем тохируулагдаж байна', 503);
  const u = await authUser(req, d); if (!isAdmin(u)) return fail('Зөвхөн админ', 403);
  const [{ data: pending }, { data: claims }, { data: reports }, { count: total }] = await Promise.all([
    d.from('agencies').select('id,slug,name,fb_url,categories,category,added_by,created_at').eq('status', 'pending').order('created_at', { ascending: false }),
    d.from('claims').select('id,note,phone,created_at,status,user_id,agencies(name,slug,fb_url)').eq('status', 'pending').not('user_id', 'is', null).order('created_at', { ascending: false }),
    d.from('reports').select('id,message,created_at,agencies(name,slug)').eq('resolved', false).order('created_at', { ascending: false }).limit(50),
    d.from('agencies').select('id', { count: 'exact', head: true }).eq('status', 'approved'),
  ]);
  const { data: ev } = await d.from('events').select('kind,agency_id').gte('created_at', new Date(Date.now() - 30 * 864e5).toISOString()).limit(50000);
  const agg = {}; for (const e of ev || []) { const a = agg[e.agency_id] ||= { views: 0, clicks: 0 }; e.kind === 'view' ? a.views++ : a.clicks++; }
  const topIds = Object.entries(agg).sort((x, y) => y[1].views - x[1].views).slice(0, 15).map(([id]) => id);
  const { data: topAg } = topIds.length ? await d.from('agencies').select('id,name,slug').in('id', topIds) : { data: [] };
  const top = topIds.map(id => ({ ...(topAg || []).find(a => a.id === id), ...agg[id] })).filter(a => a.slug);
  const totalViews = Object.values(agg).reduce((s, a) => s + a.views, 0), totalClicks = Object.values(agg).reduce((s, a) => s + a.clicks, 0);
  const ids = [...new Set((claims || []).map(c => c.user_id))];
  const { data: profs } = ids.length ? await d.from('profiles').select('id,email,full_name').in('id', ids) : { data: [] };
  const pm = Object.fromEntries((profs || []).map(p => [p.id, p]));
  return json({ top, totalViews, totalClicks, total, pending: pending || [], claims: (claims || []).map(c => ({ ...c, user: pm[c.user_id] || null })), reports: reports || [] });
}
