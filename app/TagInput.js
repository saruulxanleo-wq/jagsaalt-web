'use client';
import { useState } from 'react';
import { cap } from '@/lib/config';
// Санал болгосон жагсаалтаас сонгох эсвэл өөрөө бичиж нэмэх
export default function TagInput({ id, label, value, onChange, suggestions = [], max = 15, placeholder }) {
  const [txt, setTxt] = useState('');
  const has = t => value.some(v => v.toLowerCase() === t.toLowerCase());
  const add = t => { t = cap(t).slice(0, 40); if (t.length < 2 || has(t) || value.length >= max) return; onChange([...value, t]); setTxt(''); };
  const q = txt.trim().toLowerCase();
  const sug = suggestions.filter(s => !has(s) && (!q || s.toLowerCase().includes(q))).slice(0, q ? 8 : 20);
  return <div>
    <label htmlFor={id} className="lab">{label} <span style={{ color: 'var(--mute)', fontWeight: 500 }}>· {value.length}/{max}</span></label>
    {value.length > 0 && <div className="row" style={{ marginTop: 9 }}>{value.map(v => <span key={v} className="chip on">{v}<button type="button" aria-label={v + ' хасах'} onClick={() => onChange(value.filter(x => x !== v))} style={{ background: 'none', color: '#fff', padding: 0, fontSize: 16, lineHeight: 1 }}>×</button></span>)}</div>}
    {value.length < max && <>
      <div className="row" style={{ marginTop: 9, gap: 8 }}>
        <input id={id} className="field" style={{ marginTop: 0, flex: 1, minWidth: 200 }} placeholder={placeholder || 'Бичээд Enter дар'} value={txt} maxLength={40}
          onChange={e => setTxt(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add(txt); } }} />
        {q.length >= 2 && !has(txt.trim()) && <button type="button" className="btn ghost" onClick={() => add(txt)}>+ «{cap(txt)}» нэмэх</button>}
      </div>
      {sug.length > 0 && <div className="row" style={{ marginTop: 8, gap: 6 }}>{sug.map(s => <button type="button" key={s} className="chip" style={{ padding: '6px 12px', fontSize: 14 }} onClick={() => add(s)}>+ {s}</button>)}</div>}
    </>}
  </div>;
}
