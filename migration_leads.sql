-- Үнийн саналыг агентлаг руу дамжуулсан лог
alter table leads add column if not exists sent jsonb not null default '{}';     -- {slug: имэйл явсан хугацаа}
alter table leads add column if not exists handled jsonb not null default '{}';  -- {slug: админ гараар дамжуулсан хугацаа}
select count(*) from leads;
