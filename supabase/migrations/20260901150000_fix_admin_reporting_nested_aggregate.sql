-- Fix: "aggregate function calls cannot be nested" on the /admin Insights page.
--
-- admin_reporting_dashboard built retention_by_attendance_band and retention_by_journal_band
-- with count(rm.profile_id) placed DIRECTLY inside jsonb_agg(jsonb_build_object(...)). Postgres
-- rejects an aggregate whose arguments contain another aggregate call (ERRCODE 42803).
--
-- Pre-aggregate per band in a subquery so jsonb_build_object only references pre-computed
-- columns -- mirroring the existing retention_by_missed_streak block, which already does this.
-- No other query in the function places an aggregate directly inside jsonb_agg (the
-- track_comparison counts sit inside scalar subqueries, which are a separate scope and legal).

CREATE OR REPLACE FUNCTION public.admin_reporting_dashboard(
  p_start_date date DEFAULT NULL,
  p_end_date date DEFAULT NULL,
  p_track text DEFAULT NULL,
  p_status text DEFAULT NULL,
  p_location_id uuid DEFAULT NULL,
  p_cohort text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_capture_at timestamptz;
  v_requested_start date;
  v_end date;
  v_effective_start date;
  v_previous_start date;
  v_previous_end date;
  v_attendance_target numeric;
  v_risk_misses integer;
  v_risk_rate numeric;
  v_risk_days integer;
  v_risk_journal_weeks integer;
  v_result jsonb;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  SELECT value::timestamptz INTO v_capture_at
  FROM public.app_settings WHERE key = 'reporting_history_started_at';
  v_capture_at := COALESCE(v_capture_at, now());
  v_end := LEAST(COALESCE(p_end_date, (now() AT TIME ZONE 'Pacific/Auckland')::date),
                 (now() AT TIME ZONE 'Pacific/Auckland')::date);
  v_requested_start := COALESCE(
    p_start_date,
    (SELECT min(created_at)::date FROM public.profiles),
    v_capture_at::date
  );
  v_effective_start := GREATEST(v_requested_start, v_capture_at::date);
  v_previous_end := v_effective_start - 1;
  v_previous_start := v_previous_end - GREATEST(v_end - v_effective_start, 0);

  SELECT COALESCE(value::numeric, .65) INTO v_attendance_target FROM public.app_settings WHERE key = 'reporting_attendance_target';
  SELECT COALESCE(value::integer, 2) INTO v_risk_misses FROM public.app_settings WHERE key = 'reporting_at_risk_recent_misses';
  SELECT COALESCE(value::numeric, .50) INTO v_risk_rate FROM public.app_settings WHERE key = 'reporting_at_risk_six_week_rate';
  SELECT COALESCE(value::integer, 21) INTO v_risk_days FROM public.app_settings WHERE key = 'reporting_at_risk_attendance_days';
  SELECT COALESCE(value::integer, 3) INTO v_risk_journal_weeks FROM public.app_settings WHERE key = 'reporting_at_risk_journal_weeks';

  WITH
  member_scope AS (
    SELECT d.*
    FROM public.reporting_member_dimension d
    WHERE (p_track IS NULL OR p_track = '' OR p_track = 'All' OR d.track = p_track)
      AND (p_status IS NULL OR p_status = '' OR p_status = 'All' OR d.membership_status = p_status)
      AND (p_location_id IS NULL OR d.location_id = p_location_id)
      AND (
        p_cohort IS NULL OR p_cohort = '' OR p_cohort = 'All'
        OR (p_cohort LIKE 'start:%' AND to_char(d.observed_membership_started_at, 'YYYY-MM') = substring(p_cohort FROM 7))
        OR (p_cohort LIKE 'programme:%' AND COALESCE(d.programme_cohort, '') = substring(p_cohort FROM 11))
      )
  ),
  event_sequence AS (
    SELECT x.*,
           lag(x.status) OVER (PARTITION BY x.profile_id ORDER BY x.effective_at, x.id) AS previous_status
    FROM (
      SELECT e.* FROM public.membership_status_events e
      JOIN member_scope ms ON ms.profile_id = e.profile_id
    ) x
  ),
  observed_starts AS (
    SELECT profile_id, min(effective_at) AS started_at
    FROM event_sequence
    WHERE status IN ('active', 'trialing')
      AND NOT is_baseline
      AND (previous_status IS NULL OR previous_status NOT IN ('active', 'trialing'))
    GROUP BY profile_id
  ),
  transitions AS (
    SELECT profile_id, effective_at, status, previous_status
    FROM event_sequence
  ),
  losses AS (
    SELECT * FROM transitions
    WHERE previous_status IN ('active', 'trialing')
      AND status IN ('lapsed', 'none')
  ),
  months AS (
    SELECT generate_series(
      date_trunc('month', v_effective_start)::date,
      date_trunc('month', v_end)::date,
      interval '1 month'
    )::date AS month_start
  ),
  growth AS (
    SELECT m.month_start,
      (SELECT count(DISTINCT ms.profile_id)
       FROM member_scope ms JOIN public.reporting_membership_intervals i ON i.profile_id = ms.profile_id
       WHERE i.status IN ('active','trialing') AND i.starts_at <= m.month_start::timestamptz
         AND (i.ends_at IS NULL OR i.ends_at > m.month_start::timestamptz)) AS starting,
      (SELECT count(*) FROM observed_starts s
       WHERE s.started_at >= m.month_start::timestamptz
         AND s.started_at < (m.month_start + interval '1 month')::timestamptz) AS new_members,
      (SELECT count(DISTINCT l.profile_id) FROM losses l
       WHERE l.effective_at >= m.month_start::timestamptz
         AND l.effective_at < (m.month_start + interval '1 month')::timestamptz) AS lost,
      (SELECT count(DISTINCT ms.profile_id)
       FROM member_scope ms JOIN public.reporting_membership_intervals i ON i.profile_id = ms.profile_id
       WHERE i.status IN ('active','trialing') AND i.starts_at < (m.month_start + interval '1 month')::timestamptz
         AND (i.ends_at IS NULL OR i.ends_at >= (m.month_start + interval '1 month')::timestamptz)) AS ending,
      (SELECT count(DISTINCT ms.profile_id)
       FROM member_scope ms JOIN public.reporting_membership_intervals i ON i.profile_id = ms.profile_id
       WHERE ms.track = 'Adult' AND i.status IN ('active','trialing')
         AND i.starts_at < (m.month_start + interval '1 month')::timestamptz
         AND (i.ends_at IS NULL OR i.ends_at >= (m.month_start + interval '1 month')::timestamptz)) AS adult,
      (SELECT count(DISTINCT ms.profile_id)
       FROM member_scope ms JOIN public.reporting_membership_intervals i ON i.profile_id = ms.profile_id
       WHERE ms.track = 'Teen' AND i.status IN ('active','trialing')
         AND i.starts_at < (m.month_start + interval '1 month')::timestamptz
         AND (i.ends_at IS NULL OR i.ends_at >= (m.month_start + interval '1 month')::timestamptz)) AS teen,
      (SELECT count(DISTINCT ms.profile_id)
       FROM member_scope ms JOIN public.reporting_membership_intervals i ON i.profile_id = ms.profile_id
       WHERE ms.track = 'Child' AND i.status IN ('active','trialing')
         AND i.starts_at < (m.month_start + interval '1 month')::timestamptz
         AND (i.ends_at IS NULL OR i.ends_at >= (m.month_start + interval '1 month')::timestamptz)) AS child
    FROM months m
  ),
  retention_periods(label, duration, sort_order) AS (
    VALUES ('4 weeks', interval '4 weeks', 1),
           ('8 weeks', interval '8 weeks', 2),
           ('3 months', interval '3 months', 3),
           ('6 months', interval '6 months', 4),
           ('12 months', interval '12 months', 5)
  ),
  retention AS (
    SELECT rp.label, rp.sort_order,
      count(*) FILTER (WHERE s.started_at + rp.duration <= (v_end + 1)::timestamptz) AS denominator,
      count(*) FILTER (
        WHERE s.started_at + rp.duration <= (v_end + 1)::timestamptz
          AND EXISTS (
            SELECT 1 FROM public.reporting_membership_intervals i
            WHERE i.profile_id = s.profile_id AND i.status IN ('active','trialing')
              AND i.starts_at <= s.started_at + rp.duration
              AND (i.ends_at IS NULL OR i.ends_at > s.started_at + rp.duration)
          )
      ) AS retained,
      count(*) FILTER (WHERE ms.track='Adult' AND s.started_at + rp.duration <= (v_end + 1)::timestamptz) AS adult_denominator,
      count(*) FILTER (WHERE ms.track='Adult' AND s.started_at + rp.duration <= (v_end + 1)::timestamptz AND EXISTS (
        SELECT 1 FROM public.reporting_membership_intervals i WHERE i.profile_id=s.profile_id AND i.status IN ('active','trialing')
          AND i.starts_at <= s.started_at+rp.duration AND (i.ends_at IS NULL OR i.ends_at > s.started_at+rp.duration))) AS adult_retained,
      count(*) FILTER (WHERE ms.track='Teen' AND s.started_at + rp.duration <= (v_end + 1)::timestamptz) AS teen_denominator,
      count(*) FILTER (WHERE ms.track='Teen' AND s.started_at + rp.duration <= (v_end + 1)::timestamptz AND EXISTS (
        SELECT 1 FROM public.reporting_membership_intervals i WHERE i.profile_id=s.profile_id AND i.status IN ('active','trialing')
          AND i.starts_at <= s.started_at+rp.duration AND (i.ends_at IS NULL OR i.ends_at > s.started_at+rp.duration))) AS teen_retained,
      count(*) FILTER (WHERE ms.track='Child' AND s.started_at + rp.duration <= (v_end + 1)::timestamptz) AS child_denominator,
      count(*) FILTER (WHERE ms.track='Child' AND s.started_at + rp.duration <= (v_end + 1)::timestamptz AND EXISTS (
        SELECT 1 FROM public.reporting_membership_intervals i WHERE i.profile_id=s.profile_id AND i.status IN ('active','trialing')
          AND i.starts_at <= s.started_at+rp.duration AND (i.ends_at IS NULL OR i.ends_at > s.started_at+rp.duration))) AS child_retained
    FROM observed_starts s
    JOIN member_scope ms ON ms.profile_id=s.profile_id
    CROSS JOIN retention_periods rp
    GROUP BY rp.label, rp.sort_order
  ),
  cohort_cells AS (
    SELECT to_char(date_trunc('month', s.started_at), 'YYYY-MM') AS cohort_month,
           n.month_number,
           count(*) FILTER (
             WHERE s.started_at + make_interval(months => n.month_number) <= (v_end + 1)::timestamptz
           ) AS denominator,
           count(*) FILTER (
             WHERE s.started_at + make_interval(months => n.month_number) <= (v_end + 1)::timestamptz
               AND EXISTS (
                 SELECT 1 FROM public.reporting_membership_intervals i
                 WHERE i.profile_id=s.profile_id AND i.status IN ('active','trialing')
                   AND i.starts_at <= s.started_at + make_interval(months => n.month_number)
                   AND (i.ends_at IS NULL OR i.ends_at > s.started_at + make_interval(months => n.month_number))
               )
           ) AS retained
    FROM observed_starts s
    CROSS JOIN generate_series(0, 12) n(month_number)
    GROUP BY 1, 2
  ),
  cohort_rows AS (
    SELECT cohort_month,
           jsonb_object_agg(
             'M' || month_number::text,
             CASE WHEN denominator = 0 THEN NULL
                  ELSE round((retained::numeric / denominator::numeric) * 100, 1) END
             ORDER BY month_number
           ) AS months
    FROM cohort_cells GROUP BY cohort_month
  ),
  outcomes AS (
    SELECT o.* FROM public.reporting_eligible_session_outcomes o
    JOIN member_scope ms ON ms.profile_id=o.profile_id
    WHERE o.session_date BETWEEN v_effective_start AND v_end
      AND (p_location_id IS NULL OR o.location_id=p_location_id)
  ),
  outcome_sequence AS (
    SELECT o.*,
      lead(o.attended, 1) OVER (PARTITION BY o.profile_id ORDER BY o.session_date, o.scheduled_session_id) AS next_attended,
      lead(o.attended, 2) OVER (PARTITION BY o.profile_id ORDER BY o.session_date, o.scheduled_session_id) AS after_two_attended,
      lead(o.attended, 3) OVER (PARTITION BY o.profile_id ORDER BY o.session_date, o.scheduled_session_id) AS after_three_attended,
      sum(CASE WHEN NOT o.attended THEN 1 ELSE 0 END) OVER (
        PARTITION BY o.profile_id ORDER BY o.session_date, o.scheduled_session_id
      ) AS attended_group,
      sum(CASE WHEN NOT o.attended THEN 1 ELSE 0 END) OVER (
        PARTITION BY o.profile_id ORDER BY o.session_date DESC, o.scheduled_session_id DESC
      ) AS reverse_miss_count,
      sum(CASE WHEN o.attended THEN 1 ELSE 0 END) OVER (
        PARTITION BY o.profile_id ORDER BY o.session_date DESC, o.scheduled_session_id DESC
      ) AS reverse_attended_count
    FROM outcomes o
  ),
  streak_lengths AS (
    SELECT profile_id, attended_group, count(*) AS streak
    FROM outcome_sequence WHERE attended GROUP BY profile_id, attended_group
  ),
  member_attendance AS (
    SELECT ms.profile_id, ms.member_name, ms.track, ms.membership_status,
           ms.household_id, ms.household_name,
           count(os.scheduled_session_id) AS eligible,
           count(os.scheduled_session_id) FILTER (WHERE os.attended) AS attended,
           count(os.scheduled_session_id) FILTER (WHERE NOT os.attended) AS missed,
           max(os.session_date) FILTER (WHERE os.attended) AS last_attended,
           count(os.scheduled_session_id) FILTER (WHERE os.attended AND os.reverse_miss_count=0) AS current_streak,
           count(os.scheduled_session_id) FILTER (WHERE NOT os.attended AND os.reverse_attended_count=0) AS current_missed_streak,
           COALESCE((SELECT max(sl.streak) FROM streak_lengths sl WHERE sl.profile_id=ms.profile_id), 0) AS longest_streak
    FROM member_scope ms
    LEFT JOIN outcome_sequence os ON os.profile_id=ms.profile_id
    GROUP BY ms.profile_id, ms.member_name, ms.track, ms.membership_status,
             ms.household_id, ms.household_name
  ),
  weekly_attendance AS (
    SELECT date_trunc('week', session_date)::date AS week_start, track,
           count(*) AS eligible, count(*) FILTER (WHERE attended) AS attended
    FROM outcomes GROUP BY 1, 2
  ),
  journal_scope AS (
    SELECT j.* FROM public.reporting_journal_session_completion j
    JOIN member_scope ms ON ms.profile_id=j.profile_id
    WHERE j.session_date BETWEEN v_effective_start AND v_end
      AND (p_location_id IS NULL OR j.location_id=p_location_id)
  ),
  journal_monthly AS (
    SELECT date_trunc('month', session_date)::date AS month_start,
           count(DISTINCT scheduled_session_id) AS sessions,
           sum(fields_available) AS possible_entries,
           sum(fields_completed) AS completed_entries
    FROM journal_scope GROUP BY 1
  ),
  journal_entries_monthly AS (
    SELECT m.month_start,
      (SELECT count(*)
       FROM public.journal_field_activity_events e
       JOIN member_scope ms ON ms.profile_id=e.profile_id
       WHERE e.event='completed' AND NOT e.is_baseline AND ms.track='Adult'
         AND e.occurred_at>=m.month_start::timestamptz
         AND e.occurred_at<(m.month_start+interval '1 month')::timestamptz) AS entries,
      (SELECT count(DISTINCT ms.profile_id)
       FROM member_scope ms
       JOIN public.reporting_membership_intervals i ON i.profile_id=ms.profile_id
       WHERE ms.track='Adult' AND i.status IN ('active','trialing')
         AND i.starts_at<(m.month_start+interval '1 month')::timestamptz
         AND (i.ends_at IS NULL OR i.ends_at>m.month_start::timestamptz)) AS active_members
    FROM months m
  ),
  relationship_members AS (
    SELECT s.profile_id, ms.track,
      EXISTS (
        SELECT 1 FROM public.reporting_membership_intervals i
        WHERE i.profile_id=s.profile_id AND i.status IN ('active','trialing')
          AND i.starts_at<=s.started_at+interval '8 weeks'
          AND (i.ends_at IS NULL OR i.ends_at>s.started_at+interval '8 weeks')
      ) AS retained_eight_weeks,
      (SELECT count(*) FILTER (WHERE o.attended)::numeric/NULLIF(count(*),0)
       FROM public.reporting_eligible_session_outcomes o
       WHERE o.profile_id=s.profile_id
         AND o.session_date BETWEEN s.started_at::date AND (s.started_at+interval '8 weeks')::date) AS attendance_rate,
      CASE WHEN ms.track='Adult' THEN (
        SELECT sum(j.fields_completed)::numeric/NULLIF(sum(j.fields_available),0)
        FROM public.reporting_journal_session_completion j
        WHERE j.profile_id=s.profile_id
          AND j.session_date BETWEEN s.started_at::date AND (s.started_at+interval '8 weeks')::date
      ) ELSE NULL END AS journal_rate,
      (SELECT COALESCE(max(miss_run),0) FROM (
        SELECT count(*) AS miss_run
        FROM (
          SELECT o.attended,
            sum(CASE WHEN o.attended THEN 1 ELSE 0 END) OVER (
              ORDER BY o.session_date,o.scheduled_session_id
            ) AS attended_group
          FROM public.reporting_eligible_session_outcomes o
          WHERE o.profile_id=s.profile_id
            AND o.session_date BETWEEN s.started_at::date AND (s.started_at+interval '8 weeks')::date
        ) sequenced_outcomes
        WHERE NOT attended
        GROUP BY attended_group
      ) missed_runs) AS longest_missed_streak
    FROM observed_starts s
    JOIN member_scope ms ON ms.profile_id=s.profile_id
    WHERE s.started_at+interval '8 weeks' <= (v_end+1)::timestamptz
  ),
  engagement_bands(label, minimum, maximum, sort_order) AS (
    VALUES ('<25%',0::numeric,.25::numeric,1),('25–49%',.25,.50,2),
           ('50–74%',.50,.75,3),('75–89%',.75,.90,4),('90%+',.90,1.01,5)
  ),
  session_performance AS (
    SELECT o.week_number,
           COALESCE(max(j.theme), 'Week ' || o.week_number::text) AS theme,
           o.track,
           count(*) AS eligible,
           count(*) FILTER (WHERE o.attended) AS attended,
           sum(j.fields_available) AS possible_entries,
           sum(j.fields_completed) AS completed_entries
    FROM outcomes o
    LEFT JOIN journal_scope j
      ON j.profile_id=o.profile_id AND j.scheduled_session_id=o.scheduled_session_id
    GROUP BY o.week_number, o.track
  ),
  risk_outcomes AS (
    SELECT o.* FROM public.reporting_eligible_session_outcomes o
    JOIN member_scope ms ON ms.profile_id=o.profile_id
    WHERE o.session_date BETWEEN GREATEST(v_capture_at::date, v_end - 41) AND v_end
  ),
  risk_sequence AS (
    SELECT ro.*,
      sum(CASE WHEN ro.attended THEN 1 ELSE 0 END) OVER (
        PARTITION BY ro.profile_id ORDER BY ro.session_date DESC, ro.scheduled_session_id DESC
      ) AS reverse_attended_count
    FROM risk_outcomes ro
  ),
  risk_stats AS (
    SELECT ms.profile_id,
      count(rs.scheduled_session_id) AS eligible_6w,
      count(rs.scheduled_session_id) FILTER (WHERE rs.attended) AS attended_6w,
      count(rs.scheduled_session_id) FILTER (WHERE NOT rs.attended AND rs.reverse_attended_count=0) AS missed_streak,
      max(rs.session_date) FILTER (WHERE rs.attended) AS last_attended,
      min(rs.session_date) AS first_eligible
    FROM member_scope ms LEFT JOIN risk_sequence rs ON rs.profile_id=ms.profile_id
    GROUP BY ms.profile_id
  ),
  journal_last AS (
    SELECT e.profile_id,
           max(e.occurred_at) FILTER (WHERE e.event='completed' AND NOT e.is_baseline) AS last_journal_activity,
           count(*) FILTER (WHERE e.event='completed' AND NOT e.is_baseline
             AND e.occurred_at >= now() - interval '3 weeks') AS recent_entries,
           count(*) FILTER (WHERE e.event='completed' AND NOT e.is_baseline
             AND e.occurred_at >= now() - interval '6 weeks'
             AND e.occurred_at < now() - interval '3 weeks') AS prior_entries
    FROM public.journal_field_activity_events e
    JOIN member_scope ms ON ms.profile_id=e.profile_id
    GROUP BY e.profile_id
  ),
  active_household_members AS (
    SELECT ms.household_id, ms.profile_id, ms.track
    FROM member_scope ms
    WHERE ms.household_id IS NOT NULL AND ms.membership_status IN ('active','trialing')
  ),
  household_shapes AS (
    SELECT household_id, count(*) AS member_count,
      bool_or(track='Adult') AS has_adult,
      bool_or(track='Teen') AS has_teen,
      bool_or(track='Child') AS has_child
    FROM active_household_members GROUP BY household_id
  ),
  household_week AS (
    SELECT o.household_id, o.week_number,
           count(DISTINCT o.profile_id) AS eligible_members,
           count(DISTINCT o.profile_id) FILTER (WHERE o.attended) AS attending_members
    FROM outcomes o WHERE o.household_id IS NOT NULL
    GROUP BY o.household_id, o.week_number
  ),
  track_rows(track) AS (VALUES ('Adult'), ('Teen'), ('Child')),
  first_losses AS (
    SELECT s.profile_id, s.started_at, min(l.effective_at) AS ended_at
    FROM observed_starts s JOIN losses l ON l.profile_id=s.profile_id AND l.effective_at>s.started_at
    GROUP BY s.profile_id, s.started_at
  ),
  paying_profiles AS (
    SELECT DISTINCT ms.profile_id
    FROM member_scope ms
    LEFT JOIN public.subscriptions direct_sub
      ON direct_sub.profile_id=ms.profile_id AND direct_sub.status='active'
    LEFT JOIN public.subscriptions household_sub
      ON household_sub.household_id=ms.household_id AND household_sub.status='active'
    WHERE direct_sub.id IS NOT NULL OR household_sub.id IS NOT NULL
  )
  SELECT jsonb_build_object(
    'coverage', jsonb_build_object(
      'history_started_at', v_capture_at,
      'requested_start', v_requested_start,
      'effective_start', v_effective_start,
      'end', v_end,
      'is_partial', v_requested_start < v_capture_at::date,
      'message', CASE WHEN v_requested_start < v_capture_at::date
        THEN 'Historical status and attendance denominators are available only from ' || to_char(v_capture_at, 'DD Mon YYYY') || '. Earlier current-state rows were not backdated.'
        ELSE NULL END
    ),
    'filters', jsonb_build_object(
      'statuses', (SELECT COALESCE(jsonb_agg(DISTINCT membership_status ORDER BY membership_status), '[]'::jsonb) FROM public.profiles),
      'locations', (SELECT COALESCE(jsonb_agg(jsonb_build_object('id',id,'name',name) ORDER BY name), '[]'::jsonb) FROM public.programme_locations WHERE is_active),
      'cohorts', (
        SELECT COALESCE(jsonb_agg(x ORDER BY (x->>'label')), '[]'::jsonb)
        FROM (
          SELECT DISTINCT jsonb_build_object('value','start:'||to_char(observed_membership_started_at,'YYYY-MM'),'label',to_char(observed_membership_started_at,'Mon YYYY')) x
          FROM public.reporting_member_dimension WHERE observed_membership_started_at IS NOT NULL AND NOT observed_start_is_baseline
          UNION
          SELECT DISTINCT jsonb_build_object('value','programme:'||programme_cohort,'label',programme_cohort)
          FROM public.reporting_member_dimension WHERE NULLIF(programme_cohort,'') IS NOT NULL
        ) q
      ),
      'attendance_target', v_attendance_target
    ),
    'executive', jsonb_build_object(
      'active_paying_members', (SELECT count(*) FROM paying_profiles),
      'active_members', (SELECT count(*) FROM member_scope WHERE membership_status IN ('active','trialing')),
      'new_members', CASE WHEN v_end < v_capture_at::date THEN NULL ELSE (SELECT count(*) FROM observed_starts WHERE started_at::date BETWEEN v_effective_start AND v_end) END,
      'lost_members', CASE WHEN v_end < v_capture_at::date THEN NULL ELSE (SELECT count(DISTINCT profile_id) FROM losses WHERE effective_at::date BETWEEN v_effective_start AND v_end) END,
      'net_growth', CASE WHEN v_end < v_capture_at::date THEN NULL ELSE
                    (SELECT count(*) FROM observed_starts WHERE started_at::date BETWEEN v_effective_start AND v_end)
                    - (SELECT count(DISTINCT profile_id) FROM losses WHERE effective_at::date BETWEEN v_effective_start AND v_end) END,
      'growth_percent', (
        SELECT CASE WHEN COALESCE(starting,0)=0 THEN NULL
          ELSE round((((new_members-lost)::numeric)/starting::numeric)*100,1) END
        FROM growth ORDER BY month_start LIMIT 1
      ),
      'inactive_members', (SELECT count(*) FROM member_scope WHERE membership_status NOT IN ('active','trialing')),
      'adult_active', (SELECT count(*) FROM member_scope WHERE track='Adult' AND membership_status IN ('active','trialing')),
      'teen_active', (SELECT count(*) FROM member_scope WHERE track='Teen' AND membership_status IN ('active','trialing')),
      'child_active', (SELECT count(*) FROM member_scope WHERE track='Child' AND membership_status IN ('active','trialing')),
      'active_households', (SELECT count(*) FROM household_shapes),
      'mrr_cents', (
        SELECT CASE
          WHEN count(*)=0 OR count(mrr_cents)<>count(*) OR count(DISTINCT currency)<>1 THEN NULL
          ELSE sum(mrr_cents)
        END
        FROM public.subscriptions s WHERE s.status='active'
          AND (p_location_id IS NULL OR EXISTS (
            SELECT 1 FROM member_scope ms WHERE ms.location_id=p_location_id
              AND (ms.profile_id=s.profile_id OR ms.household_id=s.household_id)))
      ),
      'currency', (SELECT min(currency) FROM public.subscriptions WHERE status='active' AND mrr_cents IS NOT NULL)
    ),
    'growth', (SELECT COALESCE(jsonb_agg(jsonb_build_object(
      'month', to_char(month_start,'YYYY-MM'), 'starting',starting, 'new',new_members,
      'lost',lost, 'ending',ending, 'net',new_members-lost,
      'churn_rate',CASE WHEN starting=0 THEN NULL ELSE round(lost::numeric/starting::numeric*100,1) END,
      'Adult',adult,'Teen',teen,'Child',child,'total',ending
    ) ORDER BY month_start), '[]'::jsonb) FROM growth),
    'retention', (SELECT COALESCE(jsonb_agg(jsonb_build_object(
      'label',label,'denominator',denominator,'retained',retained,
      'overall',CASE WHEN denominator=0 THEN NULL ELSE round(retained::numeric/denominator::numeric*100,1) END,
      'Adult',CASE WHEN adult_denominator=0 THEN NULL ELSE round(adult_retained::numeric/adult_denominator::numeric*100,1) END,
      'Teen',CASE WHEN teen_denominator=0 THEN NULL ELSE round(teen_retained::numeric/teen_denominator::numeric*100,1) END,
      'Child',CASE WHEN child_denominator=0 THEN NULL ELSE round(child_retained::numeric/child_denominator::numeric*100,1) END
    ) ORDER BY sort_order), '[]'::jsonb) FROM retention),
    'cohorts', (SELECT COALESCE(jsonb_agg(jsonb_build_object('cohort',cohort_month,'months',months) ORDER BY cohort_month), '[]'::jsonb) FROM cohort_rows),
    'churn', jsonb_build_object(
      'monthly', (SELECT COALESCE(jsonb_agg(jsonb_build_object(
        'month',to_char(month_start,'YYYY-MM'),'lost',lost,
        'rate',CASE WHEN starting=0 THEN NULL ELSE round(lost::numeric/starting::numeric*100,1) END
      ) ORDER BY month_start),'[]'::jsonb) FROM growth),
      'current_rate', (SELECT CASE WHEN starting=0 THEN NULL ELSE round(lost::numeric/starting::numeric*100,1) END FROM growth ORDER BY month_start DESC LIMIT 1),
      'average_duration_days', (SELECT round(avg(extract(epoch FROM (ended_at-started_at))/86400)::numeric,1) FROM first_losses),
      'median_duration_days', (SELECT round((percentile_cont(.5) WITHIN GROUP (ORDER BY extract(epoch FROM (ended_at-started_at))/86400))::numeric,1) FROM first_losses),
      'by_exit_status', (SELECT COALESCE(jsonb_agg(jsonb_build_object('status',status,'count',count) ORDER BY count DESC),'[]'::jsonb)
        FROM (SELECT status,count(*) FROM losses WHERE effective_at::date BETWEEN v_effective_start AND v_end GROUP BY status) x)
    ),
    'attendance', jsonb_build_object(
      'eligible', (SELECT count(*) FROM outcomes),
      'attended', (SELECT count(*) FROM outcomes WHERE attended),
      'rate', (SELECT CASE WHEN count(*)=0 THEN NULL ELSE round(count(*) FILTER (WHERE attended)::numeric/count(*)::numeric*100,1) END FROM outcomes),
      'mean_sessions', (SELECT round(avg(attended)::numeric,1) FROM member_attendance WHERE eligible>0),
      'median_sessions', (SELECT round((percentile_cont(.5) WITHIN GROUP (ORDER BY attended))::numeric,1) FROM member_attendance WHERE eligible>0),
      'average_current_streak', (SELECT round(avg(current_streak)::numeric,1) FROM member_attendance WHERE eligible>0),
      'median_current_streak', (SELECT round((percentile_cont(.5) WITHIN GROUP (ORDER BY current_streak))::numeric,1) FROM member_attendance WHERE eligible>0),
      'longest_current_streak', (SELECT max(current_streak) FROM member_attendance),
      'four_plus_streak_percent', (SELECT CASE WHEN count(*) FILTER (WHERE eligible>0)=0 THEN NULL ELSE round(count(*) FILTER (WHERE current_streak>=4)::numeric/count(*) FILTER (WHERE eligible>0)::numeric*100,1) END FROM member_attendance),
      'eight_plus_streak_percent', (SELECT CASE WHEN count(*) FILTER (WHERE eligible>0)=0 THEN NULL ELSE round(count(*) FILTER (WHERE current_streak>=8)::numeric/count(*) FILTER (WHERE eligible>0)::numeric*100,1) END FROM member_attendance),
      'return_after_miss', (SELECT CASE WHEN count(*) FILTER (WHERE NOT attended AND next_attended IS NOT NULL)=0 THEN NULL ELSE round(count(*) FILTER (WHERE NOT attended AND next_attended)::numeric/count(*) FILTER (WHERE NOT attended AND next_attended IS NOT NULL)::numeric*100,1) END FROM outcome_sequence),
      'return_after_two_misses', (SELECT CASE WHEN count(*) FILTER (WHERE NOT attended AND next_attended=false AND after_two_attended IS NOT NULL)=0 THEN NULL ELSE round(count(*) FILTER (WHERE NOT attended AND next_attended=false AND after_two_attended)::numeric/count(*) FILTER (WHERE NOT attended AND next_attended=false AND after_two_attended IS NOT NULL)::numeric*100,1) END FROM outcome_sequence),
      'return_after_three_misses', (SELECT CASE WHEN count(*) FILTER (WHERE NOT attended AND next_attended=false AND after_two_attended=false AND after_three_attended IS NOT NULL)=0 THEN NULL ELSE round(count(*) FILTER (WHERE NOT attended AND next_attended=false AND after_two_attended=false AND after_three_attended)::numeric/count(*) FILTER (WHERE NOT attended AND next_attended=false AND after_two_attended=false AND after_three_attended IS NOT NULL)::numeric*100,1) END FROM outcome_sequence),
      'distribution', (SELECT COALESCE(jsonb_agg(jsonb_build_object('sessions',attended,'members',members) ORDER BY attended),'[]'::jsonb)
        FROM (SELECT attended,count(*) AS members FROM member_attendance WHERE eligible>0 GROUP BY attended) distribution_rows),
      'trend', (SELECT COALESCE(jsonb_agg(jsonb_build_object(
        'week',to_char(week_start,'YYYY-MM-DD'),'track',track,'eligible',eligible,'attended',attended,
        'rate',CASE WHEN eligible=0 THEN NULL ELSE round(attended::numeric/eligible::numeric*100,1) END
      ) ORDER BY week_start,track),'[]'::jsonb) FROM weekly_attendance)
    ),
    'member_metrics', (SELECT COALESCE(jsonb_agg(jsonb_build_object(
      'profile_id',ma.profile_id,'member',ma.member_name,'track',ma.track,'status',ma.membership_status,
      'household',ma.household_name,'eligible',ma.eligible,'attended',ma.attended,'missed',ma.missed,
      'attendance_rate',CASE WHEN ma.eligible=0 THEN NULL ELSE round(ma.attended::numeric/ma.eligible::numeric*100,1) END,
      'current_streak',ma.current_streak,'longest_streak',ma.longest_streak,
      'missed_streak',ma.current_missed_streak,'last_attended',ma.last_attended,
      'last_journal_activity',CASE WHEN ma.track='Adult' THEN jl.last_journal_activity ELSE NULL END,
      'journal_supported',ma.track='Adult'
    ) ORDER BY ma.member_name),'[]'::jsonb)
      FROM member_attendance ma LEFT JOIN journal_last jl ON jl.profile_id=ma.profile_id),
    'at_risk', (SELECT COALESCE(jsonb_agg(jsonb_build_object(
      'profile_id',ms.profile_id,'member',ms.member_name,'track',ms.track,
      'status',ms.membership_status,'household',ms.household_name,
      'eligible',COALESCE(ma.eligible,0),'attended',COALESCE(ma.attended,0),'missed',COALESCE(ma.missed,0),
      'attendance_rate',CASE WHEN COALESCE(ma.eligible,0)=0 THEN NULL ELSE round(ma.attended::numeric/ma.eligible::numeric*100,1) END,
      'current_streak',COALESCE(ma.current_streak,0),'longest_streak',COALESCE(ma.longest_streak,0),
      'last_attended',rs.last_attended,'missed_streak',rs.missed_streak,
      'six_week_attendance',CASE WHEN rs.eligible_6w=0 THEN NULL ELSE round(rs.attended_6w::numeric/rs.eligible_6w::numeric*100,1) END,
      'last_journal_activity',CASE WHEN ms.track='Adult' THEN jl.last_journal_activity ELSE NULL END,
      'journal_supported',ms.track='Adult',
      'reasons', jsonb_strip_nulls(jsonb_build_object(
        'recent_misses',CASE WHEN rs.missed_streak>=v_risk_misses THEN true END,
        'low_attendance',CASE WHEN rs.eligible_6w>=2 AND rs.attended_6w::numeric/rs.eligible_6w::numeric<v_risk_rate THEN true END,
        'attendance_inactive',CASE WHEN (rs.last_attended IS NOT NULL AND rs.last_attended<v_end-v_risk_days)
          OR (rs.last_attended IS NULL AND rs.first_eligible IS NOT NULL AND rs.first_eligible<=v_end-v_risk_days) THEN true END,
        'journal_inactive',CASE WHEN ms.track='Adult' AND (
          jl.last_journal_activity<now()-make_interval(weeks=>v_risk_journal_weeks)
          OR (jl.last_journal_activity IS NULL AND NOT COALESCE(ms.observed_start_is_baseline,true)
            AND ms.observed_membership_started_at<now()-make_interval(weeks=>v_risk_journal_weeks))
        ) THEN true END,
        'journal_declining',CASE WHEN ms.track='Adult' AND jl.prior_entries>0 AND jl.recent_entries<jl.prior_entries THEN true END
      ))
    ) ORDER BY rs.missed_streak DESC,ms.member_name),'[]'::jsonb)
      FROM member_scope ms JOIN risk_stats rs ON rs.profile_id=ms.profile_id
      LEFT JOIN member_attendance ma ON ma.profile_id=ms.profile_id
      LEFT JOIN journal_last jl ON jl.profile_id=ms.profile_id
      WHERE ms.membership_status IN ('active','trialing') AND (
        rs.missed_streak>=v_risk_misses
        OR (rs.eligible_6w>=2 AND rs.attended_6w::numeric/NULLIF(rs.eligible_6w,0)<v_risk_rate)
        OR (rs.last_attended IS NOT NULL AND rs.last_attended<v_end-v_risk_days)
        OR (rs.last_attended IS NULL AND rs.first_eligible IS NOT NULL AND rs.first_eligible<=v_end-v_risk_days)
        OR (ms.track='Adult' AND (
          jl.last_journal_activity<now()-make_interval(weeks=>v_risk_journal_weeks)
          OR (jl.last_journal_activity IS NULL AND NOT COALESCE(ms.observed_start_is_baseline,true)
            AND ms.observed_membership_started_at<now()-make_interval(weeks=>v_risk_journal_weeks))
        ))
        OR (ms.track='Adult' AND jl.prior_entries>0 AND jl.recent_entries<jl.prior_entries)
      )),
    'journal', jsonb_build_object(
      'supported_tracks', jsonb_build_array('Adult'),
      'possible_entries', (SELECT sum(fields_available) FROM journal_scope),
      'completed_entries', (SELECT sum(fields_completed) FROM journal_scope),
      'completion_rate', (SELECT CASE WHEN COALESCE(sum(fields_available),0)=0 THEN NULL ELSE round(sum(fields_completed)::numeric/sum(fields_available)::numeric*100,1) END FROM journal_scope),
      'average_session_completion', (SELECT round(avg(fields_completed::numeric/NULLIF(fields_available,0))*100,1) FROM journal_scope),
      'median_session_completion', (SELECT round((percentile_cont(.5) WITHIN GROUP (ORDER BY fields_completed::double precision/NULLIF(fields_available,0))*100)::numeric,1) FROM journal_scope),
      'entries_per_active_member_month', (
        SELECT round(sum(entries)::numeric/NULLIF(sum(active_members),0)::numeric,2)
        FROM journal_entries_monthly
      ),
      'trend', (SELECT COALESCE(jsonb_agg(jsonb_build_object(
        'month',to_char(month_start,'YYYY-MM'),'sessions',sessions,'possible_entries',possible_entries,
        'completed_entries',completed_entries,
        'completion',CASE WHEN possible_entries=0 THEN NULL ELSE round(completed_entries::numeric/possible_entries::numeric*100,1) END,
        'entries_per_active_member',(SELECT round(jem.entries::numeric/NULLIF(jem.active_members,0)::numeric,2) FROM journal_entries_monthly jem WHERE jem.month_start=journal_monthly.month_start)
      ) ORDER BY month_start),'[]'::jsonb) FROM journal_monthly),
      'funnel', (
        SELECT COALESCE(jsonb_agg(funnel_row ORDER BY week_number), '[]'::jsonb)
        FROM (
          SELECT week_number,
            jsonb_build_object(
              'week',week_number,'theme',theme,
              'eligible',count(*),'attended',count(*) FILTER (WHERE attended),
              'journal_started',count(*) FILTER (WHERE journal_opened_at IS NOT NULL),
              'responded',count(*) FILTER (WHERE fields_completed>0),
              'half_complete',count(*) FILTER (WHERE fields_completed::numeric/NULLIF(fields_available,0)>=.5),
              'complete',count(*) FILTER (WHERE fields_completed=fields_available)
            ) AS funnel_row
          FROM journal_scope
          GROUP BY week_number,theme
        ) funnel_rows
      )
    ),
    'sessions', (SELECT COALESCE(jsonb_agg(jsonb_build_object(
      'week',week_number,'theme',theme,'track',track,'eligible',eligible,
      'attendance_rate',CASE WHEN eligible=0 THEN NULL ELSE round(attended::numeric/eligible::numeric*100,1) END,
      'journal_completion',CASE WHEN COALESCE(possible_entries,0)=0 THEN NULL ELSE round(completed_entries::numeric/possible_entries::numeric*100,1) END,
      'entries_per_member',CASE WHEN eligible=0 OR completed_entries IS NULL THEN NULL ELSE round(completed_entries::numeric/eligible::numeric,2) END
    ) ORDER BY week_number,track),'[]'::jsonb) FROM session_performance),
    'families', jsonb_build_object(
      'active_households',(SELECT count(*) FROM household_shapes),
      'average_members',(SELECT round(avg(member_count)::numeric,2) FROM household_shapes),
      'adult_only',(SELECT count(*) FROM household_shapes WHERE has_adult AND NOT has_teen AND NOT has_child),
      'adult_child',(SELECT count(*) FROM household_shapes WHERE has_adult AND has_child AND NOT has_teen),
      'adult_teen',(SELECT count(*) FROM household_shapes WHERE has_adult AND has_teen AND NOT has_child),
      'adult_teen_child',(SELECT count(*) FROM household_shapes WHERE has_adult AND has_teen AND has_child),
      'family_participation_rate',(SELECT CASE WHEN count(*) FILTER (WHERE eligible_members>1)=0 THEN NULL ELSE round(count(*) FILTER (WHERE eligible_members>1 AND attending_members>1)::numeric/count(*) FILTER (WHERE eligible_members>1)::numeric*100,1) END FROM household_week),
      'household_retention',NULL
    ),
    'relationships', jsonb_build_object(
      'retention_by_attendance_band', (
        SELECT COALESCE(jsonb_agg(jsonb_build_object(
          'band',band,'members',members,'retained',retained,
          'retention',retained::numeric/NULLIF(members,0)*100
        ) ORDER BY sort_order),'[]'::jsonb)
        FROM (
          SELECT b.label AS band, b.sort_order,
            count(rm.profile_id) AS members,
            count(rm.profile_id) FILTER (WHERE rm.retained_eight_weeks) AS retained
          FROM engagement_bands b
          LEFT JOIN relationship_members rm
            ON rm.attendance_rate>=b.minimum AND rm.attendance_rate<b.maximum
          GROUP BY b.label, b.sort_order
        ) band_counts
      ),
      'retention_by_journal_band', (
        SELECT COALESCE(jsonb_agg(jsonb_build_object(
          'band',band,'members',members,'retained',retained,
          'retention',retained::numeric/NULLIF(members,0)*100
        ) ORDER BY sort_order),'[]'::jsonb)
        FROM (
          SELECT b.label AS band, b.sort_order,
            count(rm.profile_id) AS members,
            count(rm.profile_id) FILTER (WHERE rm.retained_eight_weeks) AS retained
          FROM engagement_bands b
          LEFT JOIN relationship_members rm
            ON rm.track='Adult' AND rm.journal_rate>=b.minimum AND rm.journal_rate<b.maximum
          GROUP BY b.label, b.sort_order
        ) band_counts
      ),
      'retention_by_missed_streak', (
        SELECT COALESCE(jsonb_agg(jsonb_build_object(
          'band',band,'members',members,'retained',retained,
          'retention',retained::numeric/NULLIF(members,0)*100
        ) ORDER BY sort_order),'[]'::jsonb)
        FROM (
          SELECT CASE WHEN longest_missed_streak=0 THEN 'No consecutive misses'
                      WHEN longest_missed_streak=1 THEN '1 miss'
                      WHEN longest_missed_streak=2 THEN '2 misses'
                      ELSE '3+ misses' END AS band,
                 CASE WHEN longest_missed_streak=0 THEN 1 WHEN longest_missed_streak=1 THEN 2
                      WHEN longest_missed_streak=2 THEN 3 ELSE 4 END AS sort_order,
                 count(*) AS members,
                 count(*) FILTER (WHERE retained_eight_weeks) AS retained
          FROM relationship_members
          GROUP BY 1,2
        ) missed_streak_bands
      )
    ),
    'track_comparison', (SELECT COALESCE(jsonb_agg(jsonb_build_object(
      'track',tr.track,
      'active_members',(SELECT count(*) FROM member_scope ms WHERE ms.track=tr.track AND ms.membership_status IN ('active','trialing')),
      'new_members',(SELECT count(*) FROM observed_starts s JOIN member_scope ms ON ms.profile_id=s.profile_id WHERE ms.track=tr.track AND s.started_at::date BETWEEN v_effective_start AND v_end),
      'eight_week_retention',(SELECT CASE tr.track WHEN 'Adult' THEN r.adult_retained::numeric/NULLIF(r.adult_denominator,0)*100 WHEN 'Teen' THEN r.teen_retained::numeric/NULLIF(r.teen_denominator,0)*100 ELSE r.child_retained::numeric/NULLIF(r.child_denominator,0)*100 END FROM retention r WHERE r.label='8 weeks'),
      'six_month_retention',(SELECT CASE tr.track WHEN 'Adult' THEN r.adult_retained::numeric/NULLIF(r.adult_denominator,0)*100 WHEN 'Teen' THEN r.teen_retained::numeric/NULLIF(r.teen_denominator,0)*100 ELSE r.child_retained::numeric/NULLIF(r.child_denominator,0)*100 END FROM retention r WHERE r.label='6 months'),
      'attendance',(SELECT count(*) FILTER (WHERE attended)::numeric/NULLIF(count(*),0)*100 FROM outcomes o WHERE o.track=tr.track),
      'return_after_miss',(SELECT count(*) FILTER (WHERE NOT attended AND next_attended)::numeric/NULLIF(count(*) FILTER (WHERE NOT attended AND next_attended IS NOT NULL),0)*100 FROM outcome_sequence o WHERE o.track=tr.track),
      'journal_completion',CASE WHEN tr.track='Adult' THEN (SELECT sum(fields_completed)::numeric/NULLIF(sum(fields_available),0)*100 FROM journal_scope) ELSE NULL END,
      'entries_per_member_month',CASE WHEN tr.track='Adult' THEN (SELECT sum(entries)::numeric/NULLIF(sum(active_members),0) FROM journal_entries_monthly) ELSE NULL END
    ) ORDER BY tr.track),'[]'::jsonb) FROM track_rows tr),
    'lifecycle', jsonb_build_array(
      jsonb_build_object('stage','Registered','count',(SELECT count(*) FROM member_scope)),
      jsonb_build_object('stage','Trial / membership started','count',(SELECT count(*) FROM observed_starts)),
      jsonb_build_object('stage','Attended','count',(SELECT count(DISTINCT profile_id) FROM public.check_ins WHERE profile_id IN (SELECT profile_id FROM member_scope))),
      jsonb_build_object('stage','Paid','count',(SELECT count(*) FROM paying_profiles)),
      jsonb_build_object('stage','4 weeks active','count',(SELECT retained FROM retention WHERE label='4 weeks')),
      jsonb_build_object('stage','8 weeks active','count',(SELECT retained FROM retention WHERE label='8 weeks')),
      jsonb_build_object('stage','3 months active','count',(SELECT retained FROM retention WHERE label='3 months')),
      jsonb_build_object('stage','6 months active','count',(SELECT retained FROM retention WHERE label='6 months'))
    ),
    'investor_scorecard', jsonb_build_object(
      'active_paying_members',(SELECT count(*) FROM paying_profiles),
      'mrr_cents',(SELECT CASE
        WHEN count(*)=0 OR count(mrr_cents)<>count(*) OR count(DISTINCT currency)<>1 THEN NULL
        ELSE sum(mrr_cents) END
        FROM public.subscriptions WHERE status='active'),
      'net_growth',CASE WHEN v_end < v_capture_at::date THEN NULL ELSE
        (SELECT count(*) FROM observed_starts WHERE started_at::date BETWEEN v_effective_start AND v_end)
        - (SELECT count(DISTINCT profile_id) FROM losses WHERE effective_at::date BETWEEN v_effective_start AND v_end) END,
      'four_week_retention',(SELECT CASE WHEN denominator=0 THEN NULL ELSE retained::numeric/denominator::numeric*100 END FROM retention WHERE label='4 weeks'),
      'eight_week_retention',(SELECT CASE WHEN denominator=0 THEN NULL ELSE retained::numeric/denominator::numeric*100 END FROM retention WHERE label='8 weeks'),
      'three_month_retention',(SELECT CASE WHEN denominator=0 THEN NULL ELSE retained::numeric/denominator::numeric*100 END FROM retention WHERE label='3 months'),
      'six_month_retention',(SELECT CASE WHEN denominator=0 THEN NULL ELSE retained::numeric/denominator::numeric*100 END FROM retention WHERE label='6 months'),
      'monthly_churn',(SELECT CASE WHEN starting=0 THEN NULL ELSE lost::numeric/starting::numeric*100 END FROM growth ORDER BY month_start DESC LIMIT 1),
      'weekly_attendance',(SELECT count(*) FILTER (WHERE attended)::numeric/NULLIF(count(*),0)*100 FROM outcomes),
      'return_after_miss',(SELECT count(*) FILTER (WHERE NOT attended AND next_attended)::numeric/NULLIF(count(*) FILTER (WHERE NOT attended AND next_attended IS NOT NULL),0)*100 FROM outcome_sequence),
      'journal_completion',(SELECT sum(fields_completed)::numeric/NULLIF(sum(fields_available),0)*100 FROM journal_scope),
      'entries_per_member_month',(SELECT sum(entries)::numeric/NULLIF(sum(active_members),0) FROM journal_entries_monthly),
      'active_households',(SELECT count(*) FROM household_shapes),
      'member_referral_percent',NULL,
      'founder_facilitated_percent',NULL,
      'active_locations',(SELECT count(*) FROM public.programme_locations WHERE is_active)
    ),
    'investor_scorecard_changes', jsonb_build_object(
      'active_paying_members',NULL,
      'mrr_cents',NULL,
      'net_growth',CASE WHEN v_previous_start < v_capture_at::date THEN NULL ELSE
        (
          (SELECT count(*) FROM observed_starts WHERE started_at::date BETWEEN v_effective_start AND v_end)
          - (SELECT count(DISTINCT profile_id) FROM losses WHERE effective_at::date BETWEEN v_effective_start AND v_end)
        ) - (
          (SELECT count(*) FROM observed_starts WHERE started_at::date BETWEEN v_previous_start AND v_previous_end)
          - (SELECT count(DISTINCT profile_id) FROM losses WHERE effective_at::date BETWEEN v_previous_start AND v_previous_end)
        ) END,
      'four_week_retention',NULL,
      'eight_week_retention',NULL,
      'three_month_retention',NULL,
      'six_month_retention',NULL,
      'monthly_churn',NULL,
      'weekly_attendance',CASE WHEN v_previous_start < v_capture_at::date THEN NULL ELSE
        (SELECT count(*) FILTER (WHERE attended)::numeric/NULLIF(count(*),0)*100 FROM outcomes)
        - (SELECT count(*) FILTER (WHERE o.attended)::numeric/NULLIF(count(*),0)*100
           FROM public.reporting_eligible_session_outcomes o
           JOIN member_scope ms ON ms.profile_id=o.profile_id
           WHERE o.session_date BETWEEN v_previous_start AND v_previous_end
             AND (p_location_id IS NULL OR o.location_id=p_location_id)) END,
      'return_after_miss',NULL,
      'journal_completion',CASE WHEN v_previous_start < v_capture_at::date THEN NULL ELSE
        (SELECT sum(fields_completed)::numeric/NULLIF(sum(fields_available),0)*100 FROM journal_scope)
        - (SELECT sum(j.fields_completed)::numeric/NULLIF(sum(j.fields_available),0)*100
           FROM public.reporting_journal_session_completion j
           JOIN member_scope ms ON ms.profile_id=j.profile_id
           WHERE j.session_date BETWEEN v_previous_start AND v_previous_end
             AND (p_location_id IS NULL OR j.location_id=p_location_id)) END,
      'entries_per_member_month',NULL,
      'active_households',NULL,
      'member_referral_percent',NULL,
      'founder_facilitated_percent',NULL,
      'active_locations',NULL
    ),
    'definitions', public.admin_reporting_metric_definitions()
  ) INTO v_result;

  RETURN v_result;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_reporting_dashboard(date,date,text,text,uuid,text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_reporting_dashboard(date,date,text,text,uuid,text) TO authenticated;

-- Metadata-only member drill-down. No lesson_journal response columns are ever
-- selected by this function.

