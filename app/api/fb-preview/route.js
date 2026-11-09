import { json, fail } from '@/lib/server';
import { normFb } from '@/lib/fb';
import { fbPage } from '@/lib/fbpage';
// Линк оруулмагц хуудасны нэр, дагагч, зургийг урьдчилан харуулна
export async function GET(req) {
  const fb = normFb(new URL(req.url).searchParams.get('url') || ''); if (!fb) return fail('Facebook хуудасны линк биш байна');
  const p = await fbPage(fb).catch(() => null);
  if (!p) return fail('Хуудсыг уншиж чадсангүй. Линкээ шалгана уу.', 404);
  return json({ fb_url: fb, name: p.name, followers: p.followers, picture: p.picture, last_post_at: p.last_post_at });
}
