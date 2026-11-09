import './globals.css';
import Link from 'next/link';
import { siteUrl, SITE_NAME } from '@/lib/config';
export const generateMetadata = async () => ({
  metadataBase: new URL(siteUrl()),
  openGraph: { type: 'website', locale: 'mn_MN', siteName: 'jagsaalt.mn', images: [{ url: '/og.png', width: 1200, height: 630 }] },
  twitter: { card: 'summary_large_image' },
  title: { default: 'Монголын маркетингийн агентлагууд | ' + SITE_NAME, template: '%s | ' + SITE_NAME },
  description: 'Монголын маркетингийн агентлагуудын нээлттэй жагсаалт. Ангиллаар шүүж, идэвхтэй эсэхийг хараад өөрт тохирохоо ол.',
});
const [n1, n2] = SITE_NAME.split('.');
export default function Root({ children }) {
  return (
    <html lang="mn">
      <body>
        <div className="wrap"><nav className="top">
          <Link href="/" className="logo"><i /><span>{n1}<b>.{n2}</b></span></Link>
          <div className="links"><Link href="/" className="on">Агентлаг</Link><span>Кино<span className="soon">удахгүй</span></span><span>Сэтгүүл<span className="soon">удахгүй</span></span></div>
          <div className="row"><Link href="/minii" className="btn ghost">Миний агентлаг</Link><Link href="/nemeh" className="btn dark">+ Нэмэх</Link></div>
        </nav></div>
        {children}
        <footer><div className="wrap row" style={{ justifyContent: 'space-between', paddingTop: 32, paddingBottom: 32 }}>
          <div className="logo" style={{ color: '#fff' }}><i /><span>{n1}<b style={{ color: 'var(--l)' }}>.{n2}</b></span></div>
          <p style={{ fontSize: 14 }}>Идэвхтэй эсэхийг Saruul RADAR шалгана · Үнэгүй жагсаалт · <Link href="/nuuts" style={{ textDecoration: 'underline' }}>Нууцлал ба нөхцөл</Link></p>
        </div></footer>
      </body>
    </html>
  );
}
