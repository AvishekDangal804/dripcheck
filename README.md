# DripCheck

**Step in. Get scored. Own the vibe.**

An AI-powered fashion check built for Itahari International College (IIC) students. Step in front of the camera, get a Drip Score built only from what's actually visible, and see how your fit stacks up on today's leaderboard.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The app runs out of the box with **no environment variables required** — it uses an in-process mock data store (`lib/mockStore.ts`) and a mock AI analyzer (`services/ai/providers/mock.ts`), so the full loop (Live Fit Check, leaderboard, Top 3, Discover) works immediately for local development or a showcase demo.

## Connecting real services

Copy `.env.example` to `.env.local` and fill in:

- **Supabase** (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) — run `supabase/schema.sql`, then `supabase/policies.sql`, then `supabase/storage.sql` (and optionally `supabase/seed.sql`) in the Supabase SQL editor, in that order.
- **AI vision provider** (`AI_PROVIDER=gemini` + `GEMINI_API_KEY`) — outfit analysis is currently implemented for Gemini; OpenAI/Anthropic are stubbed behind the same interface in `services/ai/providers/` for future use.

No code changes are needed to switch modes — every data access goes through `lib/repositories/*`, which branch on whether Supabase is configured.

## Project structure

- `app/` — routes and API handlers (App Router)
- `components/` — UI, grouped by feature area (`home/`, `live/`, `wear-today/`, `discover/`, `leaderboard/`, `about/`, `auth/`, `ui/`)
- `hooks/` — camera, framing detection, fullscreen, countdown, and the Live Fit Check state machine
- `services/ai/` — the vision provider abstraction and the visibility-aware analysis contract
- `services/outfits/` — the "What Can I Wear Today" vibe templates
- `lib/` — Supabase clients, the mock-mode data repositories, scoring, validation
- `supabase/` — SQL schema, RLS policies, storage setup, seed data
- `types/` — shared TypeScript types matching the database and AI contract

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — production build
- `npm run lint` — ESLint
