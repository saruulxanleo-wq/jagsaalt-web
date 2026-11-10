import { listListings } from '@/lib/db';
import { TYPES } from '@/lib/config';
import Hub from '../Hub';
export const dynamic = 'force-dynamic';
export const metadata = { title: TYPES.media.title, description: TYPES.media.sub };
export default async function Page() { return <Hub type="media" list={await listListings('media')} />; }
