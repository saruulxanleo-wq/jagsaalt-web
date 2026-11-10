import './globals.css';
import Link from 'next/link';
import Nav from './Nav';
import Subscribe from './Subscribe';
import { siteUrl, SITE_NAME } from '@/lib/config';
export const generateMetadata = async () => ({
  metadataBase: new URL(siteUrl()),
  openGraph: { type: 'website', locale: 'mn_MN', siteName: SITE_NAME, images: [{ url: '/og.png', width: 1200, height: 630 }] },
  twitter: { card: 'summary_large_image' },
  title: { default: 'Монголын маркетингийн хаб: агентлаг, фрилансер, инфлүэнсер | ' + SITE_NAME, template: '%s | ' + SITE_NAME },
  description: 'Монголын маркетингийн агентлаг, фрилансер, инфлүэнсер, хэрэгсэл, сургалт, коммюнити — бүгд нэг дор. Шүүж харьцуулаад өөрт тохирохоо ол.',
});
const [n1, n2] = SITE_NAME.split('.');
export const dynamic = 'force-dynamic';
const pixel = id => `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${id}');fbq('track','PageView');`;
export default function Root({ children }) {
  const pid = (process.env.META_PIXEL_ID || '').replace(/\D/g, '');
  return (
    <html lang="mn">
      <body>
        {pid && <script dangerouslySetInnerHTML={{ __html: pixel(pid) }} />}
        <div className="wrap"><nav className="top">
          <Link href="/" className="logo" aria-label={SITE_NAME}><img src="/logo.png" alt={SITE_NAME} width={199} height={34} /></Link>
          <Nav />
          <div className="row topbtns"><Link href="/minii" className="btn ghost"><span className="hide-sm">Миний </span>самбар</Link><Link href="/nemeh" className="btn dark">+ Нэмэх</Link></div>
        </nav></div>
        {children}
        <footer><div className="wrap" style={{ paddingTop: 34 }}><Subscribe source="footer" variant="footer" /></div><div className="wrap row" style={{ justifyContent: 'space-between', paddingTop: 32, paddingBottom: 32 }}>
          <div className="logo" style={{ color: '#fff' }}><i /><span>{n1}<b style={{ color: '#2BD46E' }}>.{n2}</b></span></div>
          <p style={{ fontSize: 14 }}>Идэвхтэй эсэхийг Saruul RADAR шалгана · Үнэгүй жагсаалт · <Link href="/une" style={{ textDecoration: 'underline' }}>Үнийн санал</Link> · <Link href="/nuuts" style={{ textDecoration: 'underline' }}>Нууцлал ба нөхцөл</Link> · <Link href="/aldaa" style={{ textDecoration: 'underline' }}>Алдаа мэдээлэх</Link></p>
        </div></footer>
      </body>
    </html>
  );
}
