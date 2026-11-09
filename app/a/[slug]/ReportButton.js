'use client';
import { useState } from 'react';
export default function ReportButton({ slug }) {
  const [open, setOpen] = useState(false); const [msg, setMsg] = useState(''); const [contact, setContact] = useState('');
  const [state, setState] = useState(null);
  async function send(e) {
    e.preventDefault(); setState('busy');
    const r = await fetch('/api/report', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slug, message: msg, contact }) });
    const j = await r.json().catch(() => ({})); setState(r.ok ? 'done' : j.error || 'Алдаа гарлаа');
  }
  if (state === 'done') return <div className="ok">Баярлалаа! Шалгаад засна.</div>;
  if (!open) return <button type="button" onClick={() => setOpen(true)} style={{ background: 'none', color: 'var(--mute)', fontSize: 14, fontWeight: 600, textDecoration: 'underline', justifySelf: 'start', padding: 0 }}>Мэдээлэл буруу байна уу?</button>;
  return <form onSubmit={send} style={{ display: 'grid', gap: 10, background: 'var(--bg)', borderRadius: 18, padding: 16 }}>
    <label htmlFor="rm" className="lab">Юу буруу байна?</label>
    <textarea id="rm" className="field" style={{ marginTop: 0 }} rows={3} maxLength={1000} value={msg} onChange={e => setMsg(e.target.value)} required />
    <input aria-label="Холбоо барих (заавал биш)" className="field" style={{ marginTop: 0 }} placeholder="Утас эсвэл и-мэйл (заавал биш)" value={contact} onChange={e => setContact(e.target.value)} maxLength={100} />
    {state && state !== 'busy' && <div className="err">{state}</div>}
    <div className="row"><button className="btn dark" disabled={state === 'busy'}>Илгээх</button><button type="button" className="btn ghost" onClick={() => setOpen(false)}>Болих</button></div>
  </form>;
}
