export function normFb(u) {
  try { const x = new URL(u.startsWith('http') ? u : 'https://' + u); if (!/(^|\.)facebook\.com$/.test(x.hostname)) return null;
    const id = x.searchParams.get('id'); const p = x.pathname.split('/').filter(Boolean)[0];
    return id ? `https://www.facebook.com/profile.php?id=${id}` : p ? `https://www.facebook.com/${p}` : null; } catch { return null; }
}
export const slugify = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'a-' + Date.now().toString(36);
