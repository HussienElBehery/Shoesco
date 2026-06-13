create table if not exists public.order_rate_limits (
  client_hash text not null,
  window_started_at timestamptz not null,
  attempt_count integer not null check (attempt_count > 0),
  primary key (client_hash, window_started_at)
);

alter table public.order_rate_limits enable row level security;

create or replace function public.consume_order_rate_limit(
  p_client_hash text
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_window timestamptz := date_bin(
    interval '10 minutes',
    clock_timestamp(),
    timestamptz '2000-01-01 00:00:00+00'
  );
  v_count integer;
begin
  if p_client_hash !~ '^[0-9a-f]{64}$' then
    raise exception 'Invalid client fingerprint';
  end if;

  insert into public.order_rate_limits (
    client_hash,
    window_started_at,
    attempt_count
  )
  values (p_client_hash, v_window, 1)
  on conflict (client_hash, window_started_at)
  do update set attempt_count = order_rate_limits.attempt_count + 1
  returning attempt_count into v_count;

  delete from public.order_rate_limits
  where window_started_at < clock_timestamp() - interval '1 day';

  return v_count <= 5;
end;
$$;

revoke all on table public.order_rate_limits from public, anon, authenticated;
revoke all on function public.consume_order_rate_limit(text) from public, anon, authenticated;
grant execute on function public.consume_order_rate_limit(text) to service_role;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

revoke all on function public.track_store_event(text, uuid, text) from public;
grant execute on function public.track_store_event(text, uuid, text) to anon, authenticated;

revoke all on function public.create_store_order(
  uuid, text, text, text, text, text, text, jsonb
) from public, anon, authenticated;
grant execute on function public.create_store_order(
  uuid, text, text, text, text, text, text, jsonb
) to service_role;

create or replace function public.replace_product_sizes(
  p_product_id uuid,
  p_sizes jsonb
)
returns void
language plpgsql
security invoker
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Not authorized';
  end if;
  if jsonb_typeof(p_sizes) <> 'array'
    or jsonb_array_length(p_sizes) not between 1 and 50 then
    raise exception 'Invalid sizes';
  end if;
  if exists (
    select 1
    from jsonb_to_recordset(p_sizes) as item(size text, available boolean)
    where trim(coalesce(item.size, '')) = ''
      or char_length(item.size) > 40
  ) then
    raise exception 'Invalid size value';
  end if;
  if (
    select count(*)
    from jsonb_to_recordset(p_sizes) as item(size text, available boolean)
  ) <> (
    select count(distinct trim(item.size))
    from jsonb_to_recordset(p_sizes) as item(size text, available boolean)
  ) then
    raise exception 'Duplicate sizes';
  end if;

  delete from public.product_sizes where product_id = p_product_id;
  insert into public.product_sizes (product_id, size, available)
  select p_product_id, trim(item.size), coalesce(item.available, false)
  from jsonb_to_recordset(p_sizes) as item(size text, available boolean);
end;
$$;

revoke all on function public.replace_product_sizes(uuid, jsonb) from public, anon;
grant execute on function public.replace_product_sizes(uuid, jsonb) to authenticated;
