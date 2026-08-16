import jsPDF from "jspdf";
import {
  FONT_BEBAS_REGULAR, FONT_MONTSERRAT_REGULAR, FONT_MONTSERRAT_SEMIBOLD,
  FONT_MONTSERRAT_BOLD, FONT_CORMORANT_ITALIC,
} from "@/lib/worksheetFonts";
import { NAVY_WORDMARK_PNG } from "@/lib/brandAssets";

export type WorksheetSession = {
  week_number: number;
  phase_name?: string;
  theme_title: string;
  session_title?: string;
  audience: string;
  signal_metaphor?: string;
  video_question_1?: string;
  video_question_2?: string;
  journaling_prompt?: string;
  experiential_exercise?: string;
  weekly_practice_mon?: string;
  weekly_practice_wed?: string;
  weekly_practice_sun?: string;
  core_affirmation?: string;
};

// MC-BRD-001 print palette. Ivory is screen-only and never printed as a fill.
const INK: [number, number, number] = [0x10, 0x24, 0x38];
const SIGNAL_BLUE: [number, number, number] = [0x35, 0x85, 0xaf]; // rules + non-text only
const SIGNAL_DEEP: [number, number, number] = [0x30, 0x71, 0x91]; // all coloured text under 24pt
const MIST: [number, number, number] = [0xc5, 0xe3, 0xf3]; // ripple tail only
const RULE: [number, number, number] = [0xc9, 0xd3, 0xde]; // photocopy-safe ruled lines

const PAGE_W = 595.28;
const PAGE_H = 841.89;
const M = 40;
const CW = PAGE_W - M * 2; // 515.28
const FOOTER_H = 24;
const BOTTOM = PAGE_H - M - FOOTER_H;
const WRITING_MIN = 120;
const WRITING_PITCH = 24;

// Opacity on a white page == tint toward white; avoids GState and photocopies
// identically to the intended fade.
const fade = (c: [number, number, number], opacity: number): [number, number, number] => {
  const t = 1 - opacity;
  return [
    Math.round(c[0] + (255 - c[0]) * t),
    Math.round(c[1] + (255 - c[1]) * t),
    Math.round(c[2] + (255 - c[2]) * t),
  ];
};

function registerFonts(doc: jsPDF) {
  doc.addFileToVFS("BebasNeue-Regular.ttf", FONT_BEBAS_REGULAR);
  doc.addFont("BebasNeue-Regular.ttf", "BebasNeue", "normal");
  doc.addFileToVFS("Montserrat-Regular.ttf", FONT_MONTSERRAT_REGULAR);
  doc.addFont("Montserrat-Regular.ttf", "Montserrat", "normal");
  doc.addFileToVFS("Montserrat-SemiBold.ttf", FONT_MONTSERRAT_SEMIBOLD);
  doc.addFont("Montserrat-SemiBold.ttf", "MontserratSemiBold", "normal");
  doc.addFileToVFS("Montserrat-Bold.ttf", FONT_MONTSERRAT_BOLD);
  doc.addFont("Montserrat-Bold.ttf", "MontserratBold", "normal");
  doc.addFileToVFS("CormorantGaramond-Italic.ttf", FONT_CORMORANT_ITALIC);
  doc.addFont("CormorantGaramond-Italic.ttf", "CormorantItalic", "normal");
}

type Ctx = { doc: jsPDF };

function label(ctx: Ctx, text: string, y: number): number {
  const { doc } = ctx;
  doc.setFont("MontserratBold", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...SIGNAL_DEEP);
  doc.setCharSpace(1.6);
  doc.text(text.toUpperCase(), M, y);
  doc.setCharSpace(0);
  return y + 16;
}

function bodyText(
  ctx: Ctx, text: string, y: number,
  opts: { size: number; leading: number; width?: number; x?: number; voice?: boolean; color?: [number, number, number] },
): number {
  const { doc } = ctx;
  const width = opts.width ?? CW;
  doc.setFont(opts.voice ? "CormorantItalic" : "Montserrat", "normal");
  doc.setFontSize(opts.size);
  doc.setTextColor(...(opts.color ?? INK));
  const lines = doc.splitTextToSize(text, width) as string[];
  doc.text(lines, opts.x ?? M, y);
  return y + lines.length * opts.leading;
}

function measure(
  doc: jsPDF, text: string, size: number, width: number, leading: number, voice = false,
): number {
  doc.setFont(voice ? "CormorantItalic" : "Montserrat", "normal");
  doc.setFontSize(size);
  const lines = doc.splitTextToSize(text, width) as string[];
  return lines.length * leading;
}

