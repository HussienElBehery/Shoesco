create or replace function public.create_store_order(
  p_checkout_token uuid,
  p_customer_name text,
  p_customer_email text,
  p_customer_phone text,
  p_delivery_area text,
  p_delivery_address text,
  p_customer_notes text,
  p_items jsonb
)
returns table (
  order_id uuid,
  order_reference text,
  order_subtotal integer,
  order_items jsonb,
  was_existing boolean
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.orders%rowtype;
  v_item jsonb;
  v_product public.products%rowtype;
  v_quantity integer;
  v_size text;
  v_color text;
  v_line_total integer;
  v_subtotal integer := 0;
  v_items jsonb := '[]'::jsonb;
  v_image text;
begin
  select * into v_order
  from public.orders
  where checkout_token = p_checkout_token;

  if found then
    return query
      select
        v_order.id,
        v_order.reference,
        v_order.subtotal_egp,
        coalesce(jsonb_agg(jsonb_build_object(
          'productId', oi.product_id,
          'slug', oi.product_slug,
          'name', oi.product_name,
          'image', oi.product_image,
          'size', oi.size,
          'color', oi.color,
          'quantity', oi.quantity,
          'unitPrice', oi.unit_price_egp,
          'lineTotal', oi.line_total_egp
        ) order by oi.created_at), '[]'::jsonb),
        true
      from public.order_items oi
      where oi.order_id = v_order.id;
    return;
  end if;

  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) not between 1 and 20 then
    raise exception 'Order must contain between 1 and 20 items.';
  end if;

  if char_length(trim(p_customer_name)) not between 2 and 100
    or (
      trim(coalesce(p_customer_email, '')) <> ''
      and char_length(trim(p_customer_email)) not between 5 and 254
    )
    or char_length(trim(p_customer_phone)) not between 7 and 20
    or char_length(trim(p_delivery_area)) not between 2 and 100
    or char_length(trim(p_delivery_address)) not between 5 and 300
    or char_length(coalesce(p_customer_notes, '')) > 500 then
    raise exception 'Invalid customer details.';
  end if;

  insert into public.orders (
    reference,
    checkout_token,
    customer_name,
    customer_email,
    customer_phone,
    delivery_area,
    delivery_address,
    customer_notes,
    subtotal_egp
  ) values (
    'SCO-' || to_char(current_date, 'YYMMDD') || '-' ||
      upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6)),
    p_checkout_token,
    trim(p_customer_name),
    lower(trim(coalesce(p_customer_email, ''))),
    regexp_replace(p_customer_phone, '[^0-9+]', '', 'g'),
    trim(p_delivery_area),
    trim(p_delivery_address),
    trim(coalesce(p_customer_notes, '')),
    0
  )
  returning * into v_order;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    begin
      v_quantity := (v_item->>'quantity')::integer;
    exception when others then
      raise exception 'Invalid item quantity.';
    end;
    v_size := trim(v_item->>'size');
    v_color := trim(v_item->>'color');

    if v_quantity not between 1 and 20 or v_size = '' or v_color = '' then
      raise exception 'Invalid order item.';
    end if;

    select * into v_product
    from public.products
    where id = (v_item->>'productId')::uuid
      and published = true
      and archived = false;

    if not found then
      raise exception 'A product is no longer available.';
    end if;
    if not exists (
      select 1 from public.product_sizes
      where product_id = v_product.id and size = v_size and available = true
    ) then
      raise exception 'A selected size is no longer available.';
    end if;
    if not (v_color = any(v_product.colors)) then
      raise exception 'A selected color is no longer available.';
    end if;

    select coalesce(public_url, '') into v_image
    from public.product_images
    where product_id = v_product.id
    order by position
    limit 1;

    v_line_total := v_product.price_egp * v_quantity;
    v_subtotal := v_subtotal + v_line_total;

    insert into public.order_items (
      order_id,
      product_id,
      product_name,
      product_slug,
      product_image,
      size,
      color,
      quantity,
      unit_price_egp,
      line_total_egp
    ) values (
      v_order.id,
      v_product.id,
      v_product.name,
      v_product.slug,
      coalesce(v_image, ''),
      v_size,
      v_color,
      v_quantity,
      v_product.price_egp,
      v_line_total
    );

    v_items := v_items || jsonb_build_array(jsonb_build_object(
      'productId', v_product.id,
      'slug', v_product.slug,
      'name', v_product.name,
      'image', coalesce(v_image, ''),
      'size', v_size,
      'color', v_color,
      'quantity', v_quantity,
      'unitPrice', v_product.price_egp,
      'lineTotal', v_line_total
    ));
  end loop;

  update public.orders
  set subtotal_egp = v_subtotal
  where id = v_order.id;

  insert into public.order_events (order_id, event_type, description)
  values (v_order.id, 'created', 'Order submitted through the website.');

  return query select v_order.id, v_order.reference, v_subtotal, v_items, false;
end;
$$;

revoke all on function public.create_store_order(
  uuid, text, text, text, text, text, text, jsonb
) from public, anon, authenticated;
grant execute on function public.create_store_order(
  uuid, text, text, text, text, text, text, jsonb
) to service_role;
