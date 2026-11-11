// Домэйн солих бол зөвхөн NEXT_PUBLIC_SITE_URL-г өөрчил.
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://brief.mn';
// Сервер дээр ажиллах үед уншина: домэйн солиход Cloudflare-ийн SITE_URL хувьсагчийг л өөрчилнө.
export const siteUrl = () => (process.env.SITE_URL || SITE_URL).replace(/\/$/, '');
export const SITE_NAME = SITE_URL.replace(/^https?:\/\//, '');
export const BRAND = 'Бриф';
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://feclitszuweodpnyejnj.supabase.co';
export const SUPABASE_PUBLISHABLE = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_rwzJgJfmjUmbnDKmNu_3UA_COmFiug_';
export const CATS = {
  full: { label: 'Цогц маркетинг', tone: 'v' },
  social: { label: 'Сошиал медиа', tone: 'c' },
  performance: { label: 'Дижитал / performance', tone: 'p' },
  branding: { label: 'Креатив / брэндинг', tone: 'l' },
  design: { label: 'Дизайн студи', tone: 'l' },
  content: { label: 'Контент / продакшн', tone: 'c' },
  pr: { label: 'PR', tone: 'v' },
  influencer: { label: 'Инфлүэнсэр', tone: 'p' },
  consulting: { label: 'Зөвлөх / судалгаа', tone: 'v' },
};
export const ACTIVE_DAYS = 180;
export function isActive(a) {
  if (!a.last_post_at) return null;
  return (Date.now() - new Date(a.last_post_at).getTime()) / 864e5 <= ACTIVE_DAYS;
}
export function fmtNum(n) {
  if (n == null) return '—';
  if (n >= 1000) return (n / 1000).toFixed(n >= 10000 ? 0 : 1).replace(/\.0$/, '') + 'K';
  return String(n);
}
export const cap = s => { s = String(s || '').trim().replace(/\s+/g, ' '); return s ? s.charAt(0).toLocaleUpperCase('mn') + s.slice(1) : s; };
export const catLabel = k => CATS[k]?.label || cap(k);
export const catTone = k => CATS[k]?.tone || 'p';
export const catsOf = a => (a.categories && a.categories.length ? a.categories : [a.category]).filter(Boolean);
export const SERVICES = ['Брэнд стратеги', 'Сошиал менежмент', 'Контент бүтээх', 'Видео продакшн', 'Фото зураг', 'График дизайн', 'Лого, айдентити', 'Facebook зар сурталчилгаа', 'Google зар', 'TikTok маркетинг', 'Инфлүэнсэр маркетинг', 'PR, хэвлэл мэдээлэл', 'Эвент', 'Вэбсайт хөгжүүлэлт', 'SEO', 'Маркетингийн зөвлөгөө', 'Судалгаа, аналитик', 'Медиа төлөвлөлт', 'ATL / BTL', 'Копирайтинг'];
export const TEAM_SIZES = ['1–5', '6–15', '16–50', '50+'];
export const SOCIALS = { instagram: 'Instagram', linkedin: 'LinkedIn', tiktok: 'TikTok', youtube: 'YouTube' };
export function completeness(a) {
  const checks = [!!a.logo_url, !!a.description, a.services?.length > 0, a.packages?.length > 0, !!(a.website || Object.keys(a.socials || {}).length), !!a.founded, !!a.team_size, a.clients?.length > 0, a.cases?.length > 0, a.team?.length > 0, !!a.phone_public];
  return Math.round(checks.filter(Boolean).length / checks.length * 100);
}
export const host = u => { try { return new URL(u).hostname.replace(/^www\./, ''); } catch { return u; } };
export const PERIODS = { '': 'нэг удаа', month: 'сар бүр', project: 'төсөл' };
const money = n => n >= 1e6 ? (Math.round(n / 1e5) / 10).toString().replace('.', ',') + ' сая' : Number(n).toLocaleString('en-US').replace(/,/g, ' ');
export function fmtPrice(p) {
  if (!p || p.type === 'negotiable') return 'Тохиролцоно';
  const per = p.period === 'month' ? ' / сар' : p.period === 'project' ? ' / төсөл' : '';
  if (p.type === 'range' && p.min && p.max) return `${money(p.min)} – ${money(p.max)}₮${per}`;
  if (p.min) return `${p.type === 'range' ? '' : ''}${money(p.min)}₮${per}`;
  return 'Тохиролцоно';
}
// Хаб: фрилансер, хэрэгсэл, сургалт, коммюнити
export const SELF_SERVE = ['tool', 'course'];
export const TYPES = {
  freelancer: { group: 'pro', label: 'Мэргэжилтэн', plural: 'Мэргэжилтнүүд', path: '/freelancer', tone: 'p', icon: '🧑‍💻', title: 'Маркетингийн мэргэжилтнүүд, фрилансерууд', sub: 'Агентлаг хөлслөхөөс өмнө — SMM, дизайн, зар, контент, видеоны чиглэлээр бие даан ажилладаг мэргэжилтнүүд.' },
  media: { group: 'media', label: 'Медиа ба зар', plural: 'Медиа, зарын сувгууд', path: '/media', tone: 'c', icon: '📺', title: 'Медиа ба зар сурталчилгааны сувгууд', sub: 'Мэдээллийн сайт, ТВ, радио, гадна самбар, подкаст — зараа хаана байршуулах вэ.' },
  tool: { group: 'learn', label: 'Хэрэгсэл', plural: 'Хэрэгслүүд', path: '/hereglsel', tone: 'l', icon: '🛠', title: 'Маркетингийн хэрэгслүүд', sub: 'Өөрөө хийх гэж байгаа бол — оноо, аудит, аргачлал, AI болон бусад хэрэгсэл.' },
  course: { group: 'learn', label: 'Сургалт', plural: 'Сургалтууд', path: '/surgalt', tone: 'v', icon: '🎓', title: 'Маркетингийн сургалтууд', sub: 'Онлайн курс, воркшоп, менторшип — үнэгүй болон төлбөртэй.' },
  community: { group: 'learn', label: 'Коммюнити', plural: 'Коммюнитиуд', path: '/kommyuniti', tone: 'c', icon: '💬', title: 'Маркетингийн коммюнитиуд', sub: 'Маркетерууд асуулт асууж, туршлагаа хуваалцдаг групп, клубууд.' },
};
export const TOPICS = { ads: 'Зар сурталчилгаа', social: 'Сошиал медиа', content: 'Контент, видео', design: 'Дизайн', brand: 'Брэнд, стратеги', data: 'Судалгаа, дата', ai: 'AI', pr: 'PR' };
// Агентлагийн ангилал → хэрэгслийн сэдэв (жагсаалтын дунд тохирохыг нь гаргахад)
export const CAT_TOPIC = { performance: 'ads', social: 'social', influencer: 'social', content: 'content', design: 'design', branding: 'brand', consulting: 'data', pr: 'pr' };
export const withUtm = (u, medium = 'hub') => { try { const x = new URL(u); x.searchParams.set('utm_source', 'brief.mn'); x.searchParams.set('utm_medium', medium); return x.toString(); } catch { return u; } };
// Инфлүэнсер
export const NICHES = { lifestyle: 'Влог, өдөр тутам', beauty: 'Гоо сайхан, загвар', fitness: 'Фитнес, спорт', music: 'Хөгжим', comedy: 'Хошин шог, шоу', food: 'Хоол', travel: 'Аялал, зураг', business: 'Бизнес, боловсрол', family: 'Гэр бүл', gaming: 'Гейминг, аниме', film: 'Кино, жүжиг' };
export const REACH = [['all', 'Бүгд', 0, 1e12], ['m', '500K+', 5e5, 1e12], ['l', '100K – 500K', 1e5, 5e5], ['s', '10K – 100K', 0, 1e5]];
export const fbPic = u => { try { const x = new URL(u); const id = x.searchParams.get('id') || x.pathname.split('/').filter(Boolean)[0]; return id ? `https://graph.facebook.com/${encodeURIComponent(id)}/picture?type=large&width=300&height=300` : null; } catch { return null; } };
// Монитайз — үнэ (₮). 3 сараар авбал 15% хямд.
export const PRODUCTS = {
  agency_featured: { label: 'Онцлох агентлаг', price: 99000, monthly: true, icon: '⭐', perks: ['Жагсаалтын эхэнд, сонгосон ангилалдаа ч эхэнд гарна', '«Онцлох» тэмдэг', '«Агентлаг сонгох» туслахын үр дүнд давуу эрх', 'Профайлын үзэлт, товч дарсан статистик'] },
  listing_sponsor: { label: 'Онцлох байршил', price: 49000, monthly: true, icon: '⭐', perks: ['Өөрийн хуудсандаа (мэргэжилтэн, медиа, хэрэгсэл, сургалт, коммюнити) хамгийн эхэнд', 'Хэрэгсэл, сургалт бол агентлагуудын дундах «Өөрөө хийх үү?» мөрөнд ч эхэнд', 'Сар бүрийн дарсан тооны тайлан'] },
  lead: { label: 'Клиентийн хүсэлт', price: 15000, monthly: false, icon: '🎯', perks: ['Таны чиглэл, төсөвт таарсан клиентийн хүсэлт', 'Нэг хүсэлтийг дээд тал нь 3 агентлаг авна', 'Холбоо барих мэдээлэл төлбөр баталгаажмагц нээгдэнэ'] },
};
export const priceFor = (p, months = 1) => { const b = PRODUCTS[p].price; return months >= 3 ? Math.round(b * months * 0.85 / 1000) * 1000 : b * months; };
export const fmtMnt = n => n.toLocaleString('en-US').replace(/,/g, ' ') + '₮';
export const isFeatured = a => !!a.featured_until && new Date(a.featured_until) > new Date();
export const LEAD_MAX = 3;
// Имэйл бүртгэл
export const SUB_ROLES = { agency: 'Агентлагт ажилладаг', brand: 'Брэнд, компанийн маркетер', freelance: 'Фрийлансер', owner: 'Бизнес эрхлэгч', student: 'Оюутан, суралцагч', other: 'Бусад' };
