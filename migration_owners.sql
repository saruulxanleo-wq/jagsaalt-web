-- Эзэмшил: хэрэгсэл, сургалт, коммюнити, фрилансер, инфлүэнсер
alter table listings drop constraint if exists listings_type_check;
alter table listings add constraint listings_type_check check (type in ('tool','course','community','freelancer'));
alter table listings add column if not exists owner_id uuid references auth.users on delete set null;
alter table listings add column if not exists verified boolean generated always as (owner_id is not null) stored;
alter table influencers add column if not exists owner_id uuid references auth.users on delete set null;
alter table influencers add column if not exists verified boolean generated always as (owner_id is not null) stored;
create index if not exists listings_owner on listings(owner_id);
create index if not exists influencers_owner on influencers(owner_id);
grant select (verified) on listings to anon, authenticated;
grant select (verified) on influencers to anon, authenticated;

create table if not exists item_claims (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('listing','influencer')),
  item_id uuid not null,
  user_id uuid not null references auth.users on delete cascade,
  phone text,
  note text,
  proof text,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  decided_at timestamptz
);
create index if not exists item_claims_status on item_claims(status, created_at desc);
create unique index if not exists item_claims_one_pending on item_claims(kind, item_id, user_id) where status = 'pending';
alter table item_claims enable row level security;
select 'ok';
