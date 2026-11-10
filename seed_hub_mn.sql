insert into listings (type,name,maker,description,price,url,topics,status)
select v.* from (values
-- Сургалтууд
('course','Дижитал маркетинг төлбөргүй онлайн сургалт','Edu Grow','Дижитал маркетинг, SEO, сошиал медиа, AI маркетинг, Photoshop/Premiere зэрэг Монгол хэл дээрх онлайн хичээлүүд. Үндсэн багц нь төлбөргүй.','Үнэгүй','https://surgalt.grow.mn/',array['social','content','ai'],'approved'),
('course','Content Marketing & Viral Content сургалт','Marketskills','Контент маркетинг, viral контентын бүтэц, Meta Ads, дижитал стратегийн онлайн сургалт. 16 жилийн туршлагатай маркетерийн хөтөлбөр.','Төлбөртэй','https://www.marketskills.mn/',array['content','social','ads'],'approved'),
('course','DMI Pro – Монгол хэл','Corporate Aid (DMI албан ёсны түнш)','Digital Marketing Institute-ийн олон улсын диплом. 40 цаг, 107 хичээл, Монгол хэл дээр.','4,466,000₮','https://corporateaid.mn/marketing-dmi/',array['ads','social','data'],'approved'),
('course','Digital Marketing Essentials – Монгол хэл','Corporate Aid','Маркетингийн суурьгүй хүнд зориулсан DMI-ийн танилцуулах сургалт: дижитал суваг, хэрэглэгч, сошиал медиа, AI.','Төлбөртэй','https://www.corporateaid.mn/courses/digital-marketing-essentials-монгол-хэл/',array['social','ai'],'approved'),
('course','Дижитал маркетинг & AI сургалтууд','Mergen Marketing','2013 оноос хойш дижитал маркетинг заасан багийн бичлэгтэй онлайн сургалтууд: маркетинг, AI, вэбсайт, борлуулалт. Бүгд Монгол хэл дээр.','Төлбөртэй','https://www.mergenmarketing.com/',array['ads','ai','content'],'approved'),
('course','Facebook Маркетинг Мастеркласс 2026','Nathouse Marketing','Facebook Ads Manager, контент төлөвлөлт, үр дүнгийн шинжилгээ. Видео хичээлүүд хаалттай Facebook группт, оны эцэс хүртэл үзнэ.','Төлбөртэй','https://nathouse.mn/social-media-surgalt',array['ads','social'],'approved'),
('course','Маркетерүүдэд зориулсан 54 үнэгүй онлайн сургалт','Nathouse Marketing','HubSpot, Google, Semrush, Canva зэрэг сертификаттай үнэгүй сургалтуудыг сэдвээр нь ангилсан Монгол хэл дээрх жагсаалт.','Үнэгүй','https://nathouse.mn/social_media/5135',array['content','ads','data'],'approved'),
('course','Бизнесийн борлуулалт, маркетинг','УБ хотын Худалдаа аж үйлдвэрийн танхим','Бүтээгдэхүүн хөгжүүлэлт, борлуулалтын төлөвлөгөө, төсөв, гадаад зах зээл. 8 цаг, танхим болон онлайн.','Төлбөртэй','https://www.ubchamber.mn/p/84',array['brand','data'],'approved'),
-- Коммюнитинууд (Facebook групп, гишүүдийн тоо 2026.11)
('community','Сошиал медиа маркетинг','Facebook групп','Монголын хамгийн том SMM групп (61K гишүүн). Сурталчилгаа, контент, пэйж удирдлагын асуулт хариулт.','Үнэгүй','https://www.facebook.com/groups/MongolianDigitalMarketing',array['social','ads'],'approved'),
('community','СОШИАЛ МАРКЕТИНГ','Facebook групп','44K гишүүнтэй нээлттэй групп. Сошиал маркетингийн зөвлөгөө, туршлага солилцоо.','Үнэгүй','https://www.facebook.com/groups/148606607175644',array['social','content'],'approved'),
('community','Маркетингийн Менежер','Facebook групп','24K гишүүнтэй, маркетингийн менежерүүдийн нээлттэй групп. Мэдлэг, ажлын байр, хамтын ажиллагаа.','Үнэгүй','https://www.facebook.com/groups/834653669995958',array['brand','social'],'approved'),
('community','Сошиал медиа маркетинг (хаалттай)','Facebook групп','18K гишүүнтэй хаалттай групп. Элсэхдээ хүсэлт илгээнэ.','Үнэгүй','https://www.facebook.com/groups/socialmediamongolia',array['social'],'approved'),
('community','Social Media Marketing Mongolia','Facebook групп','16K гишүүнтэй сошиал медиа маркетингийн нээлттэй групп.','Үнэгүй','https://www.facebook.com/groups/754595542091025',array['social','content'],'approved'),
('community','Маркетингийн орон зай | Marketing Space','Facebook групп','9.4K гишүүнтэй, маркетерүүдийн мэдлэг хуваалцах орон зай.','Үнэгүй','https://www.facebook.com/groups/marketing.managers.mongolia',array['brand','content'],'approved'),
('community','Сошиал Медиа Маркетинг – Асуулт, хариулт','Facebook групп','7.6K гишүүнтэй. SMM-ийн практик асуултаа тавьж, туршлагатай хүмүүсээс хариулт авах групп.','Үнэгүй','https://www.facebook.com/groups/530093907123122',array['social','ads'],'approved'),
('community','Маркетинг, борлуулалтын менежерүүдийн зарын групп','Facebook групп','5.7K гишүүн, өдөрт ~10 пост. Маркетинг, борлуулалтын ажлын байрны зар.','Үнэгүй','https://www.facebook.com/groups/4328449473936945',array['brand'],'approved'),
('community','ӨВ маркетинг хөтөч','Facebook групп','3.8K гишүүнтэй маркетингийн нээлттэй групп.','Үнэгүй','https://www.facebook.com/groups/UV.marketing',array['content','brand'],'approved'),
('community','Дижитал маркетинг менежерүүдийн групп','Facebook групп','3.2K гишүүн, өдөрт ~7 пост. Дижитал маркетерүүдийн идэвхтэй групп.','Үнэгүй','https://www.facebook.com/groups/362756022600382',array['ads','social'],'approved')
) as v(type,name,maker,description,price,url,topics,status)
where not exists (select 1 from listings l where l.url = v.url);
select type, count(*) from listings where status='approved' group by type;
