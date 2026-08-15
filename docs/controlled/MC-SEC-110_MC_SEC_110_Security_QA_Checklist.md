# MC-SEC-110 — Security QA Checklist

> Source: Notion Document Hub (controlled copy). Category: Data & Security. Status: —.
> Regenerate with `node scripts/fetch-controlled-docs.mjs`.

> **Mindcast Limited · Taupō, Aotearoa New Zealand**  
MC-SEC-110 · Version 1.0 · August 2026 · Data & Security · **Supplemental**
> 🧪 **DRAFT TEST CHECKLIST**
- [ ] Authentication required on protected routes.
- [ ] Direct URL access cannot bypass role checks.
- [ ] RLS tested for member/facilitator/admin/anonymous.
- [ ] Password reset and session revocation tested.
- [ ] Sensitive errors do not expose secrets or stack data publicly.
- [ ] File upload type/size/access rules tested.
- [ ] Input validation tested on forms and admin tools.
- [ ] Cross-site scripting / unsafe rendering risks reviewed.
- [ ] Admin destructive actions require deliberate confirmation where appropriate.
- [ ] Rate/abuse controls reviewed for login, public forms and live-session codes.
- [ ] Dependency/security update process defined.
## Findings
**[ISSUE / SEVERITY / OWNER / DUE DATE]**
