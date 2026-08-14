-- Staff Training domain (MC-TRN-001 driven).
--
-- Database-driven training: content, versioning, per-person evidence,
-- immutable acknowledgements and compliance records. No localStorage source
-- of truth; no user-editable role fields; RLS on every table.
--
-- Access model (least privilege, server-controlled roles only):
--   staff   = has_role(facilitator) OR has_role(admin)   (is_staff())
--   admin   = has_role(admin)                            (is_admin())
--   * staff read training content; only admin writes it.
--   * staff manage their OWN progress/responses; admin reads progress for the
--     compliance view and may insert/update (assign, retrain) but not delete.
--   * free-text checkpoint answers stay private to the worker: admin may read
--     scored (single/multi/checklist/order) responses only.
--   * acknowledgements and signatures are insert-only evidence (no update or
--     delete policies for anyone).
--   * safeguarding concern content is NOT stored in this domain (MC-SAF-001);
--     incident-triggered retraining rows carry a reference code only.

create or replace function public.is_staff(_user_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select public.has_role(_user_id, 'facilitator'::public.app_role)
      or public.has_role(_user_id, 'admin'::public.app_role);
$$;

create or replace function public.is_admin(_user_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select public.has_role(_user_id, 'admin'::public.app_role);
$$;

-- ── Content ────────────────────────────────────────────────────────────────

create table if not exists public.staff_training_modules (
  id uuid primary key default gen_random_uuid(),
  code text not null,
  title text not null,
  summary text not null default '',
  position int not null,
  gate text not null check (gate in ('before_first_session', 'before_member_contact', 'week_1', 'month_1')),
  pass_mark numeric check (pass_mark is null or (pass_mark > 0 and pass_mark <= 1)),
  ack_required boolean not null default false,
  version int not null default 1,
  effective_date date not null default current_date,
  est_minutes int not null default 10,
  created_at timestamptz not null default now(),
  unique (code, version)
);

create table if not exists public.staff_training_lessons (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.staff_training_modules (id) on delete cascade,
  position int not null,
  title text not null,
  body text not null default '',
  media_url text,
  unique (module_id, position)
);

create table if not exists public.staff_training_checkpoints (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid references public.staff_training_lessons (id) on delete cascade,
  module_id uuid references public.staff_training_modules (id) on delete cascade,
  position int not null,
  kind text not null check (kind in ('single', 'multi', 'checklist', 'freetext', 'acknowledge', 'order')),
  prompt text not null,
  options jsonb not null default '[]'::jsonb,
  correct jsonb,
  scoreable boolean not null default true,
  policy_code text,
  policy_version text,
  required boolean not null default true,
  check (num_nonnulls(lesson_id, module_id) = 1)
);

create table if not exists public.staff_training_requirements (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.staff_training_modules (id) on delete cascade,
  role public.app_role not null,
  required boolean not null default true,
  unique (module_id, role)
);

-- ── Per-person evidence ────────────────────────────────────────────────────

create table if not exists public.staff_training_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  module_id uuid not null references public.staff_training_modules (id) on delete cascade,
  module_code text not null,
  module_version int not null,
  status text not null default 'in_progress'
    check (status in ('in_progress', 'passed', 'acknowledged', 'failed')),
  score numeric,
  attempts int not null default 0,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  due_at date,
  expires_at date,
  superseded boolean not null default false
);
create unique index if not exists staff_training_progress_current_uq
  on public.staff_training_progress (user_id, module_id) where (not superseded);
create index if not exists staff_training_progress_user_idx
  on public.staff_training_progress (user_id);
create index if not exists staff_training_progress_module_idx
  on public.staff_training_progress (module_id);

create table if not exists public.staff_training_responses (
  id uuid primary key default gen_random_uuid(),
  progress_id uuid not null references public.staff_training_progress (id) on delete cascade,
  checkpoint_id uuid not null references public.staff_training_checkpoints (id) on delete cascade,
  response jsonb not null default 'null'::jsonb,
  is_correct boolean,
  attempt int not null default 1,
  saved_at timestamptz not null default now(),
  unique (progress_id, checkpoint_id, attempt)
);

-- Immutable versioned acknowledgements: insert + select policies only.
create table if not exists public.staff_policy_acknowledgements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  policy_code text not null,
  policy_version text not null,
  title text not null,
  declaration text not null default '',
  acknowledged_at timestamptz not null default now(),
  evidence_progress_id uuid references public.staff_training_progress (id)
);

