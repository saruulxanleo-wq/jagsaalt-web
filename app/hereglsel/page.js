import { listListings } from '@/lib/db';
import { TYPES } from '@/lib/config';
import Hub from '../Hub';
export const dynamic = 'force-dynamic';
export const metadata = { title: TYPES.tool.title, description: TYPES.tool.sub };
export default async function Page() { return <Hub type="tool" list={await listListings('tool')} />; }
