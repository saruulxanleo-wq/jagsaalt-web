'use client';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
export default function BugForm() {
  const sp = useSearchParams(); const pm = (sp.get('m') || '').slice(0, 300);
  const [f, setF] = useState({ message: pm, contact: '', page: (sp.get('p') || '').slice(0, 200) }); const [st, setSt] = useState(null);
  useEffect(() => { try { const r = document.referrer && new URL(document.referrer); if (r && r.origin === location.origin) setF(f => f.page ? f : ({ ...f, page: r.pathname })); } catch {} }, []);
  async function send(e) {
    e.preventDefault(); setSt('busy');
    const r = await fetch('/api/report', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(f) });
    const j = await r.json().catch(() => ({})); setSt(r.ok ? 'done' : j.error || 'Алдаа гарлаа');
  }
  return <section className="wrap" style={{ maxWidth: 640, marginTop: 10 }}>
    <h1 className="h" style={{ fontSize: 34, fontWeight: 800 }}>Алдаа мэдээлэх</h1>
    <p style={{ color: 'var(--mute)', marginTop: 8 }}>Сайт дээр ажиллахгүй байгаа зүйл, буруу харагдаж байгаа хэсэг байвал бичээрэй. Агентлагийн мэдээлэл буруу бол тухайн агентлагийн профайл дээрх «Мэдээлэл буруу байна уу?» товчийг ашиглаарай.</p>
    {st === 'done' ? <div className="panel ok" style={{ marginTop: 20 }}>Баярлалаа! Удахгүй засна. <Link href="/" style={{ textDecoration: 'underline' }}>Нүүр хуудас</Link></div> :
    <form onSubmit={send} className="panel" style={{ marginTop: 20, display: 'grid', gap: 14 }}>
      <div><label htmlFor="bp" className="lab">Аль хуудас дээр?</label><input id="bp" className="field" placeholder="Жишээ нь: /songoh эсвэл «Миний самбар»" value={f.page} maxLength={200} onChange={e => setF({ ...f, page: e.target.value })} /></div>
      <div><label htmlFor="bm" className="lab">Юу болсон бэ?</label><textarea id="bm" className="field" rows={5} required maxLength={1000} placeholder="Юу хийх гэж байхад ямар алдаа гарсныг бичнэ үү" value={f.message} onChange={e => setF({ ...f, message: e.target.value })} /></div>
      <div><label htmlFor="bc" className="lab">Холбоо барих <span style={{ color: 'var(--mute)', fontWeight: 500 }}>· заавал биш</span></label><input id="bc" className="field" placeholder="Утас эсвэл и-мэйл" value={f.contact} maxLength={100} onChange={e => setF({ ...f, contact: e.target.value })} /></div>
      {st && st !== 'busy' && <div className="err">{st}</div>}
      <button className="btn dark" disabled={st === 'busy'} style={{ padding: 15 }}>{st === 'busy' ? 'Илгээж байна…' : 'Илгээх'}</button>
    </form>}
  </section>;
}
