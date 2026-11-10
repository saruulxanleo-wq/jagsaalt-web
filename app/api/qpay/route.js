import { db, json, sign } from '@/lib/server';
import { isPaid } from '@/lib/qpay';
import { activateOrder } from '@/lib/orders';
// QPay төлбөр орох үед дууддаг callback. Өөрсдөө QPay-ээс дахин шалгаж баталгаажуулна.
async function handle(req) {
  const q = new URL(req.url).searchParams; const code = q.get('code') || '';
  if (q.get('t') !== await sign('qpay:' + code)) return json({ ok: false }, 403);
  const d = db(); if (!d) return json({ ok: false }, 503);
  const { data: o } = await d.from('orders').select('id,status,amount,qpay_invoice_id').eq('code', code).maybeSingle();
  if (!o?.qpay_invoice_id) return json({ ok: false }, 404);
  if (o.status === 'pending' && await isPaid(o.qpay_invoice_id, o.amount).catch(() => false)) await activateOrder(d, o.id);
  return json({ ok: true });
}
export const GET = handle; export const POST = handle;
