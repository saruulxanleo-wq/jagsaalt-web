insert into listings (type,name,maker,description,price,url,topics,status)
select v.* from (values
('community','Монголын маркетингийн холбоо (ММХ)','Мэргэжлийн холбоо','1994 оноос үйл ажиллагаа явуулж буй маркетерүүдийн холбоо. SMART Festival of Creativity-г жил бүр зохион байгуулдаг. FB дээр 26K дагагчтай.','Гишүүнчлэлтэй','http://www.marketing.org.mn',array['brand','pr','content'],'approved'),
('community','Монголын Үндэсний Маркетингийн Холбоо','Мэргэжлийн холбоо (ТББ)','«Маркетерүүдийн нэгдэл» уриатай төрийн бус байгууллага. FB дээр 15K дагагчтай.','Гишүүнчлэлтэй','https://mnma.mn',array['brand','pr'],'approved'),
('community','MMDA – Монголын маркетинг хөгжлийн академи','Академи','Монголд маркетингийн шинжлэх ухааныг хөгжүүлэх чиглэлээр сургалт, судалгаа, зөвлөгөө өгдөг.','Төлбөртэй','https://www.facebook.com/MMDAMGL',array['brand','data'],'approved'),
('community','Marketing Mongolia','Facebook пэйж','Маркетингийн оюутан, залуус болон маркетингийг өдөр тутамдаа ашигладаг хүмүүст зориулсан коммюнити пэйж. 21K дагагчтай.','Үнэгүй','https://www.facebook.com/MarketingMongolia',array['brand','content'],'approved')
) as v(type,name,maker,description,price,url,topics,status)
where not exists (select 1 from listings l where l.url = v.url);
select type, count(*) from listings where status='approved' group by type;
