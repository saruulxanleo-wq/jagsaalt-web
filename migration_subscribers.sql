-- Маркетингийнхны имэйл бүртгэл (давхар баталгаажуулалттай)
create table if not exists subscribers (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  role text,
  source text,
  status text not null default 'pending' check (status in ('pending','active','unsubscribed')),
  created_at timestamptz not null default now(),
  confirmed_at timestamptz,
  unsubscribed_at timestamptz
);
create index if not exists subscribers_status on subscribers(status);
alter table subscribers enable row level security;
select 'ok';
