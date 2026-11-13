'use client';
import Link from 'next/link';
import { track } from '@/lib/track';
import { TYPES, topicLabel, host, withUtm } from '@/lib/config';
export const trackClick = lid => { if (!/^[0-9a-f-]{36}$/.test(lid)) return; track('Contact', { content_name: 'listing_click' }); const body = JSON.stringify({ lid, kind: 'click' }); if (!(navigator.sendBeacon && navigator.sendBeacon('/api/track', new Blob([body], { type: 'application/json' })))) fetch('/api/track', { method: 'POST', body, headers: { 'Content-Type': 'application/json' }, keepalive: true }).catch(() => {}); };
export default function ListingCard({ l, medium = 'hub' }) {
  const t = TYPES[l.type] || TYPES.tool; const href = withUtm(l.url, medium); const prof = /^[0-9a-f-]{36}$/.test(l.id || '') ? `/l/${l.id}` : href;
  return <div className={'card lcard t-' + l.type}>
    <Link href={prof} className="lmain">
      <div className="top">
        {l.logo_url ? <img className="logoimg" src={l.logo_url} alt="" loading="lazy" style={{ width: 52, height: 52, borderRadius: 14 }} />
          : <span className="logoimg licon" style={{ width: 52, height: 52, borderRadius: 14 }}>{l.name.trim()[0]}</span>}
        <div style={{ minWidth: 0 }}><h3>{l.name}</h3><div style={{ fontSize: 13.5, color: 'var(--mute)', fontWeight: 600 }}>{l.maker || host(l.url)}</div></div>
      </div>
      <div className="row" style={{ gap: 6 }}>
        <span className={'cat ' + t.tone}>{t.icon} {t.label}</span>
        {l.verified && <span className="vbadge">✓ Баталгаажсан</span>}
        {l.sponsored && <span className="badge b-off">Онцлох</span>}
        {(l.topics || []).slice(0, 2).map(k => <span key={k} className="badge b-off">{topicLabel(k)}</span>)}
      </div>
      {l.description && <p style={{ color: 'var(--mute)', fontSize: 14.5 }}>{l.description}</p>}
    </Link>
    <div className="meta"><span>{l.price ? <b>{l.price}</b> : ''}</span>
      <span className="row" style={{ gap: 12 }}>{!l.verified && medium === 'hub' && /^[0-9a-f-]{36}$/.test(l.id || '') && <Link href={`/minii?own=listing:${l.id}`} className="ownlink">Минийх</Link>}
        {!l.verified && l.type === 'freelancer' && l.logo_url && medium === 'hub' && <Link href={`/aldaa?p=/freelancer&m=${encodeURIComponent('Зураг хасуулах / солих: ' + l.name)}`} className="ownlink" rel="nofollow">Зураг хасуулах</Link>}
        <Link href={prof} style={{ color: 'var(--v)' }}>Профайл →</Link></span></div>
  </div>;
}
