# Mindcast — Operations Runbook (Phase 4)

Running a recurring, paid, multi-track live event for 100+ people. This is the ops layer that keeps it monitored, secure, and recoverable. Items marked **[code]** ship in this PR; the rest are configuration you perform in the respective dashboards.

## Error / session monitoring
- **[code]** `src/lib/observability.ts` initialises **Sentry** (crash/error + release health) and **PostHog** (analytics + session replay + feature flags), both env-gated and off until keys are set.
- **Set env vars** (Vercel/host): `VITE_SENTRY_DSN`, `VITE_POSTHOG_KEY`, `VITE_POSTHOG_HOST`, `VITE_APP_RELEASE`.
- **Install** `@sentry/react` and `posthog-js` (already in `package.json`).
- **Source maps:** upload web build maps to Sentry on deploy; do the same for the **Capacitor** bundles so native crashes symbolicate. Tag each release with `VITE_APP_RELEASE`.
- Why both: a bug during a live 100-person session is an incident (Sentry alerting) *and* you want to see what the member did (PostHog replay). Feature flags let you dark-launch the live engine per track.

## Uptime monitoring
- **[code]** `supabase/functions/health` returns 200 only if the DB is reachable (503 otherwise). `verify_jwt=false`.
- Point **UptimeRobot / BetterStack** at: the web app URL, `…/functions/v1/health`, and a **synthetic Realtime check** (a tiny worker that subscribes to a channel and expects a heartbeat). The Realtime check is the important one — a session going dark mid-broadcast must page immediately.

## Scheduled jobs & CRON_SECRET
- Existing cron fns (`send-practice-reminder`, `select-weekly-callbacks`) validate the service-role bearer and 401 without it.
- **[code]** `send-weekly-reminder` now also requires cron (service-role) **or** a facilitator/admin caller — previously any logged-in member could trigger an email blast.
- Cron jobs to schedule (pg_cron / Supabase scheduled functions): session reminders, **membership renewal + lapsed-payment follow-ups** (reads `subscriptions`), journal backup verification.
- Standard: every scheduled endpoint keeps `verify_jwt=false` **and** checks the service-role bearer (or a dedicated `CRON_SECRET`). Never leave a scheduled route open.

## Transactional email (Resend)
- Already wired: `send-practice-reminder`, `send-weekly-reminder`. Reuse for welcome, receipts, failed-payment, session reminders, password resets.
- **Prerequisite (do before launch):** SPF + DKIM + DMARC on the sending domain (`mindcast.co.nz`). Without these, receipts/reset emails land in spam. This is a DNS task, likely not yet done — verify in Resend's domain settings.

## AI / content tooling
- Current AI = Lovable AI Gateway → Gemini (`ai-insights`, `analyse-video`, `moderate-content`) + Anthropic (`generate-session-video`).
- Fine uses: auto discussion prompts, session summaries from *session* content.
- **Guardrail:** `ai-insights` summarises member reflections through the gateway. **Journal content must not go to any third-party AI without explicit consent + opt-out.** Add consent language before enabling anything journal-derived, or restrict inputs to non-journal content.

## Backups & durability
- Confirm **Point-in-Time Recovery** is enabled (Supabase Pro add-on).
- **Test a restore** to a scratch project — especially the journal tables (`workbook_entries`, `teen_/kids_workbook_entries`, `session_responses`). If child journal columns get field-level encryption later, rehearse restore *with* key recovery.

## Secrets management
- **[fixed earlier]** `.env` holds only the publishable anon key today, but it's tracked in git — add to `.gitignore`, untrack, and treat the anon key as rotatable. Never add `service_role`/Stripe/Resend keys to a committed file.
- Store all function secrets in Supabase Function secrets; all `VITE_*` in the host (Vercel) env. Rotate anything ever committed.

## Rate limiting & abuse
- **[code, Phase 2]** Q&A insert is rate-limited at the DB (per-actor 4s + 60/10s session flood cap). Extend the same pattern to any new public form.

## Load / capacity for 100+ concurrent
- Members each hold one Realtime **Broadcast** subscription (cheap); only presenters subscribe to the Q&A `postgres_changes` feed — the architecture scales.
- **Verify tier:** Supabase Free ≈ 200 concurrent Realtime clients, Pro ≈ 500. 100+ members × parallel tracks × multiple tabs can approach the Pro ceiling — provision **Pro** and load-test one channel-per-track before the first large session.

## Additional production flags (children's + payment + journal data)
- Children's journal: RLS-locked-to-owner shipped (Phase 0/2); **add field-level encryption on child columns** next (safeguarding).
- PCI: stay on Stripe Checkout/Elements — never handle raw card data (current flows comply).
- Collapse the two admin signals (`user_roles` vs `profiles.is_admin`) to one source of truth to avoid a privilege-check bypass.
- Regenerate `types.ts` from the live DB in CI to prevent schema/type drift causing runtime column errors.
