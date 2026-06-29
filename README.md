# Shoesoco

A production-ready footwear storefront and order-management platform built with
Next.js, React, TypeScript, and Supabase.

[Live Demo](https://shoesoco-store.netlify.app) ·
[Health Check](https://shoesoco-store.netlify.app/api/health)

## Overview

Shoesoco is a responsive e-commerce application for browsing footwear, managing
a persistent cart, and submitting guest orders. It also includes a protected
admin workspace for managing products, images, store settings, and order
statuses.

The project was designed as a complete production workflow rather than a static
storefront. It includes database authorization, distributed rate limiting,
failure states, secure API responses, deployment health reporting, and
automated desktop and mobile testing.

## Key Features

### Customer experience

- Responsive product catalog with search, category filters, sorting, and size
  availability
- Product details, image gallery, quick view, and accessible size guide
- Persistent shopping cart that survives refreshes and temporary service errors
- Guest checkout with validation, duplicate-order protection, and WhatsApp
  follow-up
- Dedicated loading, empty, unavailable, error, and not-found states
- Keyboard-friendly dialogs and drawers with focus management and scroll locking

### Admin workspace

- Supabase Authentication with an explicit admin allowlist
- Product creation, editing, archiving, and image management
- Store settings and customer reply-template management
- Order review and status updates
- Server-enforced authorization for every protected admin operation

### Production readiness

- Content Security Policy, HSTS, frame protection, MIME sniffing protection,
  referrer policy, and restrictive permissions policy
- Supabase Row Level Security and tightened SQL function permissions
- Atomic, database-backed order rate limiting using hashed request identifiers
- Request-size limits, safe API errors, and structured server-side logging
- Transaction-aware product updates and cleanup after failed image operations
- Fail-closed production behavior when Supabase is unavailable
- Non-sensitive `/api/health` readiness endpoint

## Tech Stack

| Area | Technology |
| --- | --- |
| Framework | Next.js 16, React 19 |
| Language | TypeScript |
| Styling | Tailwind CSS 4 |
| Database and API | Supabase Postgres |
| Authentication | Supabase Auth |
| File storage | Supabase Storage |
| Unit testing | Vitest |
| Browser testing | Playwright |
| Hosting | Vercel |

## Architecture

```text
Customer or Admin
        |
        v
Next.js application
  |-- Server Components and protected admin actions
  |-- Storefront and order APIs
  |-- Security headers and health reporting
        |
        v
Supabase
  |-- PostgreSQL with Row Level Security
  |-- Authentication and admin authorization
  |-- Product image storage
  |-- Orders, settings, analytics, and rate limits
```

Production storefront requests use Supabase as the source of truth. Bundled
catalog data is available only for explicitly unconfigured local development;
production never shows fallback inventory when the database is unavailable.

## Local Development

### Requirements

- Node.js 22 or newer
- npm
- A Supabase project for database-backed functionality

### Setup

1. Clone the repository and install dependencies:

   ```bash
   git clone https://github.com/HussienElBehery/Shoesco.git
   cd Shoesco
   npm install
   ```

2. Copy `.env.example` to `.env.local` and provide the required values:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_ANON_KEY=
   SUPABASE_SERVICE_ROLE_KEY=
   RATE_LIMIT_SECRET=
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   RESEND_API_KEY=
   RESEND_FROM_EMAIL=
   OWNER_NOTIFICATION_EMAIL=Ahmed.rag789@gmail.com
   ```

3. Apply the SQL files in `supabase/migrations` in filename order.

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000).

Never commit `.env.local` or expose the service-role key in browser code.
Detailed production and admin setup instructions are available in
[DEPLOYMENT.md](./DEPLOYMENT.md).

## Quality Checks

```bash
npm run lint
npm run typecheck
npm test
npm run build
npm run test:e2e
```

`npm run check` runs linting, type checking, unit tests, and the production
build in sequence. The Playwright suite covers desktop and mobile storefront
flows, responsive overflow, cart behavior, checkout, and authenticated admin
workflows when test credentials are configured.

## API Conventions

- `GET /api/health` returns `200` when required services are ready and `503`
  when the application is degraded.
- API failures use the non-sensitive shape `{ "error": "...", "code": "..." }`.
- Customer data, authentication details, secrets, and raw IP addresses are not
  written to application logs.

## Deployment

The live application is deployed on Vercel from the connected GitHub
repository. Pushes to the production branch trigger a new production build
automatically.

See [DEPLOYMENT.md](./DEPLOYMENT.md) for environment variables, migration order,
admin setup, release verification, health checks, and rollback guidance.

## Project Highlights

This project demonstrates:

- End-to-end ownership of a real e-commerce workflow
- Secure full-stack development with authentication, RLS, and server-only
  credentials
- Defensive API and database design
- Responsive and accessible interface implementation
- Automated unit, integration, and browser testing
- Production deployment and operational documentation

## Author

**Hussien El Behery**

- [GitHub](https://github.com/HussienElBehery)
- [Live project](https://shoesoco-store.netlify.app)