// The ripple device: filled dot + 16 tapering arc polylines, clipped to a 20pt
// band so the large radii read as near-vertical passing lines. Vector strokes
// only (jsPDF core has no arc primitive; a 24-segment polyline is exact at
// print resolution). Never raster.
function drawRipple(ctx: Ctx, yTop: number) {
  const { doc } = ctx;
  const cy = yTop + 10;
  const cx = M + 5;
  const half = 10;
  doc.setFillColor(...SIGNAL_BLUE);
  doc.circle(cx, cy, 4.2, "F");
  const arcs = 16;
  const steps = 24;
  for (let i = 1; i <= arcs; i++) {
    const r = 4.2 + i * 3.4;
    const weight = 2.4 - (i - 1) * (1.7 / (arcs - 1));
    const opacity = 0.92 - (i - 1) * (0.87 / (arcs - 1));
    const colour = i <= Math.round(arcs * 0.45) ? SIGNAL_BLUE : MIST;
    doc.setDrawColor(...fade(colour, opacity));
    doc.setLineWidth(Math.max(0.7, weight));
    const a = Math.asin(Math.min(1, half / r));
    let px = 0;
    let py = 0;
    for (let sIdx = 0; sIdx <= steps; sIdx++) {
      const t = -a + (2 * a * sIdx) / steps;
      const x = cx + r * Math.cos(t);
      const y = cy + r * Math.sin(t);
      if (sIdx > 0) doc.line(px, py, x, y);
      px = x;
      py = y;
    }
  }
}

function drawLetterhead(ctx: Ctx, s: WorksheetSession) {
  const { doc } = ctx;
  const w = 120;
  const h = (w * 75) / 488;
  doc.addImage(`data:image/png;base64,${NAVY_WORDMARK_PNG}`, "PNG", M, M + 6, w, h);

  // Outlined pills (no fills) — track and week on the right.
  doc.setFont("MontserratSemiBold", "normal");
  doc.setFontSize(7);
  doc.setCharSpace(1.6);
  doc.setLineWidth(0.75);
  doc.setDrawColor(...SIGNAL_BLUE);
  doc.setTextColor(...SIGNAL_DEEP);
  const weekText = `WEEK ${s.week_number}`;
  const trackText = s.audience.toUpperCase();
  const weekW = doc.getTextWidth(weekText) + 14;
  const trackW = doc.getTextWidth(trackText) + 14;
  const y = M + 8;
  doc.rect(PAGE_W - M - weekW, y, weekW, 16, "S");
  doc.text(weekText, PAGE_W - M - weekW / 2, y + 10.5, { align: "center" });
  doc.rect(PAGE_W - M - weekW - 8 - trackW, y, trackW, 16, "S");
  doc.text(trackText, PAGE_W - M - weekW - 8 - trackW / 2, y + 10.5, { align: "center" });
  doc.setCharSpace(0);
  if (s.phase_name) {
    doc.setFont("Montserrat", "normal");
    doc.setFontSize(6.5);
    doc.setCharSpace(1.4);
    doc.text(s.phase_name.toUpperCase(), PAGE_W - M, y + 26, { align: "right" });
    doc.setCharSpace(0);
  }
}

function drawFooter(ctx: Ctx, page: number, pages: number) {
  const { doc } = ctx;
  const y = PAGE_H - M + 4;
  doc.setDrawColor(...RULE);
  doc.setLineWidth(0.5);
  doc.line(M, PAGE_H - M - 8, PAGE_W - M, PAGE_H - M - 8);
  doc.setFont("Montserrat", "normal");
  doc.setFontSize(7);
  doc.setTextColor(...SIGNAL_DEEP);
  doc.text("mindcast.co.nz", M, y + 8);
  doc.setFont("BebasNeue", "normal");
  doc.setFontSize(8);
  doc.setCharSpace(1.6);
  doc.text("NOTICE IT, NAME IT, DO IT", PAGE_W / 2, y + 8, { align: "center" });
  doc.setCharSpace(0);
  doc.setFont("Montserrat", "normal");
  doc.setFontSize(7);
  doc.text(`${page} / ${pages}`, PAGE_W - M, y + 8, { align: "right" });
}

type Layout = {
  flowed: boolean;
  writingSpace: number;
  titleLines: string[];
  subtitleLines: string[];
  quoteLines: string[];
  videoQ1Lines: string[];
  videoQ2Lines: string[];
  promptLines: string[];
  activityLines: string[];
  practiceCols: { day: string; lines: string[] }[];
  h: {
    letterhead: number; ripple: number; title: number; subtitle: number;
    signal: number; video: number; reflection: number; writingLabel: number;
    activity: number; practice: number;
  };
};

