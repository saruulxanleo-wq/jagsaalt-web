-- Хаб: хэрэгсэл, сургалт, коммюнити
create table if not exists listings (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('tool','course','community')),
  name text not null,
  maker text,
  description text,
  price text,
  url text not null,
  logo_url text,
  topics text[] not null default '{}',
  status text not null default 'pending',
  sponsored boolean not null default false,
  contact text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists listings_type_status on listings(type, status);
alter table listings enable row level security;
drop policy if exists "public approved listings" on listings;
create policy "public approved listings" on listings for select using (status = 'approved');
-- contact баганыг нийтэд харуулахгүй
revoke select on listings from anon, authenticated;
grant select (id,type,name,maker,description,price,url,logo_url,topics,status,sponsored,created_at) on listings to anon, authenticated;

alter table events add column if not exists listing_id uuid references listings on delete cascade;
create index if not exists events_listing_time on events(listing_id, created_at);

insert into listings (type,name,maker,description,price,url,topics,status) values
 ('tool','Meta Ad Library','Meta','Аль ч хуудас ямар зар явуулж байгааг үнэгүй харна. Өрсөлдөгчөө судлах хамгийн энгийн арга.','Үнэгүй','https://www.facebook.com/ads/library/','{ads,data}','approved'),
 ('tool','Google Trends','Google','Хүмүүс юуг хэр их хайж байгааг цаг хугацаа, бүсээр харуулна.','Үнэгүй','https://trends.google.com/','{data}','approved'),
 ('tool','Canva','Canva','Пост, сторис, зарын зураг, танилцуулгыг загвараас хурдан бүтээнэ.','Үнэгүй · Pro төлбөртэй','https://www.canva.com/','{design,content}','approved'),
 ('tool','CapCut','ByteDance','Reels, TikTok видеог утсан дээрээ эвлүүлэх, хадмал автоматаар нэмэх.','Үнэгүй · Pro төлбөртэй','https://www.capcut.com/','{content}','approved'),
 ('tool','SARUUL Score','saruul.work','Facebook хуудсаа 100 онооны системээр үнэлүүлж, юуг засахаа мэд.','9 000₮','https://score.saruul.work/','{social,ads}','approved'),
 ('tool','SARUUL Framework','saruul.work','Facebook зарын мөнгө хаашаа урсаж байгааг шалгах алхам алхмын аргачлал.','98 000₮','https://saruul.work/framework','{ads}','approved'),
 ('tool','PlanAI','planai.mn','Бизнесийнхээ мэдээллийг оруулаад маркетингийн төлөвлөгөө AI-аар гаргана.',null,'https://planai.mn','{ai,brand}','approved'),
 ('course','Meta Blueprint','Meta','Facebook, Instagram зарын албан ёсны үнэгүй сургалт, гэрчилгээтэй.','Үнэгүй','https://www.facebook.com/business/learn','{ads,social}','approved'),
 ('course','Google Skillshop','Google','Google Ads, Analytics, YouTube зарын үнэгүй сургалт, гэрчилгээ.','Үнэгүй','https://skillshop.withgoogle.com/','{ads,data}','approved'),
 ('course','HubSpot Academy','HubSpot','Контент, имэйл, борлуулалтын маркетингийн үнэгүй курсууд.','Үнэгүй','https://academy.hubspot.com/','{content,brand}','approved')
on conflict do nothing;
select type, count(*) from listings group by type;
