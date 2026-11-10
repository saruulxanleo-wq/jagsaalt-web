import { db, sign, mail, esc, origin } from '@/lib/server';
import { activateOrder } from '@/lib/orders';
import { decideOwn } from '@/lib/ownDecide';
const page = (SITE_URL, t, ok = true) => new Response(`<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width"><body style="font-family:system-ui;background:#F6F4FF;display:grid;place-items:center;min-height:100vh;margin:0"><div style="background:#fff;padding:40px;border-radius:24px;max-width:420px;text-align:center"><div style="font-size:40px">${ok ? '✓' : '✕'}</div><p style="font-size:18px">${t}</p><a href="${SITE_URL}" style="color:#6A3DF0">brief.mn руу буцах</a></div>`, { headers: { 'content-type': 'text/html; charset=utf-8' } });
export async function GET(req) {
  const SITE_URL = origin(req); const P = (t, ok) => page(SITE_URL, t, ok);
  const q = new URL(req.url).searchParams; const k = q.get('k'), id = q.get('id'), a = q.get('a');
  if (!['claim', 'agency', 'listing', 'influencer', 'order', 'own'].includes(k) || !['approve', 'reject'].includes(a) || q.get('t') !== await sign(`${k}:${id}:${a}`)) return P('Линк буруу байна', false);
  const d = db(); if (!d) return P('Систем тохируулагдаагүй', false);
  const now = new Date().toISOString();
  if (k === 'own') { const r = await decideOwn(d, id, a === 'approve', SITE_URL); return r.error ? P(esc(r.error), false) : P(`«${esc(r.name)}» — ${a === 'approve' ? 'баталгаажлаа, хэрэглэгчид мэдэгдлээ' : 'татгалзлаа'}`); }
  if (k === 'order') {
    if (a === 'reject') { await d.from('orders').update({ status: 'cancelled' }).eq('id', id).eq('status', 'pending'); return P('Захиалга цуцлагдлаа'); }
    const r = await activateOrder(d, id); if (r.error) return P(r.error, false);
    return P(r.already ? `${r.order.code} аль хэдийн идэвхжсэн` : `${r.order.code} идэвхжлээ: ${esc(r.order.target_name)}`);
  }
  if (k === 'influencer') {
    const { data: l } = await d.from('influencers').update({ status: a === 'approve' ? 'approved' : 'rejected', updated_at: now }).eq('id', id).select('name').single();
    return P(`«${esc(l?.name)}» ${a === 'approve' ? 'нийтлэгдлээ' : 'татгалзлаа'}`);
  }
  if (k === 'listing') {
    const { data: l } = await d.from('listings').update({ status: a === 'approve' ? 'approved' : 'rejected', updated_at: now }).eq('id', id).select('name').single();
    return P(`«${esc(l?.name)}» ${a === 'approve' ? 'нийтлэгдлээ' : 'татгалзлаа'}`);
  }
  if (k === 'agency') {
    const { data: ag } = await d.from('agencies').update({ status: a === 'approve' ? 'approved' : 'rejected', updated_at: now }).eq('id', id).select('name').single();
    return P(`«${esc(ag?.name)}» ${a === 'approve' ? 'жагсаалтад нэмэгдлээ' : 'татгалзлаа'}`);
  }
  const { data: c } = await d.from('claims').select('id,status,user_id,agency_id,agencies(name,slug)').eq('id', id).single();
  if (!c) return P('Хүсэлт олдсонгүй', false);
  if (c.status !== 'pending') return P(`Энэ хүсэлтийг өмнө нь шийдсэн (${c.status})`);
  const { data: { user } } = await d.auth.admin.getUserById(c.user_id);
  if (a === 'approve') {
    const { error } = await d.from('agency_members').insert({ agency_id: c.agency_id, user_id: c.user_id, role: 'owner' });
    if (error) return P('Батлах боломжгүй: хэрэглэгч өөр агентлагтай эсвэл агентлаг өөр эзэнтэй', false);
    await d.from('agencies').update({ verified: true, verified_at: now, status: 'approved', updated_at: now }).eq('id', c.agency_id);
  }
  await d.from('claims').update({ status: a === 'approve' ? 'approved' : 'rejected', decided_at: now }).eq('id', id);
  if (user?.email) await mail(user.email, a === 'approve' ? `«${c.agencies.name}» баталгаажлаа` : `«${c.agencies.name}» хүсэлтийн хариу`,
    a === 'approve' ? `<p>Сайн уу! «<b>${esc(c.agencies.name)}</b>» агентлагийг удирдах эрх чинь баталгаажлаа. Одоо профайлаа засаж болно.</p><p><a href="${SITE_URL}/minii">Миний самбар →</a></p>`
      : `<p>Сайн уу! «${esc(c.agencies.name)}» агентлагийг эзэмших хүсэлтийг баталгаажуулж чадсангүй. Асуух зүйл байвал энэ и-мэйлд хариу бичээрэй.</p>`);
  return P(`«${esc(c.agencies.name)}» — ${a === 'approve' ? 'баталгаажлаа, хэрэглэгчид мэдэгдлээ' : 'татгалзлаа'}`);
}
