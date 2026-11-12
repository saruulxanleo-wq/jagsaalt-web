import { db, fail, json, authUser, partnerRole } from '@/lib/server';
import { PSTATUS, PARTNER, NICHES } from '@/lib/config';
const LF = 'pstatus,deal_amount,paid_at,pnote';
const IF = ['name', 'bio', 'niches', 'ig', 'ig_followers', 'fb_url', 'fb_followers', 'tiktok', 'tiktok_followers', 'youtube', 'yt_followers'];
const num = v => v === '' || v == null ? null : Math.max(0, Math.round(Number(String(v).replace(/[^\d.]/g, '')))) || null;
const txt = (v, n) => { const t = String(v ?? '').trim().slice(0, n); return t || null; };
// Самбарын үйлдэл бүрийг partner_log-д бичнэ (гэрээний 4.4.4)
export async function POST(req) {
  const d = db(); if (!d) return fail('Систем тохируулагдаж байна', 503);
  const u = await authUser(req, d); const role = await partnerRole(d, u);
  if (!role) return fail('Эрх байхгүй', 403);
  const b = await req.json().catch(() => ({}));
  const log = (action, kind, target, label, before, after) => d.from('partner_log').insert({ actor: u.email, action, kind, target: String(target), label, before, after });

  if (b.kind === 'lead') {
    const { data: l } = await d.from('leads').select('id,name,answers,' + LF).eq('id', b.id).maybeSingle();
    if (!l || l.answers?.source !== 'influencer') return fail('Хүсэлт олдсонгүй', 404);
    const s = b.set || {}, up = {};
    if ('pstatus' in s) { if (!PSTATUS[s.pstatus]) return fail('Төлөв буруу'); up.pstatus = s.pstatus; }
    if ('deal_amount' in s) up.deal_amount = num(s.deal_amount);
    if ('paid_at' in s) { if (s.paid_at && !/^\d{4}-\d{2}-\d{2}$/.test(s.paid_at)) return fail('Огноо буруу'); up.paid_at = s.paid_at || null; }
    if ('pnote' in s) up.pnote = txt(s.pnote, 1000);
    const before = Object.fromEntries(Object.keys(up).map(k => [k, l[k]]));
    up.pupdated_at = new Date().toISOString();
    const { error } = await d.from('leads').update(up).eq('id', l.id); if (error) return fail('Хадгалж чадсангүй', 500);
    await log('lead_update', 'lead', l.id, l.name, before, up);
    return json({ ok: true });
  }

  if (b.kind === 'inf') {
    const { data: x } = await d.from('influencers').select('id,name,status,badge,owner_id,' + IF.join(',')).eq('id', b.id).maybeSingle();
    if (!x) return fail('Профайл олдсонгүй', 404);
    let up = {};
    const ST = { approve: 'approved', reject: 'rejected', hide: 'hidden', show: 'approved' };
    if (ST[b.op]) up.status = ST[b.op];
    else if (b.op === 'badge_on') up.badge = PARTNER.key;
    else if (b.op === 'badge_off') up.badge = null;
    else if (b.op === 'edit') {
      if (x.owner_id && role !== 'admin') return fail('Эзэнтэй (баталгаажсан) профайлыг эзнийх нь зөвшөөрөлгүй засахгүй', 403);
      const s = b.set || {};
      for (const k of IF) if (k in s) up[k] = k === 'niches' ? (Array.isArray(s.niches) ? s.niches.filter(n => NICHES[n]).slice(0, 3) : x.niches) : /_followers$/.test(k) ? num(s[k]) : txt(s[k], k === 'bio' ? 300 : 200);
      if ('name' in up && !up.name) return fail('Нэр хоосон байж болохгүй');
    } else return fail('Үйлдэл буруу');
    const before = Object.fromEntries(Object.keys(up).map(k => [k, x[k]]));
    up.updated_at = new Date().toISOString();
    const { error } = await d.from('influencers').update(up).eq('id', x.id); if (error) return fail('Хадгалж чадсангүй: ' + error.message, 500);
    await log('inf_' + b.op, 'inf', x.id, x.name, before, up);
    return json({ ok: true });
  }

  // Доорх үйлдлүүд зөвхөн brief.mn-ийн админд
  if (role !== 'admin') return fail('Зөвхөн brief.mn-ийн админ', 403);
  if (b.kind === 'undo') {
    const { data: g } = await d.from('partner_log').select('*').eq('id', b.id).maybeSingle();
    if (!g || g.undone || !g.before) return fail('Буцаах боломжгүй');
    const tbl = g.kind === 'lead' ? 'leads' : g.kind === 'inf' ? 'influencers' : null; if (!tbl) return fail('Буцаах боломжгүй');
    const { error } = await d.from(tbl).update(g.before).eq('id', g.target); if (error) return fail('Буцааж чадсангүй', 500);
    await d.from('partner_log').update({ undone: true }).eq('id', g.id);
    await log('undo', g.kind, g.target, g.label, g.after, g.before);
    return json({ ok: true });
  }
  if (b.kind === 'partner') {
    const email = String(b.email || '').trim().toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return fail('Имэйл буруу');
    if (b.op === 'add') {
      const { count } = await d.from('partner_access').select('email', { count: 'exact', head: true });
      if ((count || 0) >= 3) return fail('Гэрээгээр хамгийн ихдээ 3 хэрэглэгч');
      const { error } = await d.from('partner_access').upsert({ email, scope: 'influencer' }); if (error) return fail('Нэмж чадсангүй', 500);
    } else if (b.op === 'remove') await d.from('partner_access').delete().eq('email', email);
    else return fail('Үйлдэл буруу');
    await log('access_' + b.op, 'access', email, email, null, null);
    return json({ ok: true });
  }
  return fail('Үйлдэл буруу');
}
