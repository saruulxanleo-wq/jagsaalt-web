-- Монитайз: онцлох агентлаг, ивээн тэтгэсэн хэрэгсэл, лийд худалдаа, захиалга
alter table agencies add column if not exists featured_until timestamptz;
alter table listings add column if not exists sponsored_until timestamptz;
grant select (sponsored_until) on listings to anon, authenticated;
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  product text not null check (product in ('agency_featured','listing_sponsor','lead')),
  target_id uuid not null,
  target_name text,
  agency_id uuid references agencies on delete set null,
  user_id uuid,
  months int not null default 1,
  amount int not null,
  contact text,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  paid_at timestamptz
);
create index if not exists orders_status on orders(status, created_at desc);
alter table orders enable row level security;
create table if not exists lead_access (
  lead_id uuid references leads on delete cascade,
  agency_id uuid references agencies on delete cascade,
  order_id uuid references orders on delete set null,
  created_at timestamptz not null default now(),
  primary key (lead_id, agency_id)
);
alter table lead_access enable row level security;
select 'ok';
