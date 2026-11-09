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
    .select('slug,name,category,fb_url,followers,logo_url,last_post_at,verified,description')
    .order('verified', { ascending: false }).order('followers', { ascending: false, nullsFirst: false });
  if (error) throw error;
  return data;
}
export async function getAgency(slug) {
  if (process.env.MOCK) return (await import('./mock.json')).default.find(a => a.slug === slug);
  const { data } = await pub().from('agencies').select('*').eq('slug', slug).maybeSingle();
  return data;
}
