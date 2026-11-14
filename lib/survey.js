import { sign, mail, esc, btn } from './server';
// Үнийн санал авсан харилцагчид 3 хоногийн дараа «агентлаг холбогдсон уу, ажил болсон уу» асуулга илгээнэ.
// Cron байхгүй тул /api/track болон админ самбар дуудах үед (isolate бүрт 15 минутад нэг удаа) шалгана.
let last = 0;
export const surveyToken = id => sign(`survey:${id}`);
export async function sendDueSurveys(d, o, force = false) {
  if (!force && Date.now() - last < 15 * 60e3) return 0; last = Date.now();
  const now = Date.now();
  const { data: due } = await d.from('leads').select('id,name,email,agencies,answers,created_at').is('survey_sent_at', null)
    .lt('created_at', new Date(now - 3 * 864e5).toISOString()).gt('created_at', new Date(now - 30 * 864e5).toISOString()).not('email', 'is', null).limit(10);
  let n = 0;
  for (const l of due || []) {
    // Давхар илгээхгүйн тулд эхлээд тэмдэглэнэ (зөвхөн хоосон байсан мөрийг)
    const { data: got } = await d.from('leads').update({ survey_sent_at: new Date().toISOString() }).eq('id', l.id).is('survey_sent_at', null).select('id');
    if (!got?.length) continue;
    const src = l.answers?.source; if (src && src !== 'profile') continue;
    if (!(l.agencies || []).length || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(l.email || '')) continue;
    const { data: ags } = await d.from('agencies').select('name').in('slug', l.agencies);
    const names = (ags || []).map(a => a.name);
    const link = `${o}/sanal/${l.id}?t=${await surveyToken(l.id)}`;
    await mail(l.email, 'Агентлаг тантай холбогдсон уу? | brief.mn', `<p>Сайн байна уу, ${esc(String(l.name).split(' ')[0])}!</p>
<p>Хэдэн өдрийн өмнө brief.mn-ээр ${names.length ? '<b>' + names.map(esc).join(', ') + '</b>' : 'агентлаг'}-аас үнийн санал авахаар хүсэлт илгээсэн. Агентлаг холбогдсон уу, ажил болсон уу гэдгийг 30 секундэд хэлж өгөөч.</p>
<p>Хариулт тань дараагийн хүмүүст аль агентлаг хурдан, найдвартай гэдгийг харуулна. Нэр, утас чинь хаана ч харагдахгүй.</p>
<p>${btn(link, 'Хариулах →', '#0B8A3E')}</p>`);
    n++;
  }
  return n;
}
