# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A Next.js SaaS starter kit with Supabase auth, Creem.io payments, and an AI Chinese name generator feature. Built for Chinese developers to quickly ship globally-accessible paid web apps.

## Commands

- **Dev server**: `npm run dev` (port 3000)
- **Build**: `npm run build`
- **Start production**: `npm start`
- No test runner or linter configured in package.json.

## Tech Stack

- **Framework**: Next.js (App Router) with React 19, TypeScript
- **Styling**: Tailwind CSS + shadcn/ui (Radix primitives) + Framer Motion
- **Database**: Supabase (PostgreSQL, direct SQL queries via JS client — no ORM)
- **Auth**: Supabase Auth (email/password + OAuth via Google/GitHub)
- **Payments**: Creem.io (subscriptions + one-time credit purchases)
- **AI**: OpenAI SDK against OpenRouter for name generation
- **TTS**: Doubao TTS for Chinese name pronunciation

## Architecture

### Routing & Layouts

- App Router with file-based routing under `app/`
- `(auth-pages)/` route group shares an auth layout for sign-in/sign-up/forgot-password
- Protected routes under `/dashboard` — middleware in `middleware.ts` redirects unauthenticated users to `/sign-in`
- API routes under `app/api/` as Route Handlers

### Three Supabase Client Patterns

- **Server components/actions**: `utils/supabase/server.ts` — cookie-based auth context
- **Client components**: `utils/supabase/client.ts` — browser client with auth state listener
- **Admin/webhook operations**: `utils/supabase/service-role.ts` — bypasses RLS, never expose client-side

### Auth Flow

- Server actions in `app/actions.ts`: `signUpAction`, `signInAction`, `signOutAction`, `forgotPasswordAction`, `resetPasswordAction`, `createCheckoutSession`
- OAuth callback handled at `app/auth/callback/route.ts`
- New users auto-get a `customers` row with 3 free credits (via DB trigger)
- `useUser()` hook for client-side auth state, `useSubscription()` for entitlements

### Payment & Credits System

- Creem webhook at `app/api/webhooks/creem/route.ts` with HMAC-SHA256 signature verification (`utils/creem/verify-signature.ts`)
- Subscription lifecycle managed in `utils/supabase/subscriptions.ts` via `createOrUpdateCustomer()` and `createOrUpdateSubscription()`
- Subscription tiers and credit packages defined in `config/subscriptions.ts`
- `useCredits()` hook for real-time credit balance tracking

### Database

- Migrations in `supabase/migrations/` (run via Supabase SQL editor, not CLI)
- Key tables: `customers`, `subscriptions`, `credits_history`, `saved_names`, `popular_names`, `generation_batches`, `name_generation_logs`
- RLS enabled — all tables enforce row-level security by user_id

### Key Hooks

- `hooks/use-user.ts` — auth state with loading indicator
- `hooks/use-subscription.ts` — subscription status, credits, grace period
- `hooks/use-credits.ts` — credit balance and spending
- `hooks/use-toast.ts` — toast notifications

## Coding Conventions

- TypeScript throughout; functional components only
- camelCase for variables/functions, PascalCase for components
- Tailwind CSS for all styling; maintain dark/light theme compatibility via `next-themes`
- Follow shadcn/ui patterns for new UI components (`components/ui/`)
- `lib/utils.ts` exports `cn()` for className merging
- `utils/utils.ts` exports `encodedRedirect()` for server action error/success redirects
- Form data persisted to localStorage via `utils/form-storage.ts`

## Environment Variables

Copy `.env.example` to `.env.local`. Required variables:
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- `CREEM_WEBHOOK_SECRET`, `CREEM_API_KEY`, `CREEM_API_URL`
- `NEXT_PUBLIC_SITE_URL`, `CREEM_SUCCESS_URL`
- `OPENROUTER_API_KEY` or `OPENAI_API_KEY` + `OPENAI_BASE_URL`
- `DOUBAO_TTS_APPID`, `DOUBAO_TTS_ACCESS_TOKEN`

Switch from test to production by changing `CREEM_API_URL` from `https://test-api.creem.io/v1` to `https://api.creem.io`.
