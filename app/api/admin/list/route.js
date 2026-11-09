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
  const ids = [...new Set((claims || []).map(c => c.user_id))];
  const { data: profs } = ids.length ? await d.from('profiles').select('id,email,full_name').in('id', ids) : { data: [] };
  const pm = Object.fromEntries((profs || []).map(p => [p.id, p]));
  return json({ total, pending: pending || [], claims: (claims || []).map(c => ({ ...c, user: pm[c.user_id] || null })), reports: reports || [] });
}
