import { db, fail, json, authUser, partnerRole } from '@/lib/server';
export const dynamic = 'force-dynamic';
// Инфлүэнсерийн самбар: зөвхөн инфлүэнсерийн хүсэлт, профайл, үйлдлийн түүх
export async function GET(req) {
  const d = db(); if (!d) return fail('Систем тохируулагдаж байна', 503);
  const u = await authUser(req, d); const role = await partnerRole(d, u);
  if (!role) return fail(u ? `${u.email} хаягт энэ самбарын эрх байхгүй` : 'Нэвтэрнэ үү', 403);
  const [leads, infs, log, parts] = await Promise.all([
    d.from('leads').select('id,name,phone,email,company,note,answers,created_at,pstatus,deal_amount,paid_at,pnote,pupdated_at').eq('answers->>source', 'influencer').order('created_at', { ascending: false }).limit(500),
    d.from('influencers').select('id,slug,name,bio,photo_url,niches,ig,ig_followers,fb_url,fb_followers,tiktok,tiktok_followers,youtube,yt_followers,reach,status,verified,badge,created_at').order('created_at', { ascending: false }).limit(2000),
    d.from('partner_log').select('*').order('created_at', { ascending: false }).limit(300),
    role === 'admin' ? d.from('partner_access').select('email,added_at').order('added_at') : Promise.resolve({ data: null }),
  ]);
  if (leads.error || infs.error) return fail('Өгөгдөл уншиж чадсангүй: ' + (leads.error || infs.error).message, 500);
  return json({ role, email: u.email, leads: leads.data, influencers: infs.data, log: log.data || [], partners: parts.data });
}
