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
alter table agencies add column if not exists founded int;
alter table agencies add column if not exists team_size text;
alter table agencies add column if not exists min_budget text;
alter table agencies add column if not exists socials jsonb not null default '{}'::jsonb;
alter table agencies add column if not exists clients text[] not null default '{}';
alter table agencies add column if not exists cases jsonb not null default '[]'::jsonb;
alter table agencies add column if not exists team jsonb not null default '[]'::jsonb;
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('logos', 'logos', true, 1500000, array['image/webp','image/jpeg','image/png']) on conflict (id) do nothing;
alter table profiles add column if not exists sms_day date;
alter table profiles add column if not exists sms_count int not null default 0;
alter table reports add column if not exists resolved boolean not null default false;
update agencies set name = v.n, updated_at = now() from (values
 ('mongoliannationalmarketingagency','National Marketing Agency'),
 ('healthmarketingservice','Health Marketing Services'),
 ('marshallmongolia','Marshall Mongolia'),
 ('arimunmedia','All in One Place'),
 ('todoragency','Todor Agency'),
 ('hashtagchatbotboostservice','ХашТаг'),
 ('www-fameagency-mn','Fame Agency'),
 ('achitmarketing','Achit Marketing Agency'),
 ('socialzarzurag','Сошиал пост зураг бэлтгэл'),
 ('amgalanamjiltllc','Амгалан Амжилт'),
 ('digital-social-online-marketing','Digital Social Online Marketing Agency'),
 ('brandpromo-mn','Brand Promo'),
 ('brandlymarketing','Brandly'),
 ('mnmarketingconsultingllc','MN Agency'),
 ('adstationmarketingagency','Adstation'),
 ('imarketingagency','I Marketing Agency'),
 ('medymarketingagency','Medy Marketing Agency'),
 ('lumeagencymongolia','LUME Agency'),
 ('rawagency123','RAW Agency'),
 ('kreate10','Kreate Agency'),
 ('the-vision-agency-ofc','Vision.'),
 ('ufe-marketing-agency','UFE Marketing Agency'),
 ('bee2creative','Pick Agency'),
 ('5thseasonagency','5th Season Agency'),
 ('contentlabofficial','Content Lab Agency'),
 ('storylinecreativity','StoryLine Creative Agency'),
 ('thinker-ca','Thinker Creative Agency'),
 ('socialsmartmarketing','Social Marketing Mongolia'),
 ('marketingteampr','Creative Ideas'),
 ('creativemotion-mongolia','Creative Motion Agency'),
 ('businessdevelopermarketingagency','BD Marketing Agency'),
 ('agency-carpediem','Carpe Diem')
) as v(s, n) where agencies.slug = v.s;
select count(*) as fixed from agencies where updated_at > now() - interval '1 minute';
alter table agencies add column if not exists packages jsonb not null default '[]'::jsonb;
