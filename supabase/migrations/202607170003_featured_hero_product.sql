alter table public.store_settings
  add column if not exists hero_featured_product_id uuid
  references public.products(id) on delete set null;

update public.store_settings
set
  hero_eyebrow = 'Sneakers / Running / Shoe Care',
  updated_at = now()
where id = 1;
