-- Door passes: QR ticketing for the Sunday room.
--
-- Sessions are members-only from here. Everyone entering the theatre is scanned
-- at the door and the scanner answers one question: is this person entitled to
-- be in this room today?
--
-- Design decisions worth knowing before reading the SQL:
--
-- 1. A PASS IS PER PERSON, BUT A SCAN RESOLVES A HOUSEHOLD.
--    Children do not carry phones and teens are often dropped off. So scanning
--    a guardian's pass returns the whole household roster and the door staff
--    tick who actually came. One scan per family instead of four, and "who is
--    here this week" stops being an assumption. A teen who arrives alone still
--    has their own pass, so they never depend on a parent being present.
--
-- 2. THE PASS TOKEN IS THE BRACELET TOKEN.
--    profiles.nfc_id is already a unique per-person token and /b/<token> is
--    already the bracelet URL. A QR encoding the same URL is the same identity
--    through a different reader. No parallel token system.
--
-- 3. TRIAL TICKETS ARE SINGLE USE AND ENFORCED IN THE DATABASE.
--    A UI that "marks it used" is not a ticket, it is a suggestion. The redeem
--    path below is an atomic conditional UPDATE, so two simultaneous scans of
--    the same ticket cannot both succeed.

-- ── Scans arrive from the QR scanner as their own source ──────────────────
ALTER TABLE public.check_ins DROP CONSTRAINT IF EXISTS check_ins_source_check;
ALTER TABLE public.check_ins
  ADD CONSTRAINT check_ins_source_check
  CHECK (source IN ('kiosk','member_app','manual','qr','trial'));

