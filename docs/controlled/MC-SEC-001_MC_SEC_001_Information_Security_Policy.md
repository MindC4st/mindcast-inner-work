# MC-SEC-001 — Information Security Policy

> Source: Notion Document Hub (controlled copy). Category: Data & Security. Status: —.
> Regenerate with `node scripts/fetch-controlled-docs.mjs`.

## Information Security Policy
Mindcast protects member and staff information by limiting collection, access and exposure rather than relying on trust alone.
## Non-negotiable controls
- Row Level Security on every table containing personal data.
- Role checks use the existing server-controlled role system; users cannot self-escalate privilege.
- Service-role keys and other secrets never appear in client code, public repos, prompts, fixtures or screenshots.
- Production data is never copied into development/test; use synthetic data.
- MFA on privileged accounts.
- Preview/staging deployments are access-protected.
- Secrets are stored in the approved password manager and rotated after suspected exposure.
- Backups/PITR are configured and restoration is tested.
- Sentry/analytics are configured so member journal/reflection/safeguarding content is not transmitted.
## Sensitive content
Member reflections, child-safety records and personnel records receive the highest access restrictions. Safeguarding records are stored separately from ordinary operational records.
## AI
Follow MC-SEC-003. Real member/staff PII, journal content, safeguarding detail, credentials and environment files are prohibited in AI prompts unless an explicitly approved secure workflow says otherwise.
## Incident reporting
A suspected security/privacy incident is reported immediately through the approved incident route and handled under MC-SEC-002.
