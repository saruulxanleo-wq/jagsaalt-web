create table if not exists profiles (
  id uuid primary key references auth.users on delete cascade,
  email text, full_name text,
  phone text unique, phone_verified_at timestamptz,
  pending_phone text, pending_verify_id text,
  created_at timestamptz not null default now()
);
alter table claims add column if not exists user_id uuid references auth.users on delete cascade;
alter table claims add column if not exists note text;
alter table claims add column if not exists decided_at timestamptz;
alter table claims alter column phone drop not null;
create table if not exists agency_members (
  agency_id uuid references agencies on delete cascade,
  user_id uuid references auth.users on delete cascade,
  role text not null default 'owner',
  created_at timestamptz not null default now(),
  primary key (agency_id, user_id)
);
create unique index if not exists one_agency_per_user on agency_members(user_id);
alter table profiles enable row level security;
alter table agency_members enable row level security;

alter table agencies add column if not exists categories text[];
update agencies set categories = array[category] where categories is null or cardinality(categories) = 0;
