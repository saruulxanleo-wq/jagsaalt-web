import Link from 'next/link';
import ListingCard from './ListingCard';
// Агентлагуудын дунд гарах "өөрөө хийх" мөр
export default function ToolStrip({ items }) {
  return <div className="strip">
    <div className="row" style={{ justifyContent: 'space-between', marginBottom: 12 }}>
      <b className="h" style={{ fontSize: 17, fontWeight: 700 }}>Өөрөө хийх үү? <span style={{ color: 'var(--mute)', fontWeight: 600 }}>Хэрэгсэл, сургалт, коммюнити</span></b>
      <Link href="/ooroo-hiih" style={{ color: 'var(--v)', fontWeight: 700, fontSize: 14.5 }}>Бүгдийг үзэх →</Link>
    </div>
    <div className="strip-row">{items.map(l => <ListingCard key={l.id} l={l} medium="strip" />)}</div>
  </div>;
}
