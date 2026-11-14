import { listJobs } from '@/lib/db';
import Jobs from './Jobs';
export const dynamic = 'force-dynamic';
export const metadata = { title: 'Маркетингийн ажил, төсөл', description: 'Монголын маркетингийн ажлын байр, фрилансерт өгөх төсөл, гэрээт ажил. Брэнд, агентлагууд зараа үнэгүй тавина.', alternates: { canonical: '/ajil' } };
export default async function Page() { return <Jobs list={await listJobs()} />; }
