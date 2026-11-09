# jagsaalt.mn

Монголын маркетингийн агентлагуудын жагсаалт. Next.js 15 + Supabase + WeSend (SMS).

## Cloudflare Workers-д байршуулах (OpenNext)
1. Энэ хавтсыг GitHub репод түлхэнэ.
2. Cloudflare → Workers & Pages → Create → Import a repository → репогоо сонгоно.
   - Build command: `npx opennextjs-cloudflare build`
   - Deploy command: `npx opennextjs-cloudflare deploy`
3. Worker → Settings → Variables and Secrets:
   - `SUPABASE_SECRET_KEY` (Secret) — Supabase → Project Settings → API Keys → Secret key
   - `WESEND_API_KEY` (Secret) — wesend.mn → API түлхүүр
   - `NEXT_PUBLIC_SITE_URL` — wrangler.jsonc дотор (домэйн солиход зөвхөн үүнийг өөрчилнө)
4. Worker → Settings → Domains & Routes → jagsaalt.mn холбоно.

Локал: `npm run preview`

Supabase: төсөл `jagsaalt` (feclitszuweodpnyejnj). Бүтэц: `schema.sql`.
Шинэ агентлаг `status='pending'` орж ирнэ; Supabase Table Editor дээр `approved` болгоход сайтад гарна.
SMS-ээр баталгаажсан хүсэлт `claims.status='phone_verified'` болно; дугаарыг FB хуудастай тулгаад `agencies.verified=true` болгоно.
