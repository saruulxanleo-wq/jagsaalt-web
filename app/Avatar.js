// Багийн гишүүний бэлэн дүрслэлүүд (эрэгтэй m1–m3, эмэгтэй f1–f3). Зураг оруулаагүй үед сонгоно.
export const AVATARS = {
  m1: { bg: '#EDE6FF', skin: '#F2C9A5', hair: '#1F1A2E', shirt: '#6A3DF0', g: 'm', style: 1 },
  m2: { bg: '#D9F4F6', skin: '#D9A27C', hair: '#3B2A20', shirt: '#0B7A8A', g: 'm', style: 2 },
  m3: { bg: '#EEFBD2', skin: '#C68A62', hair: '#14121F', shirt: '#14121F', g: 'm', style: 3 },
  f1: { bg: '#FFE6DF', skin: '#F2C9A5', hair: '#2A1E1A', shirt: '#E8452A', g: 'f', style: 1 },
  f2: { bg: '#EDE6FF', skin: '#E3B08C', hair: '#5A3A28', shirt: '#6A3DF0', g: 'f', style: 2 },
  f3: { bg: '#EEFBD2', skin: '#C68A62', hair: '#14121F', shirt: '#3F5A06', g: 'f', style: 3 },
};
export default function Avatar({ id, size = 56 }) {
  const a = AVATARS[id] || AVATARS.m1;
  return <svg width={size} height={size} viewBox="0 0 100 100" role="img" aria-label={a.g === 'f' ? 'Эмэгтэй дүрслэл' : 'Эрэгтэй дүрслэл'} style={{ borderRadius: '50%', display: 'block', flex: 'none' }}>
    <rect width="100" height="100" fill={a.bg} />
    {a.g === 'f' && a.style !== 3 && <path d={a.style === 1 ? 'M24 46c0-20 12-31 26-31s26 11 26 31v34H24z' : 'M26 44c0-18 11-29 24-29s24 11 24 29v20H26z'} fill={a.hair} />}
    <path d="M14 100c2-20 17-30 36-30s34 10 36 30z" fill={a.shirt} />
    <rect x="43" y="56" width="14" height="16" rx="6" fill={a.skin} />
    <ellipse cx="50" cy="44" rx="17" ry="19" fill={a.skin} />
    {a.g === 'm' && a.style === 1 && <path d="M32 42c0-14 8-21 18-21s18 7 18 21c-4-7-10-10-18-10s-14 3-18 10z" fill={a.hair} />}
    {a.g === 'm' && a.style === 2 && <path d="M32 44c-1-16 7-24 18-24 12 0 19 8 18 22-2-4-6-8-12-9-6 5-15 7-24 11z" fill={a.hair} />}
    {a.g === 'm' && a.style === 3 && <><path d="M33 38c1-11 8-16 17-16s16 5 17 16c-5-4-11-5-17-5s-12 1-17 5z" fill={a.hair} /><path d="M37 52c3 9 8 12 13 12s10-3 13-12c-2 4-7 6-13 6s-11-2-13-6z" fill={a.hair} /></>}
    {a.g === 'f' && a.style === 1 && <path d="M32 44c0-15 8-22 18-22 11 0 18 7 18 22-6-8-12-11-20-12-5 3-11 6-16 12z" fill={a.hair} />}
    {a.g === 'f' && a.style === 2 && <><circle cx="50" cy="20" r="9" fill={a.hair} /><path d="M33 42c0-13 7-19 17-19s17 6 17 19c-5-6-10-9-17-9s-12 3-17 9z" fill={a.hair} /></>}
    {a.g === 'f' && a.style === 3 && <><path d="M31 46c-2-17 6-26 19-26s21 9 19 26c-3-9-9-14-19-14s-16 5-19 14z" fill={a.hair} /><circle cx="33" cy="52" r="3" fill="#C8F169" /><circle cx="67" cy="52" r="3" fill="#C8F169" /></>}
    <circle cx="43.5" cy="46" r="1.8" fill="#14121F" /><circle cx="56.5" cy="46" r="1.8" fill="#14121F" />
    <path d="M45 54c3 2.5 7 2.5 10 0" stroke="#14121F" strokeWidth="1.8" fill="none" strokeLinecap="round" />
  </svg>;
}
export function MemberPhoto({ m, size = 56 }) {
  if (m.photo && m.photo.startsWith('http')) return <img src={m.photo} alt={m.name} width={size} height={size} style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flex: 'none' }} loading="lazy" />;
  if (m.photo && AVATARS[m.photo.replace('avatar:', '')]) return <Avatar id={m.photo.replace('avatar:', '')} size={size} />;
  return <span style={{ width: size, height: size, borderRadius: '50%', background: 'var(--v2)', color: '#4B22C9', display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: size * .4, flex: 'none' }}>{(m.name || '?').trim()[0]}</span>;
}
