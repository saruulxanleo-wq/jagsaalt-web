'use client';
import { toggleShort, useShort } from '@/lib/shortlist';
// Карт дээрх «харьцуулахад нэмэх» товч
export default function ShortBtn({ slug, big }) {
  const on = useShort().includes(slug);
  const click = e => { e.preventDefault(); e.stopPropagation(); toggleShort(slug); };
  if (big) return <button type="button" className={'btn ' + (on ? 'dark' : 'ghost')} onClick={click} aria-pressed={on}>{on ? '✓ Харьцуулах жагсаалтад' : '+ Харьцуулахад нэмэх'}</button>;
  return <button type="button" className={'sbtn' + (on ? ' on' : '')} onClick={click} aria-pressed={on} title={on ? 'Харьцуулах жагсаалтаас хасах' : 'Харьцуулахад нэмэх'}>{on ? '✓' : '+'}<span>{on ? 'Сонгосон' : 'Харьцуулах'}</span></button>;
}