function computeLayout(doc: jsPDF, s: WorksheetSession): Layout {
  const titleLines = (doc.splitTextToSize((s.theme_title || "").toUpperCase(), CW) as string[]).slice(0, 3);
  const subtitleLines = s.session_title
    ? (doc.splitTextToSize(s.session_title, CW) as string[]).slice(0, 2)
    : [];
  const quoteLines = s.signal_metaphor
    ? (doc.splitTextToSize(`“${s.signal_metaphor}”`, CW - 16) as string[])
    : [];
  const videoQ1Lines = s.video_question_1
    ? (doc.splitTextToSize(s.video_question_1, CW) as string[])
    : [];
  const videoQ2Lines = s.video_question_2
    ? (doc.splitTextToSize(s.video_question_2, CW) as string[])
    : [];
  const promptLines = s.journaling_prompt
    ? (doc.splitTextToSize(`“${s.journaling_prompt}”`, CW) as string[])
    : [];
  const activityLines = s.experiential_exercise
    ? (doc.splitTextToSize(s.experiential_exercise, CW) as string[])
    : [];

  doc.setFont("Montserrat", "normal");
  doc.setFontSize(8.5);
  const colW = (CW - 24) / 3;
  const practiceCols = ([
    ["MON", s.weekly_practice_mon], ["WED", s.weekly_practice_wed], ["SUN", s.weekly_practice_sun],
  ] as [string, string | undefined][]).map(([day, t]) => ({
    day,
    lines: t ? (doc.splitTextToSize(t, colW - 14) as string[]) : [],
  }));

  const h = {
    letterhead: 54,
    ripple: 20,
    title: titleLines.length * 26 + 4,
    subtitle: subtitleLines.length * 14 + 4,
    signal: quoteLines.length ? 16 + quoteLines.length * 14 + 8 : 0,
    video: (videoQ1Lines.length || videoQ2Lines.length)
      ? 16 + (videoQ1Lines.length * 12 + 60) + (videoQ2Lines.length * 12 + 60)
      : 0,
    reflection: promptLines.length ? 16 + promptLines.length * 13 + 6 : 0,
    writingLabel: 16,
    activity: activityLines.length ? 16 + activityLines.length * 13 + 8 : 0,
    practice: practiceCols.some((c) => c.lines.length)
      ? 16 + Math.max(...practiceCols.map((c) => 12 + c.lines.length * 11)) + 6
      : 0,
  };

  // Inter-block gaps as drawn: after ripple 8, before signal 6, after
  // reflection 4, and 10 between writing space and Activity on a single page.
  const fixedTop =
    h.letterhead + h.ripple + 8 + h.title + h.subtitle + 6 +
    h.signal + h.video + h.reflection + 4 + h.writingLabel;
  const fixedBottom = h.activity + h.practice;
  let writingSpace = BOTTOM - (M + fixedTop) - fixedBottom - 10;
  let flowed = false;
  if (writingSpace < WRITING_MIN) {
    flowed = true;
    writingSpace = WRITING_MIN;
  }
  return { flowed, writingSpace, titleLines, subtitleLines, quoteLines, videoQ1Lines, videoQ2Lines, promptLines, activityLines, practiceCols, h };
}

