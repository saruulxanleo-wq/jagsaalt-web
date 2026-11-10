import { listInfluencers } from '@/lib/db';
import Influencers from './Influencers';
export const dynamic = 'force-dynamic';
export const metadata = { title: 'Монголын инфлүэнсерүүд', description: 'Facebook, Instagram, TikTok-ийн 10 000+ дагагчтай Монгол инфлүэнсер, контент бүтээгчид — чиглэл, дагагчийн тоогоор.' };
export default async function Page() { return <Influencers list={await listInfluencers()} />; }
