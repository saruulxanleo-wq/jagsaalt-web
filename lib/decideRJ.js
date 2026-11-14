// Сэтгэгдэл (review) ба ажлын зар (job)-ыг батлах/нуух
export async function decideRJ(d, k, id, a) {
  const now = new Date().toISOString();
  if (k === 'review') {
    const { data: r } = await d.from('reviews').select('draft').eq('id', id).maybeSingle(); if (!r) return 'Олдсонгүй';
    await d.from('reviews').update(a === 'approve' ? { status: 'approved', comment: r.draft, updated_at: now } : { status: 'rejected', comment: null, updated_at: now }).eq('id', id);
    return a === 'approve' ? 'Сэтгэгдэл нийтлэгдлээ' : 'Сэтгэгдлийг нуулаа (үнэлгээ нь тооцогдсоор байна)';
  }
  const st = { approve: 'approved', reject: 'rejected', close: 'closed' }[a] || 'rejected';
  const { data: j } = await d.from('jobs').update({ status: st, updated_at: now }).eq('id', id).select('title').maybeSingle();
  return `«${j?.title || ''}» ${st === 'approved' ? 'нийтлэгдлээ' : st === 'closed' ? 'хаагдлаа' : 'татгалзлаа'}`;
}
