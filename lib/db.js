import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_PUBLISHABLE } from './config';
export const pub = () => createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE, { auth: { persistSession: false } });
export const admin = () => {
  const k = process.env.SUPABASE_SECRET_KEY;
  if (!k) throw new Error('SUPABASE_SECRET_KEY тохируулаагүй байна');
  return createClient(SUPABASE_URL, k, { auth: { persistSession: false } });
};
export async function listAgencies() {
  if (process.env.MOCK) return (await import('./mock.json')).default;
  const { data, error } = await pub().from('agencies')
    .select('slug,name,category,categories,fb_url,followers,logo_url,last_post_at,verified,description,team_size,cases,founded,featured_until,packages')
    .order('verified', { ascending: false }).order('followers', { ascending: false, nullsFirst: false });
  if (error) throw error;
  return data;
}
export async function getAgency(slug) {
  if (process.env.MOCK) return (await import('./mock.json')).default.find(a => a.slug === slug);
  const { data } = await pub().from('agencies').select('*').eq('slug', slug).maybeSingle();
  return data;
}
const LCOLS = 'id,type,name,maker,description,price,url,logo_url,topics,sponsored,sponsored_until,created_at,verified';
export async function listListings(type) {
  if (process.env.MOCK) { const all = (await import('./mock_listings.json')).default; return type ? all.filter(l => l.type === type) : all; }
  let q = pub().from('listings').select(LCOLS).eq('status', 'approved').order('sponsored', { ascending: false }).order('created_at', { ascending: false });
  if (type) q = q.eq('type', type);
  const { data, error } = await q; if (error) return [];
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
export async function listInfluencers() {
  if (process.env.MOCK) return (await import('./mock_influencers.json')).default;
  let { data, error } = await pub().from('influencers').select(ICOLS).eq('status', 'approved').order('reach', { ascending: false }).limit(1000);
  if (error) ({ data, error } = await pub().from('influencers').select(ICOLS.replace(',badge', '')).eq('status', 'approved').order('reach', { ascending: false }).limit(1000)); // migration_partner.sql ажиллаагүй үед
  return error ? [] : data;
}
