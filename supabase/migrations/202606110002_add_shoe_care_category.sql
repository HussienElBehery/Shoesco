alter type public.product_category add value if not exists 'Shoe Care';

update public.store_settings
set
  hero_eyebrow = 'Sneakers / Running / Shoe Care',
  hero_description = 'Everyday sneakers, performance running shoes, and care essentials selected for comfort, clean design, and the way you move.',
  updated_at = now()
where hero_eyebrow = 'Sneakers / Running';
