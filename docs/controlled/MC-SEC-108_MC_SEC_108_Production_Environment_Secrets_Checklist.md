# MC-SEC-108 — Production Environment & Secrets Checklist

> Source: Notion Document Hub (controlled copy). Category: Data & Security. Status: —.
> Regenerate with `node scripts/fetch-controlled-docs.mjs`.

> **Mindcast Limited · Taupō, Aotearoa New Zealand**  
MC-SEC-108 · Version 1.0 · August 2026 · Data & Security · **Supplemental**
> 🚀 **DRAFT RELEASE CHECKLIST**
- [ ] Production Supabase project confirmed.
- [ ] Production hosting project/domain confirmed.
- [ ] Stripe live-mode configuration confirmed.
- [ ] Email/SMS production credentials confirmed.
- [ ] Environment variables documented by name, not secret value.
- [ ] No production secrets committed to Git.
- [ ] Service-role/admin secrets exist only server-side.
- [ ] Old prototype/test credentials revoked where no longer needed.
- [ ] MFA enabled on critical admin/provider accounts.
- [ ] Domain/DNS ownership recorded.
- [ ] Production OAuth redirect URLs checked.
- [ ] Error/logging services configured.
- [ ] Backups enabled and restore process documented.
- [ ] Admin access list approved.
## Owner
**[NAME / DATE]**
