'use client';
import { useState, useEffect } from 'react';
import { resize } from '../minii/EditAgency';
// Маягтын «Зураг / лого» талбар: файлыг санах ойд барьж, урьдчилж харуулна. Илгээсний дараа uploadImg-ээр хадгална.
export function PickImg({ file, onChange, label = 'Зураг / лого', round, hint }) {
  const [url, setUrl] = useState(null);
  useEffect(() => { if (!file) { setUrl(null); return; } const u = URL.createObjectURL(file); setUrl(u); return () => URL.revokeObjectURL(u); }, [file]);
  return <div><span className="lab">{label} <span style={{ color: 'var(--mute)', fontWeight: 500 }}>· заавал биш</span></span>
    <div className="row" style={{ gap: 14, marginTop: 6 }}>
      {url ? <img src={url} alt="" style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: round ? '50%' : 14, border: '1.5px solid var(--line)' }} />
        : <div style={{ width: 64, height: 64, borderRadius: round ? '50%' : 14, border: '1.5px dashed var(--line)', display: 'grid', placeItems: 'center', color: 'var(--mute)', fontSize: 22 }}>+</div>}
      <label className="btn ghost" style={{ cursor: 'pointer' }}>{file ? 'Солих' : 'Зураг сонгох'}<input type="file" accept="image/png,image/jpeg,image/webp" hidden onChange={e => { const f = e.target.files?.[0]; e.target.value = ''; if (f) onChange(f); }} /></label>
      {file && <button type="button" className="btn ghost" onClick={() => onChange(null)}>Хасах</button>}
    </div>
    {hint && <p style={{ fontSize: 13, color: 'var(--mute)', marginTop: 6 }}>{hint}</p>}</div>;
}
// Submit-ийн хариунд ирсэн img эрхээр зургийг хадгална. Алдаа гарсан ч маягтын амжилтыг саатуулахгүй.
export async function uploadImg(img, file) {
  if (!img || !file) return null;
  try {
    const blob = await resize(file, false); const fd = new FormData();
    fd.append('file', new File([blob], 'img.webp', { type: 'image/webp' }));
    for (const k of ['k', 'id', 'ts', 't']) fd.append(k, String(img[k]));
    const r = await fetch('/api/submit-image', { method: 'POST', body: fd }); return r.ok ? (await r.json()).url || true : null;
  } catch { return null; }
}
