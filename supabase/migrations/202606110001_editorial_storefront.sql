alter table public.products
  add column if not exists fit_note text,
  add column if not exists fit text not null default 'True to size'
    check (fit in ('Narrow', 'True to size', 'Roomy')),
  add column if not exists width text not null default 'Standard'
    check (width in ('Narrow', 'Standard', 'Wide')),
  add column if not exists materials text,
  add column if not exists care text,
  add column if not exists merchandising_label text;

alter table public.store_settings
  add column if not exists delivery_note text not null default
    'Delivery cost and timing are confirmed with you on WhatsApp.',
  add column if not exists returns_note text not null default
    'Exchange requests are reviewed before the pair is worn outdoors.',
  add column if not exists size_guide_note text not null default
    'Measure your foot heel-to-toe and choose the closest EU size.';

create table if not exists public.analytics_daily (
  event_date date not null default current_date,
  event_name text not null,
  product_id text not null default '',
  category text not null default '',
  event_count integer not null default 0,
  primary key (event_date, event_name, product_id, category)
);

alter table public.analytics_daily enable row level security;

create or replace function public.track_store_event(
  p_event_name text,
  p_product_id uuid default null,
  p_category text default ''
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_event_name not in (
    'product_view',
    'filter_use',
    'gallery_interaction',
    'add_to_cart',
    'size_help_click',
    'whatsapp_checkout_click'
  ) then
    raise exception 'Unsupported analytics event';
  end if;

  insert into public.analytics_daily (
    event_date,
    event_name,
    product_id,
    category,
    event_count
  )
  values (
    current_date,
    p_event_name,
    coalesce(p_product_id::text, ''),
    coalesce(p_category, ''),
    1
  )
  on conflict (event_date, event_name, product_id, category)
  do update set event_count = analytics_daily.event_count + 1;
end;
$$;

grant execute on function public.track_store_event(text, uuid, text) to anon, authenticated;
