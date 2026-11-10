import { db, fail, json, authUser, isAdmin } from '@/lib/server';
// Админы хонхонд: сүүлд харснаас хойш шинээр ирсэн зүйлс (тоо + сүүлийн хэдэн мөр).
const SRC = [
  ['agencies', 'Шинэ агентлаг', q => q.eq('status', 'pending'), 'name'],
  ['listings', 'Шинэ жагсаалт', q => q.eq('status', 'pending'), 'name'],
  ['influencers', 'Шинэ инфлүэнсер', q => q.eq('status', 'pending'), 'name'],
  ['claims', 'Агентлаг эзэмших хүсэлт', q => q.eq('status', 'pending'), 'note'],
  ['item_claims', 'Эзэмших хүсэлт', q => q.eq('status', 'pending'), 'kind'],
  ['leads', 'Үнийн санал / лийд', q => q, 'name'],
  ['orders', 'Захиалга', q => q, 'target_name'],
  ['reports', 'Алдааны мэдээлэл', q => q.eq('resolved', false), 'message'],
  ['subscribers', 'Имэйл бүртгэл', q => q, 'role'],
  ['profiles', 'Шинэ хэрэглэгч', q => q, 'full_name'],
];
export async function GET(req) {
  const d = db(); if (!d) return fail('Систем тохируулагдаж байна', 503);
  const u = await authUser(req, d); if (!isAdmin(u)) return fail('Зөвхөн админ', 403);
  const since = new Date(Number(new URL(req.url).searchParams.get('since')) || Date.now() - 7 * 864e5).toISOString();
  const res = await Promise.all(SRC.map(async ([t, label, f, col]) => {
    const { data, count } = await f(d.from(t).select('created_at,' + col, { count: 'exact' }).gt('created_at', since)).order('created_at', { ascending: false }).limit(3);
    return { t, label, n: count || 0, items: (data || []).map(r => ({ at: r.created_at, text: String(r[col] || '').slice(0, 60) })) };
  }));
  const groups = res.filter(r => r.n);
  return json({ ok: true, total: groups.reduce((s, g) => s + g.n, 0), groups });
}
