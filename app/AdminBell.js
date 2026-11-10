'use client';
import { useEffect, useRef, useState } from 'react';
import { sb, api } from '@/lib/sbclient';
// Зөвхөн админд харагдана: шинэ зүйл ирэхэд тоотой хонх, табын гарчигт (N), браузерын мэдэгдэл.
const SEEN = 'brief_admin_seen', EVERY = 60e3;
const ago = t => { const m = Math.round((Date.now() - new Date(t)) / 6e4); return m < 1 ? 'сая' : m < 60 ? m + ' мин' : m < 1440 ? Math.round(m / 60) + ' цаг' : Math.round(m / 1440) + ' өдөр'; };
export default function AdminBell() {
  const [on, setOn] = useState(false), [f, setF] = useState(null), [open, setOpen] = useState(false);
  const last = useRef(0), base = useRef('');
  async function poll() {
    let since = 0; try { since = Number(localStorage.getItem(SEEN)) || 0; } catch {}
    const r = await api('/api/admin/feed?since=' + since);
    if (!r.ok) { setOn(false); return false; }
    setOn(true); setF(r);
    if (r.total > last.current && last.current >= 0 && typeof Notification !== 'undefined' && Notification.permission === 'granted' && document.hidden) {
      try { const g = r.groups[0]; new Notification('brief.mn · ' + r.total + ' шинэ', { body: r.groups.map(x => `${x.label}: ${x.n}`).join('\n') || g?.label, icon: '/icon.png', tag: 'brief-admin' }).onclick = () => { window.focus(); location.href = '/admin'; }; } catch {}
    }
    last.current = r.total; return true;
  }
  useEffect(() => {
    let t; base.current = document.title.replace(/^\(\d+\)\s*/, '');
    sb().auth.getSession().then(({ data }) => {
      if (!data.session) return;
      poll().then(ok => { if (ok) t = setInterval(poll, EVERY); });
    });
    const vis = () => { if (!document.hidden && t) poll(); };
    document.addEventListener('visibilitychange', vis);
    return () => { clearInterval(t); document.removeEventListener('visibilitychange', vis); };
  }, []);
  useEffect(() => { if (!on) return; const b = document.title.replace(/^\(\d+\)\s*/, ''); document.title = (f?.total ? `(${f.total}) ` : '') + b; });
  if (!on) return null;
  const n = f?.total || 0;
  const seen = () => { try { localStorage.setItem(SEEN, String(Date.now())); } catch {} last.current = 0; setF({ total: 0, groups: [] }); setOpen(false); };
  const ask = () => Notification.requestPermission().then(() => setF({ ...f }));
  return <div style={{ position: 'relative' }}>
    <button className="btn ghost" aria-label={'Админ мэдэгдэл ' + n} onClick={() => setOpen(!open)} style={{ position: 'relative', padding: '9px 12px' }}>🔔{n > 0 && <b style={{ position: 'absolute', top: -6, right: -6, background: '#E5383B', color: '#fff', borderRadius: 99, fontSize: 12, minWidth: 20, height: 20, display: 'grid', placeItems: 'center', padding: '0 5px' }}>{n > 99 ? '99+' : n}</b>}</button>
    {open && <div className="panel bellpop">
      <b>{n ? n + ' шинэ зүйл' : 'Шинэ зүйл алга'}</b>
      {f?.groups?.map(g => <div key={g.t} style={{ fontSize: 14, minWidth: 0 }}><div style={{ fontWeight: 700 }}>{g.label} <span style={{ color: 'var(--v)' }}>+{g.n}</span></div>
        {g.items.map((it, i) => <div key={i} style={{ color: 'var(--mute)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.text || '—'} · {ago(it.at)}</div>)}</div>)}
      <div style={{ display: 'grid', gridTemplateColumns: n > 0 ? '1fr auto' : '1fr', gap: 8 }}><a href="/admin" className="btn dark" onClick={seen} style={{ justifyContent: 'center' }}>Админ руу</a>{n > 0 && <button className="btn ghost" onClick={seen}>Уншсан</button>}</div>
      {typeof Notification !== 'undefined' && Notification.permission === 'default' && <button className="btn ghost" onClick={ask} style={{ fontSize: 14 }}>Браузерын мэдэгдэл асаах</button>}
    </div>}
  </div>;
}
