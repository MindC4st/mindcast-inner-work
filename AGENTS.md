# AGENTS.md

## Curriculum content — source of truth

The live portal reads the Supabase `curriculum_weeks` table (via the `curriculum_public` RPC).

**Video URLs for the 52-week curriculum are set by:**

`supabase/migrations/20260711160000_curriculum_content_v2.sql`

This is the base source for `youtube_url`, `youtube_title`, `adult_source`, `adult_video_title`, `teen_source`, and `teen_video_title`.

**Per-week overrides are applied by later migrations** (e.g. `20260814130000_week1_video_content_update.sql` overrides Week 1 with per-track videos and adds `kids_source` + `kids_game` to `curriculum_weeks`). To find the *current* video for a given week, read the migration chain in timestamp order — the newest `UPDATE public.curriculum_weeks ... WHERE week_number = N` wins.

Do NOT treat the files in `exports/` (`mindcast-adult-lessons.csv`, `mindcast-teen-lessons.csv`, `mindcast-child-lessons.csv`, `VIDEO-SOURCING-SHEET.csv`) as the source of truth — they are stale exports of an earlier framework.

Key facts:
- Base model: one video per week, shared across all three tracks (`adult_source == teen_source == youtube_url`). Week 1 has been overridden to per-track videos (`adult_source` / `teen_source` / `kids_source`).
- The member portal resolves the video per track from `mindcast_live_sessions.video_link` (per-audience), falling back to `curriculum_weeks.youtube_url` (see `PortalWeek.tsx`).
- The full lesson copy (opening hook, teaching points, reflective questions, activities, weekly practices, affirmation) lives in `mindcast_live_sessions` — seeded by `20260526180000_seed_phase1_to_4_lesson_content.sql`, with per-week overrides in later migrations.
- Child sessions use a picture book (`kids_picture_book`) plus a `kids_game` group game and `kids_source` video.
- Session headings resolve per-track: `adult_video_title` / `teen_video_title` / `kids_title`.

If you need the current video list in a reviewable form, regenerate it from the migration chain (see `scripts/verify-video-urls.mjs` for the CSV parsing pattern).