-- ── Documents & signatures ─────────────────────────────────────────────────
-- Metadata + recorded declarations only. Binary storage is deliberately NOT
-- wired here: a secure staff-documents bucket needs its own storage-policy
-- review before upload is introduced (documented follow-up).

create table if not exists public.staff_documents (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  title text not null,
  version text not null default '1.0',
  status text not null default 'live' check (status in ('live', 'draft', 'retired')),
  effective_date date,
  summary text not null default '',
  storage_path text,
  access text not null default 'staff' check (access in ('staff', 'admin'))
);

create table if not exists public.staff_document_signatures (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.staff_documents (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  document_version text not null,
  declaration text not null,
  signed_at timestamptz not null default now()
);

-- ── Compliance ─────────────────────────────────────────────────────────────

create table if not exists public.staff_compliance_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  category text not null check (category in ('staff_start', 'safety_check', 'exception', 'note', 'retraining')),
  status text not null default 'current',
  detail text not null default '',
  valid_from date,
  valid_until date,
  recorded_by uuid references auth.users (id),
  created_at timestamptz not null default now()
);

-- Incident-triggered refresher: reference code only, never incident PII.
create table if not exists public.staff_incident_training_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  reference_code text not null,
  module_id uuid references public.staff_training_modules (id),
  due_at date,
  status text not null default 'open' check (status in ('open', 'completed', 'waived')),
  recorded_by uuid references auth.users (id),
  created_at timestamptz not null default now()
);

-- ── RLS ────────────────────────────────────────────────────────────────────

alter table public.staff_training_modules enable row level security;
alter table public.staff_training_lessons enable row level security;
alter table public.staff_training_checkpoints enable row level security;
alter table public.staff_training_requirements enable row level security;
alter table public.staff_training_progress enable row level security;
alter table public.staff_training_responses enable row level security;
alter table public.staff_policy_acknowledgements enable row level security;
alter table public.staff_documents enable row level security;
alter table public.staff_document_signatures enable row level security;
alter table public.staff_compliance_records enable row level security;
alter table public.staff_incident_training_records enable row level security;

-- Content: staff read, admin write.
drop policy if exists stt_modules_read on public.staff_training_modules;
create policy stt_modules_read on public.staff_training_modules
  for select using (public.is_staff(auth.uid()));
drop policy if exists stt_modules_write on public.staff_training_modules;
create policy stt_modules_write on public.staff_training_modules
  for all to authenticated
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

drop policy if exists stt_lessons_read on public.staff_training_lessons;
create policy stt_lessons_read on public.staff_training_lessons
  for select using (public.is_staff(auth.uid()));
drop policy if exists stt_lessons_write on public.staff_training_lessons;
create policy stt_lessons_write on public.staff_training_lessons
  for all to authenticated
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

drop policy if exists stt_checkpoints_read on public.staff_training_checkpoints;
create policy stt_checkpoints_read on public.staff_training_checkpoints
  for select using (public.is_staff(auth.uid()));
drop policy if exists stt_checkpoints_write on public.staff_training_checkpoints;
create policy stt_checkpoints_write on public.staff_training_checkpoints
  for all to authenticated
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

drop policy if exists stt_requirements_read on public.staff_training_requirements;
create policy stt_requirements_read on public.staff_training_requirements
  for select using (public.is_staff(auth.uid()));
drop policy if exists stt_requirements_write on public.staff_training_requirements;
create policy stt_requirements_write on public.staff_training_requirements
  for all to authenticated
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

-- Progress: own rows fully (save/resume/submit); admin read + assign/retrain.
drop policy if exists stt_progress_own on public.staff_training_progress;
create policy stt_progress_own on public.staff_training_progress
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists stt_progress_admin on public.staff_training_progress;
create policy stt_progress_admin on public.staff_training_progress
  for select using (public.is_admin(auth.uid()));
