import { Suspense } from 'react';
import Wizard from './Wizard';
export const metadata = { title: 'Ямар агентлагтай хамтрах вэ? 1 минутад ол', description: '5 асуултад хариулаад өөрийн бизнест тохирох маркетингийн агентлагуудыг ол. Үнэгүй.' };
export default function Page() { return <Suspense><Wizard /></Suspense>; }
