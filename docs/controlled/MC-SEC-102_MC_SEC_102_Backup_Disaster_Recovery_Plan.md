# MC-SEC-102 — Backup & Disaster Recovery Plan

> Source: Notion Document Hub (controlled copy). Category: Data & Security. Status: —.
> Regenerate with `node scripts/fetch-controlled-docs.mjs`.

> **Mindcast Limited · Taupō, Aotearoa New Zealand**  
MC-SEC-102 · Version 1.0 · August 2026 · Data & Security · **Supplemental**
> 💾 **DRAFT PLAN — fill in actual provider capabilities before relying on it.**
## Systems
Database: **[SUPABASE PROJECT / BACKUP TIER]**  
Storage: **[BUCKETS / BACKUP METHOD]**  
Code: GitHub repository.  
Documents/policies: **[NOTION / EXPORT STRATEGY]**
## Targets
Recovery Point Objective: **[RPO]**  
Recovery Time Objective: **[RTO]**
## Restore process
1. Declare incident and owner.
1. Identify last known good backup/version.
1. Restore in isolated/test context where possible.
1. Validate authentication, RLS and critical data.
1. Restore production service.
1. Communicate and monitor.
## Testing
Restore test frequency: **[QUARTERLY / OTHER]**  
Last test: **[DATE / RESULT]**
## Critical dependency failure
Supabase: **[PLAN]**  
Hosting: **[PLAN]**  
Payments: **[PLAN]**  
Email/SMS: **[PLAN]**
