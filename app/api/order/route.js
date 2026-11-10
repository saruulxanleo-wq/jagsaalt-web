import { db, fail, json, authUser, editableAgency, mail, ADMIN_EMAIL, decideLink, esc, btn, origin } from '@/lib/server';
import { PRODUCTS, priceFor, fmtMnt, LEAD_MAX } from '@/lib/config';
import { score } from '@/lib/match';
import { bank } from '@/lib/orders';
import { qpayOn, createInvoice } from '@/lib/qpay';
import { sign } from '@/lib/server';
const code = () => 'J' + Array.from(crypto.getRandomValues(new Uint8Array(5)), b => 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[b % 32]).join('');
// Захиалга үүсгэнэ → дансны мэдээлэл + гүйлгээний утга буцаана, админд имэйл
export async function POST(req) {
  const d = db(); if (!d) return fail('Систем тохируулагдаж байна', 503);
  const b = await req.json().catch(() => ({}));
  const P = PRODUCTS[b.product]; if (!P) return fail('Бүтээгдэхүүн буруу');
  const months = P.monthly ? (b.months === 3 ? 3 : 1) : 1;
  const u = await authUser(req, d);
  let row = { product: b.product, months, amount: priceFor(b.product, months), user_id: u?.id || null, contact: String(b.contact || '').trim().slice(0, 100) || u?.email || null };
  if (b.product === 'agency_featured') {
    if (!u) return fail('Нэвтэрнэ үү', 401);
    const ag = await editableAgency(d, u, b.slug); if (!ag) return fail('Танд эзэмшдэг агентлаг алга');
    Object.assign(row, { target_id: ag.id, target_name: ag.name, agency_id: ag.id });
  } else if (b.product === 'listing_sponsor') {
    const { data: l } = await d.from('listings').select('id,name,status').eq('id', String(b.target || '')).maybeSingle();
    if (!l || l.status !== 'approved') return fail('Хэрэгслээ сонгоно уу');
    if (!row.contact) return fail('Холбоо барих утас эсвэл и-мэйлээ бичнэ үү');
    Object.assign(row, { target_id: l.id, target_name: l.name });
  } else {
    if (!u) return fail('Нэвтэрнэ үү', 401);
    const ag = await editableAgency(d, u); if (!ag) return fail('Агентлагаа эзэмшсэн байх шаардлагатай');
    const { data: lead } = await d.from('leads').select('id,answers,created_at').eq('id', String(b.target || '')).maybeSingle();
    if (!lead || !score(ag, lead.answers || {})) return fail('Энэ хүсэлт танд тохирохгүй байна');
    const { data: acc } = await d.from('lead_access').select('agency_id').eq('lead_id', lead.id);
    if ((acc || []).some(x => x.agency_id === ag.id)) return fail('Та энэ хүсэлтийг аль хэдийн авсан');
    if ((acc || []).length >= LEAD_MAX) return fail('Энэ хүсэлтийг 3 агентлаг авсан байна');
    const { data: dup } = await d.from('orders').select('code,amount').eq('product', 'lead').eq('target_id', lead.id).eq('agency_id', ag.id).eq('status', 'pending').maybeSingle();
    if (dup) await d.from('orders').update({ status: 'cancelled' }).eq('code', dup.code);
    Object.assign(row, { target_id: lead.id, target_name: 'Клиентийн хүсэлт ' + lead.created_at.slice(0, 10), agency_id: ag.id });
  }
  row.code = code();
  const { data: o, error } = await d.from('orders').insert(row).select('id').single();
  if (error) return fail('Захиалга үүсгэж чадсангүй', 500);
  const og = origin(req);
  if (qpayOn()) {
    try {
      const inv = await createInvoice({ code: row.code, amount: row.amount, description: `jagsaalt.mn · ${P.label} · ${row.target_name}`, callback: `${og}/api/qpay?code=${row.code}&t=${await sign('qpay:' + row.code)}` });
      await d.from('orders').update({ qpay_invoice_id: inv.invoice_id }).eq('id', o.id);
      return json({ ok: true, code: row.code, amount: row.amount, qpay: inv });
    } catch (e) { console.log('qpay', e.message); /* QPay ажиллахгүй бол дансаар */ }
  }
  await mail(ADMIN_EMAIL(), `Захиалга ${row.code}: ${P.label} · ${fmtMnt(row.amount)}`, `<p><b>${esc(P.label)}</b>${months > 1 ? ` · ${months} сар` : ''}<br>${esc(row.target_name)}<br>Дүн: <b>${fmtMnt(row.amount)}</b><br>Гүйлгээний утга: <b>${row.code}</b><br>Холбоо барих: ${esc(row.contact || '-')}</p><p>Дансандаа ${row.code} утгатай ${fmtMnt(row.amount)} орсныг шалгаад:</p><p>${btn(await decideLink(og, 'order', o.id, 'approve'), 'Төлбөр орсон — идэвхжүүлэх', '#2FB344')}${btn(await decideLink(og, 'order', o.id, 'reject'), 'Цуцлах', '#E8452A')}</p>`);
  return json({ ok: true, code: row.code, amount: row.amount, bank: bank() });
}
