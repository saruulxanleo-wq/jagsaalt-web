import Link from 'next/link';
export const metadata = { title: 'Хуудас олдсонгүй' };
export default function NotFound() {
  return <section className="wrap" style={{ marginTop: 40, maxWidth: 640, textAlign: 'center' }}>
    <div className="h" style={{ fontSize: 80, fontWeight: 800, color: 'var(--v)' }}>404</div>
    <h1 className="h" style={{ fontSize: 30, fontWeight: 800, marginTop: 8 }}>Ийм хуудас олдсонгүй</h1>
    <p style={{ color: 'var(--mute)', fontSize: 17, marginTop: 10 }}>Линк хуучирсан эсвэл агентлаг жагсаалтаас хасагдсан байж магадгүй.</p>
    <div className="row" style={{ justifyContent: 'center', marginTop: 24, gap: 10 }}>
      <Link href="/" className="btn dark">Бүх агентлаг</Link><Link href="/songoh" className="btn lime">Надад тохирох агентлаг олох →</Link></div>
  </section>;
}
