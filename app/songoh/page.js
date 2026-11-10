import { Suspense } from 'react';
import Wizard from './Wizard';
import { listListings } from '@/lib/db';
export const dynamic = 'force-dynamic';
export const metadata = { title: 'Ямар агентлагтай хамтрах вэ? 1 минутад ол', description: '7 асуултад хариулаад өөрийн бизнест тохирох маркетингийн агентлагуудыг ол. Үнэгүй.' };
export default async function Page() { const hub = (await listListings()).filter(l => l.type !== 'community'); return <Suspense><Wizard hub={hub} /></Suspense>; }
