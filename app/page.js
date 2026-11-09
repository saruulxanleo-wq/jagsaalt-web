import { listAgencies } from '@/lib/db';
import Directory from './Directory';
export const dynamic = "force-dynamic";
export default async function Home() {
  const list = await listAgencies();
  return <Directory list={list} />;
}
