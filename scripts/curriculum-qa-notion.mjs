#!/usr/bin/env node
/**
 * curriculum-qa-notion.mjs — Mindcast 52-week curriculum QA against LIVE
 * Notion (source of truth). Self-contained: fetches all 156 lesson pages
 * (52 weeks x Adult/Teen/Child) via the Notion API and runs the full QA
 * rule set from the Curriculum Lesson Specification & Verification Pass.
 *
 *   NOTION_API_KEY=... node scripts/curriculum-qa-notion.mjs [--out proposals/curriculum-qa-results.json]
 *
 * Requires the Notion database-query endpoint (workspace usage cap applies).
 * Checks: section architecture vs the canonical Weeks 40-52 backbone, shared
 * core concept word-for-word parity, callback schema + SUN derivation,
 * practice-day validation (exactly MON/WED/SUN; wk52 none), fidelity tags
 * (OPEN retired), child Story terminology + subheadings, facilitator-note
 * structure, whole-page editorial-contamination scan, banned-claim and
 * forbidden-vocab scans with refusal-context filtering, intervention-strength
 * overclaim scan, safety heuristics, and report-only video status.
 */

import { readFileSync, writeFileSync } from 'node:fs';

// ── env ────────────────────────────────────────────────────────────────────
try {
  for (const line of readFileSync(new URL('../.env', import.meta.url), 'utf8').split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
} catch { /* no .env is fine if NOTION_API_KEY is in the environment */ }
const KEY = process.env.NOTION_API_KEY;
if (!KEY) { console.error('NOTION_API_KEY missing (env or .env)'); process.exit(1); }

const DBS = {
  Adult: '3c00d85f-784c-81a1-82d6-000bbb8ab5f0',
  Teen: '3c00d85f-784c-81ac-af08-000bc747cc8f',
  Child: '3c00d85f-784c-8115-a7ff-000b576223a4',
};

async function notion(path, init = {}) {
  const res = await fetch(`https://api.notion.com/v1/${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${KEY}`, 'Notion-Version': '2022-06-28', 'Content-Type': 'application/json', ...(init.headers || {}) },
  });
  if (res.status === 429) { await new Promise(r => setTimeout(r, 1500)); return notion(path, init); }
  if (!res.ok) throw new Error(`Notion ${path}: ${res.status} ${await res.text()}`);
  return res.json();
}

// ── fetch ──────────────────────────────────────────────────────────────────
async function children(blockId) {
  const out = [];
  let cursor;
  do {
    const j = await notion(`blocks/${blockId}/children?page_size=100${cursor ? '&start_cursor=' + cursor : ''}`);
    out.push(...j.results);
    cursor = j.has_more ? j.next_cursor : null;
  } while (cursor);
  for (const b of out) if (b.has_children && !['child_page', 'child_database'].includes(b.type)) b.children = await children(b.id);
  return out;
}
async function fetchAll() {
  const out = {};
  for (const [track, id] of Object.entries(DBS)) {
    const pages = [];
    let cursor;
    do {
      const q = await notion(`databases/${id}/query`, { method: 'POST', body: JSON.stringify({ page_size: 100, ...(cursor ? { start_cursor: cursor } : {}) }) });
      pages.push(...q.results);
      cursor = q.has_more ? q.next_cursor : null;
    } while (cursor);
    const wanted = pages.filter(p => (p.properties.Week?.number ?? 0) >= 1 && (p.properties.Week?.number ?? 0) <= 52)
      .sort((a, b) => a.properties.Week.number - b.properties.Week.number);
    if (wanted.length !== 52) throw new Error(`${track}: expected 52 pages, got ${wanted.length}`);
    out[track] = [];
    for (const p of wanted) {
      out[track].push({
        id: p.id,
        week: p.properties.Week.number,
        title: (p.properties.title?.title || []).map(t => t.plain_text).join(''),
        week_type: p.properties['Week type']?.select?.name || '',
        heavy_week: !!p.properties['Heavy week']?.checkbox,
        callback_line: (p.properties['Callback line']?.rich_text || []).map(t => t.plain_text).join(''),
        blocks: await children(p.id),
      });
      process.stderr.write('.');
    }
    process.stderr.write(` ${track} done\n`);
  }
  return out;
}

