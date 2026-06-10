# Supabase setup

1. Create a Supabase project.
2. Run the SQL migration in `migrations/202606100001_initial_shoesco.sql`.
3. Run `seed.sql` to load the current eight-product catalog.
4. Public sign-ups are disabled by `config.toml`.
5. In Authentication providers, keep Email enabled so allowlisted owners can sign in.
6. Create the owner email/password account in Authentication.
7. Add its UUID to `public.admin_users` using the SQL shown at the bottom of the migration.
8. Copy the project URL and anon key into `.env.local`.
9. Use the Shoesco admin dashboard to manage the live catalog.

Until credentials are configured, the public site uses the local seeded catalog
and `/admin` displays a setup notice.
