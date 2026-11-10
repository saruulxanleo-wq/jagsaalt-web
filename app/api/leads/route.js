import { db, fail, json, authUser, editableAgency } from '@/lib/server';
import { score, NEEDS, BUDGETS, SIZES, PRIORITIES } from '@/lib/match';
import { LEAD_MAX } from '@/lib/config';
// Агентлагт тохирох сүүлийн 45 хоногийн клиентийн хүсэлтүүд. Худалдаж авсных нь холбоо барих мэдээлэл нээлттэй.
export async function GET(req) {
  const d = db(); if (!d) return fail('Систем тохируулагдаж байна', 503);
  const u = await authUser(req, d); if (!u) return fail('Нэвтэрнэ үү', 401);
  const ag = await editableAgency(d, u, new URL(req.url).searchParams.get('slug')); if (!ag) return json({ ok: true, leads: [] });
  const { data: leads } = await d.from('leads').select('id,name,phone,email,company,note,answers,agencies,created_at').gte('created_at', new Date(Date.now() - 45 * 864e5).toISOString()).order('created_at', { ascending: false }).limit(300);
  const ids = (leads || []).map(l => l.id);
  const { data: acc } = ids.length ? await d.from('lead_access').select('lead_id,agency_id').in('lead_id', ids) : { data: [] };
  const { data: pend } = await d.from('orders').select('target_id,code,amount').eq('product', 'lead').eq('agency_id', ag.id).eq('status', 'pending');
  const out = [];
  for (const l of leads || []) {
    const a = l.answers || {}; const m = a.source === 'profile' ? (l.agencies || []).includes(ag.slug) : score(ag, a); const mine = (acc || []).some(x => x.lead_id === l.id && x.agency_id === ag.id);
    if (!m && !mine) continue;
    const taken = (acc || []).filter(x => x.lead_id === l.id).length;
    out.push({ id: l.id, created_at: l.created_at, needs: (a.needs || []).map(k => NEEDS[k]?.label).filter(Boolean), budget: BUDGETS[a.budget]?.[0] || null, size: SIZES[a.size] || null, priority: PRIORITIES[a.priority] || null, industry: a.industry || null,
      left: Math.max(0, LEAD_MAX - taken), pending: (pend || []).find(p => p.target_id === l.id) || null,
      contact: mine ? { name: l.name, phone: l.phone, email: l.email, company: l.company, note: l.note, fb: a.fb || null } : null });
  }
  return json({ ok: true, agency: ag.name, leads: out });
}
