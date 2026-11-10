import { db, fail, json, authUser, getProfile, isAdmin, editableAgency } from '@/lib/server';
import { KINDS, parseOwn, ownCode, getItem } from '@/lib/owners';
export async function GET(req) {
  const d = db(); if (!d) return fail('Систем тохируулагдаж байна', 503);
  const u = await authUser(req, d); if (!u) return fail('Нэвтрээгүй байна', 401);
  const p = await getProfile(d, u);
  const q = new URL(req.url).searchParams;
  const [{ data: m }, { data: c }, { data: ls }, { data: infs }, { data: ic }] = await Promise.all([
    d.from('agency_members').select('role, agencies(*)').eq('user_id', u.id).maybeSingle(),
    d.from('claims').select('id,status,created_at,agencies(name,slug)').eq('user_id', u.id).order('created_at', { ascending: false }).limit(1).maybeSingle(),
    d.from('listings').select(KINDS.listing.cols).eq('owner_id', u.id).order('created_at'),
    d.from('influencers').select(KINDS.influencer.cols).eq('owner_id', u.id).order('created_at'),
    d.from('item_claims').select('id,kind,item_id,status,created_at').eq('user_id', u.id).eq('status', 'pending'),
  ]);
  // Хүлээгдэж буй хүсэлтүүдийн нэр
  const pend = await Promise.all((ic || []).map(async x => ({ ...x, name: (await getItem(d, x.kind, x.item_id))?.name || '—' })));
  // ?own=listing:<id> — эзэмших гэж буй зүйл, баталгаажуулах код
  let own = null; const t = parseOwn(q.get('own'));
  if (t) { const it = await getItem(d, t.kind, t.id); if (it) own = { kind: t.kind, id: t.id, name: it.name, type: it.type || 'influencer', url: it.url || it.fb_url || (it.ig && 'https://www.instagram.com/' + it.ig) || '', taken: !!it.owner_id && it.owner_id !== u.id, mine: it.owner_id === u.id, code: await ownCode(u.id, t.kind, t.id) }; }
  const edit = q.get('edit');
  const editAgency = edit && isAdmin(u) ? await editableAgency(d, u, edit) : null;
  return json({ is_admin: isAdmin(u), edit_agency: editAgency, email: u.email, name: p.full_name, phone: p.phone, phone_verified: !!p.phone_verified_at, agency: m?.agencies || null, claim: c || null,
    listings: ls || [], influencers: infs || [], item_claims: pend, own });
}
