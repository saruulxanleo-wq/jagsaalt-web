import { Suspense } from 'react';
import Account from './Account';
export const metadata = { title: 'Миний самбар' };
export default function Page() { return <Suspense><Account /></Suspense>; }
