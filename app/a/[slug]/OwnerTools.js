'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { sb, api } from '@/lib/sbclient';
export default function OwnerTools({ slug }) {
  const [href, setHref] = useState(null);
  useEffect(() => { sb().auth.getSession().then(async ({ data }) => {
    if (!data.session) return; const r = await api('/api/me');
    if (r.agency?.slug === slug) setHref('/minii'); else if (r.is_admin) setHref('/minii?edit=' + slug);
  }); }, [slug]);
  return href ? <Link href={href} className="btn dark">✎ Профайл засах</Link> : null;
}
