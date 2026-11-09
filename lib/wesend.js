const API = 'https://api.wesend.mn/v1';
const h = () => ({ Authorization: `Bearer ${process.env.WESEND_API_KEY}`, 'Content-Type': 'application/json' });
export async function sendCode(phone, brand) {
  const r = await fetch(`${API}/verify`, { method: 'POST', headers: h(), body: JSON.stringify({ to: phone, brand: brand.slice(0, 20), code_length: 4, locale: 'mn' }) });
  return { ok: r.ok, status: r.status, data: await r.json() };
}
export async function checkCode(id, code) {
  const r = await fetch(`${API}/verify/${id}/check`, { method: 'POST', headers: h(), body: JSON.stringify({ code }) });
  return { ok: r.ok, status: r.status, data: await r.json() };
}
