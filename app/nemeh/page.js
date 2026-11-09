import AddForm from './AddForm';
export const metadata = { title: 'Жагсаалтад нэмэх' };
export default async function Page({ searchParams }) { const { type } = await searchParams; return <AddForm type={type} />; }
