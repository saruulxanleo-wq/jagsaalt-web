'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { sb } from '@/lib/sbclient';
// Эхний алхам: өөрийнхөө профайлыг нэмж байна уу, эсвэл өөр хүнийг санал болгож байна уу?
export default function Who({ type, who, setWho, children }) {
  const [s, setS] = useState(null);
  useEffect(() => { sb().auth.getSession().then(({ data }) => setS(data.session || false)); }, []);
  const ag = type === 'agency', inf = type === 'influencer';
  const selfL = ag ? 'Энэ миний агентлаг / би төлөөлдөг' : inf ? 'Энэ би өөрөө / би менежер нь' : type === 'freelancer' ? 'Энэ би өөрөө' : 'Энэ минийх / би төлөөлдөг';
  const opt = (k, title, sub) => <button type="button" onClick={() => setWho(k)} className="panel" aria-pressed={who === k}
    style={{ textAlign: 'left', padding: '16px 18px', flex: 1, minWidth: 240, cursor: 'pointer', boxShadow: who === k ? 'inset 0 0 0 3px var(--v)' : undefined }}>
    <b style={{ fontSize: 16.5 }}>{title}</b><div style={{ color: 'var(--mute)', fontSize: 14, marginTop: 4 }}>{sub}</div></button>;
  const login = () => sb().auth.signInWithOAuth({ provider: 'google', options: { redirectTo: location.origin + '/minii?next=' + encodeURIComponent(`/nemeh?type=${type}&who=self`), queryParams: { prompt: 'select_account' } } });
  return <>
    <div className="row" style={{ marginTop: 20, gap: 12, alignItems: 'stretch' }}>
      {opt('self', '🙋 ' + selfL, 'Баталгаажуулаад «✓ Баталгаажсан» тэмдэг авна, мэдээллээ өөрөө засна, санал шууд чамд ирнэ')}
      {opt('other', '👀 Өөр хүнийг санал болгож байна', 'Мэдэх хүн, байгууллагаа жагсаалтад нэмүүлэх. Эзэн нь дараа нь баталгаажуулна')}
    </div>
    {who === 'self' && s === false && <div className="panel" style={{ marginTop: 18, display: 'grid', gap: 12, boxShadow: 'inset 0 0 0 3px var(--v)' }}>
      <b style={{ fontSize: 17 }}>Эхлээд нэвтэр</b>
      <p style={{ color: 'var(--mute)', margin: 0 }}>Хуурамч профайл үүсгэхээс сэргийлж эзэмшигчийг Google бүртгэл, утасны дугаар болон баталгаажуулах кодоор шалгадаг. Нэвтэрсний дараа энэ хуудас руу буцаж ирнэ.</p>
      <button type="button" className="btn dark" onClick={login} style={{ justifySelf: 'start' }}>Google-ээр нэвтрэх →</button></div>}
    {who === 'self' && s && ag && <Link href="/minii" className="panel row" style={{ marginTop: 18, padding: '20px 24px', boxShadow: 'inset 0 0 0 3px var(--v)', justifyContent: 'space-between' }}>
      <span><b style={{ fontSize: 17 }}>Агентлагаа «Миний самбар»-аас бүртгэ</b><br /><span style={{ color: 'var(--mute)' }}>Утсаа баталгаажуулаад агентлагаа нэмж эсвэл эзэмших хүсэлт илгээ.</span></span><span className="btn v">Үргэлжлүүлэх →</span></Link>}
    {(who === 'other' || (who === 'self' && s && !ag)) && children}
  </>;
}
