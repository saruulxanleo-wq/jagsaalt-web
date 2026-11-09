import { db, fail, json, authUser, getProfile, isAdmin, editableAgency } from '@/lib/server';
export async function GET(req) {
  const d = db(); if (!d) return fail('Систем тохируулагдаж байна', 503);
  const u = await authUser(req, d); if (!u) return fail('Нэвтрээгүй байна', 401);
  const p = await getProfile(d, u);
  const { data: m } = await d.from('agency_members').select('role, agencies(*)').eq('user_id', u.id).maybeSingle();
  const { data: c } = await d.from('claims').select('id,status,created_at,agencies(name,slug)').eq('user_id', u.id).order('created_at', { ascending: false }).limit(1).maybeSingle();
  const edit = new URL(req.url).searchParams.get('edit');
  const editAgency = edit && isAdmin(u) ? await editableAgency(d, u, edit) : null;
  return json({ is_admin: isAdmin(u), edit_agency: editAgency, email: u.email, name: p.full_name, phone: p.phone, phone_verified: !!p.phone_verified_at, agency: m?.agencies || null, claim: c || null });
}
