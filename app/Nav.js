'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { TYPES } from '@/lib/config';
export default function Nav() {
  const p = usePathname() || '/';
  const items = [['/', 'Агентлаг'], [TYPES.freelancer.path, TYPES.freelancer.label], ['/influencer', 'Инфлүэнсер'], ...Object.entries(TYPES).filter(([k]) => k !== 'freelancer').map(([, t]) => [t.path, t.label])];
  const on = h => h === '/' ? (p === '/' || p.startsWith('/a/') || p === '/songoh') : p.startsWith(h);
  return <div className="links">{items.map(([h, l]) => <Link key={h} href={h} className={on(h) ? 'on' : undefined}>{l}</Link>)}</div>;
}
