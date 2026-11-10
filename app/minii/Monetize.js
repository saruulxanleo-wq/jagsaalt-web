'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/sbclient';
import { PRODUCTS, priceFor, fmtMnt, isFeatured } from '@/lib/config';
import { BankBox } from '../tolbor/Pay';
export default function Monetize({ agency, slug }) {
  const [res, setRes] = useState(null); const [err, setErr] = useState(null); const [busy, setBusy] = useState(false); const [leads, setLeads] = useState(null);
  const loadLeads = () => api('/api/leads' + (slug ? '?slug=' + encodeURIComponent(slug) : '')).then(r => setLeads(r.ok ? r.leads : []));
  useEffect(() => { loadLeads(); if (location.hash === '#leads' || location.search.includes('buy=')) setTimeout(() => document.getElementById(location.hash ? 'leads' : 'feat')?.scrollIntoView({ behavior: 'smooth' }), 400); }, []);
  async function order(product, extra) { setBusy(true); setErr(null); const r = await api('/api/order', { product, slug, ...extra }); setBusy(false); if (r.ok) { setRes(r); if (product === 'lead') loadLeads(); } else setErr(r.error); }
  const feat = isFeatured(agency);
  return <>
    <div id="feat" className="panel" style={{ marginTop: 18 }}>
      <h2 className="h" style={{ fontSize: 20, fontWeight: 700 }}>⭐ Онцлох агентлаг</h2>
      {feat ? <p style={{ marginTop: 8 }}>Таны агентлаг <b>{new Date(agency.featured_until).toLocaleDateString('mn-MN')}</b> хүртэл онцлох байна. Сунгах бол доороос сонго.</p>
        : <p style={{ marginTop: 8, color: 'var(--mute)' }}>Жагсаалтын эхэнд, ангилалдаа эхэнд гарч, «Онцлох» тэмдэг авна. «Агентлаг сонгох» туслахын үр дүнд давуу эрхтэй.</p>}
      <div className="row" style={{ marginTop: 12 }}>{[1, 3].map(m => <button key={m} className={m === 3 ? 'btn dark' : 'btn ghost'} disabled={busy} onClick={() => order('agency_featured', { months: m })}>{m} сар · {fmtMnt(priceFor('agency_featured', m))}{m === 3 && ' (−15%)'}</button>)}</div>
    </div>
    {err && <div className="err" style={{ marginTop: 12 }}>{err}</div>}
    {res && <div style={{ marginTop: 12 }}><BankBox r={res} /></div>}
    <div id="leads" className="panel" style={{ marginTop: 18 }}>
      <h2 className="h" style={{ fontSize: 20, fontWeight: 700 }}>🎯 Танд тохирох клиентийн хүсэлтүүд</h2>
      <p style={{ marginTop: 6, color: 'var(--mute)' }}>«Агентлаг сонгох» туслахаар ирсэн, таны чиглэлд таарсан сүүлийн 45 хоногийн хүсэлтүүд. Холбоо барих мэдээлэл {fmtMnt(PRODUCTS.lead.price)}, нэг хүсэлтийг дээд тал нь 3 агентлаг авна.</p>
      {leads === null ? <p style={{ marginTop: 12 }}>Түр хүлээ…</p> : !leads.length ? <p style={{ marginTop: 12 }}>Одоогоор тохирох хүсэлт алга. Профайлдаа үйлчилгээ, үнийн санал нэмбэл илүү олон хүсэлтэд таарна.</p>
        : <div style={{ display: 'grid', gap: 10, marginTop: 14 }}>{leads.map(l => <div key={l.id} style={{ border: '1px solid var(--line, #E6E2F3)', borderRadius: 16, padding: 14 }}>
          <div className="row" style={{ justifyContent: 'space-between' }}><b>{l.needs.join(', ') || 'Маркетинг'}</b><span style={{ color: 'var(--mute)', fontSize: 14 }}>{l.created_at.slice(0, 10)}</span></div>
          <div style={{ color: 'var(--mute)', fontSize: 14, marginTop: 4 }}>{[l.budget && 'Төсөв: ' + l.budget + ' / сар', l.size, l.priority && 'Чухалчлах: ' + l.priority, l.industry].filter(Boolean).join(' · ')}</div>
          {l.contact ? <div className="panel ok" style={{ marginTop: 10, padding: 12 }}><b>{l.contact.name}</b>{l.contact.company && ' · ' + l.contact.company}<br />{l.contact.phone} {l.contact.email}{l.contact.fb && <><br />FB: {l.contact.fb}</>}{l.contact.note && <><br />«{l.contact.note}»</>}</div>
            : l.pending ? <div style={{ marginTop: 10 }}>Төлбөр хүлээгдэж байна · гүйлгээний утга <b>{l.pending.code}</b> · {fmtMnt(l.pending.amount)}</div>
            : l.left ? <button className="btn v" style={{ marginTop: 10 }} disabled={busy} onClick={() => order('lead', { target: l.id })}>Холбоо барих мэдээлэл авах · {fmtMnt(PRODUCTS.lead.price)} <span style={{ opacity: .8 }}>({l.left} үлдсэн)</span></button>
            : <div style={{ marginTop: 10, color: 'var(--mute)' }}>3 агентлаг авсан</div>}
        </div>)}</div>}
    </div>
  </>;
}
