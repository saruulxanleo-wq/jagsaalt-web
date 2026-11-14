import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_PUBLISHABLE } from './config';
import { statsOf } from './reviews';
import { rankScore } from './config';
// Нийтийн датаг isolate бүрт 60 секунд санах (Supabase руу хүсэлт бүрт очихгүй). Алдаа гарвал кэшлэхгүй.
const C = new Map();
export function memo(key, fn, ttl = 60e3) {
  const h = C.get(key); if (h && Date.now() - h.t < ttl) return h.p;
  const p = fn(); C.set(key, { t: Date.now(), p }); p.catch(() => C.delete(key)); return p;
}
export const pub = () => createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE, { auth: { persistSession: false } });
export const admin = () => {
  const k = process.env.SUPABASE_SECRET_KEY;
  if (!k) throw new Error('SUPABASE_SECRET_KEY тохируулаагүй байна');
  return createClient(SUPABASE_URL, k, { auth: { persistSession: false } });
};
export function listAgencies() { return memo('agencies', loadAgencies); }
async function loadAgencies() {
  if (process.env.MOCK) return (await import('./mock.json')).default;
  const { data, error } = await pub().from('agencies')
    .select('id,slug,name,category,categories,fb_url,followers,logo_url,last_post_at,verified,description,team_size,cases,founded,featured_until,packages,services,website,socials,clients,team,phone_public')
    .order('verified', { ascending: false }).order('followers', { ascending: false, nullsFirst: false });
  if (error) throw error;
  const { data: rv } = await pub().from('reviews').select('agency_id,contacted,hired,rating').limit(5000);
  const by = {}; for (const r of rv || []) (by[r.agency_id] ||= []).push(r);
  return data.map(a => by[a.id] ? { ...a, rv: statsOf(by[a.id]) } : a);
}
export function getAgency(slug) { return memo('ag:' + slug, () => loadAgency(slug)); }
async function loadAgency(slug) {
  if (process.env.MOCK) return (await import('./mock.json')).default.find(a => a.slug === slug);
  const { data } = await pub().from('agencies').select('*').eq('slug', slug).maybeSingle();
  if (!data) return data;
  const { data: rv } = await pub().from('reviews').select('id,contacted,hired,rating,comment,author,created_at').eq('agency_id', data.id).order('created_at', { ascending: false });
  return rv?.length ? { ...data, rv: statsOf(rv), reviews: rv.filter(r => r.comment) } : data;
}
const LCOLS = 'id,type,name,maker,description,price,url,logo_url,topics,sponsored,sponsored_until,created_at,verified,starts_at,schedule';
export async function listListings(type) {
  if (process.env.MOCK) { const all = (await import('./mock_listings.json')).default; return type ? all.filter(l => l.type === type) : all; }
  const all = await memo('listings', loadListings);
  return type ? all.filter(l => l.type === type) : all;
}
async function loadListings() {
  const { data, error } = await pub().from('listings').select(LCOLS).eq('status', 'approved').order('sponsored', { ascending: false }).order('created_at', { ascending: false });
  if (error) throw error;
  const now = new Date();
  return data.map(l => ({ ...l, sponsored: l.sponsored || (!!l.sponsored_until && new Date(l.sponsored_until) > now) })).sort((a, b) => b.sponsored - a.sponsored);
}
export async function getListing(id) {
  if (!/^[0-9a-f-]{36}$/.test(id || '')) return null;
  if (process.env.MOCK) return (await import('./mock_listings.json')).default.find(l => l.id === id) || null;
  const { data } = await pub().from('listings').select(LCOLS).eq('id', id).eq('status', 'approved').maybeSingle();
  if (!data) return null;
  return { ...data, sponsored: data.sponsored || (!!data.sponsored_until && new Date(data.sponsored_until) > new Date()) };
}
const ICOLS = 'id,slug,name,bio,photo_url,niches,ig,ig_followers,fb_url,fb_followers,tiktok,tiktok_followers,youtube,yt_followers,reach,verified,dm_url,badge,created_at';
export function listInfluencers() { return memo('influencers', loadInfluencers).catch(() => []); }
async function loadInfluencers() {
  if (process.env.MOCK) return (await import('./mock_influencers.json')).default;
  let { data, error } = await pub().from('influencers').select(ICOLS).eq('status', 'approved').order('reach', { ascending: false }).limit(1000);
  if (error) ({ data, error } = await pub().from('influencers').select(ICOLS.replace(',badge', '')).eq('status', 'approved').order('reach', { ascending: false }).limit(1000)); // migration_partner.sql ажиллаагүй үед
  if (error) throw error;
  return data;
}

export function listJobs() { return memo('jobs', loadJobs); }
async function loadJobs() {
  const { data } = await pub().from('jobs').select('id,kind,title,company,description,location,budget,contact,url,deadline,topics,created_at').eq('status', 'approved').order('created_at', { ascending: false }).limit(200);
  const today = new Date().toISOString().slice(0, 10), old = Date.now() - 75 * 864e5;
  return (data || []).filter(j => (j.deadline ? j.deadline >= today : new Date(j.created_at) > old));
}

// Нүүр/жагсаалтын картанд хэрэгтэй талбарууд л (баг, кейс, сошиал гэх мэт хөтөч рүү очихгүй)
export const slimAgencies = list => list.map(a => ({ slug: a.slug, name: a.name, category: a.category, categories: a.categories, logo_url: a.logo_url, description: a.description,
  verified: a.verified, featured_until: a.featured_until, last_post_at: a.last_post_at, team_size: a.team_size, followers: a.followers, founded: a.founded, rv: a.rv,
  cases: (a.cases || []).map(() => 1), packages: (a.packages || []).map(p => ({ type: p.type, min: p.min })), clients: a.clients, services: a.services, _r: rankScore(a) }));
