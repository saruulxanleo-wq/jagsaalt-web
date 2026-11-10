import { db, fail, json, authUser, isAdmin, sign, origin } from '@/lib/server';
// Админ: бүртгэлийн тоо, CSV экспорт (цуцлах линктэй)
export async function GET(req) {
  const d = db(); if (!d) return fail('Систем', 503);
  const u = await authUser(req, d); if (!isAdmin(u)) return fail('Зөвхөн админ', 403);
  const { data } = await d.from('subscribers').select('email,role,source,status,created_at,confirmed_at').order('created_at', { ascending: false }).limit(20000);
  const rows = data || [];
  if (new URL(req.url).searchParams.get('csv')) {
    const o = origin(req); const e = v => '"' + String(v ?? '').replace(/"/g, '""') + '"';
    const lines = ['email,role,source,status,created_at,confirmed_at,unsubscribe_url'];
    for (const r of rows.filter(r => r.status === 'active')) lines.push([r.email, r.role, r.source, r.status, r.created_at, r.confirmed_at, `${o}/api/unsubscribe?e=${encodeURIComponent(r.email)}&t=${await sign('unsub:' + r.email)}`].map(e).join(','));
    return new Response('﻿' + lines.join('\n'), { headers: { 'content-type': 'text/csv; charset=utf-8', 'content-disposition': 'attachment; filename="subscribers.csv"' } });
  }
  const by = (k) => rows.filter(r => r.status === 'active').reduce((m, r) => (m[r[k] || '—'] = (m[r[k] || '—'] || 0) + 1, m), {});
  return json({ ok: true, active: rows.filter(r => r.status === 'active').length, pending: rows.filter(r => r.status === 'pending').length, unsub: rows.filter(r => r.status === 'unsubscribed').length, byRole: by('role'), bySource: by('source'), recent: rows.slice(0, 10) });
}