// ── QA engine ──────────────────────────────────────────────────────────────
const STOP = new Set('the a an and or of to in on is are was were be been being that this these those it its for with as at by from not no but if then so what who how why when where you your yours i me my we our us they them their he she his her one two into about over under out up down more most some any all can could would should will just like get got make made take took go going day week thing things time times new own very really actually today'.split(' '));
const words = (s) => (s || '').toLowerCase().replace(/[^a-z0-9\s\-\/]/g, ' ').split(/\s+/).filter(w => w.length > 3 && !STOP.has(w));

function flatten(page) {
  const headings = [];
  const texts = [];
  let h2 = '', h3 = '';
  const parseTag = (raw) => {
    const m = raw.match(/^(.*?)\s*—\s*(VERBATIM|STRUCTURED|OPEN)\s*$/);
    return m ? { name: m[1].trim(), tag: m[2] } : { name: raw.trim(), tag: null };
  };
  const walk = (list) => {
    for (const b of list) {
      const txt = ((b[b.type]?.rich_text || []).map(r => r.plain_text).join('')).trim();
      if (b.type === 'heading_2') { const p = parseTag(txt); h2 = p.name; h3 = ''; headings.push({ level: 2, name: h2, tag: p.tag, raw: txt }); continue; }
      if (b.type === 'heading_3') { const p = parseTag(txt); h3 = p.name; headings.push({ level: 3, name: h3, tag: p.tag, raw: txt, parent: h2 }); continue; }
      if (txt && b.type !== 'divider') texts.push({ h2, h3, txt });
      if (b.children) walk(b.children);
    }
  };
  walk(page.blocks);
  return { headings, texts };
}
function callout(page) {
  const cal = page.blocks.find(b => b.type === 'callout');
  if (!cal) return { header: '', weekly_theme: null, shared: null, adult: null, teen: null, child: null };
  const lines = [];
  lines.push(...((cal.callout?.rich_text || []).map(r => r.plain_text).join('')).split('\n').map(s => s.trim()).filter(Boolean));
  for (const c of cal.children || []) lines.push(...((c[c.type]?.rich_text || []).map(r => r.plain_text).join('')).split('\n').map(s => s.trim()).filter(Boolean));
  const get = (pfx) => { const l = lines.find(l => l.startsWith(pfx)); return l ? l.slice(pfx.length).trim() : null; };
  return { header: lines[0] || '', weekly_theme: get('Weekly theme:'), shared: get('Shared core concept:'), adult: get('Adult translation:'), teen: get('Teen translation:'), child: get('Child translation:') };
}

const REFUSAL = /(do not claim|we do not teach|we do not use|we do not tell|we do not encourage|we do not require|we do not say|we do not call|never claim|never (say|call|label)|not a recognised|failed replication|does not hold|never been located|no study|no research|no such|is not a finding|not a research finding|does not come from a study|not supported|contested|myth|misattributed|incorrect to say|don'?t claim|do not say|do not call|banned|retired|debunked|not neuroscience|we reject|reject unsupported|the lesson rejects|no ceremony|no candles|not about keeping|does not mean keeping|never encourage|do not encourage|do not confuse|not the same as|avoid saying|avoid(ing)?|do not present|is not an instruction|we deliberately|refusal|rejects?|rather than|slogans|nobody is required|no one is required|not required to|do(es)? not have to|don'?t have to)/i;

