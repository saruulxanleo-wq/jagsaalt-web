import { db, fail, json, mail, ADMIN_EMAIL, esc, origin } from '@/lib/server';
export async function POST(req) {
  const d = db(); if (!d) return fail('Систем тохируулагдаж байна', 503);
  const b = await req.json().catch(() => ({}));
  const msg = String(b.message || '').trim().slice(0, 1000); if (msg.length < 5) return fail('Юу буруу байгааг бичнэ үү');
  const { data: ag } = await d.from('agencies').select('id,name,slug').eq('slug', b.slug || '').maybeSingle(); if (!ag) return fail('Агентлаг олдсонгүй', 404);
  const contact = String(b.contact || '').trim().slice(0, 100);
  await d.from('reports').insert({ agency_id: ag.id, message: contact ? `${msg}\n— ${contact}` : msg });
  await mail(ADMIN_EMAIL(), `Мэдээлэл буруу: ${ag.name}`, `<p><b>${esc(ag.name)}</b> — <a href="${origin(req)}/a/${ag.slug}">профайл</a></p><p>${esc(msg).replace(/\n/g, '<br>')}</p>${contact ? `<p>Холбоо барих: ${esc(contact)}</p>` : ''}<p><a href="${origin(req)}/admin">Админ хуудас →</a></p>`);
  return json({ ok: true });
}
