alter table listings drop constraint if exists listings_type_check;
alter table listings add constraint listings_type_check check (type in ('tool','course','community','freelancer','media'));
select 'ok';
