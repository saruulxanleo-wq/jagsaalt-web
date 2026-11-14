'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useShort, clearShort } from '@/lib/shortlist';
// Сонгосон агентлагууд байвал доор хөвөх «Харьцуулах» мөр
export default function CompareBar() {
  const s = useShort(), p = usePathname() || '';
  if (!s.length || p.startsWith('/haritsuulah') || p.startsWith('/admin')) return null;
  return <div className="cbar" role="region" aria-label="Харьцуулах">
    <span><b>{s.length}</b> агентлаг сонгосон{s.length < 2 ? ' · дахиад 1+ сонго' : ''}</span>
    <button type="button" className="cbx" onClick={clearShort} aria-label="Цэвэрлэх">✕</button>
    <Link href={'/haritsuulah?a=' + s.join(',')} className="btn lime" style={{ padding: '9px 16px', fontSize: 14 }}>Харьцуулах →</Link>
  </div>;
}
