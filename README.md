# Nike Store E-Commerce full Production Ready

A full-stack Nike-style e-commerce app built with Next.js 15, featuring product browsing, authentication, INR pricing, Stripe checkout, and order management.

🔗 **Live:** https://nike-web-iota.vercel.app

## Features

- **Storefront** — hero, product listing with filters & sorting, search, and product detail pages with a simulated multi-angle gallery (swipeable on mobile).
- **Auth** — email/password + Google sign-in (Better Auth), session-aware navbar.
- **Cart & Favorites** — persistent client-side cart and favorites (Zustand).
- **Checkout** — Stripe-hosted checkout in INR, with server-side price validation.
- **Orders** — order history with status, plus cancel + automatic Stripe refund.
- **Responsive** — mobile-first UI throughout (drawer menu, dot-indicator gallery).

## Tech Stack

- **Framework:** Next.js 15 (App Router), React 19, TypeScript
- **Styling:** Tailwind CSS v4
- **Database:** Neon (PostgreSQL) + Drizzle ORM
- **Auth:** Better Auth
- **Payments:** Stripe
- **State:** Zustand

## Getting Started

```bash
npm install
cp .env.example .env.local   # fill in the values below
npm run db:push              # create tables
npm run db:seed              # seed sample products
npm run dev                  # http://localhost:3000
```

## Environment Variables

```env
DATABASE_URL=                  # Neon Postgres connection string
BETTER_AUTH_SECRET=            # random 32-byte hex
BETTER_AUTH_URL=               # http://localhost:3000 (or deployed URL)

GOOGLE_CLIENT_ID=              # optional, for Google login
GOOGLE_CLIENT_SECRET=

STRIPE_SECRET_KEY=             # sk_test_... for checkout
STRIPE_WEBHOOK_SECRET=         # whsec_... marks orders paid
```

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run db:push` | Push schema to the database |
| `npm run db:seed` | Seed sample data |
| `npm run db:studio` | Open Drizzle Studio |

## Deployment

Deployed on **Vercel**. Set all environment variables in the Vercel dashboard, point `BETTER_AUTH_URL` to your deployed URL, and add a Stripe webhook for `checkout.session.completed` at `/api/webhooks/stripe`.

## Testing Payments

Use Stripe test mode with card `4242 4242 4242 4242`, any future expiry, any CVC.
