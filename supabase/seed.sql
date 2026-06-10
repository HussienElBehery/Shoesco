insert into public.products
  (id, slug, name, price_egp, category, gender, colors, short_description, description, featured)
values
  ('10000000-0000-4000-8000-000000000001','urban-runner-white','Urban Runner White',3499,'Sneakers','Unisex',array['White','Light Gray'],'A clean everyday sneaker with lightweight comfort and a modern profile.','Urban Runner White is designed for daily wear with cushioned comfort and an easy-to-style finish.',true),
  ('10000000-0000-4000-8000-000000000002','street-core-black','Street Core Black',3799,'Sneakers','Men',array['Black','Charcoal'],'A clean everyday sneaker with lightweight comfort and a modern profile.','Street Core Black is designed for daily wear with cushioned comfort and an easy-to-style finish.',false),
  ('10000000-0000-4000-8000-000000000003','court-line-cream','Court Line Cream',3299,'Sneakers','Women',array['Beige','Cream'],'A clean everyday sneaker with lightweight comfort and a modern profile.','Court Line Cream is designed for daily wear with cushioned comfort and an easy-to-style finish.',true),
  ('10000000-0000-4000-8000-000000000004','velocity-knit-blue','Velocity Knit Blue',4499,'Running','Men',array['Navy','Electric Blue'],'A responsive running shoe with lightweight cushioning and secure support.','Velocity Knit Blue combines breathable comfort, responsive cushioning, and stable support.',true),
  ('10000000-0000-4000-8000-000000000005','metro-low-green','Metro Low Green',3199,'Sneakers','Unisex',array['White','Forest Green'],'A clean everyday sneaker with lightweight comfort and a modern profile.','Metro Low Green is designed for daily wear with cushioned comfort and an easy-to-style finish.',false),
  ('10000000-0000-4000-8000-000000000006','tempo-flex-rose','Tempo Flex Rose',3999,'Running','Women',array['Dusty Rose','White'],'A responsive running shoe with lightweight cushioning and secure support.','Tempo Flex Rose combines breathable comfort, responsive cushioning, and stable support.',true),
  ('10000000-0000-4000-8000-000000000007','pace-shift-olive','Pace Shift Olive',4699,'Running','Unisex',array['Olive','Sand','Black'],'A responsive running shoe with lightweight cushioning and secure support.','Pace Shift Olive combines breathable comfort, responsive cushioning, and stable support.',false),
  ('10000000-0000-4000-8000-000000000008','aero-run-black','Aero Run Black',4199,'Running','Unisex',array['Black','Graphite'],'A responsive running shoe with lightweight cushioning and secure support.','Aero Run Black combines breathable comfort, responsive cushioning, and stable support.',false)
on conflict (id) do nothing;

insert into public.product_sizes (product_id, size, available)
select p.id, size::text, true
from public.products p
cross join generate_series(
  case when p.gender = 'Women' then 36 else 38 end,
  case when p.gender = 'Women' then 41 else 45 end
) size
on conflict (product_id, size) do nothing;

insert into public.product_images (product_id, storage_path, public_url, alt_text, position)
select
  id,
  case when category = 'Running' then '/images/hero/running.png' else '/images/products/sneaker.png' end,
  case when category = 'Running' then '/images/hero/running.png' else '/images/products/sneaker.png' end,
  name,
  0
from public.products
where not exists (select 1 from public.product_images where product_id = products.id);
