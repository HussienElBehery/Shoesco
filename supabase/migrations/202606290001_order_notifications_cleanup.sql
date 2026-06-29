update public.store_settings
set email = 'Ahmed.rag789@gmail.com',
    updated_at = now()
where id = 1;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'orders'
      and policyname = 'Admins delete orders'
  ) then
    create policy "Admins delete orders" on public.orders
      for delete using (public.is_admin());
  end if;
end $$;
