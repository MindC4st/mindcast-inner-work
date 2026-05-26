"""Generate a SQL migration that seeds mindcast_live_sessions with the
real lesson content from the four Mindcast LIVE phase CSVs.

Run once locally. The output goes under supabase/migrations/.
"""
import csv
import os

CSV_TO_COL = [
    ("Week_Number", "week_number"),
    ("Phase", "phase"),
    ("Phase_Name", "phase_name"),
    ("Theme_Title", "theme_title"),
    ("Audience", "audience"),
    ("Core_Concept", "core_concept"),
    ("Signal_Metaphor", "signal_metaphor"),
    ("Ancient_Wisdom_Reframe", "ancient_wisdom_reframe"),
    ("Session_Title", "session_title"),
    ("Opening_Hook", "opening_hook"),
    ("Teaching_Points", "teaching_points"),
    ("Experiential_Exercise", "experiential_exercise"),
    ("Guided_Reflection", "guided_reflection"),
    ("Journaling_Prompt", "journaling_prompt"),
    ("Weekly_Practice_Mon", "weekly_practice_mon"),
    ("Weekly_Practice_Wed", "weekly_practice_wed"),
    ("Weekly_Practice_Sun", "weekly_practice_sun"),
    ("Core_Affirmation", "core_affirmation"),
    ("Video_Link", "video_link"),
    ("Video_Description", "video_description"),
    ("Video_Backup_Description", "video_backup_description"),
    ("Film_Script_2min", "film_script_2min"),
    ("Facilitator_Notes", "facilitator_notes"),
]

FILES = [
    r"C:\Users\grant\Downloads\mindcast_live_phase1.csv",
    r"C:\Users\grant\Downloads\mindcast_live_phase2.csv",
    r"C:\Users\grant\Downloads\mindcast_live_phase3.csv",
    r"C:\Users\grant\Downloads\files (1)\mindcast_live_phase4.csv",
]

OUT = r"C:\GitHub\mindcast-inner-work\supabase\migrations\20260526180000_seed_phase1_to_4_lesson_content.sql"


def lit(v: str) -> str:
    if v is None or v == "":
        return "''"
    return "'" + v.replace("'", "''") + "'"


def lit_int(v: str) -> str:
    return str(int(v))


def main() -> None:
    all_rows = []
    for path in FILES:
        with open(path, encoding="utf-8") as f:
            for row in csv.DictReader(f):
                all_rows.append(row)

    seen = set()
    for r in all_rows:
        key = (int(r["Week_Number"]), r["Audience"])
        if key in seen:
            raise SystemExit(f"DUPLICATE row across CSVs: {key}")
        seen.add(key)

    if len(all_rows) != 156:
        raise SystemExit(f"Expected 156 rows, got {len(all_rows)}")

    aud_rank = {"Adult": 0, "Teen": 1, "Child": 2}
    all_rows.sort(key=lambda r: (int(r["Week_Number"]), aud_rank[r["Audience"]]))

    cols_db = [c for _, c in CSV_TO_COL]
    update_cols = [c for c in cols_db if c not in ("week_number", "audience")]

    values = []
    for r in all_rows:
        parts = []
        for csv_col, db_col in CSV_TO_COL:
            v = r.get(csv_col, "")
            if db_col in ("week_number", "phase"):
                parts.append(lit_int(v))
            else:
                parts.append(lit(v))
        values.append("  (" + ", ".join(parts) + ")")

    sql = []
    sql.append("-- Phase 1-4 lesson content seed for mindcast_live_sessions.")
    sql.append("-- Source: mindcast_live_phase{1..4}.csv (52 weeks x 3 audiences = 156 rows).")
    sql.append("-- ON CONFLICT (week_number, audience) DO UPDATE refreshes all content")
    sql.append("-- columns, so this cleanly overrides the earlier stub seed.")
    sql.append("")
    sql.append("INSERT INTO public.mindcast_live_sessions (")
    sql.append("  " + ", ".join(cols_db))
    sql.append(") VALUES")
    sql.append(",\n".join(values))
    sql.append("ON CONFLICT (week_number, audience) DO UPDATE SET")
    sets = [f"  {c} = EXCLUDED.{c}" for c in update_cols]
    sql.append(",\n".join(sets) + ";")
    sql.append("")

    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, "w", encoding="utf-8", newline="\n") as f:
        f.write("\n".join(sql))

    print(f"Wrote {OUT}")
    print(f"Rows: {len(all_rows)}  File: {os.path.getsize(OUT):,} bytes")


if __name__ == "__main__":
    main()
