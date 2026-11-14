'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { TYPES, DIY } from '@/lib/config';
const LEARN = Object.values(TYPES).filter(t => t.group === 'learn');
export default function Nav() {
  const p = usePathname() || '/';
  const items = [['/', 'Агентлаг'], [TYPES.freelancer.path, TYPES.freelancer.label], ['/influencer', 'Инфлүэнсер'], [TYPES.media.path, TYPES.media.label], ['/ajil', 'Ажил, төсөл']];
  const on = h => h === '/' ? (p === '/' || p.startsWith('/a/') || p === '/songoh' || p.startsWith('/haritsuulah') || p === '/studi' || p === '/produkshn') : p.startsWith(h);
  const diyOn = p.startsWith(DIY.path) || LEARN.some(t => p.startsWith(t.path));
  return <div className="links">
    {items.map(([h, l]) => <Link key={h} href={h} className={on(h) ? 'on' : undefined}>{l}</Link>)}
    <span className="dd">
      <Link href={DIY.path} className={diyOn ? 'on' : undefined}>{DIY.label} <span className="ddc" aria-hidden>▾</span></Link>
      <span className="ddm" role="menu">{LEARN.map(t => <Link key={t.path} href={t.path} role="menuitem"><b>{t.icon} {t.label}</b><small>{t.short}</small></Link>)}</span>
    </span>
  </div>;
}
