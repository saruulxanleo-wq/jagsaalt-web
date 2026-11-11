'use client';
import { trackClick } from '../../ListingCard';
import { withUtm } from '@/lib/config';
export default function GoButton({ id, url, label }) {
  return <a href={withUtm(url, 'profile')} target="_blank" rel="noopener" className="btn dark" onClick={() => trackClick(id)}>{label} ↗</a>;
}
