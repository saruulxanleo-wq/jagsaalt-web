import { db, fail, json, authUser, isAdmin } from '@/lib/server';
import { ownCode } from '@/lib/owners';
import { sendDueSurveys } from '@/lib/survey';
import { after } from 'next/server';
export async function GET(req) {
  const d = db(); if (!d) return fail('Систем тохируулагдаж байна', 503);
  const u = await authUser(req, d); if (!isAdmin(u)) return fail('Зөвхөн админ', 403);
  const o = process.env.SITE_URL || new URL(req.url).origin;
  after(() => sendDueSurveys(d, o).catch(() => 0));
  if (new URL(req.url).searchParams.get('stats')) return json(await stats(d));
  // Бүгдийг зэрэг асууна (өмнө нь ~20 дараалсан асуулт байсан). 30 хоногийн статистикийг ?stats=1 тусад нь.
  const since = new Date(Date.now() - 120 * 864e5).toISOString(), since14 = new Date(Date.now() - 14 * 864e5).toISOString();
  const [{ data: pending }, { data: claims }, { data: reports }, { count: total }, { data: listings }, { data: infp }, { data: orders }, { data: leads }, { data: icl },
    { data: lagS }, { data: lclA }, { data: licA }, { data: lrep }, { data: linf }, { data: llst }, { data: lord }, { data: nusers }, { data: nmem }, { data: lrev }, { data: ljob }] = await Promise.all([
    d.from('agencies').select('id,slug,name,fb_url,categories,category,added_by,created_at').eq('status', 'pending').order('created_at', { ascending: false }),
    d.from('claims').select('id,note,phone,created_at,status,user_id,agencies(name,slug,fb_url)').eq('status', 'pending').not('user_id', 'is', null).order('created_at', { ascending: false }),
    d.from('reports').select('id,message,created_at,agencies(name,slug)').eq('resolved', false).order('created_at', { ascending: false }).limit(50),
    d.from('agencies').select('id', { count: 'exact', head: true }).eq('status', 'approved'),
    d.from('listings').select('id,type,name,maker,description,price,url,topics,status,sponsored,contact,created_at,verified').neq('status', 'rejected').order('created_at', { ascending: false }),
    d.from('influencers').select('id,name,fb_url,ig,tiktok,youtube,niches,bio,contact,fb_followers,ig_followers,tiktok_followers,created_at').eq('status', 'pending').order('created_at', { ascending: false }),
    d.from('orders').select('id,code,product,target_name,months,amount,contact,status,created_at,paid_at').in('status', ['pending', 'paid']).order('created_at', { ascending: false }).limit(60),
    d.from('leads').select('*').order('created_at', { ascending: false }).limit(500),
    d.from('item_claims').select('*').eq('status', 'pending').order('created_at', { ascending: false }),
    d.from('agencies').select('id,slug,name,fb_url,categories,category,added_by,status,created_at,updated_at').in('added_by', ['user', 'owner']).gte('created_at', since).order('created_at', { ascending: false }),
    d.from('claims').select('id,note,phone,created_at,decided_at,status,user_id,agencies(name,slug,fb_url)').not('user_id', 'is', null).gte('created_at', since).order('created_at', { ascending: false }),
    d.from('item_claims').select('*').gte('created_at', since).order('created_at', { ascending: false }),
    d.from('reports').select('id,message,created_at,resolved,agencies(name,slug)').gte('created_at', since).order('created_at', { ascending: false }).limit(200),
    d.from('influencers').select('id,name,fb_url,ig,tiktok,youtube,niches,bio,contact,fb_followers,ig_followers,tiktok_followers,status,created_at,updated_at').gte('created_at', since).order('created_at', { ascending: false }),
    d.from('listings').select('id,type,name,maker,description,price,url,topics,status,contact,created_at,updated_at').gte('created_at', since).order('created_at', { ascending: false }),
    d.from('orders').select('id,code,product,target_name,months,amount,contact,status,created_at,paid_at').gte('created_at', since).order('created_at', { ascending: false }).limit(200),
    d.from('profiles').select('id,email,full_name,phone,created_at').gte('created_at', since14).order('created_at', { ascending: false }).limit(300),
    d.from('agency_members').select('agency_id,user_id,created_at,agencies(name,slug)').gte('created_at', since14).order('created_at', { ascending: false }).limit(200),
    d.from('reviews').select('id,contacted,hired,rating,draft,comment,author,status,created_at,updated_at,agencies(name,slug)').gte('created_at', since).order('created_at', { ascending: false }).limit(300),
    d.from('jobs').select('*').gte('created_at', since).order('created_at', { ascending: false }).limit(300),
  ]);
  // Хоёр дахь давалгаа: холбоотой нэр, профайлуудыг нэг дор (нэг мөр бүрт тусад нь асуухгүй)
  const allIc = [...(icl || []), ...(licA || [])];
  const lIds = [...new Set(allIc.filter(c => c.kind === 'listing').map(c => c.item_id))], iIds = [...new Set(allIc.filter(c => c.kind !== 'listing').map(c => c.item_id))];
  const lslugs = [...new Set((leads || []).flatMap(l => l.agencies || []))];
  const uids = [...new Set([...(claims || []), ...(icl || []), ...(lclA || []), ...(licA || []), ...(nmem || [])].map(c => c.user_id).filter(Boolean))];
  const [{ data: itL }, { data: itI }, { data: lags }, { data: profs }] = await Promise.all([
    lIds.length ? d.from('listings').select('id,name,type,url').in('id', lIds) : { data: [] },
    iIds.length ? d.from('influencers').select('id,name,fb_url,ig').in('id', iIds) : { data: [] },
    lslugs.length ? d.from('agencies').select('id,slug,name,fb_url').in('slug', lslugs) : { data: [] },
    uids.length ? d.from('profiles').select('id,email,full_name').in('id', uids) : { data: [] },
  ]);
  const itemOf = c => { const it = ((c.kind === 'listing' ? itL : itI) || []).find(x => x.id === c.item_id); if (!it) return null; const { id, ...rest } = it; return rest; };
  const { data: lmem } = (lags || []).length ? await d.from('agency_members').select('agency_id').in('agency_id', lags.map(a => a.id)) : { data: [] };
  const owned = new Set((lmem || []).map(m => m.agency_id));
  const leadAgencies = Object.fromEntries((lags || []).map(a => [a.slug, { name: a.name, fb_url: a.fb_url, owned: owned.has(a.id) }]));
  const ownClaims = await Promise.all((icl || []).map(async c => ({ ...c, item: itemOf(c), code: await ownCode(c.user_id, c.kind, c.item_id) })));
  const licItems = (licA || []).map(c => ({ ...c, item: itemOf(c) }));
  const pm = Object.fromEntries((profs || []).map(p => [p.id, p]));
  const noBulk = rows => { const c = {}; (rows || []).forEach(r => { const k = String(r.created_at).slice(0, 16); c[k] = (c[k] || 0) + 1; }); return (rows || []).filter(r => c[String(r.created_at).slice(0, 16)] < 4); };
  const log = { reviews: lrev || [], jobs: ljob || [], users: nusers || [], members: (nmem || []).map(m => ({ ...m, user: pm[m.user_id] || null })), agencies: lagS || [], claims: (lclA || []).map(c => ({ ...c, user: pm[c.user_id] || null })), itemClaims: licItems.map(c => ({ ...c, user: pm[c.user_id] || null })), reports: lrep || [], influencers: noBulk(linf), listings: noBulk(llst), orders: lord || [] };
  return json({ leadAgencies, log, orders: orders || [], infPending: infp || [], infTop: [], listings: (listings || []).map(l => ({ ...l, clicks: 0 })), leads: leads || [], top: [], totalViews: null, totalClicks: null, total, pending: pending || [], claims: (claims || []).map(c => ({ ...c, user: pm[c.user_id] || null })), ownClaims: ownClaims.map(c => ({ ...c, user: pm[c.user_id] || null })), reports: reports || [] });
}

