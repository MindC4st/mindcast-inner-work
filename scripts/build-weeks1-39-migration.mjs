import { readFileSync, writeFileSync } from 'node:fs';
const d = JSON.parse(readFileSync('C:/Users/grant/AppData/Local/Temp/opencode/mirofish/parsed-weeks-1-39.json', 'utf8'));
const findings = JSON.parse(readFileSync('C:/Users/grant/AppData/Local/Temp/opencode/mirofish/pull-findings.json', 'utf8'));

const esc = (s) => (s || '').replace(/\s+\n/g, '\n').trim();
function q(tag, value) {
  const v = esc(value);
  if (v.includes('$' + tag + '$')) throw new Error('tag collision: ' + tag);
  return `$${tag}$${v}$${tag}$`;
}
function splitName(raw) {
  const m = (raw || '').match(/^(.+?)\s+—\s+(.*)$/);
  if (!m) return { title: raw || '', author: '' };
  return { title: m[1].trim(), author: m[2].trim() };
}
const phaseNum = (p) => Number((p || '').replace(/\D/g, '')) || 0;

const NOTES_ORDER = ['Aim', 'Run the room', 'Safeguarding', 'Why this week exists — the evidence', 'Evidence quality', 'We deliberately do not claim', 'Source trail'];
function assembleNotes(sections) {
  const parts = [];
  const keys = Object.keys(sections).map(k => k.split('/')[1]);
  const ordered = [...NOTES_ORDER.filter(n => keys.includes(n)), ...keys.filter(k => !NOTES_ORDER.includes(k))];
  for (const name of ordered) {
    const body = (sections['Facilitator notes/' + name] || []).join('\n').trim();
    if (body) parts.push('## ' + name + '\n' + body);
  }
  return parts.join('\n\n');
}

const L = [];
L.push('-- Weeks 1-39 curriculum content pulled from Notion (source of truth per');
L.push('-- MC-MEM-106 v2.1 + Curriculum Lesson Specification). Replaces the review-doc');
L.push('-- migrations (weeks 1-31) and the earlier weeks 32-52 pull for weeks 32-39.');
L.push('--');
L.push('-- Pull-time transformations applied (all reported):');
for (const c of findings.cleaned) L.push('--   CLEANED  ' + c);
for (const m of findings.merged) L.push('--   MERGED   ' + m);
L.push('--');
L.push('-- Report-only (NOT fixed here — see proposals/notion-pull-weeks1-39-report.md):');
L.push('--   * 69 "DRAFT — rewrite from the video transcript" placeholders in In today\'s world');
L.push('--   * Adult wk1 + Teen wk1 videos flagged TO BE REPLACED (wrong videos, pulled as-is)');
L.push('--   * 64 missing callback lines (weeks 18-39 mostly) — left blank, never invented');
L.push('--   * Shared core concept drift: wk34 adult callout line missing, wk36 teen missing,');
L.push('--     wk37 adult version 26 chars longer than teen/child');
L.push('--   * Adult wk30 core concept uses forbidden vocabulary ("journey" x2)');
L.push('--   * Weeks 33-39 still carry OPEN fidelity tags in Notion (retired per spec; tags are');
L.push('--     Notion-side metadata and are not stored in the app)');
L.push('');

