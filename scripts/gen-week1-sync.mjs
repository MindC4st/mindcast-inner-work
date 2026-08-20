// gen-week1-sync.mjs — generate 20260823140000_week1_content_sync.sql
import { readFileSync, writeFileSync } from 'node:fs';

const DIR = 'C:/Users/grant/AppData/Local/Temp/opencode/mirofish';
const child = readFileSync(`${DIR}/week1-Child.txt`, 'utf8');
const v2Themes = JSON.parse(readFileSync(`${DIR}/v2-themes.json`, 'utf8'));
const themesJson = JSON.parse(readFileSync(`${DIR}/themes.json`, 'utf8'));

const TAG = '$w1sync$';

function between(txt, startMarker, endMarker) {
  const i = txt.indexOf(startMarker);
  if (i < 0) throw new Error('marker not found: ' + startMarker);
  const j = endMarker ? txt.indexOf(endMarker, i + startMarker.length) : txt.length;
  return txt.slice(i + startMarker.length, j < 0 ? txt.length : j);
}
const toText = (block) => block.split('\n')
  .map(l => l
    .replace(/^\s*\[heading_[23]\][^\n]*$/, '')
    .replace(/^\s*\[(paragraph|quote)\]\s*/, '')
    .replace(/^\s*\[bulleted_list_item\]\s*/, '- ')
    .replace(/^\s*\[numbered_list_item\]\s*/, '- '))
  .join('\n').replace(/\n{3,}/g, '\n\n').trim();

// ---- child sections ----
const openingQ = toText(between(child, '[heading_3] Opening Question — VERBATIM', '[heading_3] Slide 1 Notes'));
const teachingPts = toText(between(child, '[heading_2] Teaching points — VERBATIM', '[heading_2] Slide 4'));
const ancientWisdom = toText(between(child, '[heading_3] Ancient Wisdom Quote — VERBATIM', '[heading_3] In Today’s World Quote'));
const todaysWorld = toText(between(child, '[heading_3] In Today’s World Quote — VERBATIM', '[heading_3] Optional Gemini Clip'));
const bodyDetective = toText(between(child, '[heading_3] Body Detective — FACILITATOR ACTIVITY', '[heading_3] Colouring Page Prompt'));
const whileColour = toText(between(child, '[heading_3] While They Colour — VERBATIM', '[heading_3] Slide 5 Notes'));
const colourPrompt = toText(between(child, '[heading_3] Colouring Page Prompt — STRUCTURED', '[heading_3] AI Generation Safety'));
const reflectionQs = toText(between(child, '[heading_3] Reflection Questions — VERBATIM', '[heading_3] Slide 6 Notes'));
const childInstructions = toText(between(child, '[heading_3] Child Instructions — VERBATIM', '[heading_3] Slide 7 Notes'));
const intentionLine = toText(between(child, '[heading_3] Intention — VERBATIM', '[heading_3] Child Instructions'));
const affirmation = toText(between(child, '[heading_3] Affirmation — VERBATIM', '[heading_3] Closing Screen'));
const practiceBlock = toText(between(child, '[heading_2] Weekly Practice — VERBATIM', '[heading_2] Slide 8'));
const gameFull = toText(between(child, '[heading_3] Group Game — FACILITATOR VIEW ONLY', '[heading_2] Facilitator Notes'));
const askChildren = toText(between(child, '[heading_3] Ask the Children — VERBATIM', '[heading_3] Second Question'));
const secondQ = toText(between(child, '[heading_3] Second Question — VERBATIM', '[heading_3] Slide 4 Notes'));

// practice lines: SUN/WED/FRI
const prac = { SUN: '', WED: '', FRI: '' };
for (const line of practiceBlock.split('\n')) {
  const m = line.match(/^- (SUN|WED|FRI)(?: \(TODAY\))? — (.*)$/);
  if (m) prac[m[1]] = m[2];
}

