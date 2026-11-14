// Хүсэлтийн дараах асуулгаас гарсан баталгаатай үнэлгээ, хариу өгөх хурд
export const CONTACT = { '24h': '24 цагийн дотор', '3d': '3 хоногийн дотор', '7d': '7 хоногийн дотор', no: 'Холбогдоогүй' };
export const HIRED = { yes: 'Ажил болсон', talking: 'Яриа үргэлжилж байна', no: 'Ажил болоогүй' };
// rows: [{contacted, hired, rating}] → { n, avg, rated, fast, contacted, hired, speed }
export function statsOf(rows = []) {
  const c = rows.filter(r => r.contacted), rated = rows.filter(r => r.rating);
  const fast = c.filter(r => r.contacted === '24h').length, ok = c.filter(r => r.contacted !== 'no').length;
  const speed = c.length >= 2 ? (fast / c.length >= 0.5 ? '24h' : ok / c.length >= 0.5 ? 'ok' : 'slow') : null;
  return { n: rows.length, rated: rated.length, avg: rated.length ? Math.round(rated.reduce((s, r) => s + r.rating, 0) / rated.length * 10) / 10 : null,
    asked: c.length, fast, contacted: ok, hired: rows.filter(r => r.hired === 'yes').length, speed };
}
export const SPEED = { '24h': '⚡ 24 цагт холбогддог', ok: 'Ихэвчлэн холбогддог', slow: 'Удаан холбогддог' };