let updates = 0;
for (let i = 0; i < d.Adult.length; i++) {
  const A = d.Adult[i], T = d.Teen[i], C = d.Child[i];
  const w = A.week;
  if (T.week !== w || C.week !== w) throw new Error('week misalignment at ' + w);
  const t = String(w);
  const prev = { Adult: i > 0 ? d.Adult[i - 1].callback_line : '', Teen: i > 0 ? d.Teen[i - 1].callback_line : '', Child: i > 0 ? d.Child[i - 1].callback_line : '' };

  // ---- curriculum_weeks ----
  const book = splitName(C.book_raw);
  const nzAlt = splitName(C.nz_alt_raw);
  const cw = [];
  cw.push(`  weekly_theme         = ${q('cw' + t + '_theme', A.weekly_theme)}`);
  cw.push(`  the_territory        = ${q('cw' + t + '_terr', A.territory)}`);
  cw.push(`  opening_question     = ${q('cw' + t + '_oq', A.opening_question)}`);
  cw.push(`  week_type            = ${q('cw' + t + '_wt', A.week_type)}`);
  cw.push(`  reflective_question  = ${q('cw' + t + '_rq', A.journaling_prompt)}`);
  cw.push(`  interactive_activity = ${q('cw' + t + '_ia', A.exercise)}`);
  if (C.book_raw) {
    cw.push(`  kids_picture_book    = ${q('cw' + t + '_bk', book.title)}`);
    if (book.author) cw.push(`  kids_picture_book_author = ${q('cw' + t + '_bka', book.author)}`);
    const noteParts = [];
    if (C.book_why) noteParts.push('WHY THIS BOOK: ' + C.book_why);
    if (C.read_aloud_note) noteParts.push('READ-ALOUD: ' + C.read_aloud_note);
    if (noteParts.length) cw.push(`  kids_picture_book_note = ${q('cw' + t + '_bkn', noteParts.join('\n'))}`);
    if (C.book_question) cw.push(`  kids_picture_book_question = ${q('cw' + t + '_bkq', C.book_question)}`);
  }
  if (C.nz_alt_raw) {
    cw.push(`  kids_nz_alternative = ${q('cw' + t + '_nz', nzAlt.title)}`);
    if (nzAlt.author) cw.push(`  kids_nz_alternative_author = ${q('cw' + t + '_nza', nzAlt.author)}`);
    if (C.nz_alt_note) cw.push(`  kids_nz_alternative_note = ${q('cw' + t + '_nzn', C.nz_alt_note)}`);
  }
  if (C.colouring_prompt) cw.push(`  kids_colouring_prompt = ${q('cw' + t + '_col', C.colouring_prompt)}`);
  if (C.game) cw.push(`  kids_game = ${q('cw' + t + '_g', C.game)}`);
  if (C.game_equipment) cw.push(`  kids_game_equipment = ${q('cw' + t + '_ge', C.game_equipment)}`);
  if (C.game_under5) cw.push(`  kids_game_under5 = ${q('cw' + t + '_g5', C.game_under5)}`);
  L.push(`-- Week ${w} — ${A.weekly_theme}`);
  L.push(`UPDATE public.curriculum_weeks SET\n${cw.join(',\n')},\n  updated_at = now()\nWHERE week_number = ${w};`);
  updates++;

  // ---- live sessions ----
  for (const [aud, rec] of [['Adult', A], ['Teen', T], ['Child', C]]) {
    const tag = `s${t}${aud[0].toLowerCase()}`;
    const translationKey = aud.toLowerCase() + '_translation';
    const translation = rec[translationKey];
    const coreConcept = rec.shared_core_concept + (translation ? `\n\n${aud} translation: ${translation}` : '');
    const sets = [];
    sets.push(`  session_title          = ${q(tag + '_st', rec.session_title)}`);
    sets.push(`  theme_title            = ${q(tag + '_tt', rec.weekly_theme)}`);
    sets.push(`  phase                  = ${phaseNum(rec.phase)}`);
    sets.push(`  phase_name             = ${q(tag + '_pn', rec.block_theme)}`);
    sets.push(`  heavy_week_flag        = ${rec.heavy_week ? 'true' : 'false'}`);
    sets.push(`  s5_source_opening_hook = ${q(tag + '_hk', rec.hook)}`);
    sets.push(`  s5_source_core_concept = ${q(tag + '_cc', rec.core_concept_body)}`);
    sets.push(`  core_concept           = ${q(tag + '_cco', coreConcept)}`);
    sets.push(`  teaching_points        = ${q(tag + '_tp', rec.teaching_points)}`);
    if (aud !== 'Child') {
      if (rec.video_url) sets.push(`  video_link             = ${q(tag + '_vl', rec.video_url)}`);
      sets.push(`  video_description      = ${q(tag + '_vd', rec.video_description)}`);
      sets.push(`  todays_theme           = ${q(tag + '_tdt', rec.todays_theme)}`);
      sets.push(`  todays_world_vo_script = ${q(tag + '_tdv', rec.todays_vo)}`);
      sets.push(`  ancient_wisdom_reframe = ${q(tag + '_aw', rec.ancient_reframe)}`);
      sets.push(`  ancient_wisdom_vo_script = ${q(tag + '_awv', rec.ancient_vo)}`);
    } else {
      sets.push(`  ancient_wisdom_reframe = ''`);
      sets.push(`  ancient_wisdom_vo_script = ''`);
      sets.push(`  todays_theme           = ''`);
      sets.push(`  todays_world_vo_script = ''`);
    }
    sets.push(`  signal_metaphor        = ${q(tag + '_sm', rec.signal_metaphor)}`);
    sets.push(`  private_write_prompt   = ${q(tag + '_pw', rec.private_write)}`);
    sets.push(`  experiential_exercise  = ${q(tag + '_ex', rec.exercise)}`);
    sets.push(`  guided_reflection      = ${q(tag + '_gr', rec.guided_reflection)}`);
    sets.push(`  journaling_prompt      = ${q(tag + '_jp', rec.journaling_prompt)}`);
    sets.push(`  intention_prompt       = ${q(tag + '_ip', rec.intention)}`);
    sets.push(`  core_affirmation       = ${q(tag + '_ca', rec.affirmation)}`);
    sets.push(`  weekly_practice_mon    = ${q(tag + '_pm', rec.practices.mon)}`);
    sets.push(`  weekly_practice_wed    = ${q(tag + '_pw2', rec.practices.wed)}`);
    sets.push(`  weekly_practice_fri    = ''`);
    sets.push(`  weekly_practice_sun    = ${q(tag + '_ps', rec.practices.sun)}`);
    sets.push(`  previous_week_callback = ${q(tag + '_pwc', prev[aud])}`);
    sets.push(`  facilitator_notes      = ${q(tag + '_fn', assembleNotes(rec.notes_sections))}`);
    L.push(`UPDATE public.mindcast_live_sessions SET\n${sets.join(',\n')},\n  updated_at = now()\nWHERE week_number = ${w} AND audience = '${aud}';`);
    updates++;
  }
  L.push('');
}

writeFileSync('C:/GitHub/mindcast-inner-work/supabase/migrations/20260823120000_weeks1_39_notion_pull.sql', L.join('\n'), 'utf8');
console.log('updates:', updates, '| bytes:', L.join('\n').length);
