'use client';
import { track } from '@/lib/track';
import { useState } from 'react';
import { api } from '@/lib/sbclient';
import Mine from './Mine';
import Link from 'next/link';
import { TYPES, TOPICS } from '@/lib/config';
const PH = { media: ['Хэвлэл, сайт, суваг, самбарын нэр', 'Баннер 300 000₮-с, 30 сек 500 000₮'], freelancer: ['Овог нэр', 'Сард 800 000₮-с, пост бүр 50 000₮'], tool: ['SARUUL Score, Canva…', 'Үнэгүй, 9 000₮, сард 29 000₮'], course: ['Курсын нэр', 'Үнэгүй, 350 000₮'], community: ['Группын нэр', 'Үнэгүй, гишүүнчлэл сард 20 000₮'] };
export default function ListingForm({ type }) {
  const t = TYPES[type];
  const [f, setF] = useState({ name: '', url: '', maker: '', description: '', price: '', topics: [], contact: '' });
  const [mine, setMine] = useState(false); const [msg, setMsg] = useState(null); const [busy, setBusy] = useState(false); const [done, setDone] = useState(false);
  const set = k => e => setF({ ...f, [k]: e.target.value });
  const tog = k => setF({ ...f, topics: f.topics.includes(k) ? f.topics.filter(x => x !== k) : f.topics.length >= 3 ? f.topics : [...f.topics, k] });
  async function submit(e) {
    e.preventDefault(); setBusy(true); setMsg(null);
    const r = await api('/api/listing/submit', { ...f, type, mine }); setBusy(false);
    r.ok ? (setDone(true), track('SubmitApplication', { content_name: 'listing_' + type })) : setMsg(r.error || 'Алдаа гарлаа');
  }
  if (done) return <div className="panel ok" style={{ marginTop: 22, fontSize: 17 }}>Баярлалаа! Админ шалгаад нийтэлнэ. <Link href={t.path} style={{ textDecoration: 'underline' }}>{t.plural} →</Link></div>;
  return <form onSubmit={submit} className="panel" style={{ marginTop: 18, display: 'grid', gap: 18 }}>
    <div><label htmlFor="ln" className="lab">Нэр</label><input id="ln" required className="field" maxLength={80} placeholder={PH[type][0]} value={f.name} onChange={set('name')} /></div>
    <div><label htmlFor="lu" className="lab">Линк</label><input id="lu" required className="field" placeholder={type === 'community' ? 'facebook.com/groups/…' : type === 'freelancer' ? 'Facebook профайл, LinkedIn эсвэл портфолио' : 'https://…'} value={f.url} onChange={set('url')} /></div>
    <div><label htmlFor="ld" className="lab">Товч тайлбар <span style={{ color: 'var(--mute)', fontWeight: 500 }}>· {f.description.length}/200</span></label>
      <textarea id="ld" required className="field" rows={3} maxLength={200} placeholder={type === 'freelancer' ? 'Юу хийдэг, ямар брэндүүдтэй ажилласан бэ?' : 'Юу хийдэг, хэнд хэрэгтэй вэ?'} value={f.description} onChange={set('description')} /></div>
    <div><span className="lab">Сэдэв <span style={{ color: 'var(--mute)', fontWeight: 500 }}>· 1–3 ({f.topics.length}/3)</span></span>
      <div className="row" style={{ marginTop: 9 }}>{Object.entries(TOPICS).map(([k, v]) => { const on = f.topics.includes(k); return <button type="button" key={k} aria-pressed={on} className={'chip' + (on ? ' on' : '')} onClick={() => tog(k)}>{on && '✓ '}{v}</button>; })}</div></div>
    <div className="row" style={{ gap: 14, alignItems: 'flex-start' }}>
      <div style={{ flex: 1, minWidth: 220 }}><label htmlFor="lm" className="lab">{type === 'freelancer' ? 'Мэргэжил' : type === 'media' ? 'Төрөл' : 'Бүтээгч'} <span style={{ color: 'var(--mute)', fontWeight: 500 }}>· заавал биш</span></label><input id="lm" className="field" maxLength={60} placeholder={type === 'freelancer' ? 'SMM мэргэжилтэн, график дизайнер…' : type === 'media' ? 'Мэдээллийн сайт, ТВ, радио, гадна самбар, подкаст…' : 'Компани, хүн'} value={f.maker} onChange={set('maker')} /></div>
      <div style={{ flex: 1, minWidth: 220 }}><label htmlFor="lp" className="lab">Үнэ <span style={{ color: 'var(--mute)', fontWeight: 500 }}>· заавал биш</span></label><input id="lp" className="field" maxLength={40} placeholder={PH[type][1]} value={f.price} onChange={set('price')} /></div>
    </div>
    <div><label htmlFor="lc" className="lab">Холбоо барих утас эсвэл и-мэйл <span style={{ color: 'var(--mute)', fontWeight: 500 }}>· зөвхөн админ харна</span></label><input id="lc" className="field" maxLength={80} value={f.contact} onChange={set('contact')} /></div>
    <Mine value={mine} onChange={setMine} what={type === 'freelancer' ? 'Энэ миний профайл' : 'Энэ минийх (эзэмшигч нь би)'} />
    {msg && <div className="err">{msg}</div>}
    <button className="btn dark" disabled={busy || !f.topics.length} style={{ padding: 16 }}>{busy ? 'Түр хүлээ…' : 'Санал болгох →'}</button>
  </form>;
}
