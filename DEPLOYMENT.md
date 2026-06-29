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

The customer confirmation is displayed in the browser after checkout and uses
the saved order reference plus the purchased item names:

```text
مساء الخير اوردر رقم {order_reference} حضرتك طالب {item_summary} ببلغ حضرتك ان تأكيد اي اوردر بيكون بتحويل الشحن علي الرقم دا 01154497618
```

## Database and owner setup

1. Apply every file in `supabase/migrations` in filename order.
2. Run `supabase/seed.sql` only when starter products are wanted.
3. Create the owner through Supabase Authentication.
4. Insert the owner's auth UUID into `public.admin_users`.
5. Run `supabase/tests/deployment_hardening.sql` against a non-production test
   database after migrations.

## Vercel deployment

1. Import `https://github.com/HussienElBehery/Shoesco` into Vercel.
2. Set the required configuration above for Production, Preview, and
   Development as appropriate.
3. Push to the connected production branch to trigger a build.
4. After deployment, request `GET /api/health` and confirm it returns
   `{"status":"ready"}`.

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

After deployment, place one controlled test order and confirm the customer
browser confirmation and admin order page both receive the same order reference.
A `503` from `/api/health` contains only a non-sensitive error and should
trigger an alert.

## Operational behavior

- Configured production storefront queries fail closed. If Supabase is
  unavailable, customers see a temporary-unavailable message instead of local
  demo products or uncertain stock.
- Checkout checks readiness, preserves the cart and customer-entered details,
  and prevents duplicate orders with the checkout token.
- New orders are saved in Supabase for the admin dashboard and display the
  customer confirmation message in the browser. Duplicate checkout-token
  retries reuse the saved order.
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
