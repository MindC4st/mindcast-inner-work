# MC-SEC-112 — Authentication & Account Recovery QA Checklist

> Source: Notion Document Hub (controlled copy). Category: Data & Security. Status: —.
> Regenerate with `node scripts/fetch-controlled-docs.mjs`.

> **Mindcast Limited · Taupō, Aotearoa New Zealand**  
MC-SEC-112 · Version 1.0 · August 2026 · Data & Security · **Supplemental**
> 🔐 **DRAFT QA CHECKLIST**
- [ ] New user registration.
- [ ] Email verification if used.
- [ ] Sign in/sign out.
- [ ] Wrong password / lockout or rate limits.
- [ ] Password reset link and expiry.
- [ ] Redirect after reset.
- [ ] Staff role loaded correctly after login.
- [ ] Role downgrade/removal takes effect.
- [ ] Ephemeral/bracelet sign-in behaviour tested.
- [ ] Lost/stolen device sign-out process documented.
- [ ] Account deletion/deactivation process tested.
- [ ] Recovery does not expose another user's account or data.
