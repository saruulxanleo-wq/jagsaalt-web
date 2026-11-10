import { NextResponse } from 'next/server';
// Хуучин *.workers.dev болон www. хаягаас үндсэн домэйн рүү 301 (API-г хөндөхгүй: QPay callback гэх мэт)
export function middleware(req) {
  const canon = (process.env.SITE_URL || '').replace(/\/$/, '');
  let ch; try { ch = new URL(canon).host; } catch { return NextResponse.next(); }
  const host = req.headers.get('host') || '';
  if (!ch || ch.endsWith('workers.dev') || host === ch || host.startsWith('localhost')) return NextResponse.next();
  if (host.endsWith('workers.dev') || host === 'www.' + ch) {
    const u = new URL(req.url); return NextResponse.redirect(canon + u.pathname + u.search, 301);
  }
  return NextResponse.next();
}
export const config = { matcher: ['/((?!api/|_next/|.*\\.(?:png|jpg|svg|ico|webp|txt|xml)$).*)'] };
