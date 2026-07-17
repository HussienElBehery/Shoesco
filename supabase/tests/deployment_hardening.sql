begin;

do $$
begin
  if not exists (
    select 1
    from pg_class
    where oid = 'public.order_rate_limits'::regclass
      and relrowsecurity
  ) then
    raise exception 'order_rate_limits must have RLS enabled';
  end if;

  if has_function_privilege(
    'anon',
    'public.create_store_order(uuid,text,text,text,text,text,text,jsonb)',
    'execute'
  ) then
    raise exception 'anon must not execute create_store_order';
  end if;

  if has_function_privilege(
    'authenticated',
    'public.create_store_order(uuid,text,text,text,text,text,text,jsonb)',
    'execute'
  ) then
    raise exception 'authenticated must not execute create_store_order';
  end if;

  if not has_function_privilege(
    'service_role',
    'public.create_store_order(uuid,text,text,text,text,text,text,jsonb)',
    'execute'
  ) then
    raise exception 'service_role must execute create_store_order';
  end if;

  if has_function_privilege(
    'anon',
    'public.consume_order_rate_limit(text)',
    'execute'
  ) then
    raise exception 'anon must not execute consume_order_rate_limit';
  end if;

  if not has_function_privilege(
    'authenticated',
    'public.replace_product_sizes(uuid,jsonb)',
    'execute'
  ) then
    raise exception 'authenticated admins need replace_product_sizes';
  end if;

  if not exists (
    select 1 from pg_class
    where oid = 'public.review_images'::regclass and relrowsecurity
  ) then
    raise exception 'review_images must have RLS enabled';
  end if;

  if not exists (
    select 1 from storage.buckets
    where id = 'review-images'
      and public
      and file_size_limit = 5242880
  ) then
    raise exception 'review-images bucket must be public with a 5 MB limit';
  end if;

  if has_function_privilege(
    'anon',
    'public.get_gmail_delivery_credentials()',
    'execute'
  ) or has_function_privilege(
    'authenticated',
    'public.get_gmail_delivery_credentials()',
    'execute'
  ) then
    raise exception 'browser roles must not read Gmail credentials';
  end if;

  if not has_function_privilege(
    'service_role',
    'public.get_gmail_delivery_credentials()',
    'execute'
  ) then
    raise exception 'service_role must read Gmail credentials through the protected function';
  end if;

  if has_table_privilege(
    'authenticated',
    'vault.decrypted_secrets',
    'select'
  ) then
    raise exception 'authenticated users must not directly read decrypted Vault secrets';
  end if;
end
$$;

rollback;
