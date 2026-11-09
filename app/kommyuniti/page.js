import { listListings } from '@/lib/db';
import { TYPES } from '@/lib/config';
import Hub from '../Hub';
export const dynamic = 'force-dynamic';
export const metadata = { title: TYPES.community.title, description: TYPES.community.sub };
export default async function Page() { return <Hub type="community" list={await listListings('community')} />; }
