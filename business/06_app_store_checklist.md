# 06 · App Store Launch Checklist

*Written from the perspective of a mobile release manager. Covers Apple App Store
+ Google Play. App-store rules change often — verify against the current
guidelines at submission time.*

---

## First decision: do you even need the app stores at launch?
**Recommendation: launch PWA-first.** The app is already an installable PWA — a
member can "Add to Home Screen" from the browser with no store review, no
developer accounts, no 30% cut, and instant updates. Submit native apps **later**,
once revenue justifies the overhead. Everything below applies when you do go
native (via the existing Capacitor scaffold).

---

## The big one: payments & Apple's cut
This determines your whole billing approach on iOS.

- Apple normally requires **In-App Purchase (IAP)** — and takes **15–30%** — for
  **digital** content/subscriptions.
- **BUT** Apple's guidelines (§3.1.3(e), "person-to-person / real-world services")
  allow **external payment (Stripe)** when the purchase is for a **real-world,
  in-person experience** — which a **live in-person gathering** is.
- **Position Mindcast membership as access to an in-person community service**
  (which it genuinely is), so you can keep **Stripe** and avoid the 30% cut.
  Google Play is more permissive here but the same framing helps.
- **Do not** offer purely-digital-only upgrades inside the iOS app that would trip
  the IAP requirement. Keep the paid thing = "membership to the real gathering."
- Have the membership description + receipts reflect the in-person nature. If in
  doubt, take payments on the **website** and keep the app for the experience.

> This is a real, common workaround for community/fitness/class apps — but it's a
> judgement call Apple's reviewer makes. Get it right in the app description and
> be ready to explain it in the review notes.

---

## User-generated content (UGC) — the moderation requirement
Apple **§1.2** and Google both **require** apps with user-generated content
(your on-screen submissions, Q&A, welcome-wall names) to have **all** of:
- [ ] A method to **filter objectionable content** before it appears.
- [ ] A **moderator** who approves content before it's shown publicly. *(You
      already have this: submissions are `pending` until a moderator approves —
      keep it strictly enforced; nothing hits the big screen unmoderated.)*
- [ ] A way for users to **report** objectionable content.
- [ ] A way to **block** abusive users.
- [ ] A published **content policy** + the ability to act on reports within 24h.

**Action:** make sure the app has (a) a visible "report" affordance on shared
content, (b) block/ban capability for staff, and (c) a short **Community Content
Policy** page. This is a hard gate — apps get rejected for missing it.

---

## Privacy & data disclosure
Both stores require a **privacy label** describing what you collect. Prepare
honest answers (see [L4](legal/04_privacy_policy_notes.md)):

| Data | Collected? | Why | Linked to identity? |
|---|---|---|---|
| Name / email | Yes | Account, membership | Yes |
| Journal entries | Yes | The member's private practice | Yes (private, owner-only) |
| Attendance / check-ins | Yes | Session participation, welcome wall | Yes |
| Payment info | Via **Stripe** (not stored by you) | Membership billing | Handled by Stripe |
| On-screen submissions | Yes | Live participation (moderated) | Optional (can be anonymous) |
| Usage/diagnostics | Minimal | App reliability | Prefer not-linked |

Required regardless of store:
- [ ] **Privacy Policy URL** (public, e.g. `/privacy`).
- [ ] **Account deletion** *inside the app* (both stores now require an in-app way
      to delete your account + data — build/confirm a "Delete my account" flow).
- [ ] **Data Safety form** (Google) + **App Privacy** answers (Apple), matching
      reality.
- [ ] Kids: because children's content exists, be careful — **kids don't have
      their own logins** (an adult accesses kids content), which keeps you out of
      the strictest children's-app rules. Keep it that way, and don't collect data
      *from* children directly.

---

## Embedded content (YouTube)
- YouTube videos are shown via **official embeds** (the standard iframe/player) —
  that's compliant. Don't download/re-host YouTube content (violates YouTube ToS).
- Disclose that the app displays third-party (YouTube) content.
- Make sure embedded players don't trigger unexpected autoplay or data issues in
  review.

---

## Technical submission checklist (when going native)
- [ ] Apple **Developer Program** ($NZ ~US$99/yr) + Google **Play Console**
      (US$25 one-off).
- [ ] App icons, splash, screenshots for all required sizes.
- [ ] Capacitor build tested on real iOS + Android devices.
- [ ] Deep links / universal links for `/live/:code`, `/b/:token` bracelet taps.
- [ ] Push notifications configured (if used) + permission priming.
- [ ] Camera/NFC permission strings with **clear usage descriptions** (NFC
      check-in must explain *why* it needs NFC).
- [ ] Crash-free on a cold start with no network (PWA offline shell).
- [ ] **Reviewer notes**: explain the in-person model + provide a **demo account**
      so reviewers can see gated content.

## What to disclose / work around — summary
- **YouTube embeds** → disclose third-party content; use official embeds only. ✅ easy
- **User data storage** → privacy label + policy + in-app account deletion. ⚠️ required
- **User info collection** → minimise, disclose, and don't collect from kids. ⚠️ required
- **On-screen submissions** → full UGC moderation stack (approve-before-show,
  report, block, policy). ⛔ hard gate — already partly built, finish it.
- **Payments** → frame as in-person service to keep Stripe (avoid 30% IAP). ⚠️ judgement call

## Decisions to confirm
- PWA-first at launch (recommended) vs native from day one?
- Who writes the Community Content Policy page (needed for both stores + UGC)?
- Confirm the in-app **account/data deletion** flow exists before any store
  submission.
