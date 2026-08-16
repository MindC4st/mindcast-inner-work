# MC-FIN-104 — Payment & Subscription QA Checklist

> Source: Notion Document Hub (controlled copy). Category: Finance & Operations. Status: —.
> Regenerate with `node scripts/fetch-controlled-docs.mjs`.

> **Mindcast Limited · Taupō, Aotearoa New Zealand**  
MC-FIN-104 · Version 1.0 · August 2026 · Finance & Operations · **Supplemental**
> 💳 **DRAFT QA CHECKLIST**
- [ ] Correct products/prices in live mode.
- [ ] Successful checkout updates membership status.
- [ ] Failed payment handling tested.
- [ ] Cancellation tested.
- [ ] Refund workflow tested.
- [ ] Duplicate webhook handling tested.
- [ ] Payment-provider outage/failure behaviour understood.
- [ ] Member cannot unlock paid access without valid status except approved admin override.
- [ ] Household/add-on rules tested.
- [ ] GST/tax treatment confirmed with accountant.
- [ ] Customer pricing/refund wording matches actual billing logic.
## Test references
Stripe test/live IDs: **[RECORD NON-SECRET IDS ONLY]**
