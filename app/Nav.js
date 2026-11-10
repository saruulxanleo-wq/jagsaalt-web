'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { TYPES } from '@/lib/config';
export default function Nav() {
  const p = usePathname() || '/';
  const items = [['/', 'Агентлаг'], ['/influencer', 'Инфлүэнсер'], ...Object.values(TYPES).map(t => [t.path, t.label])];
  const on = h => h === '/' ? (p === '/' || p.startsWith('/a/') || p === '/songoh') : p.startsWith(h);
  return <div className="links">{items.map(([h, l]) => <Link key={h} href={h} className={on(h) ? 'on' : undefined}>{l}</Link>)}</div>;
}
