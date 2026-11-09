'use client';
import { useState } from 'react';
import { CATS, catLabel, cap } from '@/lib/config';
export default function CatPicker({ value, onChange }) {
  const [txt, setTxt] = useState('');
  const toggle = k => onChange(value.includes(k) ? value.filter(x => x !== k) : value.length >= 3 ? value : [...value, k]);
  const custom = value.filter(k => !CATS[k]);
  const add = () => { const t = cap(txt).slice(0, 30); if (t.length < 2 || value.length >= 3) return; const key = Object.keys(CATS).find(k => CATS[k].label.toLowerCase() === t.toLowerCase()) || t; if (!value.includes(key)) onChange([...value, key]); setTxt(''); };
  return <div>
    <span className="lab">Ангилал <span style={{ color: 'var(--mute)', fontWeight: 500 }}>· 1–3 сонго ({value.length}/3)</span></span>
    <div className="row" style={{ marginTop: 9 }}>
      {[...Object.keys(CATS), ...custom].map(k => {
        const on = value.includes(k), full = !on && value.length >= 3;
        return <button type="button" key={k} aria-pressed={on} disabled={full} className={'chip' + (on ? ' on' : '')} style={full ? { opacity: .45, cursor: 'default' } : undefined} onClick={() => toggle(k)}>{on && (value.indexOf(k) === 0 ? '★ ' : '✓ ')}{catLabel(k)}</button>;
      })}
      {value.length < 3 && <span className="row" style={{ gap: 6 }}>
        <input aria-label="Өөр ангилал" className="field" style={{ marginTop: 0, width: 190, padding: '9px 14px', borderRadius: 999 }} placeholder="+ Өөр ангилал" value={txt} maxLength={30}
          onChange={e => setTxt(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add(); } }} />
        {txt.trim().length >= 2 && <button type="button" className="btn ghost" style={{ padding: '9px 14px' }} onClick={add}>Нэмэх</button>}
      </span>}
    </div>
    {value.length > 1 && <p style={{ fontSize: 13.5, color: 'var(--mute)', marginTop: 6 }}>★ — үндсэн ангилал (эхэнд сонгосон нь)</p>}
  </div>;
}
