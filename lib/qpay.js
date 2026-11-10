// QPay Merchant API v2 (saruul.work-тэй ижил мерчант). Түлхүүрүүд: QPAY_USERNAME, QPAY_PASSWORD, QPAY_INVOICE_CODE
const BASE = 'https://merchant.qpay.mn/v2';
export const qpayOn = () => !!(process.env.QPAY_USERNAME && process.env.QPAY_PASSWORD && process.env.QPAY_INVOICE_CODE);
let tok = null;
async function token() {
  if (tok && tok.exp > Date.now()) return tok.v;
  const r = await fetch(BASE + '/auth/token', { method: 'POST', headers: { Authorization: 'Basic ' + btoa(process.env.QPAY_USERNAME + ':' + process.env.QPAY_PASSWORD) } });
  if (!r.ok) throw new Error('QPay auth ' + r.status);
  const j = await r.json(); tok = { v: j.access_token, exp: Date.now() + ((j.expires_in ? (j.expires_in > 1e9 ? j.expires_in * 1000 - Date.now() : j.expires_in * 1000) : 3e6) - 6e4) };
  return tok.v;
}
async function call(path, body) {
  const r = await fetch(BASE + path, { method: 'POST', headers: { Authorization: 'Bearer ' + await token(), 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const j = await r.json().catch(() => ({})); if (!r.ok) throw new Error('QPay ' + path + ' ' + r.status + ' ' + (j.message || ''));
  return j;
}
export async function createInvoice({ code, amount, description, callback }) {
  const j = await call('/invoice', { invoice_code: process.env.QPAY_INVOICE_CODE, sender_invoice_no: code, invoice_receiver_code: 'terminal', invoice_description: description.slice(0, 120), amount, callback_url: callback });
  return { invoice_id: j.invoice_id, qr_image: j.qr_image, qr_text: j.qr_text, short_url: j.qPay_shortUrl, urls: (j.urls || []).map(u => ({ name: u.name, logo: u.logo, link: u.link })) };
}
export async function isPaid(invoiceId, amount) {
  const j = await call('/payment/check', { object_type: 'INVOICE', object_id: invoiceId, offset: { page_number: 1, page_limit: 100 } });
  return (j.count > 0 && (j.paid_amount ?? 0) >= amount) || (j.rows || []).some(r => r.payment_status === 'PAID');
}
