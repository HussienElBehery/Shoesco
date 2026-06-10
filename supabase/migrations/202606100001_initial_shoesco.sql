create extension if not exists "pgcrypto";

create type public.product_category as enum ('Sneakers', 'Running');
create type public.product_gender as enum ('Men', 'Women', 'Unisex');

create table public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  price_egp integer not null check (price_egp >= 0),
  category public.product_category not null,
  gender public.product_gender not null,
  colors text[] not null default '{}',
  short_description text not null,
  description text not null,
  featured boolean not null default false,
  published boolean not null default true,
  archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.product_sizes (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  size text not null,
  available boolean not null default true,
  unique(product_id, size)
);

create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  storage_path text not null,
  public_url text not null,
  alt_text text not null default '',
  position integer not null default 0
);

create table public.store_settings (
  id smallint primary key default 1 check (id = 1),
  whatsapp_number text not null,
  whatsapp_display_number text not null,
  instagram_url text not null,
  tiktok_url text not null,
  email text not null,
  location text not null,
  support_hours text not null,
  hero_eyebrow text not null,
  hero_title text not null,
  hero_description text not null,
  updated_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_users where user_id = auth.uid()
  );
$$;

alter table public.admin_users enable row level security;
alter table public.products enable row level security;
alter table public.product_sizes enable row level security;
alter table public.product_images enable row level security;
alter table public.store_settings enable row level security;

create policy "Admins can read allowlist" on public.admin_users
  for select using (public.is_admin());

create policy "Published products are public" on public.products
  for select using ((published and not archived) or public.is_admin());
create policy "Admins insert products" on public.products
  for insert with check (public.is_admin());
create policy "Admins update products" on public.products
  for update using (public.is_admin()) with check (public.is_admin());
create policy "Admins delete products" on public.products
  for delete using (public.is_admin());

create policy "Public reads sizes for visible products" on public.product_sizes
  for select using (
    exists (
      select 1 from public.products p
      where p.id = product_id and ((p.published and not p.archived) or public.is_admin())
    )
  );
create policy "Admins manage sizes" on public.product_sizes
  for all using (public.is_admin()) with check (public.is_admin());

create policy "Public reads images for visible products" on public.product_images
  for select using (
    exists (
      select 1 from public.products p
      where p.id = product_id and ((p.published and not p.archived) or public.is_admin())
    )
  );
create policy "Admins manage images" on public.product_images
  for all using (public.is_admin()) with check (public.is_admin());

create policy "Store settings are public" on public.store_settings
  for select using (true);
create policy "Admins update store settings" on public.store_settings
  for update using (public.is_admin()) with check (public.is_admin());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images',
  'product-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

create policy "Product images are public" on storage.objects
  for select using (bucket_id = 'product-images');
create policy "Admins upload product images" on storage.objects
  for insert with check (bucket_id = 'product-images' and public.is_admin());
create policy "Admins update product images" on storage.objects
  for update using (bucket_id = 'product-images' and public.is_admin());
create policy "Admins delete product images" on storage.objects
  for delete using (bucket_id = 'product-images' and public.is_admin());

insert into public.store_settings (
  whatsapp_number, whatsapp_display_number, instagram_url, tiktok_url,
  email, location, support_hours, hero_eyebrow, hero_title, hero_description
) values (
  '201069368315', '010 6936 8315',
  'https://www.instagram.com/shoesoco', 'https://www.tiktok.com/@shoesoco',
  'hello@shoesco.com', 'Cairo, Egypt', 'Saturday-Thursday, 10am-8pm',
  'Sneakers / Running', 'Move well. Look effortless.',
  'Everyday sneakers and performance running shoes, selected for comfort, clean design, and the way you move.'
);

-- After creating the owner in Supabase Authentication, run:
-- insert into public.admin_users (user_id) values ('OWNER_AUTH_USER_UUID');
