import { db, fail, json, authUser, pickCats, editableAgency } from '@/lib/server';
import { CATS, TEAM_SIZES } from '@/lib/config';
const str = (v, n) => typeof v === 'string' ? v.trim().slice(0, n) : '';
const url = v => { const w = str(v, 200); return !w ? '' : /^https?:\/\//.test(w) ? w : 'https://' + w; };
export async function POST(req) {
  const d = db(); if (!d) return fail('Систем тохируулагдаж байна', 503);
  const u = await authUser(req, d); if (!u) return fail('Нэвтрээгүй байна', 401);
  const b = await req.json().catch(() => ({}));
  const ag = await editableAgency(d, u, b.slug); if (!ag) return fail('Чамд засах эрх алга', 403);
  const up = { updated_at: new Date().toISOString() };
  if ('description' in b) up.description = str(b.description, 400) || null;
  if ('website' in b) up.website = url(b.website) || null;
  if ('phone_public' in b) up.phone_public = String(b.phone_public || '').replace(/[^\d+ ]/g, '').slice(0, 20) || null;
  if (Array.isArray(b.services)) up.services = b.services.map(s => str(String(s), 40)).filter(Boolean).slice(0, 12);
  if (b.categories) { const c = pickCats(b.categories); if (!c || !c.every(k => CATS[k])) return fail('1-3 ангилал сонго'); up.categories = c; up.category = c[0]; }
  if ('founded' in b) { const y = parseInt(b.founded, 10); up.founded = y >= 1990 && y <= new Date().getFullYear() ? y : null; }
  if ('team_size' in b) up.team_size = TEAM_SIZES.includes(b.team_size) ? b.team_size : null;
  if ('min_budget' in b) up.min_budget = str(b.min_budget, 40) || null;
  if (b.socials && typeof b.socials === 'object') {
    const s = {}; for (const k of ['instagram', 'linkedin', 'tiktok', 'youtube']) { const v = url(b.socials[k]); if (v) s[k] = v; }
    const e = str(b.socials.email, 100); if (/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e)) s.email = e;
    up.socials = s;
  }
  if (Array.isArray(b.clients)) up.clients = b.clients.map(s => str(String(s), 40)).filter(Boolean).slice(0, 30);
  if (Array.isArray(b.cases)) up.cases = b.cases.slice(0, 6).map(c => ({ title: str(c.title, 80), client: str(c.client, 60), result: str(c.result, 200), link: url(c.link) })).filter(c => c.title);
  if (Array.isArray(b.team)) up.team = b.team.slice(0, 12).map(m => ({ name: str(m.name, 60), role: str(m.role, 60) })).filter(m => m.name);
  const { error } = await d.from('agencies').update(up).eq('id', ag.id);
  if (error) return fail('Хадгалж чадсангүй: ' + error.message, 500);
  return json({ ok: true, slug: ag.slug });
}
