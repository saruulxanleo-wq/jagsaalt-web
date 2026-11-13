// Facebook хуудасны линкийг нэг хэлбэрт оруулна. Хуваалцах (share), пост, зураг, reel зэрэг
// хуудас биш линкийг хүлээж авахгүй — тэр нь бүгд «share» гэх мэт нэг түлхүүрт буугаад өөр агентлагтай давхцдаг.
const NOT_PAGE = new Set(['share', 'sharer', 'sharer.php', 'story.php', 'permalink.php', 'photo', 'photo.php', 'photos', 'watch', 'reel', 'reels', 'groups', 'events', 'hashtag', 'search', 'login', 'login.php', 'l.php', 'dialog', 'plugins', 'ads', 'business', 'help', 'marketplace', 'gaming', 'stories', 'notes', 'media', 'video.php', 'posts', 'home.php']);
export function fbLinkError(u) {
  try { const x = new URL(u.startsWith('http') ? u : 'https://' + u); if (!/(^|\.)facebook\.com$|(^|\.)fb\.com$|(^|\.)fb\.me$/.test(x.hostname)) return null;
    const p = (x.pathname.split('/').filter(Boolean)[0] || '').toLowerCase();
    if (x.hostname.endsWith('fb.me') || NOT_PAGE.has(p)) return 'Энэ нь хуваалцах/постын линк байна. Facebook хуудас руугаа ороод хаягийн мөрөнд гарах линкийг хуулж оруул (жишээ: facebook.com/хуудасны-нэр).';
  } catch {} return null;
}
export function normFb(u) {
  try { const x = new URL(u.startsWith('http') ? u : 'https://' + u); if (!/(^|\.)facebook\.com$/.test(x.hostname)) return null;
    const id = x.searchParams.get('id'); const parts = x.pathname.split('/').filter(Boolean); let p = parts[0];
    if (p && p.toLowerCase() === 'people' && /^\d+$/.test(parts[2] || '')) return `https://www.facebook.com/profile.php?id=${parts[2]}`;
    if (p && NOT_PAGE.has(p.toLowerCase())) return null;
    return id ? `https://www.facebook.com/profile.php?id=${id}` : p ? `https://www.facebook.com/${p}` : null; } catch { return null; }
}
export const slugify = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'a-' + Date.now().toString(36);
