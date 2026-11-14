import { notFound } from 'next/navigation';
import { db } from '@/lib/server';
import { surveyToken } from '@/lib/survey';
import SurveyForm from './SurveyForm';
export const dynamic = 'force-dynamic';
export const metadata = { title: 'Агентлаг холбогдсон уу?', robots: { index: false } };
// Үнийн санал авсан харилцагчийн асуулга (и-мэйлээр ирсэн гарын үсэгтэй линкээр л нээгдэнэ)
export default async function Page({ params, searchParams }) {
  const { id } = await params; const { t } = await searchParams;
  if (!/^[0-9a-f-]{36}$/.test(id || '') || t !== await surveyToken(id)) notFound();
  const d = db(); if (!d) notFound();
  const { data: l } = await d.from('leads').select('id,name,agencies').eq('id', id).maybeSingle(); if (!l) notFound();
  const { data: ags } = await d.from('agencies').select('id,slug,name,logo_url').in('slug', l.agencies || []);
  const { data: done } = await d.from('reviews').select('agency_id').eq('lead_id', id);
  return <section className="wrap" style={{ maxWidth: 760, marginTop: 10 }}>
    <h1 className="h" style={{ fontSize: 'clamp(26px,3.4vw,38px)', fontWeight: 800 }}>Агентлаг тантай холбогдсон уу?</h1>
    <p style={{ color: 'var(--mute)', fontSize: 17, marginTop: 8 }}>30 секунд. Хариулт тань дараагийн хүмүүст аль агентлаг хурдан, найдвартай гэдгийг харуулна. Нэр, утас чинь хаана ч харагдахгүй.</p>
    <SurveyForm id={id} t={t} agencies={(ags || []).map(a => ({ slug: a.slug, name: a.name, logo_url: a.logo_url, done: (done || []).some(x => x.agency_id === a.id) }))} />
  </section>;
}
