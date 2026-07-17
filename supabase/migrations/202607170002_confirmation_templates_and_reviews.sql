alter table public.store_settings
  add column if not exists site_confirmation_template text not null default
    'مساء الخير اوردر رقم {order_reference} حضرتك طالب {item_summary} ببلغ حضرتك ان تأكيد اي اوردر بيكون بتحويل الشحن علي الرقم دا 01154497618',
  add column if not exists whatsapp_confirmation_template text not null default
    E'مساء الخير، أود استكمال تأكيد طلبي لدى Shoesoco.\n\nرقم الطلب: {order_reference}\n\nالمنتجات:\n{item_list}\n\nبرجاء مراجعة الطلب وتأكيد تكلفة الشحن والخطوات المطلوبة لإتمامه.';

create table if not exists public.review_images (
  id uuid primary key default gen_random_uuid(),
  storage_path text not null unique,
  public_url text not null,
  alt_text text not null default 'Customer review screenshot'
    check (char_length(alt_text) between 1 and 160),
  position integer not null default 0 check (position >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists review_images_position_idx
  on public.review_images (position, created_at);

alter table public.review_images enable row level security;

create policy "Review images are public" on public.review_images
  for select using (true);
create policy "Admins insert review images" on public.review_images
  for insert with check (public.is_admin());
create policy "Admins update review images" on public.review_images
  for update using (public.is_admin()) with check (public.is_admin());
create policy "Admins delete review images" on public.review_images
  for delete using (public.is_admin());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'review-images',
  'review-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "Review storage is public" on storage.objects
  for select using (bucket_id = 'review-images');
create policy "Admins upload review images" on storage.objects
  for insert with check (bucket_id = 'review-images' and public.is_admin());
create policy "Admins update review images" on storage.objects
  for update using (bucket_id = 'review-images' and public.is_admin());
create policy "Admins delete review images" on storage.objects
  for delete using (bucket_id = 'review-images' and public.is_admin());
