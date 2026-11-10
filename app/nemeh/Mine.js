'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { sb } from '@/lib/sbclient';
// Нэвтэрсэн бол «Энэ минийх» — нийтлэгдмэгц шууд эзэмшинэ
export default function Mine({ value, onChange, what = 'Энэ минийх' }) {
  const [s, setS] = useState(null);
  useEffect(() => { sb().auth.getSession().then(({ data }) => setS(data.session || false)); }, []);
  if (s === null) return null;
  if (!s) return <p style={{ fontSize: 14, color: 'var(--mute)' }}>Өөрийнхөө зүйлийг нэмж байгаа бол эхлээд <Link href="/minii" style={{ textDecoration: 'underline' }}>нэвтэр</Link> — тэгвэл нийтлэгдмэгц чинийх болж, өөрөө засна.</p>;
  return <label className="row" style={{ gap: 10, cursor: 'pointer', background: 'var(--v2)', borderRadius: 14, padding: '12px 14px' }}>
    <input type="checkbox" checked={value} onChange={e => onChange(e.target.checked)} style={{ width: 18, height: 18 }} />
    <span><b>{what}</b> <span style={{ color: 'var(--mute)' }}>· нийтлэгдмэгц «Миний самбар»-аас өөрөө засна</span></span></label>;
}
