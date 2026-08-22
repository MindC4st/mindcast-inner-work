# Admin membership reporting

## Architecture

The Admin `Insights` tab is an Admin-only reporting workspace. It calls one
filtered database function (`admin_reporting_dashboard`) and does not download
complete membership, attendance or journal histories for browser-side
aggregation. Filtered CSVs reuse the same result contract through
`admin_reporting_export`, so dashboard and export formulas cannot drift.

Existing production systems remain authoritative:

- `profiles` and `subscriptions`: current membership and billing state.
- `households` / `household_members`: family relationships.
- `scheduled_sessions`: the eligible-session schedule.
- `check_ins`: presence. Duplicate scans are reduced to one member/session
  outcome. The separate `attendance` table remains an entitlement/credit
  consumption record and is not used as proof of presence.
- `lesson_journal`: private Adult journal content. Reporting never selects or
  copies response values.
- `mindcast_live_sessions`: whether Adult video questions are available in a
  curriculum week.

The reporting foundation adds only missing historical metadata:

- `membership_status_events`: immutable status/tier transitions.
- `journal_field_activity_events`: Adult journal field empty/non-empty
  transitions, with no response content.
- `journal_session_activity`: first/last open time and open count for an Adult
  week, used to distinguish opening the journal from entering a response.
- `programme_locations`: data-driven location options, initially Taupō.
- `subscriptions.mrr_cents` / `currency`: snapshots from future Stripe events.

## Historical coverage

`reporting_history_started_at` is written when the foundation migration runs.
Existing profiles and non-empty Adult journal fields receive baseline rows at
that time. A baseline is a truthful current-state observation, not a backdated
join or response event.

Consequently:

- present-day current-state counts are available immediately;
- historical active counts, churn, retention and eligible-attendance rates are
  reliable only from the capture date;
- pre-capture periods are labelled partial in the UI;
- retention and new-member metrics exclude baseline events;
- legacy subscriptions have no MRR until Stripe sends a later subscription
  event; the UI shows “Not enough data yet”, never zero;
- referral source, household retention and founder/non-founder attribution show
  “Not enough data yet” until those facts are reliably captured.

## Metric definitions

The executable definitions live in `admin_reporting_metric_definitions()` and
the matching UI copy lives in `src/lib/adminReporting.ts`.

- **Active member:** effective `membership_status` is `active` or `trialing`,
  matching the paid-content gate. `past_due` remains visible separately.
- **Paying member:** profile or household is covered by a Stripe subscription
  whose current status is `active`. A trial is not paying.
- **Eligible session:** a non-cancelled scheduled session at or before today,
  in the member’s track/location, occurring inside an active/trialing status
  interval and after reporting capture.
- **Attended:** at least one valid `check_ins` row for the profile and scheduled
  session. Duplicate scan sources count once.
- **Missed:** eligible but not attended. A session before joining, after ending,
  in another track/location or cancelled is never a miss.
- **Attendance rate:** distinct eligible sessions attended / eligible sessions.
- **Return After Miss:** missed outcomes whose next eligible session was
  attended / missed outcomes with a subsequent eligible session. Two- and
  three-miss recovery require that many consecutive misses before the return.
- **Journal entry:** an Adult field changes from empty/placeholder to meaningful
  non-empty persisted text. Only field key, member/week and timestamp are
  recorded in analytics.
- **Session journal completion:** currently completed available fields /
  available fields. Five fields are always available; each configured video
  question adds one. Follow-up intention outcome/reflection is not part of the
  same-session denominator. Teen and Child are paper-only and display N/A.
- **Retention:** members with a non-baseline active start who remain active at
  the requested duration / starts old enough to reach that duration.
- **Churn:** members moving from active/trialing to terminal `lapsed`/`none`
  during a period / members active at the period start. `paused` and `past_due`
  remain visible but are not treated as cancellation churn; a missed session is
  never churn.
- **Family participation:** household/weeks with at least two eligible enrolled
  members where at least two attended / household/weeks with at least two
  eligible enrolled members.

## Privacy and access

All reporting functions require the `admin` role. Underlying history tables and
derived views have no authenticated read grants. The member detail function
returns membership facts, attendance outcomes and Adult completion counts only.
The legacy Downloads journal export was replaced with monthly completion
metadata; it no longer exports reflections, video answers, activities or
intentions.

## Configurable risk rules

Thresholds use existing `app_settings` rather than a second settings system:

- `reporting_attendance_target` (default `0.65`)
- `reporting_at_risk_recent_misses` (default `2`)
- `reporting_at_risk_six_week_rate` (default `0.50`)
- `reporting_at_risk_attendance_days` (default `21`)
- `reporting_at_risk_journal_weeks` (default `3`)

Flags are reporting only. They do not cancel, message or otherwise mutate a
member.
