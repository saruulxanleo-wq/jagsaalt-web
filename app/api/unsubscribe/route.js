import { db, sign } from '@/lib/server';
import { subPage } from '@/lib/subpage';
// Имэйл бүрийн доор: /api/unsubscribe?e=<email>&t=<sign('unsub:'+email)>
async function handle(req) {
  const q = new URL(req.url).searchParams; const email = (q.get('e') || '').toLowerCase();
  if (q.get('t') !== await sign('unsub:' + email)) return subPage('Линк буруу байна', 'Цуцлах линкээ дахин шалгаарай.', false);
  const d = db(); if (d) await d.from('subscribers').update({ status: 'unsubscribed', unsubscribed_at: new Date().toISOString() }).eq('email', email);
  return subPage('Бүртгэлээс хасагдлаа', 'Цаашид имэйл илгээхгүй.');
}
export const GET = handle; export const POST = handle;
