import { db, fail, json, authUser, isAdmin } from '@/lib/server';
// Админ: сайттай холбогдсон бүх имэйлийг нэг жагсаалтад нэгтгэнэ (давхардалгүй, ангилал шошготой)
const TAGS = { sub: 'Товхимол', user: 'Бүртгэлтэй хэрэглэгч', agency: 'Агентлагийн эзэн', owner: 'Профайлын эзэн', lead: 'Үнийн санал хүссэн', order: 'Захиалагч' };
export async function GET(req) {
  const d = db(); if (!d) return fail('Систем', 503);
  const u = await authUser(req, d); if (!isAdmin(u)) return fail('Зөвхөн админ', 403);
  const [{ data: subs }, { data: profs }, { data: mem }, { data: lo }, { data: io }, { data: leads }, { data: orders }] = await Promise.all([
    d.from('subscribers').select('email,role,status,created_at').limit(20000),
    d.from('profiles').select('id,email,full_name,phone,created_at').limit(20000),
    d.from('agency_members').select('user_id,agencies(name)'),
    d.from('listings').select('owner_id,name,type').not('owner_id', 'is', null),
    d.from('influencers').select('owner_id,name').not('owner_id', 'is', null),
    d.from('leads').select('name,company,email,phone,created_at').limit(20000),
    d.from('orders').select('contact,target_name,status,created_at').limit(20000),
  ]);
  const M = new Map(); const pid = {};
  const add = (email, tag, x = {}) => {
    const e = String(email || '').trim().toLowerCase(); if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e)) return;
    const c = M.get(e) || { email: e, tags: [], name: '', phone: '', company: '', note: [], first: x.at || null, last: x.at || null, consent: false };
    if (!c.tags.includes(tag)) c.tags.push(tag);
    if (x.name && !c.name) c.name = x.name; if (x.phone && !c.phone) c.phone = x.phone; if (x.company && !c.company) c.company = x.company;
    if (x.note && !c.note.includes(x.note)) c.note.push(x.note);
    if (x.at) { if (!c.first || x.at < c.first) c.first = x.at; if (!c.last || x.at > c.last) c.last = x.at; }
    if (x.consent) c.consent = true;
    M.set(e, c);
  };
  for (const s of subs || []) if (s.status !== 'unsubscribed') add(s.email, 'sub', { at: s.created_at, consent: s.status === 'active', note: s.status === 'pending' ? 'товхимол баталгаажаагүй' : null });
  for (const p of profs || []) { pid[p.id] = p; add(p.email, 'user', { at: p.created_at, name: p.full_name, phone: p.phone }); }
  for (const m of mem || []) add(pid[m.user_id]?.email, 'agency', { note: m.agencies?.name });
  for (const o of [...(lo || []), ...(io || [])]) add(pid[o.owner_id]?.email, 'owner', { note: o.name });
  for (const l of leads || []) add(l.email, 'lead', { at: l.created_at, name: l.name, phone: l.phone, company: l.company });
  for (const o of orders || []) add(o.contact, 'order', { at: o.created_at, note: o.target_name });
  const rows = [...M.values()].sort((a, b) => String(b.last || '').localeCompare(String(a.last || '')));
  if (new URL(req.url).searchParams.get('csv')) {
    const e = v => '"' + String(v ?? '').replace(/"/g, '""') + '"';
    const lines = ['email,name,phone,company,categories,newsletter_consent,details,first_seen,last_seen', ...rows.map(r => [r.email, r.name, r.phone, r.company, r.tags.map(t => TAGS[t]).join('; '), r.consent ? 'yes' : 'no', r.note.join('; '), r.first, r.last].map(e).join(','))];
    return new Response('﻿' + lines.join('\n'), { headers: { 'content-type': 'text/csv; charset=utf-8', 'content-disposition': 'attachment; filename="brief-contacts.csv"' } });
  }
  return json({ ok: true, rows });
}
