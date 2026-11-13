import { db, fail, json, authUser, isAdmin } from '@/lib/server';
import { ownCode } from '@/lib/owners';
export async function GET(req) {
  const d = db(); if (!d) return fail('Систем тохируулагдаж байна', 503);
  const u = await authUser(req, d); if (!isAdmin(u)) return fail('Зөвхөн админ', 403);
  const [{ data: pending }, { data: claims }, { data: reports }, { count: total }] = await Promise.all([
    d.from('agencies').select('id,slug,name,fb_url,categories,category,added_by,created_at').eq('status', 'pending').order('created_at', { ascending: false }),
    d.from('claims').select('id,note,phone,created_at,status,user_id,agencies(name,slug,fb_url)').eq('status', 'pending').not('user_id', 'is', null).order('created_at', { ascending: false }),
    d.from('reports').select('id,message,created_at,agencies(name,slug)').eq('resolved', false).order('created_at', { ascending: false }).limit(50),
    d.from('agencies').select('id', { count: 'exact', head: true }).eq('status', 'approved'),
  ]);
  const { data: ev } = await d.from('events').select('kind,agency_id').not('agency_id', 'is', null).gte('created_at', new Date(Date.now() - 30 * 864e5).toISOString()).limit(50000);
  const agg = {}; for (const e of ev || []) { const a = agg[e.agency_id] ||= { views: 0, clicks: 0 }; e.kind === 'view' ? a.views++ : a.clicks++; }
  const topIds = Object.entries(agg).sort((x, y) => y[1].views - x[1].views).slice(0, 15).map(([id]) => id);
  const { data: topAg } = topIds.length ? await d.from('agencies').select('id,name,slug').in('id', topIds) : { data: [] };
  const top = topIds.map(id => ({ ...(topAg || []).find(a => a.id === id), ...agg[id] })).filter(a => a.slug);
  const totalViews = Object.values(agg).reduce((s, a) => s + a.views, 0), totalClicks = Object.values(agg).reduce((s, a) => s + a.clicks, 0);
  const { data: listings } = await d.from('listings').select('id,type,name,maker,description,price,url,topics,status,sponsored,contact,created_at,verified').neq('status', 'rejected').order('created_at', { ascending: false });
  const { data: lev } = await d.from('events').select('listing_id').not('listing_id', 'is', null).gte('created_at', new Date(Date.now() - 30 * 864e5).toISOString()).limit(50000);
  const lc = {}; for (const e of lev || []) lc[e.listing_id] = (lc[e.listing_id] || 0) + 1;
  const { data: infp } = await d.from('influencers').select('id,name,fb_url,ig,tiktok,youtube,niches,bio,contact,fb_followers,ig_followers,tiktok_followers,created_at').eq('status', 'pending').order('created_at', { ascending: false });
  const { data: iev } = await d.from('events').select('influencer_id').not('influencer_id', 'is', null).gte('created_at', new Date(Date.now() - 30 * 864e5).toISOString()).limit(50000);
  const ic = {}; for (const e of iev || []) ic[e.influencer_id] = (ic[e.influencer_id] || 0) + 1;
  const { data: itop } = Object.keys(ic).length ? await d.from('influencers').select('id,name,slug').in('id', Object.keys(ic).slice(0, 200)) : { data: [] };
  const { data: orders } = await d.from('orders').select('id,code,product,target_name,months,amount,contact,status,created_at,paid_at').in('status', ['pending', 'paid']).order('created_at', { ascending: false }).limit(60);
  const { data: leads } = await d.from('leads').select('*').order('created_at', { ascending: false }).limit(500);
  const lslugs = [...new Set((leads || []).flatMap(l => l.agencies || []))];
  const { data: lags } = lslugs.length ? await d.from('agencies').select('id,slug,name,fb_url').in('slug', lslugs) : { data: [] };
  const { data: lmem } = (lags || []).length ? await d.from('agency_members').select('agency_id').in('agency_id', lags.map(a => a.id)) : { data: [] };
  const owned = new Set((lmem || []).map(m => m.agency_id));
  const leadAgencies = Object.fromEntries((lags || []).map(a => [a.slug, { name: a.name, fb_url: a.fb_url, owned: owned.has(a.id) }]));
  const { data: icl } = await d.from('item_claims').select('*').eq('status', 'pending').order('created_at', { ascending: false });
  const ownClaims = await Promise.all((icl || []).map(async c => { const { data: it } = await d.from(c.kind === 'listing' ? 'listings' : 'influencers').select(c.kind === 'listing' ? 'name,type,url' : 'name,fb_url,ig').eq('id', c.item_id).maybeSingle(); return { ...c, item: it, code: await ownCode(c.user_id, c.kind, c.item_id) }; }));
  const ids = [...new Set([...(claims || []), ...ownClaims].map(c => c.user_id))];
  const { data: profs } = ids.length ? await d.from('profiles').select('id,email,full_name').in('id', ids) : { data: [] };
  const pm = Object.fromEntries((profs || []).map(p => [p.id, p]));
  // Лог: сүүлийн 120 хоногийн бүх хүсэлт (шийдэгдсэнийг ч оруулна). Бөөнөөр импортолсныг (нэг минутад 4+) алгасна.
  const since = new Date(Date.now() - 120 * 864e5).toISOString();
  const noBulk = rows => { const c = {}; (rows || []).forEach(r => { const k = String(r.created_at).slice(0, 16); c[k] = (c[k] || 0) + 1; }); return (rows || []).filter(r => c[String(r.created_at).slice(0, 16)] < 4); };
  const [{ data: lagS }, { data: lclA }, { data: licA }, { data: lrep }, { data: linf }, { data: llst }, { data: lord }] = await Promise.all([
    d.from('agencies').select('id,slug,name,fb_url,categories,category,added_by,status,created_at,updated_at').in('added_by', ['user', 'owner']).gte('created_at', since).order('created_at', { ascending: false }),
    d.from('claims').select('id,note,phone,created_at,decided_at,status,user_id,agencies(name,slug,fb_url)').not('user_id', 'is', null).gte('created_at', since).order('created_at', { ascending: false }),
    d.from('item_claims').select('*').gte('created_at', since).order('created_at', { ascending: false }),
    d.from('reports').select('id,message,created_at,resolved,agencies(name,slug)').gte('created_at', since).order('created_at', { ascending: false }).limit(200),
    d.from('influencers').select('id,name,fb_url,ig,tiktok,youtube,niches,bio,contact,fb_followers,ig_followers,tiktok_followers,status,created_at,updated_at').gte('created_at', since).order('created_at', { ascending: false }),
    d.from('listings').select('id,type,name,maker,description,price,url,topics,status,contact,created_at,updated_at').gte('created_at', since).order('created_at', { ascending: false }),
    d.from('orders').select('id,code,product,target_name,months,amount,contact,status,created_at,paid_at').gte('created_at', since).order('created_at', { ascending: false }).limit(200),
  ]);
  const licItems = await Promise.all((licA || []).map(async c => { const { data: it } = await d.from(c.kind === 'listing' ? 'listings' : 'influencers').select(c.kind === 'listing' ? 'name,type,url' : 'name,fb_url,ig').eq('id', c.item_id).maybeSingle(); return { ...c, item: it }; }));
  const lids = [...new Set([...(lclA || []), ...licItems].map(c => c.user_id))].filter(x => !ids.includes(x));
  const { data: lprofs } = lids.length ? await d.from('profiles').select('id,email,full_name').in('id', lids) : { data: [] };
  (lprofs || []).forEach(p => { pm[p.id] = p; });
  // Мэдээлэл: шинэ хэрэглэгч, агентлагт удирдагч нэмэгдсэн (хаб/Telegram мэдэгдэлтэй адил харагдана)
  const since30 = new Date(Date.now() - 14 * 864e5).toISOString();
  const [{ data: nusers }, { data: nmem }] = await Promise.all([
    d.from('profiles').select('id,email,full_name,phone,created_at').gte('created_at', since30).order('created_at', { ascending: false }).limit(300),
    d.from('agency_members').select('agency_id,user_id,created_at,agencies(name,slug)').gte('created_at', since30).order('created_at', { ascending: false }).limit(200),
  ]);
  const mids = [...new Set((nmem || []).map(m => m.user_id))].filter(x => !pm[x]);
  if (mids.length) { const { data: mp } = await d.from('profiles').select('id,email,full_name').in('id', mids); (mp || []).forEach(p => { pm[p.id] = p; }); }
  const log = { users: nusers || [], members: (nmem || []).map(m => ({ ...m, user: pm[m.user_id] || null })), agencies: lagS || [], claims: (lclA || []).map(c => ({ ...c, user: pm[c.user_id] || null })), itemClaims: licItems.map(c => ({ ...c, user: pm[c.user_id] || null })), reports: lrep || [], influencers: noBulk(linf), listings: noBulk(llst), orders: lord || [] };
  return json({ leadAgencies, log, orders: orders || [], infPending: infp || [], infTop: (itop || []).map(x => ({ ...x, clicks: ic[x.id] })).sort((a, b) => b.clicks - a.clicks).slice(0, 15), listings: (listings || []).map(l => ({ ...l, clicks: lc[l.id] || 0 })), leads: leads || [], top, totalViews, totalClicks, total, pending: pending || [], claims: (claims || []).map(c => ({ ...c, user: pm[c.user_id] || null })), ownClaims: ownClaims.map(c => ({ ...c, user: pm[c.user_id] || null })), reports: reports || [] });
}
