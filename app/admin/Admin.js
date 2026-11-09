'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { sb, api } from '@/lib/sbclient';
import { catsOf, catLabel } from '@/lib/config';
const ago = t => { const h = Math.round((Date.now() - new Date(t)) / 36e5); return h < 1 ? 'дөнгөж сая' : h < 24 ? `${h} цагийн өмнө` : `${Math.round(h / 24)} өдрийн өмнө`; };
const Box = ({ title, n, children }) => <div className="panel" style={{ marginTop: 18 }}><h2 className="h" style={{ fontSize: 20, fontWeight: 700 }}>{title} <span style={{ color: 'var(--mute)' }}>{n}</span></h2><div style={{ display: 'grid', gap: 12, marginTop: 14 }}>{n ? children : <p style={{ color: 'var(--mute)' }}>Хоосон.</p>}</div></div>;
const Row = ({ children, actions }) => <div className="row" style={{ background: 'var(--bg)', borderRadius: 16, padding: '12px 14px', justifyContent: 'space-between', gap: 12 }}><div style={{ flex: 1, minWidth: 240 }}>{children}</div><div className="row" style={{ gap: 6 }}>{actions}</div></div>;
export default function Admin() {
  const [s, setS] = useState(undefined); const [data, setData] = useState(null); const [err, setErr] = useState(null); const [q, setQ] = useState('');
  useEffect(() => { sb().auth.getSession().then(({ data }) => setS(data.session)); }, []);
  const load = async () => { const r = await api('/api/admin/list'); r.ok ? setData(r) : setErr(r.error); };
  useEffect(() => { if (s) load(); }, [s]);
  const act = async (kind, id, action, confirmText) => {
    if (confirmText && !window.confirm(confirmText)) return;
    const r = await api('/api/admin/action', { kind, id, action }); r.ok ? load() : setErr(r.error);
  };
  if (s === undefined) return <section className="wrap" style={{ padding: 40 }}>…</section>;
  if (!s) return <section className="wrap" style={{ padding: 40 }}><Link href="/minii" className="btn dark">Нэвтрэх</Link></section>;
  if (err && !data) return <section className="wrap" style={{ padding: 40 }}><div className="err">{err}</div></section>;
  if (!data) return <section className="wrap" style={{ padding: 40 }}>Ачаалж байна…</section>;
  return <section className="wrap" style={{ maxWidth: 980, marginTop: 10 }}>
    <div className="row" style={{ justifyContent: 'space-between' }}>
      <h1 className="h" style={{ fontSize: 34, fontWeight: 800 }}>Админ</h1>
      <span style={{ color: 'var(--mute)', fontWeight: 600 }}>Жагсаалтад {data.total} агентлаг</span>
    </div>
    {err && <div className="err" style={{ marginTop: 12 }}>{err}</div>}
    <Box title="Эзэмших хүсэлт" n={data.claims.length}>{data.claims.map(c => <Row key={c.id}
      actions={<><button className="btn v" onClick={() => act('claim', c.id, 'approve')}>Батлах</button><button className="btn ghost" onClick={() => act('claim', c.id, 'reject', 'Татгалзах уу?')}>Татгалзах</button></>}>
      <b>{c.agencies?.name}</b> ← {c.user?.full_name || c.user?.email} <span style={{ color: 'var(--mute)' }}>· {c.user?.email} · {c.phone}</span>
      <div style={{ fontSize: 14 }}>«{c.note}» · <a href={c.agencies?.fb_url} target="_blank" rel="noopener" style={{ color: 'var(--v)' }}>FB</a> · <span style={{ color: 'var(--mute)' }}>{ago(c.created_at)}</span></div></Row>)}</Box>
    <Box title="Шинэ агентлагийн санал" n={data.pending.length}>{data.pending.map(a => <Row key={a.id}
      actions={<><button className="btn v" onClick={() => act('agency', a.id, 'approve')}>Нэмэх</button><button className="btn ghost" onClick={() => act('agency', a.id, 'reject')}>Татгалзах</button></>}>
      <b>{a.name}</b> <span style={{ color: 'var(--mute)' }}>· {catsOf(a).map(catLabel).join(', ')} · {a.added_by === 'owner' ? 'эзэн нэмсэн' : 'хэрэглэгч санал болгосон'}</span>
      <div style={{ fontSize: 14 }}>{a.fb_url ? <a href={a.fb_url} target="_blank" rel="noopener" style={{ color: 'var(--v)' }}>{a.fb_url.replace('https://www.', '')}</a> : 'линкгүй'} · <span style={{ color: 'var(--mute)' }}>{ago(a.created_at)}</span></div></Row>)}</Box>
    <Box title="Мэдээлэл буруу гэсэн гомдол" n={data.reports.length}>{data.reports.map(r => <Row key={r.id}
      actions={<><Link className="btn ghost" href={`/minii?edit=${r.agencies?.slug}`}>Засах</Link><button className="btn ghost" onClick={() => act('report', r.id, 'resolve')}>Шийдсэн</button></>}>
      <b>{r.agencies?.name}</b> <span style={{ color: 'var(--mute)' }}>· {ago(r.created_at)}</span><div style={{ fontSize: 14, whiteSpace: 'pre-wrap' }}>{r.message}</div></Row>)}</Box>
    <div className="panel" style={{ marginTop: 18 }}>
      <h2 className="h" style={{ fontSize: 20, fontWeight: 700 }}>Агентлаг засах / нуух</h2>
      <p style={{ color: 'var(--mute)', marginTop: 6 }}>Аль ч агентлагийн профайл руу ороод «✎ Профайл засах» дар. Эсвэл slug-аар нь шууд:</p>
      <form className="row" style={{ marginTop: 10 }} onSubmit={e => { e.preventDefault(); if (q) location.href = '/minii?edit=' + encodeURIComponent(q.trim()); }}>
        <input className="field" style={{ marginTop: 0, flex: 1 }} placeholder="жишээ нь spotagency" value={q} onChange={e => setQ(e.target.value)} /><button className="btn dark">Засах</button></form>
    </div>
  </section>;
}
