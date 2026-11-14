-- Аудитын ажлууд (2026-11): хүсэлтийн дараах асуулга → баталгаатай сэтгэгдэл, ажлын самбар, сургалтын хуваарь
alter table leads add column if not exists survey_sent_at timestamptz;

create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references leads(id) on delete cascade,
  agency_id uuid not null references agencies(id) on delete cascade,
  contacted text check (contacted in ('24h','3d','7d','no')),   -- агентлаг хэр хурдан холбогдсон
  hired text check (hired in ('yes','talking','no')),           -- ажил болсон уу
  rating int check (rating between 1 and 5),
  draft text,      -- харилцагчийн бичсэн сэтгэгдэл (админ батлахаас өмнө нууц)
  comment text,    -- батлагдсан, нийтэд харагдах сэтгэгдэл
  author text,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz,
  unique (lead_id, agency_id)
);
alter table reviews enable row level security;
drop policy if exists reviews_read on reviews;
create policy reviews_read on reviews for select to anon, authenticated using (true);
revoke all on reviews from anon, authenticated;
grant select (id, agency_id, contacted, hired, rating, comment, author, status, created_at) on reviews to anon, authenticated;

create table if not exists jobs (
  id uuid primary key default gen_random_uuid(),
  kind text not null default 'project' check (kind in ('job','project')),
  title text not null,
  company text,
  description text not null,
  location text,
  budget text,
  contact text not null,
  url text,
  deadline date,
  topics text[] not null default '{}',
  status text not null default 'pending' check (status in ('pending','approved','rejected','closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz
);
alter table jobs enable row level security;
drop policy if exists jobs_read on jobs;
create policy jobs_read on jobs for select to anon, authenticated using (status = 'approved');
grant select on jobs to anon, authenticated;

alter table listings add column if not exists starts_at date;
alter table listings add column if not exists schedule text;
grant select (starts_at, schedule) on listings to anon, authenticated;

select 'ok' as done;
