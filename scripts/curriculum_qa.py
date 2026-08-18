#!/usr/bin/env python3
"""
Mindcast curriculum QA.

Two checks across all 156 lessons (52 weeks x adult/teen/child):

  1. COHERENCE  - flags lessons whose Journaling Prompt AND Core Affirmation
                  share no meaningful keywords with the Weekly Theme. This is
                  how the Week 1 adult fracture was found: the front half of
                  the lesson taught signal/noise while the back half taught
                  emotional labour.

  2. CLAIMS     - flags discredited, contested or overstated claims. Mindcast
                  positions itself on best available evidence; a member
                  finding "21 days to form a habit" in month four costs more
                  than this script costs to run.

Usage:
    python3 scripts/curriculum_qa.py                    # human readable
    python3 scripts/curriculum_qa.py --json             # machine readable
    python3 scripts/curriculum_qa.py --dir path/to/csvs

Exit codes:  0 = clean   1 = findings   2 = could not read source files
Run after any curriculum edit, and before any lesson export goes to print.
"""

from __future__ import annotations
import argparse, csv, json, re, sys
from pathlib import Path

TRACKS = {
    "adult": "mindcast-adult-lessons.csv",
    "teen": "mindcast-teen-lessons.csv",
    "child": "mindcast-child-lessons.csv",
}

STOPWORDS = set("""
the a an and or of to in on is are was were be been being that this these those it its
for with as at by from not no but if then so what who how why when where you your yours
i me my we our us they them their he she his her one two into about over under out up
down more most some any all can could would should will just like get got make made
take took go going day week thing things time times new own very really actually
today session week's group people person feel feeling felt something anything nothing
""".split())

# Fields whose drift indicates the lesson has fractured away from its theme.
THEME_FIELDS = ["Weekly Theme", "Core Learning", "Core Concept"]
CHECK_FIELDS = ["Journaling Prompt", "Core Affirmation"]
CONTEXT_FIELDS = ["Experiential Exercise", "Guided Reflection"]

CLAIMS = {
    "21-day habit rule": (
        r"21[-\s]day|twenty[-\s]one days",
        "Originates in Maltz (1960), an observation about post-surgical "
        "adjustment, not habit research. Lally et al. (2010): median 66 days, "
        "range 18-254.",
    ),
    "mirror neurons": (
        r"mirror neuron",
        "Human mirror-neuron function is contested; transmission of beliefs is "
        "unsupported. Teach social contagion as behaviour, not mechanism.",
    ),
    "learning styles": (
        r"learning style|visual learner|auditory learner|kinaesthetic learner",
        "No credible evidence that matching instruction to a preferred style "
        "improves learning.",
    ),
    "left/right brain": (
        r"left[-\s]brain(ed)?|right[-\s]brain(ed)?|left hemisphere person",
        "Hemispheric personality types are not supported.",
    ),
    "Mehrabian 7-38-55": (
        r"7[-\s]?38[-\s]?55|93\s*%\s*of communication|55\s*%\s*(is\s*)?body language",
        "Mehrabian's finding applies only to incongruent affective messages, "
        "not communication generally.",
    ),
    "power posing": (
        r"power pos(e|ing)",
        "Hormonal and behavioural effects failed to replicate.",
    ),
    "ego depletion": (
        r"ego depletion|willpower is (like )?a muscle|willpower.{0,25}finite",
        "Failed large-scale replication.",
    ),
    "marshmallow test": (
        r"marshmallow test|marshmallow experiment",
        "Watts et al. (2018): effects largely attenuate when controlling for "
        "socioeconomic background.",
    ),
    "10% of the brain": (
        r"10\s*%\s*of (our|your|the) brain|ten percent of (our|your|the) brain",
        "Myth.",
    ),
    "amygdala hijack": (
        r"amygdala hijack",
        "Goleman's popular coinage, not a technical term. Avoid millisecond "
        "timing claims.",
    ),
    "reptilian/lizard brain": (
        r"reptilian brain|lizard brain|triune brain",
        "The triune brain model is obsolete in neuroscience.",
    ),
    "rewiring the brain": (
        r"rewir(e|es|ing) (your|the|our) brain",
        "Overstates neuroplasticity. Prefer 'build the pathway' / 'practise'.",
    ),
    "dopamine detox": (
        r"dopamine detox|dopamine fast",
        "Not a recognised physiological process.",
    ),
    "law of attraction": (
        r"law of attraction|manifest(ing|ation)?\s+(your|abundance|money|success)",
        "Charter section 7 excludes this framing.",
    ),
    "vibration / frequency": (
        r"raise your vibration|high[- ]vibration|energy frequency|vibrational",
        "Charter section 7 excludes this framing.",
    ),
    "10,000 hours": (
        r"10,?000 hours",
        "Ericsson's work does not support a universal threshold; Gladwell's "
        "framing is a popularisation.",
    ),
    "cortisol claims": (
        r"cortisol",
        "REVIEW ONLY - popular cortisol claims are frequently wrong. Verify "
        "the specific statement.",
    ),
    "growth mindset": (
        r"growth mindset|fixed mindset",
        "REVIEW ONLY - permitted, but never with an effect size implied. "
        "Sisk et al. (2018): ~1% of variance, d = 0.08. Benefit concentrates "
        "in struggling learners.",
    ),
}

