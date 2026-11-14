import './globals.css';
import Link from 'next/link';
import Nav from './Nav';
import Subscribe from './Subscribe';
import AdminBell from './AdminBell';
import MobileTabs from './MobileTabs';
import CompareBar from './CompareBar';
import { siteUrl, SITE_NAME } from '@/lib/config';
export const generateMetadata = async () => ({
  metadataBase: new URL(siteUrl()),
  openGraph: { type: 'website', locale: 'mn_MN', siteName: SITE_NAME, images: [{ url: '/og-brief.jpg', width: 1200, height: 630 }] },
  twitter: { card: 'summary_large_image' },
  title: { default: 'Монголын маркетингийн хаб: агентлаг, фрилансер, инфлүэнсер | ' + SITE_NAME, template: '%s | ' + SITE_NAME },
  description: 'Монголын маркетингийн агентлаг, фрилансер, инфлүэнсер, хэрэгсэл, сургалт, коммюнити — бүгд нэг дор. Шүүж харьцуулаад өөрт тохирохоо ол.',
});
const [n1, n2] = SITE_NAME.split('.');
export const dynamic = 'force-dynamic';
// Pixel, GA-г хуудас бүрэн ачаалсны дараа (load + 1.5с) татна. fbq/gtag дараалал нь шууд үүсэх тул эрт дуудсан event алдагдахгүй.
const later = src => `addEventListener('load',function(){setTimeout(function(){var t=document.createElement('script');t.async=1;t.src='${src}';document.head.appendChild(t)},1500)});`;
const pixel = id => `!function(f){if(f.fbq)return;var n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[]}(window);fbq('init','${id}');fbq('track','PageView');` + later('https://connect.facebook.net/en_US/fbevents.js');
const gtag = id => `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${id}');` + later('https://www.googletagmanager.com/gtag/js?id=' + id);
export default function Root({ children }) {
  const pid = (process.env.META_PIXEL_ID || '').replace(/\D/g, '');
  const gid = (process.env.GA_ID || '').replace(/[^A-Z0-9-]/gi, '');
  return (
    <html lang="mn">
      <head>
        <link rel="preload" href="/fonts/geologica-cyrillic-800-normal.woff2" as="font" type="font/woff2" crossOrigin="" />
        <link rel="preload" href="/fonts/geologica-cyrillic-400-normal.woff2" as="font" type="font/woff2" crossOrigin="" />
        <link rel="preconnect" href="https://feclitszuweodpnyejnj.supabase.co" />
      </head>
      <body>
        {pid && <script dangerouslySetInnerHTML={{ __html: pixel(pid) }} />}
        {gid && <script dangerouslySetInnerHTML={{ __html: gtag(gid) }} />}
        <div className="wrap"><nav className="top">
          <Link href="/" className="logo" aria-label={SITE_NAME}><img src="/logo.webp" alt={SITE_NAME} width={199} height={34} fetchPriority="high" /></Link>
          <Nav />
          <div className="row topbtns"><AdminBell /><Link href="/minii" className="btn ghost"><span className="hide-sm">Миний </span>самбар</Link><Link href="/nemeh" className="btn dark">+ Нэмэх</Link></div>
        </nav></div>
        {children}
        <CompareBar /><MobileTabs />
        <footer><div className="wrap" style={{ paddingTop: 34 }}><Subscribe source="footer" variant="footer" /></div><div className="wrap row" style={{ justifyContent: 'space-between', paddingTop: 32, paddingBottom: 32 }}>
          <div className="logo" style={{ color: '#fff' }}><i /><span>{n1}<b style={{ color: '#2BD46E' }}>.{n2}</b></span></div>
          <p style={{ fontSize: 14 }}>Идэвхтэй эсэхийг Saruul RADAR шалгана · Үнэгүй жагсаалт · <Link href="/une" style={{ textDecoration: 'underline' }}>Үнийн санал</Link> · <Link href="/nuuts" style={{ textDecoration: 'underline' }}>Нууцлал ба нөхцөл</Link> · <Link href="/aldaa" style={{ textDecoration: 'underline' }}>Алдаа мэдээлэх</Link></p>
        </div></footer>
      </body>
    </html>
  );
}
