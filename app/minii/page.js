import { Suspense } from 'react';
import Account from './Account';
export const metadata = { title: 'Миний агентлаг' };
export default function Page() { return <Suspense><Account /></Suspense>; }
