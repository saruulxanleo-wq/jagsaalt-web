'use client';
import { useEffect, useState } from 'react';
import { fmtNum } from '@/lib/config';
// Линк бичмэгц FB хуудасны нэр, зураг, дагагчийг харуулж, нэрийг автоматаар бөглөнө
export default function FbPreview({ url, onName }) {
  const [p, setP] = useState(null); const [st, setSt] = useState('idle');
  useEffect(() => {
    if (!/facebook\.com\/./i.test(url || '')) { setP(null); setSt('idle'); return; }
    setSt('load'); const t = setTimeout(async () => {
      const r = await fetch('/api/fb-preview?url=' + encodeURIComponent(url)); const j = await r.json().catch(() => ({}));
      if (r.ok) { setP(j); setSt('ok'); onName?.(j.name); } else { setP(null); setSt(j.error || 'err'); }
    }, 600);
    return () => clearTimeout(t);
  }, [url]);
  if (st === 'idle') return null;
  if (st === 'load') return <div style={{ marginTop: 10, color: 'var(--mute)', fontSize: 14 }}>Facebook хуудсыг уншиж байна…</div>;
  if (st !== 'ok') return <div style={{ marginTop: 10, color: '#A3260F', fontSize: 14 }}>{st === 'err' ? 'Хуудсыг уншиж чадсангүй' : st}</div>;
  const active = p.last_post_at && (Date.now() - new Date(p.last_post_at)) / 864e5 <= 180;
  return <div style={{ marginTop: 10, display: 'flex', gap: 12, alignItems: 'center', background: 'var(--bg)', borderRadius: 16, padding: '10px 12px' }}>
    {p.picture ? <img src={p.picture} alt="" width={48} height={48} style={{ borderRadius: 12, objectFit: 'cover' }} /> : <span style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--line)' }} />}
    <div style={{ fontSize: 14.5, flex: 1 }}><b style={{ fontSize: 16 }}>{p.name}</b><div style={{ color: 'var(--mute)' }}>{fmtNum(p.followers)} дагагч{p.last_post_at ? ` · сүүлийн пост ${p.last_post_at}` : ''}</div></div>
    {p.last_post_at && <span className={'badge ' + (active ? 'b-act' : 'b-off')}>{active ? <><span className="dot" />Идэвхтэй</> : 'Идэвхгүй'}</span>}
  </div>;
}