// 30 хоногийн үзэлт, дарсан тоо (event-үүд их тул тусад нь, хуудас нээгдсэний дараа ачаална)
async function stats(d) {
  const t30 = new Date(Date.now() - 30 * 864e5).toISOString();
  const [{ data: ev }, { data: lev }, { data: iev }] = await Promise.all([
    d.from('events').select('kind,agency_id').not('agency_id', 'is', null).gte('created_at', t30).limit(50000),
    d.from('events').select('listing_id').not('listing_id', 'is', null).gte('created_at', t30).limit(50000),
    d.from('events').select('influencer_id').not('influencer_id', 'is', null).gte('created_at', t30).limit(50000),
  ]);
  const agg = {}; for (const e of ev || []) { const a = agg[e.agency_id] ||= { views: 0, clicks: 0 }; e.kind === 'view' ? a.views++ : a.clicks++; }
  const topIds = Object.entries(agg).sort((x, y) => y[1].views - x[1].views).slice(0, 15).map(([id]) => id);
  const lc = {}; for (const e of lev || []) lc[e.listing_id] = (lc[e.listing_id] || 0) + 1;
  const ic = {}; for (const e of iev || []) ic[e.influencer_id] = (ic[e.influencer_id] || 0) + 1;
  const iTop = Object.entries(ic).sort((x, y) => y[1] - x[1]).slice(0, 15).map(([id]) => id);
  const [{ data: topAg }, { data: itop }] = await Promise.all([
    topIds.length ? d.from('agencies').select('id,name,slug').in('id', topIds) : { data: [] },
    iTop.length ? d.from('influencers').select('id,name,slug').in('id', iTop) : { data: [] },
  ]);
  return { ok: true, lc, top: topIds.map(id => ({ ...(topAg || []).find(a => a.id === id), ...agg[id] })).filter(a => a.slug),
    totalViews: Object.values(agg).reduce((s, a) => s + a.views, 0), totalClicks: Object.values(agg).reduce((s, a) => s + a.clicks, 0),
    infTop: (itop || []).map(x => ({ ...x, clicks: ic[x.id] })).sort((a, b) => b.clicks - a.clicks) };
}
