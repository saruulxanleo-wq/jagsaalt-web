import { db, json, fail } from '@/lib/server';
import { isPaid } from '@/lib/qpay';
import { activateOrder } from '@/lib/orders';
// Хэрэглэгчийн хуудас QPay төлбөр орсон эсэхийг асууна
export async function GET(req) {
  const code = (new URL(req.url).searchParams.get('code') || '').slice(0, 10);
  const d = db(); if (!d) return fail('Систем', 503);
  const { data: o } = await d.from('orders').select('id,status,amount,qpay_invoice_id').eq('code', code).maybeSingle();
  if (!o) return fail('Олдсонгүй', 404);
  if (o.status === 'pending' && o.qpay_invoice_id && await isPaid(o.qpay_invoice_id, o.amount).catch(() => false)) { await activateOrder(d, o.id); return json({ ok: true, status: 'paid' }); }
  return json({ ok: true, status: o.status });
}