const CLAIMS = [
  ['21-day habit rule', /21[-\s]day (habit|rule)|twenty[-\s]one day/i],
  ['learning styles', /learning styles/i],
  ['left/right brain', /left[-\s\/ ]?right brain|right-brain|left-brain/i],
  ['Mehrabian 7-38-55', /mehrabian|7-38-55/i],
  ['power posing', /power pos/i],
  ['ego depletion', /ego deplet/i],
  ['decision fatigue as settled', /decision fatigue/i],
  ['marshmallow test', /marshmallow test/i],
  ['10% of brain', /10 ?% of (your |the )?brain/i],
  ['triune brain', /triune|reptilian brain/i],
  ['dopamine detox', /dopamine (detox|fast)/i],
  ['10,000 hours', /10,?000 hours/i],
  ['average of five people', /average of the five|average of five people|five people you spend/i],
  ['law of attraction', /law of attraction/i],
  ['manifestation mechanism', /manifest(ing|ation)/i],
  ['abundance mechanism', /abundance (mindset|thinking|attracts|belief)/i],
  ['vibration/frequency', /raise your vibration|high[- ]vibration|vibrational|energy frequency/i],
  ['amygdala hijack as fact', /amygdala hijack/i],
  ['mirror neurons transmit', /mirror neurons? (transmit|copy|mean you)/i],
  ['brain waste', /clears? (brain )?waste|brain waste/i],
  ['rewiring', /rewir(e|ing|ed)/i],
  ['awareness is structural', /awareness is (literally )?structural/i],
  ['Duhigg cited as researcher', /duhigg'?s (research|study|findings)/i],
  ['Clear cited as researcher', /james clear'?s (research|study|findings)|clear'?s atomic habits research/i],
  ['Kessler cited as researcher', /kessler'?s (research|study|findings)/i],
  ['Walker cited as researcher', /matthew walker'?s (research|study|findings)|walker'?s research/i],
  ['Pang credential claim', /pang.{0,40}neuroscientist/i],
];
const VOCAB = [
  ['journey (product noun)', /\b(your|the|this|a) (personal development |inner |healing )?journey\b|\bhero'?s journey\b/i],
  ['ceremony/ritual language', /\bceremon(y|ial)\b|\britual(s)?\b/i],
  ['tribe', /\btribe\b/i],
  ['transformation outcome', /transform(ation|ed|ing)? (your|their)? ?life|guaranteed transformation/i],
  ['hidden true self pressure', /\b(hidden|discover(ing)? your) (true|real|authentic) self\b/i],
  ['programme dependence', /you need mindcast|can'?t do this without (mindcast|us|the programme)/i],
  ['forbidden marketing vocab', /\b(click here|subscribe|unlock|limited time|don'?t miss out|high[- ]vibe|sacred)\b/i],
];
const OVERCLAIMS = [
  ['unequivocal evidence claim', /research.{0,60}unequivocal|is unequivocal/i],
  ['exercise = antidepressants', /as effective as antidepressants/i],
  ['single highest-leverage intervention', /single highest-leverage|highest-leverage physiological intervention/i],
  ['microbiome mood claim', /microbiome.{0,120}(mood|anxiety)|(mood|anxiety).{0,80}microbiome/i],
  ['breathing works immediately', /breath\w*.{0,80}works immediately|works immediately.{0,40}breath/i],
  ['direct ANS modulation', /directly modulat\w* the autonomic/i],
];
const EDITORIAL_MARKERS = ['Reason:', '--- Part', 'Block status', 'Complete: Weeks', 'Next block:', 'Carried forward:', 'Escalated', 'Everything else unchanged.', 'Correction in §', 'Read §', 'Signal Metaphor rewrites', 'Evidence-backed facilitator notes'];

function safetyScan(week, track, page, texts, add) {
  for (const t of texts) {
    if (t.h2 === 'Video') continue;
    const s = t.txt;
    const refusal = REFUSAL.test(s);
    if (/close your eyes/i.test(s) && /(hurt|wound|loss|pain|grief|remember when|bring to mind)/i.test(s) && !/don'?t have to close|if that'?s comfortable|you can keep your eyes|eyes open|keep your eyes open/i.test(s)) {
      add(week, track, 'G-safety', t.h2 + '/' + t.h3, s, 'No eyes-closed facilitator-narrated recall of personal distress', 'Rewrite as eyes-open written reflection', page);
    }
    if (!refusal && /(keep|hide) (it|this|things|secrets?) from (your )?(parents|caregivers|family|wh[aā]nau|trusted adults)/i.test(s) && !/not about|never|does not mean|no one is asking/i.test(s)) {
      add(week, track, 'G-safety', t.h2 + '/' + t.h3, s, 'No encouraging secrecy from caregivers', 'Remove or reframe', page);
    }
    if (!refusal && /\b(candles?|incense|darkened room|witnessed silence|hand[- ]on[- ]heart|circle[- ]and[- ]symbol|release statement|threshold ritual)\b/i.test(s) && !/\b(no|without|never|don'?t|not)\b/i.test(s)) {
      add(week, track, 'G-safety', t.h2 + '/' + t.h3, s, 'No ceremonial staging', 'Remove staging language', page);
    }
    if (!refusal && /(you must share|everyone must share|they must share)/i.test(s)) {
      add(week, track, 'G-safety', t.h2 + '/' + t.h3, s, 'No forced disclosure; costless opt-out required', 'Add opt-out', page);
    }
    if (!refusal && /(this (session|programme) will (treat|cure)|as your (therapist|counsellor)|we diagnose)/i.test(s)) {
      add(week, track, 'G-safety', t.h2 + '/' + t.h3, s, 'No therapeutic/clinical role claims', 'Reframe; referral is success', page);
    }
  }
}
function claimScan(week, track, page, texts, add) {
  for (const t of texts) {
    if (t.h2 === 'Video') continue;
    const refusalSection = /deliberately do not claim|source trail/i.test(t.h3 || '');
    for (const [name, re] of CLAIMS) {
      const m = t.txt.match(re);
      if (!m) continue;
      const ctx = t.txt.slice(Math.max(0, m.index - 90), m.index + 130);
      if (refusalSection || REFUSAL.test(ctx)) continue;
      add(week, track, 'H-evidence', t.h2 + '/' + t.h3, ctx, 'Banned/unsupported claim: ' + name, 'Remove or move into do-not-claim with explicit rejection', page);
    }
    for (const [name, re] of VOCAB) {
      const m = t.txt.match(re);
      if (!m) continue;
      const ctx = t.txt.slice(Math.max(0, m.index - 90), m.index + 130);
      if (refusalSection || REFUSAL.test(ctx)) continue;
      if (name === 'ceremony/ritual language' && /\b(no|without|never|don'?t|not)\b/i.test(ctx)) continue;
      add(week, track, 'I-vocab', t.h2 + '/' + t.h3, ctx, 'Forbidden/retired language: ' + name, 'Reword per MC-BRD-002', page);
    }
    for (const [name, re] of OVERCLAIMS) {
      const m = t.txt.match(re);
      if (!m) continue;
      if (refusalSection) continue;
      const ctx = t.txt.slice(Math.max(0, m.index - 90), m.index + 150);
      if (REFUSAL.test(ctx)) continue;
      add(week, track, 'H-overclaim', t.h2 + '/' + t.h3, ctx, 'Overclaim: ' + name, 'Soften to the strength the evidence notes already state', page);
    }
  }
}

async function main() {
  console.error('Fetching 156 pages from live Notion...');
  const d = await fetchAll();

  const defects = [];
  const videoReport = [];
  const add = (week, track, check, section, current, rule, fix, page) => defects.push({ week, track, check, section, current: (current || '').slice(0, 280), rule, fix, id: page?.id || '', title: page?.title || '' });
  const addV = (week, track, section, current, page) => videoReport.push({ week, track, section, current: (current || '').slice(0, 280), id: page?.id || '', title: page?.title || '' });

  const flat = {};
  for (const track of ['Adult', 'Teen', 'Child']) {
    flat[track] = {};
    for (const p of d[track]) flat[track][p.week] = { page: p, ...flatten(p), callout: callout(p) };
  }

  // canonical backbones from weeks 40-52 (majority H2 sequence per track)
  const canonical = {};
  for (const track of ['Adult', 'Teen', 'Child']) {
    const seqs = {};
    for (const p of d[track].filter(x => x.week >= 40)) {
      const seq = flat[track][p.week].headings.filter(h => h.level === 2).map(h => h.name).join(' > ');
      (seqs[seq] ||= []).push(p.week);
    }
    canonical[track] = Object.entries(seqs).sort((a, b) => b[1].length - a[1].length)[0][0].split(' > ');
  }
  const childSpecSeq = Object.entries((() => {
    const seqs = {};
    for (const p of d.Child.filter(x => x.week >= 40)) {
      const seq = flat.Child[p.week].headings.filter(h => h.level === 2).map(h => h.name).join(' > ');
      (seqs[seq] ||= []).push(p.week);
    }
    return seqs;
  })()).find(([k]) => k.includes('Story'))?.[0].split(' > ') || canonical.Child;

  const REQUIRED_NOTES = ['Aim', 'Run the room', 'Why this week exists — the evidence', 'Evidence quality', 'We deliberately do not claim', 'Source trail'];
  const CHILD_STORY_SUBS = ['Book', 'Why this book', 'Ask the children', 'Aotearoa alternative', 'Alternative note', 'Read-aloud video (optional)'];

  const callbackReport = [], coreConceptReport = [], tagReport = [], childTermReport = [], notesReport = [], orderReport = [];

  for (let w = 1; w <= 52; w++) {
    const cc = { Adult: flat.Adult[w].callout.shared, Teen: flat.Teen[w].callout.shared, Child: flat.Child[w].callout.shared };
    const vals = Object.values(cc).map(v => (v || '').trim());
    if (new Set(vals).size > 1 || vals.some(v => !v)) {
      coreConceptReport.push({ week: w, adult: cc.Adult, teen: cc.Teen, child: cc.Child, missing: Object.entries(cc).filter(([k, v]) => !v).map(([k]) => k) });
    }
    for (const track of ['Adult', 'Teen', 'Child']) {
      const F = flat[track][w]; const p = F.page;
      const seq = F.headings.filter(h => h.level === 2).map(h => h.name);
      const canon = track === 'Child' ? childSpecSeq : canonical[track];
      const missing = canon.filter(s => !seq.includes(s));
      const extra = seq.filter(s => !canon.includes(s));
      const common = canon.filter(s => seq.includes(s));
      const idxs = common.map(s => seq.indexOf(s));
      const reordered = idxs.some((v, i) => i > 0 && v < idxs[i - 1]);
      if (missing.length || extra.length || reordered) orderReport.push({ week: w, track, missing, extra, reordered, id: p.id, title: p.title });

      // callbacks
      const cb = (p.callback_line || '').trim();
      const sun = (F.texts.find(t => t.h2 === 'Weekly practice' && /^- SUN —/.test(t.txt))?.txt || '').replace(/^- SUN — /, '');
      const rec = { week: w, track, callback: cb, len: cb.length, issues: [], sun: sun.slice(0, 140) };
      if (w === 52) { if (cb) rec.issues.push('wk52 must have no callback'); }
      else if (!cb) rec.issues.push('missing callback');
      else {
        if (/^[A-Z]/.test(cb)) rec.issues.push('starts uppercase');
        if (/\.$/.test(cb)) rec.issues.push('ends with full stop');
        if (track !== 'Child' && /^you\b/i.test(cb)) rec.issues.push('starts with "you"');
        if (cb.length > 180) rec.issues.push('excessive length (>180)');
        else if (cb.length > 140) rec.issues.push('soft-over-140');
        const ow = new Set(words(cb)); const sw = words(sun);
        if (sun && sw.filter(x => ow.has(x)).length < 2) rec.issues.push('weak derivation from SUN practice');
      }
      callbackReport.push(rec);

      // practice days: exactly MON/WED/SUN (wk52 none)
      const practiceDays = F.texts.filter(t => t.h2 === 'Weekly practice').map(t => {
        const m = t.txt.match(/^[-\s]*([A-Z]{3}) —/);
        return m ? m[1] : null;
      }).filter(Boolean);
      const badDays = practiceDays.filter(dv => !['MON', 'WED', 'SUN'].includes(dv));
      if (badDays.length) add(w, track, 'A-structure', 'Weekly practice', 'practice days: ' + practiceDays.join('/'), 'Exactly MON/WED/SUN only (FRI merges into WED; never SUN)', 'Merge non-canonical day lines into WED', p);
      if (w === 52 && practiceDays.length) add(w, track, 'A-structure', 'Weekly practice', 'Week 52 carries practice items', 'Week 52 keeps no ongoing practice', 'Remove practice items', p);

      // fidelity tags
      for (const h of F.headings) if (/—\s*OPEN\s*$/.test(h.raw)) tagReport.push({ week: w, track, heading: h.raw, id: p.id, title: p.title });

      // child terminology
      if (track === 'Child') {
        for (const h of F.headings) if (h.level === 2 && /^picture book$/i.test(h.name)) childTermReport.push({ week: w, issue: 'retired "## Picture book" heading (canonical: ## Story)', id: p.id, title: p.title });
        if (seq.includes('Story')) {
          const storySubs = F.headings.filter(h => h.level === 3 && h.parent === 'Story').map(h => h.name);
          const miss = CHILD_STORY_SUBS.filter(s => !storySubs.includes(s));
          if (miss.length) childTermReport.push({ week: w, issue: 'Story missing subheadings: ' + miss.join(', '), id: p.id, title: p.title });
        }
      }

      // facilitator notes structure
      const noteSubs = F.headings.filter(h => h.level === 3 && h.parent === 'Facilitator notes').map(h => h.name);
      const fn = { week: w, track, missing: [], flags: [], id: p.id, title: p.title };
      if (F.headings.some(h => h.level === 2 && h.name === 'Facilitator notes')) {
        fn.missing = REQUIRED_NOTES.filter(r => !noteSubs.includes(r));
        if (noteSubs.includes('Prep')) fn.flags.push('flattened "Prep" blob');
      } else fn.flags.push('no Facilitator notes section');
      if (fn.missing.length || fn.flags.length) notesReport.push(fn);

      // whole-page editorial contamination scan
      for (const t of F.texts) {
        for (const marker of EDITORIAL_MARKERS) {
          if (t.txt.includes(marker)) {
            add(w, track, 'F-notes', t.h2 + '/' + t.h3, t.txt.slice(0, 200), 'Editorial/review-document leakage in live lesson', 'Remove the editorial text', p);
            break;
          }
        }
      }

      // callout format
      if (!F.callout.shared) add(w, track, 'B-core', 'Callout', F.callout.header || '(no callout text)', 'Callout must carry "Shared core concept:" line', 'Add the shared line (word-for-word across tracks)', p);

      safetyScan(w, track, p, F.texts, add);
      claimScan(w, track, p, F.texts, add);

      // title vocab scan
      for (const [name, re] of VOCAB) {
        const m = (p.title || '').match(re);
        if (m && !REFUSAL.test(p.title)) add(w, track, 'I-vocab', 'Page title', p.title, 'Forbidden/retired language in title: ' + name, 'Retitle (human decision)', p);
      }

      // video report-only
      const vid = F.texts.find(t => t.h2 === 'Video' && /^Video: /.test(t.txt));
      const desc = F.texts.filter(t => t.h2 === 'Video' && t.h3 === 'Description').map(t => t.txt).join(' ');
      if (/TO BE REPLACED|requires review|Current assignment|STATUS: OPEN-LICENCE SEARCH BRIEF/i.test(desc) || /belongs to Week \d+/i.test(desc)) addV(w, track, 'Video/Description', desc, p);
      if (vid && /No licensed URL selected/i.test(vid.txt)) addV(w, track, 'Video', 'No licensed URL selected', p);
    }
  }

  const out = { runAt: new Date().toISOString(), canonical, childSpecSeq, coreConceptReport, callbackReport, tagReport, childTermReport, notesReport, orderReport, defects, videoReport };
  const outPath = process.argv.find(a => a.startsWith('--out='))?.split('=')[1] || 'proposals/curriculum-qa-results.json';
  writeFileSync(outPath, JSON.stringify(out, null, 1));
  console.log('QA complete. Results: ' + outPath);
  console.log('core concept issues:', coreConceptReport.length);
  console.log('callback issues:', callbackReport.filter(r => r.issues.length).length);
  console.log('OPEN tags:', tagReport.length);
  console.log('child terminology:', childTermReport.length);
  console.log('notes issues:', notesReport.length);
  console.log('order deviations:', orderReport.length);
  console.log('defects G/H/I:', defects.length);
  const byCheck = {};
  for (const x of defects) byCheck[x.check + '|' + x.rule.split('—')[0].trim()] = (byCheck[x.check + '|' + x.rule.split('—')[0].trim()] || 0) + 1;
  Object.entries(byCheck).sort((a, b) => b[1] - a[1]).slice(0, 20).forEach(([k, v]) => console.log('  ' + v + 'x ' + k));
  console.log('video report-only:', videoReport.length);
}

main().catch(e => { console.error(e.message ?? e); process.exit(1); });