drop policy if exists stt_progress_admin_write on public.staff_training_progress;
create policy stt_progress_admin_write on public.staff_training_progress
  for update using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));
drop policy if exists stt_progress_admin_insert on public.staff_training_progress;
create policy stt_progress_admin_insert on public.staff_training_progress
  for insert with check (public.is_admin(auth.uid()));

-- Responses: own rows; admin may read scored answers only (free-text stays
-- private to the worker — MC-TRN-001 module 6 / MC-SEC-001 least privilege).
drop policy if exists stt_responses_own on public.staff_training_responses;
create policy stt_responses_own on public.staff_training_responses
  for all using (
    exists (select 1 from public.staff_training_progress p where p.id = progress_id and p.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.staff_training_progress p where p.id = progress_id and p.user_id = auth.uid())
  );
drop policy if exists stt_responses_admin on public.staff_training_responses;
create policy stt_responses_admin on public.staff_training_responses
  for select using (
    public.is_admin(auth.uid())
    and exists (
      select 1 from public.staff_training_checkpoints c
      where c.id = checkpoint_id and c.scoreable
    )
  );

-- Acknowledgements: immutable evidence. Insert own, read own; admin reads all.
drop policy if exists stt_ack_insert on public.staff_policy_acknowledgements;
create policy stt_ack_insert on public.staff_policy_acknowledgements
  for insert with check (user_id = auth.uid());
drop policy if exists stt_ack_own_read on public.staff_policy_acknowledgements;
create policy stt_ack_own_read on public.staff_policy_acknowledgements
  for select using (user_id = auth.uid() or public.is_admin(auth.uid()));

-- Documents: staff read live/staff-level; admin reads+writes all.
drop policy if exists stt_documents_read on public.staff_documents;
create policy stt_documents_read on public.staff_documents
  for select using (
    public.is_admin(auth.uid())
    or (public.is_staff(auth.uid()) and access = 'staff')
  );
drop policy if exists stt_documents_write on public.staff_documents;
create policy stt_documents_write on public.staff_documents
  for all to authenticated
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

-- Signatures: immutable evidence, same pattern as acknowledgements.
drop policy if exists stt_sig_insert on public.staff_document_signatures;
create policy stt_sig_insert on public.staff_document_signatures
  for insert with check (user_id = auth.uid());
drop policy if exists stt_sig_read on public.staff_document_signatures;
create policy stt_sig_read on public.staff_document_signatures
  for select using (user_id = auth.uid() or public.is_admin(auth.uid()));

-- Compliance: own rows visible to self; admin manages. Safety-check status is
-- visible to the worker; this table never holds safeguarding concern content.
drop policy if exists stt_compliance_own on public.staff_compliance_records;
create policy stt_compliance_own on public.staff_compliance_records
  for select using (user_id = auth.uid());
drop policy if exists stt_compliance_admin on public.staff_compliance_records;
create policy stt_compliance_admin on public.staff_compliance_records
  for select using (public.is_admin(auth.uid()));
drop policy if exists stt_compliance_admin_insert on public.staff_compliance_records;
create policy stt_compliance_admin_insert on public.staff_compliance_records
  for insert with check (public.is_admin(auth.uid()));
drop policy if exists stt_compliance_admin_update on public.staff_compliance_records;
create policy stt_compliance_admin_update on public.staff_compliance_records
  for update using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

-- Incident refreshers: admin manages; worker sees their own open items.
drop policy if exists stt_incident_own on public.staff_incident_training_records;
create policy stt_incident_own on public.staff_incident_training_records
  for select using (user_id = auth.uid());
drop policy if exists stt_incident_admin on public.staff_incident_training_records;
create policy stt_incident_admin on public.staff_incident_training_records
  for select using (public.is_admin(auth.uid()));
drop policy if exists stt_incident_admin_insert on public.staff_incident_training_records;
create policy stt_incident_admin_insert on public.staff_incident_training_records
  for insert with check (public.is_admin(auth.uid()));
drop policy if exists stt_incident_admin_update on public.staff_incident_training_records;
create policy stt_incident_admin_update on public.staff_incident_training_records
  for update using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
