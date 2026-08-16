# MC-SEC-101 — Access Control & RLS Review Checklist

> Source: Notion Document Hub (controlled copy). Category: Data & Security. Status: —.
> Regenerate with `node scripts/fetch-controlled-docs.mjs`.

> **Mindcast Limited · Taupō, Aotearoa New Zealand**  
MC-SEC-101 · Version 1.0 · August 2026 · Data & Security · **Supplemental**
> 🔑 **DRAFT TECHNICAL CHECKLIST**
## Roles to test
- Member
- Facilitator
- Admin
- Unauthenticated user
## Core checks
- [ ] Members can read/update only their own private profile/workbook data unless explicitly shared.
- [ ] Facilitators cannot access admin-only HR/payment data.
- [ ] Admin permissions are limited to genuine operational need.
- [ ] Staff HR/training records are not visible to other staff.
- [ ] Safeguarding/vetting records have restricted policies.
- [ ] Storage buckets use appropriate private/public configuration.
- [ ] Server-side functions re-check authorization; they do not trust client UI state.
- [ ] Service-role keys are never shipped to the browser.
- [ ] Deleted/disabled users lose access.
- [ ] Cross-cohort/household access is tested.
## Evidence
Test date: **[DATE]**  
Reviewer: **[NAME]**  
Migration/commit reference: **[REF]**  
Issues: **[LINK/LIST]**
