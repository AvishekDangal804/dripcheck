# Deploying DripCheck

The app is production-ready. It builds and lints clean, and it runs in two modes
with **no code changes** between them:

| Mode | When | Data | AI |
|------|------|------|-----|
| **Mock** (default) | no env vars set | in-memory, resets on cold start | canned analyzer |
| **Live** | Supabase + AI keys set | Supabase Postgres + Storage | Gemini vision |

You can deploy straight away in mock mode for a demo, or wire up the real
services first (below) for a persistent public launch.

---

## 1. Deploy to Vercel (recommended)

This app lives in the `saugat/` subdirectory of a larger repo, so the one
setting that matters:

1. Vercel → **Add New Project** → import `AvishekDangal804/SSS-informative-website-`.
2. **Root Directory** → set to `saugat`.
3. Framework preset: **Next.js** (auto-detected). Build command `next build`,
   output handled automatically.
4. Add environment variables (section 3) — or skip them for a mock-mode demo.
5. **Deploy.**

Every push to `main` redeploys.

### Or via CLI

```bash
cd saugat
npx vercel            # first run links/creates the project
npx vercel --prod     # production deploy
```

---

## 2. Set up Supabase (for Live mode)

1. Create a project at [supabase.com](https://supabase.com).
2. In the SQL editor, run these files **in order**:
   1. `supabase/schema.sql`
   2. `supabase/policies.sql`
   3. `supabase/storage.sql`
   4. `supabase/seed.sql` *(optional — demo outfits)*
3. Project Settings → API — copy the URL, the `anon` key, and the
   `service_role` key.

## 3. Environment variables

Set these in Vercel (Project → Settings → Environment Variables), or locally in
`saugat/.env.local`. See `.env.example` for the annotated list.

| Variable | Required for Live | Notes |
|----------|-------------------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | yes | from Supabase API settings |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | yes | browser-safe |
| `SUPABASE_SERVICE_ROLE_KEY` | yes | **server only** — never expose |
| `AI_PROVIDER` | for real scoring | `gemini` (only implemented provider) |
| `GEMINI_API_KEY` | for real scoring | [aistudio.google.com](https://aistudio.google.com/app/apikey) |
| `OPENAI_API_KEY` / `ANTHROPIC_API_KEY` | no | providers stubbed for future use |

Leave all of them unset → the app stays in mock mode and still works.

If **any** Supabase var is missing the app falls back to mock data; if the AI
key is missing it falls back to the mock analyzer. Partial config is safe.

---

## 4. Pre-flight checklist

```bash
cd saugat
npm ci
npm run lint      # must pass
npm run build     # must pass
npm run start     # smoke-test the production build on :3000
```

- [ ] `npm run build` passes
- [ ] Vercel Root Directory = `saugat`
- [ ] Supabase SQL run in order (Live mode only)
- [ ] Env vars set in Vercel for the Production environment (Live mode only)
- [ ] Camera works — the site must be served over HTTPS (Vercel does this)
- [ ] Hit `/live` and run one fit check end to end
