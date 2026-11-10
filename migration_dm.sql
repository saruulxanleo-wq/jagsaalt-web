-- Инфлүэнсер: эзэмшигчийн сонгосон шууд холбоо барих суваг (Messenger, WhatsApp, утас, имэйл)
alter table influencers add column if not exists dm_url text;
grant select (dm_url) on influencers to anon, authenticated;
select 'ok';
