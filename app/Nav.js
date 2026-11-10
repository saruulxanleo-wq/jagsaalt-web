'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { TYPES } from '@/lib/config';
export default function Nav() {
  const p = usePathname() || '/';
  const learn = Object.values(TYPES).filter(t => t.group === 'learn').map(t => t.path);
  const items = [['/', 'Агентлаг'], [TYPES.freelancer.path, TYPES.freelancer.label], ['/influencer', 'Инфлүэнсер'], [TYPES.media.path, TYPES.media.label], [TYPES.course.path, 'Суралцах']];
  const on = h => h === '/' ? (p === '/' || p.startsWith('/a/') || p === '/songoh' || p === '/studi' || p === '/produkshn') : h === TYPES.course.path ? learn.some(x => p.startsWith(x)) : p.startsWith(h);
  return <div className="links">{items.map(([h, l]) => <Link key={h} href={h} className={on(h) ? 'on' : undefined}>{l}</Link>)}</div>;
}