function drawActivityAndPractice(ctx: Ctx, s: WorksheetSession, L: Layout, y: number): number {
  const { doc } = ctx;
  if (L.activityLines.length) {
    y = label(ctx, "Activity", y);
    y = bodyText(ctx, s.experiential_exercise || "", y, { size: 9.5, leading: 13 }) + 8;
  }
  if (L.practiceCols.some((c) => c.lines.length)) {
    y = label(ctx, "This Week's Practice", y);
    const colW = (CW - 24) / 3;
    L.practiceCols.forEach((col, i) => {
      const x = M + i * (colW + 12);
      doc.setDrawColor(...SIGNAL_BLUE);
      doc.setLineWidth(0.75);
      doc.rect(x, y, 8, 8, "S");
      doc.setFont("MontserratSemiBold", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(...SIGNAL_DEEP);
      doc.setCharSpace(1.4);
      doc.text(col.day, x + 12, y + 7);
      doc.setCharSpace(0);
      doc.setFont("Montserrat", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(...INK);
      doc.text(col.lines, x + 12, y + 20);
    });
    y += 12 + Math.max(...L.practiceCols.map((c) => c.lines.length)) * 11 + 6;
  }
  return y;
}

export function generateWorksheetPdf(s: WorksheetSession): jsPDF {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  registerFonts(doc);

  doc.setProperties({
    title: `Mindcast — Week ${s.week_number} ${s.audience} — ${s.theme_title}`,
    subject: s.phase_name || "",
    author: "Mindcast Limited",
    keywords: `${s.audience} week ${s.week_number}`,
    creator: "Mindcast",
  });

  const L = computeLayout(doc, s);
  const assert = (cond: boolean, msg: string) => {
    if (!cond && import.meta.env.DEV) throw new Error(`worksheet layout: ${msg}`);
  };

  // ── Page 1 ──
  let y = M;
  drawLetterhead({ doc }, s);
  y += L.h.letterhead;
  drawRipple({ doc }, y);
  y += L.h.ripple + 8;

  doc.setFont("BebasNeue", "normal");
  doc.setFontSize(24);
  doc.setTextColor(...INK);
  doc.text(L.titleLines, M, y + 18);
  y += L.h.title;
  if (L.subtitleLines.length) {
    doc.setFont("CormorantItalic", "normal");
    doc.setFontSize(11);
    doc.setTextColor(...SIGNAL_DEEP);
    doc.text(L.subtitleLines, M, y + 8);
    y += L.h.subtitle;
  }
  y += 6;

  if (L.quoteLines.length) {
    y = label({ doc }, "The Signal", y);
    doc.setDrawColor(...SIGNAL_BLUE);
    doc.setLineWidth(2);
    const qH = L.quoteLines.length * 14;
    doc.line(M, y, M, y + qH - 4);
    doc.setFont("CormorantItalic", "normal");
    doc.setFontSize(11);
    doc.setTextColor(...INK);
    doc.text(L.quoteLines, M + 16, y + 4);
    y += qH + 8;
  }

  if (L.videoQ1Lines.length || L.videoQ2Lines.length) {
    y = label({ doc }, "While You Watch", y);
    ([L.videoQ1Lines, L.videoQ2Lines] as string[][]).forEach((q, qi) => {
      if (!q.length) return;
      doc.setFont("MontserratSemiBold", "normal");
      doc.setFontSize(9);
      doc.setTextColor(...INK);
      doc.text(`${qi + 1}.  ${q[0]}`, M, y);
      if (q.length > 1) {
        doc.text(q.slice(1), M + 12, y + 12);
      }
      y += q.length * 12 + 6;
      doc.setDrawColor(...RULE);
      doc.setLineWidth(0.75);
      for (let i = 0; i < 2; i++) {
        y += 24;
        doc.line(M, y, PAGE_W - M, y);
      }
      y += 6;
    });
  }

  if (L.promptLines.length) {
    y = label({ doc }, "Reflection", y);
    doc.setFont("CormorantItalic", "normal");
    doc.setFontSize(10.5);
    doc.setTextColor(...INK);
    doc.text(L.promptLines, M, y + 2);
    y += L.promptLines.length * 13 + 6;
  }
  y += 4;

  y = label({ doc }, "Your Reflection", y);
  const lines = Math.floor((L.writingSpace - 8) / WRITING_PITCH);
  doc.setDrawColor(...RULE);
  doc.setLineWidth(0.75);
  for (let i = 0; i < lines; i++) {
    y += WRITING_PITCH;
    doc.line(M, y, PAGE_W - M, y);
  }
  assert(y <= BOTTOM + 1, "writing space overflows page 1");

  if (!L.flowed) {
    y += 10;
    y = drawActivityAndPractice({ doc }, s, L, y);
    assert(y <= BOTTOM + 1, "single-page content exceeds the page");
  }

  // ── Page 2 (explicit overflow) ──
  if (L.flowed) {
    doc.addPage();
    const y2 = drawActivityAndPractice({ doc }, s, L, M + 8);
    assert(y2 <= BOTTOM + 1, "overflow page exceeds the page");
  }

  const pages = doc.getNumberOfPages();
  for (let p = 1; p <= pages; p++) {
    doc.setPage(p);
    drawFooter({ doc }, p, pages);
  }

  return doc;
}

export function downloadWorksheetPdf(s: WorksheetSession) {
  const doc = generateWorksheetPdf(s);
  const filename = `mindcast-week-${String(s.week_number).padStart(2, "0")}-${s.audience.toLowerCase()}.pdf`;
  doc.save(filename);
}

export async function generateWorksheetPdfBlob(s: WorksheetSession): Promise<Blob> {
  const doc = generateWorksheetPdf(s);
  return doc.output("blob");
}

export async function generateWorksheetPdfDataUri(s: WorksheetSession): Promise<string> {
  const doc = generateWorksheetPdf(s);
  return doc.output("datauristring");
}