// game split: main text ends at equipment list; equipment = first bullet run; under5 after
const gameLines = gameFull.split('\n');
const eqStart = gameLines.findIndex(l => l.startsWith('- kitchen timer'));
const u5Start = gameLines.findIndex(l => l.startsWith('Keep all three rounds shorter.'));
const gameMain = gameLines.slice(0, eqStart).join('\n').trim();
const equipment = gameLines.slice(eqStart, u5Start).filter(l => l.startsWith('- ')).map(l => l.slice(2)).join('; ');
const under5 = gameLines.slice(u5Start).join('\n').trim();

// facilitator notes — compose with ## headings
const fnSections = [
  ['Aim', '[heading_3] Aim — STRUCTURED', '[heading_3] Run the Room'],
  ['Run the Room', '[heading_3] Run the Room — STRUCTURED', '[heading_3] Safeguarding'],
  ['Safeguarding', '[heading_3] Safeguarding — VERBATIM', '[heading_3] Why This Week Exists'],
  ['Why This Week Exists — The Evidence', '[heading_3] Why This Week Exists — The Evidence — VERBATIM', '[heading_3] Real-World Anchor'],
  ['Real-World Anchor', '[heading_3] Real-World Anchor — VERBATIM', '[heading_3] Evidence Quality'],
  ['Evidence Quality', '[heading_3] Evidence Quality — VERBATIM', '[heading_3] We Deliberately Do Not Claim'],
  ['We Deliberately Do Not Claim', '[heading_3] We Deliberately Do Not Claim — VERBATIM', '[heading_3] Source Trail'],
  ['Source Trail', '[heading_3] Source Trail — VERBATIM', null],
];
const fnParts = fnSections.map(([title, s, e]) => `## ${title}\n${toText(between(child, s, e))}`);
const facilitatorNotes = fnParts.join('\n\n');

// ---- sanity checks ----
const checks = { openingQ, teachingPts, ancientWisdom, todaysWorld, bodyDetective, whileColour, colourPrompt, reflectionQs, childInstructions, intentionLine, affirmation, gameMain, equipment, under5, facilitatorNotes };
for (const [k, v] of Object.entries(checks)) {
  if (!v || v.length < 10) throw new Error(`extraction too short: ${k}`);
  if (v.includes(TAG)) throw new Error(`tag collision in ${k}`);
}
console.log('child sections extracted:', Object.fromEntries(Object.entries(checks).map(([k, v]) => [k, v.length])));
console.log('practice:', JSON.stringify(prac).slice(0, 200));

