import Link from 'next/link';
import { PRODUCTS, priceFor, fmtMnt } from '@/lib/config';
export const metadata = { title: 'Үнийн санал', description: 'jagsaalt.mn дээр онцлох байр, ивээн тэтгэлэг, клиентийн хүсэлтийн үнэ.' };
const CTA = { agency_featured: ['/minii?buy=featured', 'Агентлагаа онцлох болгох'], listing_sponsor: ['/tolbor?product=listing_sponsor', 'Хэрэгслээ онцлох'], lead: ['/minii#leads', 'Тохирох хүсэлтүүдээ харах'] };
export default function Page() {
  return <section className="wrap" style={{ marginTop: 10 }}>
    <h1 className="h" style={{ fontSize: 'clamp(30px,4vw,46px)', fontWeight: 800 }}>Үнийн санал</h1>
    <p style={{ color: 'var(--mute)', fontSize: 18, marginTop: 10, maxWidth: 700 }}>Жагсаалтад орох, профайлаа засах, «Баталгаажсан» тэмдэг авах нь <b style={{ color: 'var(--ink)' }}>үргэлж үнэгүй</b>. Илүү олон клиентэд харагдах, шууд хүсэлт авах бол доорх үйлчилгээг сонго.</p>
    <div className="grid" style={{ marginTop: 26 }}>{Object.entries(PRODUCTS).map(([k, p]) => <div key={k} className="card" style={{ cursor: 'default' }}>
      <div style={{ fontSize: 34 }}>{p.icon}</div>
      <h2 className="h" style={{ fontSize: 22, fontWeight: 800 }}>{p.label}</h2>
      <div><b className="h" style={{ fontSize: 32, fontWeight: 800 }}>{fmtMnt(p.price)}</b><span style={{ color: 'var(--mute)', fontWeight: 600 }}> / {p.monthly ? 'сар' : 'хүсэлт'}</span></div>
      {p.monthly && <div style={{ color: 'var(--mute)', fontSize: 14 }}>3 сараар: {fmtMnt(priceFor(k, 3))} <span className="badge b-act">15% хямд</span></div>}
      <ul style={{ display: 'grid', gap: 8, paddingLeft: 0, listStyle: 'none', margin: '6px 0' }}>{p.perks.map(x => <li key={x}>✓ {x}</li>)}</ul>
      <Link href={CTA[k][0]} className="btn dark" style={{ marginTop: 'auto', textAlign: 'center' }}>{CTA[k][1]} →</Link>
    </div>)}</div>
    <div className="panel" style={{ marginTop: 26 }}>
      <h3 className="h" style={{ fontSize: 18, fontWeight: 700 }}>Төлбөр хэрхэн төлөх вэ?</h3>
      <p style={{ marginTop: 8, color: 'var(--mute)' }}>Захиалга өгөхөд QPay QR гарна — банкны аппаараа уншуулж төлмөгц шууд идэвхжинэ. «Онцлох» тэмдэгтэй байршил бүр төлбөртэй гэдгийг хэрэглэгчдэд нээлттэй харуулдаг.</p>
    </div>
  </section>;
}
