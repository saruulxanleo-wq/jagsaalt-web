'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { TYPES, DIY } from '@/lib/config';
// Утсан дээрх доод цэс (≤640px). Дээд хэвтээ цэсний оронд.
const LEARN = Object.values(TYPES).filter(t => t.group === 'learn');
export default function MobileTabs() {
  const p = usePathname() || '/'; const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [p]);
  if (p.startsWith('/admin')) return null;
  const tabs = [['/', '🏢', 'Агентлаг', p === '/' || p.startsWith('/a/') || p === '/songoh' || p.startsWith('/haritsuulah')], [TYPES.freelancer.path, '🧑‍💻', 'Мэргэжилтэн', p.startsWith(TYPES.freelancer.path)],
    ['/influencer', '⭐', 'Инфлүэнсер', p.startsWith('/influencer')], [DIY.path, '🛠', 'Өөрөө хийх', p.startsWith(DIY.path) || LEARN.some(t => p.startsWith(t.path))]];
  const more = [[TYPES.media.path, TYPES.media.icon || '📺', TYPES.media.label], ['/ajil', '💼', 'Ажил, төсөл'], ['/surgalt#huvaari', '📅', 'Сургалтын хуваарь'], ['/songoh', '🎯', 'Надад тохирох агентлагийг ол'], ['/minii', '👤', 'Миний самбар'], ['/nemeh', '➕', 'Жагсаалтад нэмэх']];
  return <>
    {open && <div className="msheet" onClick={() => setOpen(false)}><div onClick={e => e.stopPropagation()}>{more.map(([h, i, l]) => <Link key={h} href={h}><span aria-hidden>{i}</span>{l}</Link>)}</div></div>}
    <nav className="mtabs" aria-label="Үндсэн цэс">
      {tabs.map(([h, i, l, on]) => <Link key={h} href={h} className={on ? 'on' : undefined}><span aria-hidden>{i}</span>{l}</Link>)}
      <button type="button" className={open || more.some(([h]) => p.startsWith(h.split('#')[0]) && h !== '/') ? 'on' : undefined} onClick={() => setOpen(!open)} aria-expanded={open}><span aria-hidden>☰</span>Бусад</button>
    </nav>
  </>;
}
