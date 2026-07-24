# Legal · Privacy Policy Notes (DRAFT)

> **⚠️ Founder draft — have a NZ lawyer finalise the published policy.** This
> outlines what a Mindcast privacy policy must cover under the **NZ Privacy Act
> 2020** (and GDPR-style expectations if you ever have overseas members). It maps
> to what the app actually collects, and to the app-store privacy labels in
> [06](../06_app_store_checklist.md).

The published version lives at `/privacy` and is linked from sign-up and the app.

---

## 1. Who we are
Mindcast [legal entity, once chosen], based in Taupō, New Zealand, is the agency
responsible for personal information you provide. Contact: [privacy@mindcast.co.nz].

## 2. What we collect and why (be specific — Privacy Principle 1 & 3)
| Information | Why we collect it |
|---|---|
| Name, email, (optional) age group | Create your account, run your membership, communicate with you |
| Household / guardian links | So a parent can manage a child's/teen's participation |
| Journal entries & reflections | To give **you** a private record of your practice |
| Attendance / check-ins | To run sessions and show your name on the welcome wall (opt-in) |
| On-screen submissions | Live participation — **moderated and opt-in**; can be anonymous |
| Membership status & tier | To provide the right access |
| Payment details | **Handled by Stripe** — we do **not** store card numbers |
| Basic app diagnostics | To keep the app working |

We collect only what we need, directly from you wherever possible.

## 3. How we use and share it (Principles 10 & 11)
- We use your information only for the purposes above.
- **Your journal is private** — visible only to you, and (for a linked child/teen)
  to that child's linked guardian. Facilitators and admins **cannot** read member
  journals.
- We **do not sell** your information.
- We share with **service providers** only as needed to run Mindcast: Supabase
  (secure database/hosting), Stripe (payments), and email/notification providers —
  each under their own privacy terms.
- We disclose to authorities only where legally required or to prevent serious
  harm (see the [Safeguarding Charter](03_safeguarding_ethics_anticult.md)).

## 4. On-screen sharing is opt-in and moderated
Nothing you submit appears on the big screen unless you choose to share it, and a
**moderator approves it first**. You can share anonymously.

## 5. Storage & security (Principle 5)
- Data is stored in **Supabase** with database-level access controls (row-level
  security): members can only reach their own data; paid content and journals are
  protected in the database, not just hidden in the app.
- Payment data is held by **Stripe** (PCI-compliant), not by us.
- We take reasonable steps to keep information safe; no system is 100% secure.

## 6. Your rights (Principles 6 & 7)
- **Access** the information we hold about you.
- **Correct** it if it's wrong.
- **Delete** your account and data — available **inside the app** ("Delete my
  account") and on request.
- **Withdraw** from on-screen sharing or communications at any time.

## 7. Children & young people
- **Children do not have their own logins.** A paying adult accesses children's
  content on their behalf; we do not collect information directly from children.
- Teen accounts are set up with guardian involvement.
- We take extra care with any information relating to under-18s.

## 8. Retention
We keep your information while you're a member and for a reasonable period
afterward for legal/accounting reasons, then delete or anonymise it.

## 9. Changes & contact
We'll post changes here and notify members of material ones. Questions or requests:
[privacy@mindcast.co.nz]. You may also contact the **NZ Office of the Privacy
Commissioner** if you have an unresolved concern.

---

### Build/notice checklist (matches the app)
- [ ] Publish this at `/privacy` (link from sign-up + app).
- [ ] Confirm the **in-app account/data deletion** flow exists (store requirement).
- [ ] Privacy labels (Apple/Google) match this document exactly.
- [ ] A brief **just-in-time notice** at the point you first collect journals /
      check-ins ("this is private / this shows your name on screen").

## Decisions for your lawyer
- Final entity name + contact details.
- Data retention periods (accounting vs privacy minimisation).
- Whether any members will be overseas (triggers extra cross-border obligations).
