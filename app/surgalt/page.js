import { listListings } from '@/lib/db';
import { TYPES } from '@/lib/config';
import Hub from '../Hub';
export const dynamic = 'force-dynamic';
export const metadata = { title: TYPES.course.title, description: TYPES.course.sub };
export default async function Page() { return <Hub type="course" list={await listListings('course')} />; }
