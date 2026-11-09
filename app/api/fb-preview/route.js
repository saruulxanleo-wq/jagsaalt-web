import { json, fail } from '@/lib/server';
import { normFb } from '@/lib/fb';
import { fbPage } from '@/lib/fbpage';
// Линк оруулмагц хуудасны нэр, дагагч, зургийг урьдчилан харуулна
export async function GET(req) {
  const fb = normFb(new URL(req.url).searchParams.get('url') || ''); if (!fb) return fail('Facebook хуудасны линк биш байна');
  const p = await fbPage(fb).catch(() => null);
  if (!p) { const id = new URL(fb).searchParams.get('id') || fb.split('/').pop(); return json({ fb_url: fb, name: null, followers: null, picture: `https://graph.facebook.com/${encodeURIComponent(id)}/picture?type=large`, last_post_at: null, partial: true }); }
  return json({ fb_url: fb, name: p.name, followers: p.followers, picture: p.picture, last_post_at: p.last_post_at });
}
