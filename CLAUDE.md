# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**ZamZuur** — a Mongolian location-based shopping and daily route planning app. Users discover nearby stores, pre-order products, and plan daily shopping routes.

## Commands

```bash
npm run dev      # Start development server (Next.js)
npm run build    # Production build
npm run start    # Serve production build
npm run lint     # Run ESLint
```

No test suite is configured.

## Architecture

**Next.js App Router** with Supabase as the backend. All routing follows the `/app` directory convention.

### Key layers

- [app/](app/) — Pages and API routes. API routes under `app/api/` handle auth, products, stores, and admin operations server-side.
- [components/](components/) — React components. `components/ui/` contains shadcn/ui primitives (do not modify these manually — add via `npx shadcn@latest add <component>`).
- [lib/](lib/) — Shared logic:
  - `lib/supabase/` — Three Supabase clients: `client.ts` (browser), `server.ts` (server components/routes), `admin.ts` (service-role for admin ops).
  - `lib/types.ts` — All shared TypeScript interfaces (User, Business, Store, Product, Order, DailyPlan, etc.).
  - Context files (`auth-context.tsx`, `cart-context.tsx`, `order-context.tsx`, `plan-context.tsx`, etc.) — global state managed via React Context, all wrapped in [components/providers.tsx](components/providers.tsx).
- [data/](data/) — Static JSON seed/fixture data (`products.json`, `stores.json`, `users.json`).

### State management pattern

All major domains have a context in `lib/`. Access them via their exported hook (e.g., `useAuth`, `useCart`). They are composed in `providers.tsx` and mounted in [app/layout.tsx](app/layout.tsx).

### Maps

Map components ([components/store-map.tsx](components/store-map.tsx), [components/route-map.tsx](components/route-map.tsx)) use `react-leaflet` with OpenStreetMap tiles. Leaflet requires client-only rendering — these components use `"use client"` and dynamic imports where needed.

## Tech Stack

| Area | Library |
|------|---------|
| Framework | Next.js (App Router), React 19 |
| Language | TypeScript (`@/*` path alias maps to repo root) |
| Styling | Tailwind CSS v4, shadcn/ui (New York style, neutral theme) |
| Backend/Auth | Supabase (Postgres + Supabase Auth) |
| Forms | React Hook Form + Zod |
| Maps | Leaflet / react-leaflet |
| Charts | Recharts |

## Configuration Notes

- `next.config.mjs` ignores TypeScript build errors (`ignoreBuildErrors: true`) — the build won't fail on type errors, but they should still be fixed.
- Environment variables are in `lib/.env` (Supabase URL and anon key). Server-side admin operations use `SUPABASE_SERVICE_ROLE_KEY` from the environment.
- Both `package-lock.json` and `pnpm-lock.yaml` exist. Use `npm` unless you have a specific reason to use pnpm.
- Deployment is via GitHub Actions to GitHub Pages (`.github/workflows/nextjs.yml`).
