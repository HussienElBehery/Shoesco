# Shoesoco deployment

## Required configuration

Set these values in the hosting platform. Never expose the service role key or
rate-limit secret to browser code.

```text
NEXT_PUBLIC_SUPABASE_URL=https://PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
RATE_LIMIT_SECRET=at-least-32-random-characters
NEXT_PUBLIC_SITE_URL=https://your-production-domain.example
```

`SHOESOCO_OFFLINE_DEV=1` is only for local Playwright/development runs. Do not
set it in production.

## Database and owner setup

1. Apply every file in `supabase/migrations` in filename order.
2. Run `supabase/seed.sql` only when starter products are wanted.
3. Create the owner through Supabase Authentication.
4. Insert the owner's auth UUID into `public.admin_users`.
5. Run `supabase/tests/deployment_hardening.sql` against a non-production test
   database after migrations.

## Release checks

Run:

```powershell
npm.cmd run check
npm.cmd run test:e2e
npm.cmd audit --omit=dev
```

The audit sends dependency metadata to npm and therefore requires explicit
approval in restricted environments. Authenticated admin E2E coverage also
requires `SHOESOCO_TEST_ADMIN_EMAIL` and `SHOESOCO_TEST_ADMIN_PASSWORD`.

After deployment, request `GET /api/health`. A `200` response with
`{"status":"ready"}` means the app can reach required Supabase data. A `503`
contains only a non-sensitive error and should trigger an alert.

## Operational behavior

- Configured production storefront queries fail closed. If Supabase is
  unavailable, customers see a temporary-unavailable message instead of local
  demo products or uncertain stock.
- Checkout checks readiness, preserves the cart and customer-entered details,
  and prevents duplicate orders with the checkout token.
- Order rate limits are stored in Supabase using a server-side HMAC of the
  requesting IP. Raw IP addresses are not stored.
- Server errors use structured JSON logs and must not include request bodies,
  customer details, credentials, or Supabase keys.

## Rollback

Redeploy the previous application release first. Database migrations are
additive; leave the hardening table and functions in place during an app
rollback. If a database rollback is essential, test it on a copy first and
remove only objects introduced by the matching migration after confirming no
active release calls them.
