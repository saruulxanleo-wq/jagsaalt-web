import { db, fail, json, mail, ADMIN_EMAIL, decideLink, esc, btn, origin } from '@/lib/server';
import { TOPICS } from '@/lib/config';
// Ажлын байр / төслийн зар → pending, админд батлах линктэй и-мэйл
export async function POST(req) {
  const d = db(); if (!d) return fail('Систем тохируулагдаж байна', 503);
  const b = await req.json().catch(() => ({}));
  const s = (v, n) => String(v || '').trim().slice(0, n) || null;
  const title = s(b.title, 100), description = s(b.description, 1500), contact = s(b.contact, 120);
  if (!title || title.length < 4) return fail('Гарчгаа бич');
  if (!description || description.length < 30) return fail('Ажлын тайлбараа дэлгэрэнгүй бич (30+ тэмдэгт)');
  if (!contact) return fail('Холбоо барих утас, и-мэйл эсвэл линкээ бич');
  let url = null; if (b.url) { try { url = new URL(/^https?:\/\//.test(b.url) ? b.url : 'https://' + b.url).toString(); } catch { return fail('Линкээ зөв оруул'); } }
  const deadline = /^\d{4}-\d{2}-\d{2}$/.test(b.deadline || '') ? b.deadline : null;
  const row = { kind: b.kind === 'job' ? 'job' : 'project', title, description, contact, url, deadline, company: s(b.company, 80), location: s(b.location, 60), budget: s(b.budget, 60),
    topics: (Array.isArray(b.topics) ? b.topics : []).filter(t => TOPICS[t]).slice(0, 3) };
  const { data, error } = await d.from('jobs').insert(row).select('id').single();
  if (error) return fail('Хадгалж чадсангүй', 500);
  const o = origin(req);
  await mail(ADMIN_EMAIL(), `Шинэ ${row.kind === 'job' ? 'ажлын байр' : 'төсөл'}: ${title}`, `<p><b>${esc(title)}</b>${row.company ? ' · ' + esc(row.company) : ''}${row.budget ? ' · ' + esc(row.budget) : ''}</p><p style="white-space:pre-wrap">${esc(description)}</p><p>Холбоо: ${esc(contact)}${deadline ? ' · Хугацаа: ' + deadline : ''}</p><p>${btn(await decideLink(o, 'job', data.id, 'approve'), 'Нийтлэх', '#2FB344')}${btn(await decideLink(o, 'job', data.id, 'reject'), 'Татгалзах', '#E8452A')}</p>`);
  return json({ ok: true });
}
