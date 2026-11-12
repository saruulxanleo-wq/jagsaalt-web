-- Түнш агентлагийн (Contento) инфлүэнсерийн самбар
create table if not exists partner_access (
  email text primary key,
  scope text not null default 'influencer',
  added_at timestamptz not null default now()
);
alter table partner_access enable row level security;
create table if not exists partner_log (
  id bigserial primary key,
  actor text not null,
  action text not null,
  kind text not null,
  target text not null,
  label text,
  before jsonb,
  after jsonb,
  undone boolean not null default false,
  created_at timestamptz not null default now()
);
alter table partner_log enable row level security;
create index if not exists partner_log_time on partner_log(created_at desc);
alter table leads add column if not exists pstatus text not null default 'new';
alter table leads add column if not exists deal_amount bigint;
alter table leads add column if not exists paid_at date;
alter table leads add column if not exists pnote text;
alter table leads add column if not exists pupdated_at timestamptz;
alter table influencers add column if not exists badge text;
grant select (badge) on influencers to anon, authenticated;