REVIEW_ONLY = {"cortisol claims", "growth mindset", "amygdala hijack"}


def tokens(text: str) -> set[str]:
    return {
        w for w in re.findall(r"[a-z']+", (text or "").lower())
        if len(w) > 3 and w not in STOPWORDS
    }


def load(directory: Path) -> dict:
    data = {}
    for track, filename in TRACKS.items():
        path = directory / filename
        if not path.exists():
            print(f"ERROR: missing {path}", file=sys.stderr)
            sys.exit(2)
        with path.open(encoding="utf-8-sig") as fh:
            data[track] = {
                r["Week"].strip(): r
                for r in csv.DictReader(fh)
                if r.get("Week", "").strip()
            }
    return data


def check_coherence(data: dict) -> list[dict]:
    findings = []
    for track, weeks in data.items():
        for week, row in weeks.items():
            theme = set()
            for f in THEME_FIELDS:
                theme |= tokens(row.get(f, ""))
            if not theme:
                continue
            overlaps = {f: len(theme & tokens(row.get(f, ""))) for f in CHECK_FIELDS}
            if all(v == 0 for v in overlaps.values()):
                context = {f: len(theme & tokens(row.get(f, ""))) for f in CONTEXT_FIELDS}
                findings.append({
                    "week": int(week),
                    "track": track,
                    "theme": row.get("Weekly Theme", "").strip(),
                    "overlaps": {**overlaps, **context},
                    "affirmation": (row.get("Core Affirmation") or "").strip()[:110],
                })
    return sorted(findings, key=lambda f: (f["week"], f["track"]))


def check_claims(data: dict) -> list[dict]:
    findings = []
    for track, weeks in data.items():
        for week, row in weeks.items():
            blob = " ".join(str(v or "") for v in row.values())
            for name, (pattern, note) in CLAIMS.items():
                m = re.search(pattern, blob, re.I)
                if m:
                    start = max(0, m.start() - 60)
                    findings.append({
                        "week": int(week),
                        "track": track,
                        "claim": name,
                        "severity": "review" if name in REVIEW_ONLY else "fix",
                        "note": note,
                        "excerpt": " ".join(blob[start:m.end() + 60].split()),
                    })
    return sorted(findings, key=lambda f: (f["severity"], f["week"], f["track"]))


def main() -> int:
    ap = argparse.ArgumentParser(description="Mindcast curriculum QA")
    ap.add_argument("--dir", default="exports", help="directory holding the lesson CSVs")
    ap.add_argument("--json", action="store_true", help="machine-readable output")
    args = ap.parse_args()

    data = load(Path(args.dir))
    total = sum(len(w) for w in data.values())
    coherence = check_coherence(data)
    claims = check_claims(data)
    fixes = [c for c in claims if c["severity"] == "fix"]

    if args.json:
        print(json.dumps({
            "lessons_scanned": total,
            "coherence_findings": coherence,
            "claim_findings": claims,
        }, indent=2))
        return 1 if (coherence or fixes) else 0

    print(f"MINDCAST CURRICULUM QA  -  {total} lessons scanned\n" + "=" * 66)

    print(f"\n1. COHERENCE  -  {len(coherence)} fractured of {total}")
    if not coherence:
        print("   Clean. Every lesson's affirmation or journal prompt tracks its theme.")
    for f in coherence:
        print(f"\n   wk{f['week']:>2} {f['track']:<6} {f['theme']}")
        print(f"      overlaps: {f['overlaps']}")
        print(f"      affirmation: \"{f['affirmation']}\"")

    print(f"\n\n2. CLAIMS  -  {len(fixes)} to fix, {len(claims) - len(fixes)} to review")
    if not claims:
        print("   Clean.")
    current = None
    for f in claims:
        if f["claim"] != current:
            current = f["claim"]
            tag = "FIX" if f["severity"] == "fix" else "REVIEW"
            print(f"\n   [{tag}] {f['claim']}")
            print(f"      {f['note']}")
        print(f"      - {f['track']} wk{f['week']}: ...{f['excerpt']}...")

    ok = not coherence and not fixes
    print("\n" + "=" * 66)
    print("PASS - no blocking findings." if ok else "FINDINGS PRESENT - see above.")
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
