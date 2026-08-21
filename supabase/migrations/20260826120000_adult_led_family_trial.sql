-- Adult-led family free trial.
--
-- The public free trial is adult-led: an adult registers for one free session
-- and may bring their own children/teens to that SAME session. Under-18s may
-- never attend a free trial independently — they are linked to the adult's
-- booking, checked into the same live session, and only after (or atomically
-- with) the adult.
--
-- A single trial_tickets row per ATTENDEE (not a household flag), linked to the
-- adult via linked_adult_id. Teen emails are individual trial passes; children
-- have no email/token of their own and are carried on the adult's family scan.
--
-- One free trial per person, for life, is enforced by a partial unique index on
-- a USED ticket's email — generation of a pass never blocks anyone, only a
-- successfully used pass does.

-- ── Columns ────────────────────────────────────────────────────────────────
ALTER TABLE public.trial_tickets
  ADD COLUMN IF NOT EXISTS linked_adult_id uuid
    REFERENCES public.trial_tickets(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS age_group text
    CHECK (age_group IN ('child', 'teen')),
  ADD COLUMN IF NOT EXISTS dob date,
  -- Which session the pass was USED in (set at check-in, never at registration).
  ADD COLUMN IF NOT EXISTS trial_used_session_id uuid,
  ADD COLUMN IF NOT EXISTS trial_used_session_date date;

-- Children have no email of their own.
ALTER TABLE public.trial_tickets ALTER COLUMN email DROP NOT NULL;

CREATE INDEX IF NOT EXISTS trial_tickets_linked_adult_idx
  ON public.trial_tickets (linked_adult_id);
CREATE INDEX IF NOT EXISTS trial_tickets_dob_idx
  ON public.trial_tickets (dob);
CREATE INDEX IF NOT EXISTS trial_tickets_used_session_idx
  ON public.trial_tickets (trial_used_session_id);

-- One successfully-used free trial per email, enforced in the database so two
-- concurrent check-ins of the same person cannot both succeed. Generation is
-- unrestricted — only a redeemed pass counts.
CREATE UNIQUE INDEX IF NOT EXISTS trial_tickets_one_used_email_idx
  ON public.trial_tickets (lower(email))
  WHERE redeemed_at IS NOT NULL AND email IS NOT NULL;

-- ── Family redemption: atomic, single use, under-18 enforced ────────────────
-- Resolves the family from the scanned token, validates every selected ticket
-- belongs to that family, enforces that a minor is only admitted when their
-- linked adult is checked into the SAME session (or is being checked in now),
-- and redeems atomically so a racing double-scan cannot both succeed.
--
-- Only rows newly redeemed by THIS call are returned; a rescan returns an
-- empty `admitted` set, which the caller treats as "already in".
CREATE OR REPLACE FUNCTION public.redeem_trial_family(
  p_token text,
  p_ticket_ids uuid[],
  p_session_date date,
  p_staff uuid
)
RETURNS TABLE (
  ok boolean,
  reason text,
  admitted jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_anchor public.trial_tickets%ROWTYPE;
  v_adult  public.trial_tickets%ROWTYPE;
  v_rows   jsonb;
BEGIN
  -- 1. Resolve the scanned ticket (must still be unexpired).
  SELECT * INTO v_anchor
    FROM public.trial_tickets
   WHERE token = p_token
     AND expires_at > now();
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 'unknown', NULL::jsonb;
    RETURN;
  END IF;

  -- 2. The family adult.
  IF v_anchor.linked_adult_id IS NULL THEN
    v_adult := v_anchor;
  ELSE
    SELECT * INTO v_adult
      FROM public.trial_tickets
     WHERE id = v_anchor.linked_adult_id;
    IF NOT FOUND THEN
      RETURN QUERY SELECT false, 'parent_missing', NULL::jsonb;
      RETURN;
    END IF;
  END IF;

  -- 3. The adult must already be in (same session) if this is a minor-only
  --    admit, or be part of this transaction's selection.
  IF EXISTS (
    SELECT 1 FROM unnest(p_ticket_ids) tid
    JOIN public.trial_tickets t ON t.id = tid
   WHERE t.linked_adult_id = v_adult.id
  ) AND NOT (
    v_adult.id = ANY(p_ticket_ids)
    OR (
      v_adult.redeemed_at IS NOT NULL
      AND v_adult.trial_used_session_date = p_session_date
    )
  ) THEN
    RETURN QUERY SELECT false, 'parent_required', NULL::jsonb;
    RETURN;
  END IF;

  -- 4. Selected tickets must all belong to this family (adult or its minors).
  IF EXISTS (
    SELECT 1 FROM unnest(p_ticket_ids) tid
    LEFT JOIN public.trial_tickets t ON t.id = tid
   WHERE t.id IS NULL
      OR (t.id <> v_adult.id AND t.linked_adult_id IS DISTINCT FROM v_adult.id)
  ) THEN
    RETURN QUERY SELECT false, 'not_in_family', NULL::jsonb;
    RETURN;
  END IF;

  -- 5. Atomically redeem; capture only rows newly redeemed by this call so a
  --    rescan is idempotent (no duplicate attendance downstream).
  WITH redeemed AS (
    UPDATE public.trial_tickets t
       SET redeemed_at = now(),
           redeemed_by = p_staff,
           trial_used_session_date = p_session_date
     WHERE t.id = ANY(p_ticket_ids)
       AND t.redeemed_at IS NULL
     RETURNING t.id, t.full_name, t.track, t.age_group, t.linked_adult_id
  )
  SELECT COALESCE(
    jsonb_agg(
      jsonb_build_object(
        'id', r.id,
        'full_name', r.full_name,
        'track', r.track,
        'age_group', r.age_group,
        'is_adult', (r.linked_adult_id IS NULL)
      )
      ORDER BY (r.linked_adult_id IS NULL) DESC, r.full_name
    ), '[]'::jsonb
  )
  INTO v_rows
  FROM redeemed r;

  RETURN QUERY SELECT true, 'redeemed', v_rows;
END;
$$;

REVOKE ALL ON FUNCTION public.redeem_trial_family(text, uuid[], date, uuid) FROM PUBLIC, anon, authenticated;
