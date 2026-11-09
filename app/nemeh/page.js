import { Suspense } from 'react';
import AddForm from './AddForm';
export const metadata = { title: 'Агентлаг нэмэх' };
export default function Page() { return <Suspense><AddForm /></Suspense>; }
