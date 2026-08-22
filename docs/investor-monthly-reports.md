# MINDCAST Investor Monthly Reports

## Stage 1 audit

### Existing infrastructure reused

- Admin routing is a single Admin Console at `/admin` with role-gated tabs. The investor workspace is an Admin-only `Investor Updates` tab, with `/admin/investor-reports` as a canonical redirect.
- `public.admin_reporting_dashboard(...)` is the shared metric definition and aggregation layer used by Admin Insights. The investor query calls this RPC for the selected month, previous month and six-month trend; it does not recreate attendance, retention or journal calculations in React.
- `membership_status_events` and `reporting_membership_intervals` are the membership history source. Baseline events are explicitly not backdated.
- `scheduled_sessions` plus `check_ins` are the attendance source of truth. The billing-entitlement `attendance` table is not used as proof of presence.
- privacy-safe `journal_field_activity_events`, `reporting_journal_field_state` and `reporting_journal_session_completion` provide Adult engagement counts without journal text. Teen and Child journals are paper-only and are never given a digital completion rate.
- `subscriptions.mrr_cents` is already normalised by the Stripe webhook; weekly prices use `52 ÷ 12`. Shop and other one-off revenue is excluded from MRR.
- `households` and `household_members` supply family structure. `programme_locations` and `scheduled_sessions.location_id` supply dynamic location data.
- MINDCAST already sends through Resend. The test-send function reuses `FROM_EMAIL`, the existing verified sender helper and the existing public Supabase brand-asset bucket.
- The approved email wordmark is the public `Wordmark-White-Transparent.png`; email typography uses system-safe Arial/Helvetica fallbacks.
- No generic rich-text editor exists or is needed. The report deliberately uses constrained narrative fields, preserving concise investor-update structure.
- Admin authorisation is enforced in the route, database RLS/RPCs and the test-send Edge Function.

### Metric availability

| Metric | Current source | State |
| --- | --- | --- |
| Active members / growth | Membership intervals | Available after reporting capture; earlier months are marked partial/unavailable |
| Active paying members | Subscription events + membership intervals | Available from the billing-history capture timestamp |
| MRR / ARPM / MRR growth | Normalised subscription event snapshots | Available from the billing-history capture timestamp |
| Trial → paid | Trialing Stripe subscription transitions | Available when trial subscriptions resolve |
| 4/8-week and 3/6-month retention | Shared eligible cohort calculation | Hidden until a cohort is mature |
| Attendance / return after misses | Scheduled sessions + check-ins | Available where eligible sessions exist |
| Adult journal engagement | Privacy-safe field activity metadata | Available; no journal content is queried or stored |
| Teen / Child journal engagement | Paper journals | Intentionally unavailable |
| Family participation | Household + eligible attendance | Available where multi-member household-weeks exist |
| Active locations | Non-cancelled sessions by location | Available |
| Referral acquisition | No reliable referral attribution field | Unavailable; never shown as 0% |
| CAC / payback | No joined acquisition-spend and attribution dataset | Unavailable |
| Contribution margin | No canonical direct-delivery cost allocation | Unavailable |
| Founder-independent facilitation | Facilitator IDs exist, founder/non-founder classification does not | Unavailable |

## Architecture

```text
Admin Insights definitions
        │
        ├─ admin_reporting_dashboard(selected month)
        ├─ admin_reporting_dashboard(previous month)
        └─ admin_reporting_dashboard(six-month range)
                         │
       admin_investor_report_metrics(report month)
                         │
        React metric adapter + founder commentary
                         │
              one static email renderer
              ├─ Admin desktop preview
              ├─ Admin mobile preview
              ├─ plain text preview
              ├─ Copy HTML / text
              ├─ Download HTML / print to PDF
              └─ Resend test delivery
```

The outgoing HTML is a self-contained, 640px, table-based document with inline critical styles, absolute public image URLs, responsive stacking, alt text and no JavaScript, React, authentication or Supabase queries.

## Persistence and immutability

- `investor_reports` stores one or more numbered versions per calendar month.
- `investor_report_priorities` stores ordered objectives, targets and later outcomes.
- `investor_report_audit` records immutable lifecycle events.
- `investor_report_deliveries` records exact test/send payloads without open/click tracking.
- `investor_update_contacts` is a minimal future subscriber model because no investor CRM currently exists. It is not exposed as a bulk-send feature in this build.
- Draft/Ready reports autosave. Metrics refresh only when explicitly requested after initial creation.
- Marking a report Sent saves the complete metric JSON, definition version, HTML and plain text. Database triggers prevent edits/deletion of the Sent report and its priorities.
- A change after Sent requires `admin_create_investor_report_revision`, producing a new Draft version while preserving the original.

## Calendar and comparison conventions

- Calendar boundaries use `Pacific/Auckland`.
- A completed August report covers 1 August 00:00 through 31 August 23:59:59.999999 New Zealand time.
- The current month is visibly marked `Draft — incomplete month` and uses today's cutoff.
- Active members and active paying members are month-end snapshots (or current-as-of snapshots for an incomplete month).
- New/lost/net members are flows during the selected calendar month.
- Count and currency cards show absolute change from the prior month.
- Rate cards show percentage-point change. For example, 70% → 80% is `+10 pts`, not `+10%`.
- MRR growth is the relative change from previous month-end MRR and is unavailable when the previous value is zero.

## Metric reconciliation

The automated fixture in `src/test/investor-reports.test.ts` reconciles the adapter and renderer against a deterministic shared-reporting payload:

- membership: `40 starting + 8 new − 2 lost = 46 ending`
- paying members: `42` from the billing snapshot
- attendance: `72 attended ÷ 100 eligible = 72%`
- Adult journal: `147 meaningful fields ÷ 210 available = 70%`
- eight-week retention: `15 retained ÷ 20 mature = 75%`
- member mix: `26 Adult + 12 Teen + 8 Child = 46`

This verifies calculation wiring and email presentation, not production data. A production-month reconciliation must be performed after the migration is applied because this workspace has no authenticated production database session. For the selected month, reconcile the RPC output against restricted Admin queries for:

1. month-end membership intervals;
2. latest subscription reporting event per subscription at cutoff;
3. distinct eligible scheduled-session/check-in pairs;
4. privacy-safe journal completion metadata.

Record the checked month, query timestamp and discrepancies in the release/deployment record before the first real investor report is marked Sent.

## Deployment order

1. Apply `20260901120000_admin_reporting_foundation.sql`.
2. Apply `20260901130000_admin_reporting_queries.sql`.
3. Apply `20260901140000_investor_monthly_reports.sql`.
4. Deploy `send-investor-report-test` with `RESEND_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_URL` and the approved `FROM_EMAIL`.
5. Sign in as Admin, open `/admin/investor-reports`, select the first truthful reporting month and run the production reconciliation above.

