import { siteUrl } from '@/lib/config';
export const dynamic = 'force-dynamic';
export default function robots() {
  return { rules: [{ userAgent: '*', allow: '/', disallow: ['/api/', '/admin', '/minii'] }], sitemap: siteUrl() + '/sitemap.xml' };
}
