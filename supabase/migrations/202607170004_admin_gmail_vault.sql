create extension if not exists supabase_vault with schema vault;

revoke all on vault.secrets from public, anon, authenticated, service_role;
revoke all on vault.decrypted_secrets from public, anon, authenticated, service_role;

create or replace function public.gmail_delivery_configured()
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Not authorized';
  end if;

  return exists (
    select 1
    from vault.secrets
    where name = 'shoesoco_gmail_app_password'
  );
end;
$$;

create or replace function public.set_gmail_app_password(p_password text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  normalized_password text := regexp_replace(coalesce(p_password, ''), '\s', '', 'g');
  existing_secret_id uuid;
begin
  if not public.is_admin() then
    raise exception 'Not authorized';
  end if;

  if normalized_password !~ '^[A-Za-z0-9]{16}$' then
    raise exception 'Gmail app password must contain 16 letters or numbers';
  end if;

  select id
  into existing_secret_id
  from vault.secrets
  where name = 'shoesoco_gmail_app_password'
  limit 1;

  if existing_secret_id is null then
    perform vault.create_secret(
      normalized_password,
      'shoesoco_gmail_app_password',
      'Shoesoco Gmail SMTP app password'
    );
  else
    perform vault.update_secret(existing_secret_id, normalized_password);
  end if;
end;
$$;

create or replace function public.remove_gmail_app_password()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Not authorized';
  end if;

  delete from vault.secrets
  where name = 'shoesoco_gmail_app_password';
end;
$$;

create or replace function public.get_gmail_delivery_credentials()
returns table(gmail_user text, app_password text)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.role() <> 'service_role' then
    raise exception 'Not authorized';
  end if;

  return query
  select
    'Ahmed.rag789@gmail.com'::text,
    decrypted_secret::text
  from vault.decrypted_secrets
  where name = 'shoesoco_gmail_app_password'
  limit 1;
end;
$$;

revoke all on function public.gmail_delivery_configured() from public, anon, service_role;
revoke all on function public.set_gmail_app_password(text) from public, anon, service_role;
revoke all on function public.remove_gmail_app_password() from public, anon, service_role;
revoke all on function public.get_gmail_delivery_credentials() from public, anon, authenticated;

grant execute on function public.gmail_delivery_configured() to authenticated;
grant execute on function public.set_gmail_app_password(text) to authenticated;
grant execute on function public.remove_gmail_app_password() to authenticated;
grant execute on function public.get_gmail_delivery_credentials() to service_role;
