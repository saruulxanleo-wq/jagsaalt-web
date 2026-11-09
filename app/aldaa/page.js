import { Suspense } from 'react';
import BugForm from './BugForm';
export const metadata = { title: 'Алдаа мэдээлэх' };
export default function Page() { return <Suspense><BugForm /></Suspense>; }
