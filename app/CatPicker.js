'use client';
import { CATS } from '@/lib/config';
export default function CatPicker({ value, onChange }) {
  const toggle = k => onChange(value.includes(k) ? value.filter(x => x !== k) : value.length >= 3 ? value : [...value, k]);
  return <div>
    <span className="lab">Ангилал <span style={{ color: 'var(--mute)', fontWeight: 500 }}>· 1–3 сонго ({value.length}/3)</span></span>
    <div className="row" style={{ marginTop: 9 }}>{Object.entries(CATS).map(([k, c]) => {
      const on = value.includes(k), full = !on && value.length >= 3;
      return <button type="button" key={k} aria-pressed={on} disabled={full} className={'chip' + (on ? ' on' : '')} style={full ? { opacity: .45, cursor: 'default' } : undefined} onClick={() => toggle(k)}>{on && (value.indexOf(k) === 0 ? '★ ' : '✓ ')}{c.label}</button>;
    })}</div>
    {value.length > 1 && <p style={{ fontSize: 13.5, color: 'var(--mute)', marginTop: 6 }}>★ — үндсэн ангилал (эхэнд сонгосон нь)</p>}
  </div>;
}
