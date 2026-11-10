// Захиалга идэвхжүүлэх (админ "Төлбөр орсон" дарахад)
const DAY = 864e5;
const extend = (until, months) => new Date(Math.max(Date.now(), until ? new Date(until).getTime() : 0) + months * 30 * DAY).toISOString();
export async function activateOrder(d, id) {
  const { data: o } = await d.from('orders').select('*').eq('id', id).single();
  if (!o) return { error: 'Захиалга олдсонгүй' };
  if (o.status === 'paid') return { order: o, already: true };
  if (o.status !== 'pending') return { error: 'Захиалга цуцлагдсан' };
  if (o.product === 'agency_featured') {
    const { data: a } = await d.from('agencies').select('featured_until').eq('id', o.target_id).single();
    await d.from('agencies').update({ featured_until: extend(a?.featured_until, o.months) }).eq('id', o.target_id);
  } else if (o.product === 'listing_sponsor') {
    const { data: l } = await d.from('listings').select('sponsored_until').eq('id', o.target_id).single();
    await d.from('listings').update({ sponsored_until: extend(l?.sponsored_until, o.months) }).eq('id', o.target_id);
  } else if (o.product === 'lead') {
    const { error } = await d.from('lead_access').insert({ lead_id: o.target_id, agency_id: o.agency_id, order_id: o.id });
    if (error && !/duplicate/.test(error.message)) return { error: 'Лийд нээж чадсангүй' };
  }
  const paid_at = new Date().toISOString();
  await d.from('orders').update({ status: 'paid', paid_at }).eq('id', id);
  return { order: { ...o, status: 'paid', paid_at } };
}
export const bank = () => ({ name: process.env.BANK_NAME || '', account: process.env.BANK_ACCOUNT || '', holder: process.env.BANK_HOLDER || '' });
