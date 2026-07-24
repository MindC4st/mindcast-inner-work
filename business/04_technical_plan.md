# 04 · Technical Plan

*Written from the perspective of a pragmatic technical lead / CTO. This reflects
the actual state of the codebase as built so far.*

---

## Where the tech stands
The app is **substantially built**. Stack: Vite + React + TypeScript + Tailwind +
shadcn-ui on the front end; **Supabase** (Postgres, Auth, Realtime, Edge
Functions, Storage) on the back end; **Stripe** for billing; a **PWA** service
worker; and a **Capacitor** scaffold for native wrapping. NFC check-in is wired.

### Already built ✅
- Adaptive member **portal** (tile launcher, check-in, weeks, journals, progress).
- **Mindcast Live** — coursebook library, big-screen **FacilitatorView**, in-app
  **lesson editor** (edit slide text + swap YouTube per week/track).
- **52-week curriculum** in the database (three tracks) + `activity_type`.
- **Private journals** with owner-only + guardian-read security.
- **Membership + tiers** schema (adult/teen/kids add-on), Stripe **subscription
  checkout + webhook**, and a **program schedule** (weeks unlock 9:30am Sundays).
- **Server-side paywall** (content is RLS-gated — not just hidden in the UI).
- **Check-in → Welcome Wall**, **Q&A moderation**, display walls.
- **Account & data deletion** — an in-app "Delete my account" flow (Settings) +
  a `delete-account` edge function that cancels any Stripe subscription, deletes
  personal data, and removes the auth user. *(Fulfils the privacy-policy promise
  + app-store requirement.)*
- **Private colouring-PDF bucket** — a `colouring` Storage bucket (private) with
  RLS so only staff or a paying kids-add-on member can read (via signed URL);
  facilitators upload. Portal has a per-week "Download colouring page" button.

### Still to do 🔧 (in priority order)
1. **Switch Stripe on (config, not code).** Create the products/prices in Stripe
   and set the env vars: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`,
   `STRIPE_PRICE_ADULT_MONTHLY/_TERMLY`, `STRIPE_PRICE_TEEN_MONTHLY/_TERMLY`,
   `STRIPE_PRICE_KIDS_ADDON` (falls back to `STRIPE_PRICE_MONTHLY/TERMLY`). Test
   with Stripe test mode → a real card in live mode.
2. **Move off Lovable → your own Supabase + Vercel** (steps below).
3. **Apply all migrations** to your Supabase (`supabase db push`) — this turns on
   the paywall RLS, tiers, schedule, and `activity_type`.
4. **Set the program start date** at `/admin/program`.
5. **Moderation before on-screen — one gap to close.** The **facilitator live
   board is correctly gated** (only `approved` submissions display). But the two
   **legacy display walls** (`/display/wordcloud`, `/display/goals`) pull
   *opt-in-but-un-moderated* member shares (`workbook_entries.leaving_word`,
   `check_ins.goal_update`). Before you rely on those walls (or submit to app
   stores), add the same approve-before-show gate to them, or retire them in
   favour of the moderated FacilitatorView wall.
6. **Kids colouring PDFs** → the private `colouring` bucket + download button are
   **built**; just **upload the PDFs** (`week-01.pdf` … `week-52.pdf`) when ready.
7. **Live interactive widgets** — the word-cloud/poll aggregation driven by
   `activity_type` (data is in; the on-screen aggregation UI is the remaining
   build; best done against the live app).
8. **Native app-store wrapping** (Capacitor) + store submissions — see
   [06](06_app_store_checklist.md).

---

## Migration: Lovable → your own Supabase + Vercel

You're moving from Lovable's managed hosting to infrastructure **you own**. Do it
in this order to avoid downtime or data loss.

### Step 1 — Your Supabase project
- Project `pjyelgogdsuiugaudecc` is yours. Get its **DB password + API keys** from
  Project Settings.
- **Schema:** the source of truth is this repo's `supabase/migrations/`. Run:
  ```
  supabase link --project-ref pjyelgogdsuiugaudecc
  supabase db push
  ```
  This recreates every table, policy, function on your project.
- **Data:** use the export script (`EXPORT_DATA.sql`, provided separately) to pull
  rows out of Lovable's DB and load them into yours. Auth users migrate
  separately via Supabase Auth export/import.
- **Edge functions:** `supabase functions deploy` each function in
  `supabase/functions/`, then set their secrets (Stripe keys, etc.).
- **Storage:** recreate buckets (worksheets, colouring PDFs — **private**) and
  re-upload assets.

### Step 2 — Point the app at your Supabase
- Update `VITE_SUPABASE_URL` + `VITE_SUPABASE_PUBLISHABLE_KEY` (and the project
  id) in your environment to your project.
- Update Supabase **Auth redirect URLs** to your new domain.
- Update the Stripe **webhook endpoint** URL to your project's function URL.

### Step 3 — Vercel
- Import the GitHub repo into Vercel. Framework preset: **Vite** (it's a Vite
  build — `vite build`, output `dist/`; a `vercel.json` is already in the repo).
- Set all `VITE_*` env vars in Vercel (production + preview).
- Point your domain (`mindcast.co.nz`) DNS at Vercel.
- Every git push now auto-deploys — **that replaces Lovable's live preview.** Use
  Vercel's **Preview Deployments** (one per branch/PR) as your new "preview",
  and the in-app dev page menu for quick navigation.

### Step 4 — Decommission Lovable
- Once your Vercel deploy + your Supabase are verified end-to-end (login, a test
  payment, a live session), stop editing in Lovable. Keep it read-only for a
  couple of weeks as a fallback, then close it.

---

## Ongoing engineering practices
- **Branches → PRs → merge to main → auto-deploy.** (Already how the repo works.)
- **Never** put secrets in the repo — only in Supabase/Vercel env vars.
- **Back up** your Supabase (enable Point-in-Time Recovery on a paid plan once you
  have real member data — worth the $25/mo tier).
- **Security:** the paywall + journal privacy are enforced in the database (RLS),
  not just the UI — keep it that way; never widen a policy to `USING(true)` on
  member data.

## Decisions to confirm
- Domain: is `mindcast.co.nz` registered + ready to point at Vercel?
- Do you want native iOS/Android apps at launch, or **PWA-first** (installable
  from the browser, no app-store review) to start? *(Recommendation: launch
  PWA-first — zero review friction — and submit native apps once revenue
  justifies the developer accounts + review overhead.)*
- Who is your "break-glass" technical helper if something breaks during a live
  session? (Line one up — see [05](05_hr_and_safeguarding.md).)
