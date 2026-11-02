# ORBIT
React + Vite + TypeScript planner: Running/Non-running timetables, Grok floating assistant, Supabase cloud sync.

## Run locally
```bash
npm install
# fill .env (see below)
npx vercel dev      # serves the app AND /api/ai  (npm run dev = UI only)
```

## Supabase sync setup (5 minutes)
1. supabase.com > New project.
2. SQL Editor > paste and run `supabase/schema.sql` (creates `orbit_state` with row-level security: each user reads/writes only their own row).
3. Authentication > Providers: keep Email enabled. For instant sign-up, turn off "Confirm email"; otherwise confirm via the email link first.
4. Project Settings > API: copy **Project URL** into `VITE_SUPABASE_URL` and the **anon public** key into `VITE_SUPABASE_ANON_KEY`.
5. In ORBIT: Settings > Cloud sync > Create account / Sign in. Do the same on your other devices.

Sync behaviour: the whole app state is one JSON record. Edits upload ~1.5 s after the last change; the cloud copy is checked on sign-in and when you return to the tab. If two devices edit at once, the latest edit wins. Without Supabase variables or a sign-in, ORBIT works locally as before.

## Credentials
| Variable | Where | Needed |
|---|---|---|
| `XAI_API_KEY`, `XAI_MODEL` | server only (`.env` / Vercel) | for Grok |
| `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` | `.env` / Vercel | for sync (public by design; protected by RLS) |
| `SUPABASE_SERVICE_ROLE_KEY` | - | unused; never put it in frontend code |

`VITE_` values are baked in at build time: after adding them in Vercel, redeploy. `.env` is git-ignored.

## Deploy
Push to GitHub, import in Vercel (Vite auto-detected), add the four variables above, deploy.

## Notes
- Reminders fire only while ORBIT is open (no server push).
- Not included: Calendar, Analytics, one-off Schedule, exam marks.
- Generated without running `npm install` / `npm run build` / `npm run typecheck`.
