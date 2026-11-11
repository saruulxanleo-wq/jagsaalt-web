import { AI_BOTS } from '@/lib/aibots';
import { siteUrl } from '@/lib/config';
export const dynamic = 'force-dynamic';
export default function robots() {
  return { rules: [{ userAgent: AI_BOTS, disallow: '/' }, { userAgent: '*', allow: '/', disallow: ['/api/', '/admin', '/minii'] }], sitemap: siteUrl() + '/sitemap.xml' };
}
