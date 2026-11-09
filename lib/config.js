// Домэйн солих бол зөвхөн NEXT_PUBLIC_SITE_URL-г өөрчил.
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://jagsaalt.mn';
export const SITE_NAME = SITE_URL.replace(/^https?:\/\//, '');
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
export const catsOf = a => (a.categories && a.categories.length ? a.categories : [a.category]).filter(k => CATS[k]);