// ---- SQL generation ----
const esc = (s) => s.replace(/'/g, "''");
const dq = (s) => `${TAG}${s}${TAG}`;
const stmts = [];

stmts.push(`-- Week 1 content sync + child-track alignment (source: the three rebuilt
-- Week 1 Notion pages, pulled 2026-08-20).
--
-- 1. Backfill curriculum_weeks.weekly_theme (weeks 1-32 were wiped to '' by the
--    weeks1-39 notion pull, which read the callout instead of the Weekly Theme
--    property) and kids_title (never populated).
-- 2. Sync the child Week 1 row to the rewritten 8-slide child sequence:
--    lighthouse comparison, The Quiet Book read-live delivery, Body Detective +
--    colouring, spoken reflection, one-thing intention (no if-then), closing game.
-- 3. Fill the two gaps the pull left in every track: core_concept (the pull
--    stored it in s5_source_core_concept, which the deck does not read) and
--    thought_provoking_question (Slide 5 subheading).
-- 4. Refresh week-2 callbacks for Teen + Child to mirror the updated week-1
--    intention prompts.`);

// 1. weekly_theme backfill (weeks 1-32 only; 33-52 already set)
for (let wk = 1; wk <= 32; wk++) {
  stmts.push(`UPDATE public.curriculum_weeks SET weekly_theme = ${dq(v2Themes[wk])}, updated_at = now() WHERE week_number = ${wk};`);
}

// 2. kids_title backfill — strip "Week N — " prefix from Notion page titles
for (const [wk, title] of Object.entries(themesJson.childTitles)) {
  const clean = title.replace(/^Week \d+\s*[—–-]\s*/, '').trim();
  if (!clean) continue;
  stmts.push(`UPDATE public.curriculum_weeks SET kids_title = ${dq(clean)}, updated_at = now() WHERE week_number = ${wk};`);
}

// 3. curriculum_weeks week 1 child fields
stmts.push(`UPDATE public.curriculum_weeks SET
  kids_signal_metaphor = ${dq(todaysWorld)},
  kids_source = '',
  kids_read_aloud_source_check = ${dq("READ LIVE FROM A PURCHASED COPY — no unofficial YouTube read-alouds (copyright, and the text is not the week's book).")},
  kids_picture_book_question = ${dq(`${askChildren}\n\n${secondQ}`)},
  kids_colouring_prompt = ${dq(colourPrompt)},
  kids_game = ${dq(gameMain)},
  kids_game_equipment = ${dq(equipment)},
  kids_game_under5 = ${dq(under5)},
  updated_at = now()
WHERE week_number = 1;`);

// 4. core_concept + thought_provoking_question, all tracks
stmts.push(`UPDATE public.mindcast_live_sessions
SET core_concept = s5_source_core_concept, updated_at = now()
WHERE week_number = 1 AND COALESCE(btrim(core_concept), '') = '' AND COALESCE(btrim(s5_source_core_concept), '') <> '';`);
stmts.push(`UPDATE public.mindcast_live_sessions SET thought_provoking_question = ${dq('What reached you yesterday that you never deliberately chose to give attention to?')}, updated_at = now() WHERE week_number = 1 AND audience = 'Adult';`);
stmts.push(`UPDATE public.mindcast_live_sessions SET thought_provoking_question = ${dq('What have you heard, seen or experienced often enough that it started to feel normal?')}, updated_at = now() WHERE week_number = 1 AND audience = 'Teen';`);

// 5. child live session — full sync
stmts.push(`UPDATE public.mindcast_live_sessions SET
  ancient_wisdom_reframe = ${dq(ancientWisdom)},
  signal_metaphor = ${dq(todaysWorld)},
  opening_hook = ${dq(openingQ)},
  teaching_points = ${dq(teachingPts)},
  experiential_exercise = ${dq(`${bodyDetective}\n\nWHILE THEY COLOUR\n${whileColour}`)},
  guided_reflection = ${dq(reflectionQs)},
  journaling_prompt = ${dq(reflectionQs)},
  private_write_prompt = ${dq(childInstructions)},
  intention_prompt = ${dq(`${intentionLine}\n${childInstructions}`)},
  core_affirmation = ${dq(affirmation)},
  weekly_practice_mon = '',
  weekly_practice_wed = ${dq(prac.WED)},
  weekly_practice_fri = ${dq(prac.FRI)},
  weekly_practice_sun = ${dq(prac.SUN)},
  facilitator_notes = ${dq(facilitatorNotes)},
  updated_at = now()
WHERE week_number = 1 AND audience = 'Child';`);

// 6. week-2 callbacks (mirror the updated week-1 intention prompts)
stmts.push(`UPDATE public.mindcast_live_sessions SET previous_week_callback = ${dq('one thing I want to work on this week is…')}, updated_at = now() WHERE week_number = 2 AND audience = 'Child';`);
stmts.push(`UPDATE public.mindcast_live_sessions SET previous_week_callback = ${dq('when I notice [a specific pressure, trend, opinion, label or cue], I will [take one small action that gives me a moment to choose]')}, updated_at = now() WHERE week_number = 2 AND audience = 'Teen';`);

const sql = stmts.join('\n\n') + '\n';
writeFileSync('supabase/migrations/20260823140000_week1_content_sync.sql', sql);
console.log('wrote migration:', sql.length, 'chars,', stmts.length, 'statements');
