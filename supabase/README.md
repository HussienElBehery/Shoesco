# Supabase setup

1. Create a Supabase project.
2. Run every SQL file in `migrations/` in filename order.
3. Run `seed.sql` to load the starter catalog.
4. Public sign-ups are disabled by `config.toml`.
5. In Authentication providers, keep Email enabled so allowlisted owners can sign in.
6. Create the owner email/password account in Authentication.
7. Add its UUID to `public.admin_users` using the SQL shown at the bottom of the migration.
8. Copy the project URL, anon key, and server-only service role key into `.env.local`.
9. Never expose `SUPABASE_SERVICE_ROLE_KEY` through a `NEXT_PUBLIC_` variable or commit it.
10. Use the Shoesoco owner dashboard to manage products, orders, and reply settings.
11. Set a random `RATE_LIMIT_SECRET` in the deployed server environment.
12. Run `tests/deployment_hardening.sql` on a test database after migrations.

The order endpoint uses the service role only on the server. Browser clients cannot
call the atomic order-creation function directly, and order rows are readable only
by allowlisted owners.

Until credentials are configured, the public site uses the local seeded catalog
and `/admin` displays a setup notice.
