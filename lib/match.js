// Клиентийн хариултыг агентлагуудтай тулгах энгийн оноо
export const NEEDS = {
  social: { label: 'Сошиал хуудсаа хөтлүүлэх', cats: ['social', 'content', 'full'], kw: ['сошиал', 'контент', 'пост'] },
  ads: { label: 'Facebook, Google зар сурталчилгаа', cats: ['performance', 'social', 'full'], kw: ['зар', 'facebook', 'google', 'performance', 'ads'] },
  brand: { label: 'Брэнд, лого, дизайн', cats: ['branding', 'design'], kw: ['брэнд', 'лого', 'дизайн', 'айдентити'] },
  video: { label: 'Видео, фото контент', cats: ['content'], kw: ['видео', 'фото', 'продакшн', 'reels'] },
  web: { label: 'Вэбсайт', cats: ['design', 'performance'], kw: ['вэб', 'web', 'сайт', 'seo'] },
  pr: { label: 'PR, хэвлэл мэдээлэл', cats: ['pr', 'full'], kw: ['pr', 'хэвлэл', 'мэдээлэл'] },
  influencer: { label: 'Инфлүэнсэр маркетинг', cats: ['influencer', 'social'], kw: ['инфлүэнсэр', 'influencer'] },
  strategy: { label: 'Маркетингийн стратеги, зөвлөгөө', cats: ['consulting', 'full'], kw: ['стратеги', 'зөвлө', 'судалгаа'] },
  all: { label: 'Бүгдийг нэг дор', cats: ['full'], kw: ['цогц'] },
};
export const BUDGETS = { b1: ['500 мянга хүртэл', 0, 5e5], b2: ['0,5 – 1,5 сая', 5e5, 15e5], b3: ['1,5 – 3 сая', 15e5, 3e6], b4: ['3 – 6 сая', 3e6, 6e6], b5: ['6 саяас дээш', 6e6, 1e10], b0: ['Мэдэхгүй байна', 0, 1e10] };
export const SIZES = { s: 'Шинэ эсвэл жижиг бизнес', m: 'Дунд бизнес (10–50 ажилтан)', l: 'Том компани (50+)' };
export const ADS = { yes: 'Тогтмол зар явуулдаг', some: 'Хааяа boost', no: 'Зар явуулдаггүй' };
export const PRIORITIES = { price: 'Боломжийн үнэ', quality: 'Бүтээлч, чанартай ажил', speed: 'Хурдан эхлэх', exp: 'Туршлагатай, том брэндтэй ажилласан' };
const active = a => a.last_post_at && (Date.now() - new Date(a.last_post_at)) / 864e5 <= 180;
export function score(a, q) {
  const cats = a.categories?.length ? a.categories : [a.category];
  const text = [...(a.services || []), ...(a.packages || []).flatMap(p => [p.title, ...(p.items || [])]), a.description || ''].join(' ').toLowerCase();
  let s = 0; const why = [];
  const needs = (q.needs || []).map(k => NEEDS[k]).filter(Boolean);
  let catHits = 0, kwHits = 0;
  for (const n of needs) { if (n.cats.some(c => cats.includes(c))) catHits++; if (n.kw.some(k => text.includes(k))) kwHits++; }
  if (needs.length && !catHits && !kwHits) return null;
  s += catHits * 30 + kwHits * 15;
  if (catHits) why.push('Таны хэрэгцээтэй чиглэлээр ажилладаг');
  const b = BUDGETS[q.budget];
  const prices = (a.packages || []).filter(p => p.type !== 'negotiable' && p.min).map(p => p.min);
  if (b && q.budget !== 'b0' && prices.length) {
    if (Math.min(...prices) <= b[2]) { s += 20; why.push('Төсөвт тань багтах багцтай'); } else s -= 25;
  }
  const big = ['16–50', '50+'].includes(a.team_size), small = ['1–5', '6–15'].includes(a.team_size);
  if (q.size === 'l' && big) { s += 12; why.push('Том төсөлд хүрэлцэх багтай'); }
  if (q.size === 's' && small) { s += 8; }
  if (q.priority === 'exp') { const n = (a.clients?.length || 0) + (a.cases?.length || 0); if (n) { s += Math.min(20, n * 4); why.push(`${n} брэнд/кейсийн туршлагатай`); } }
  if (q.priority === 'price' && small) s += 6;
  if (q.priority === 'quality' && a.cases?.length) { s += 10; why.push('Кейсүүдээ нээлттэй харуулсан'); }
  if (a.verified) { s += 15; why.push('Баталгаажсан агентлаг'); }
  if (active(a)) { s += 10; why.push('Сүүлийн 6 сард идэвхтэй'); }
  if (a.followers) s += Math.min(10, Math.log10(a.followers) * 2.5);
  if (a.packages?.length) s += 4; if (a.description) s += 3;
  return { s, why: why.slice(0, 3) };
}
