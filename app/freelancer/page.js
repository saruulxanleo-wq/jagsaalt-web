import { listListings } from '@/lib/db';
import { TYPES } from '@/lib/config';
import Hub from '../Hub';
export const dynamic = 'force-dynamic';
export const metadata = { title: TYPES.freelancer.title, description: TYPES.freelancer.sub };
export default async function Page() { return <Hub type="freelancer" list={await listListings('freelancer')} />; }