-- ── Trial tickets ─────────────────────────────────────────────────────────
-- A prospective member registers once at /try and gets ONE ticket for ONE
-- session. There is no free ongoing tier: after this they join or they don't.
CREATE TABLE IF NOT EXISTS public.trial_tickets (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token           text NOT NULL UNIQUE,
  full_name       text NOT NULL,
  email           text NOT NULL,
  phone           text,
  track           text NOT NULL DEFAULT 'Adult'
                    CHECK (track IN ('Adult','Teen','Child')),
  -- Children attending with this guest, as free text: the door needs to know
  -- how many seats, not to create profiles for people who may never return.
  guests          jsonb NOT NULL DEFAULT '[]'::jsonb,
  intended_date   date,
  -- Single use. Set at redemption, never reset.
  redeemed_at     timestamptz,
  redeemed_by     uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  expires_at      timestamptz NOT NULL DEFAULT (now() + interval '60 days'),
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS trial_tickets_token_idx ON public.trial_tickets (token);
CREATE INDEX IF NOT EXISTS trial_tickets_email_idx ON public.trial_tickets (lower(email));

ALTER TABLE public.trial_tickets ENABLE ROW LEVEL SECURITY;

-- Nobody reads this table from the browser. Issuing and redeeming both go
-- through edge functions holding the service-role key, so there is no policy
-- granting anon or authenticated any access at all: RLS denies by default and
-- that is the intent. A public SELECT here would leak every guest's name,
-- email and phone to anyone who could guess a token.

-- ── Redemption: atomic, single use ────────────────────────────────────────
-- SECURITY DEFINER so the edge function can call it, but the guard is inside:
-- the UPDATE only matches a row that is unredeemed and unexpired. The second
-- caller of a racing pair matches zero rows and is told the ticket is spent.
CREATE OR REPLACE FUNCTION public.redeem_trial_ticket(p_token text, p_staff uuid)
RETURNS TABLE (
  ok boolean,
  reason text,
  full_name text,
  track text,
  guests jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row public.trial_tickets%ROWTYPE;
BEGIN
  UPDATE public.trial_tickets t
     SET redeemed_at = now(), redeemed_by = p_staff
   WHERE t.token = p_token
     AND t.redeemed_at IS NULL
     AND t.expires_at > now()
  RETURNING t.* INTO v_row;

  IF FOUND THEN
    RETURN QUERY SELECT true, 'redeemed'::text, v_row.full_name, v_row.track, v_row.guests;
    RETURN;
  END IF;

  -- Nothing updated. Work out why, so the door gets a useful message rather
  -- than a flat "no".
  SELECT * INTO v_row FROM public.trial_tickets WHERE token = p_token;
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 'unknown'::text, NULL::text, NULL::text, NULL::jsonb;
  ELSIF v_row.redeemed_at IS NOT NULL THEN
    RETURN QUERY SELECT false, 'already_used'::text, v_row.full_name, v_row.track, v_row.guests;
  ELSE
    RETURN QUERY SELECT false, 'expired'::text, v_row.full_name, v_row.track, v_row.guests;
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.redeem_trial_ticket(text, uuid) FROM PUBLIC, anon, authenticated;

-- ── Every profile needs a pass token ──────────────────────────────────────
-- Members who were never issued a bracelet still need something to scan, so
-- backfill nfc_id for anyone missing it. Same column, same /b/<token> URL,
-- so a member can be read by NFC or by QR interchangeably.
UPDATE public.profiles
SET nfc_id = encode(gen_random_bytes(8), 'hex')
WHERE COALESCE(nfc_id, '') = '';

-- ── Door roster ───────────────────────────────────────────────────────────
-- Given ANY person's pass token, return everyone the door should consider:
-- that person, plus their household if they are in one. Membership status
-- comes back per person so the scanner shows who is entitled and who is not.
--
-- SECURITY DEFINER because the door tablet is staff-operated and needs to read
-- household rows it does not own; access is restricted by the REVOKE/GRANT
-- below to authenticated callers, and the edge function additionally checks the
-- caller is staff.
CREATE OR REPLACE FUNCTION public.door_roster_for_token(p_token text)
RETURNS TABLE (
  profile_id uuid,
  display_name text,
  role_in_household text,
  track text,
  membership_status text,
  kids_addon boolean,
  is_scanned_person boolean,
  checked_in_today boolean
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH scanned AS (
    SELECT p.id FROM public.profiles p WHERE p.nfc_id = p_token
  ),
  hh AS (
    SELECT hm.household_id
      FROM public.household_members hm
      JOIN scanned s ON s.id = hm.profile_id
     LIMIT 1
  ),
  people AS (
    SELECT id FROM scanned
    UNION
    SELECT hm.profile_id FROM public.household_members hm JOIN hh ON hh.household_id = hm.household_id
  )
  SELECT
    p.id,
    COALESCE(NULLIF(TRIM(COALESCE(p.first_name,'') || ' ' || COALESCE(p.last_name,'')), ''),
             p.display_name, p.name, 'Member'),
    COALESCE(hm.role_in_household, 'adult'),
    CASE lower(COALESCE(p.age_group,'adult'))
      WHEN 'teen' THEN 'Teen' WHEN 'child' THEN 'Child' WHEN 'kids' THEN 'Child' ELSE 'Adult' END,
    COALESCE(sub.status, 'none'),
    COALESCE(p.kids_addon, false),
    (p.id IN (SELECT id FROM scanned)),
    EXISTS (
      SELECT 1 FROM public.check_ins ci
       WHERE ci.profile_id = p.id
         AND ci.checked_in_at >= date_trunc('day', now())
    )
  FROM public.profiles p
  JOIN people ON people.id = p.id
  LEFT JOIN public.household_members hm ON hm.profile_id = p.id
  -- A subscription covers EITHER the payer's own profile OR the whole
  -- household. Looking only at profile_id would show every child on a family
  -- membership as unentitled and turn them away at the door, which is exactly
  -- the case this feature exists to serve.
  LEFT JOIN LATERAL (
    SELECT s.status
      FROM public.subscriptions s
     WHERE s.profile_id = p.id
        OR (s.household_id IS NOT NULL AND s.household_id = hm.household_id)
     ORDER BY
       -- Prefer a live subscription over a stale cancelled one.
       (s.status IN ('active','trialing')) DESC,
       s.updated_at DESC NULLS LAST
     LIMIT 1
  ) sub ON true
  ORDER BY (p.id IN (SELECT id FROM scanned)) DESC, 3, 2;
$$;

REVOKE ALL ON FUNCTION public.door_roster_for_token(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.door_roster_for_token(text) TO authenticated;

-- Verify after db push:
--   SELECT count(*) FROM public.profiles WHERE COALESCE(nfc_id,'') = '';  -- expect 0
--   SELECT * FROM public.door_roster_for_token('<a real nfc_id>');
--   SELECT public.redeem_trial_ticket('nope', NULL);                      -- ok=false, unknown
