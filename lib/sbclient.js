'use client';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_PUBLISHABLE } from './config';
let c;
export const sb = () => c ||= createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE, { auth: { flowType: 'pkce', detectSessionInUrl: true, persistSession: true } });
export async function api(path, body) {
  let { data } = await sb().auth.getSession();
  if (data.session && (data.session.expires_at || 0) * 1000 < Date.now() + 60e3) { const x = await sb().auth.refreshSession().catch(() => null); if (x?.data?.session) data = x.data; }
  const r = await fetch(path, { method: body ? 'POST' : 'GET', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + (data.session?.access_token || '') }, body: body ? JSON.stringify(body) : undefined });
  return { ok: r.ok, ...(await r.json().catch(() => ({}))) };
}
