import jsPDF from "jspdf";
import { PRACTICE_SLOTS, practiceText } from "./practiceCadence";
import {
  FONT_BEBAS_REGULAR,
  FONT_MONTSERRAT_REGULAR,
  FONT_MONTSERRAT_SEMIBOLD,
  FONT_MONTSERRAT_BOLD,
  FONT_CORMORANT_ITALIC,
} from "@/lib/worksheetFonts";
import { NAVY_WORDMARK_PNG } from "@/lib/brandAssets";

export type WorksheetSession = {
  week_number: number;
  phase_name?: string;
  theme_title: string;
  session_title?: string;
  audience: string;
  opening_hook?: string;
  opening_question?: string;
  signal_metaphor?: string;
  kids_signal_metaphor?: string;
  video_question_1?: string;
  video_question_2?: string;
  kids_picture_book_question?: string;
  thought_provoking_question?: string;
  experiential_exercise?: string;
  workbook_activity?: string;
  private_write_prompt?: string;
  journaling_prompt?: string;
  intention_prompt?: string;
  activity_type?: string;
  activity_options?: string[] | string;
  practice_sun_today?: string;
  practice_midweek?: string;
  practice_fri?: string;
  weekly_practice_mon?: string;
  weekly_practice_wed?: string;
  weekly_practice_sun?: string;
  weekly_practice_fri?: string;
};

export type WorksheetPageKey = "worksheet";

/**
 * A weekly worksheet is deliberately one sheet for every track. The live deck
 * remains 8 / 8 / 9 slides; the paper no longer mirrors one page per slide.
 */
export const worksheetPageKeysForTrack = (_audience: string): readonly WorksheetPageKey[] => ["worksheet"];

// Print palette: navy text, grey rules and one small Signal Blue mark. There
// are no tinted panels or full-bleed fills, keeping printing economical. These
// names are also read by curriculum-workbook.test.
const INK: [number, number, number] = [0x10, 0x24, 0x38];
const SIGNAL_BLUE: [number, number, number] = [0x35, 0x85, 0xaf];
const SIGNAL_DEEP: [number, number, number] = [0x2b, 0x70, 0x91];
const RULE: [number, number, number] = [0xc4, 0xd4, 0xdc];
const MUTED: [number, number, number] = [0x5c, 0x6b, 0x77];

const PAGE_W = 595.28;
const LEFT = 50;
const RIGHT = PAGE_W - LEFT;
const CONTENT_W = RIGHT - LEFT;
const WRITING_PITCH = 24;
const FOOTER_RULE_Y = 792;

type FontName = "BebasNeue" | "Montserrat" | "MontserratSemiBold" | "MontserratBold" | "CormorantItalic";
type SurfaceKind = "lines" | "tchart" | "drawing" | "scale" | "choice" | "wordcloud";

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

const clean = (value: string | null | undefined): string => (value || "")
  .replace(/[\u2012-\u2015]/g, "-")
  .replace(/\u00a0/g, " ")
  .replace(/\s+/g, " ")
  .trim();

function firstOf(...values: Array<string | null | undefined>): string {
  return values.map(clean).find(Boolean) || "";
}

function excerpt(value: string | null | undefined, max: number): string {
  const text = clean(value);
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  return `${cut.slice(0, Math.max(0, cut.lastIndexOf(" ")))}...`;
}

function setTextStyle(
  doc: jsPDF,
  font: FontName,
  size: number,
  colour: [number, number, number] = INK,
) {
  doc.setFont(font, "normal");
  doc.setFontSize(size);
  doc.setTextColor(...colour);
}

function wrapped(doc: jsPDF, text: string, width: number, size: number, font: FontName): string[] {
  setTextStyle(doc, font, size);
  return doc.splitTextToSize(clean(text), width) as string[];
}

function drawFitText(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  width: number,
  maxHeight: number,
  options: {
    maxSize?: number;
    minSize?: number;
    font?: FontName;
    colour?: [number, number, number];
    align?: "left" | "center" | "right";
  } = {},
) {
  const font = options.font ?? "Montserrat";
  const minSize = options.minSize ?? 6.4;
  let size = options.maxSize ?? 8.4;
  let leading = size * 1.25;
  let lines = wrapped(doc, text, width, size, font);
  while (size > minSize && lines.length * leading > maxHeight) {
    size -= 0.3;
    leading = size * 1.25;
    lines = wrapped(doc, text, width, size, font);
  }
  const maxLines = Math.max(1, Math.floor(maxHeight / leading));
  if (lines.length > maxLines) {
    lines = lines.slice(0, maxLines);
    const last = lines[maxLines - 1].replace(/[.\s]+$/, "");
    lines[maxLines - 1] = `${last}...`;
  }
  setTextStyle(doc, font, size, options.colour ?? INK);
  doc.text(lines, options.align === "center" ? x + width / 2 : x, y, {
    align: options.align ?? "left",
    lineHeightFactor: 1.25,
  });
}

function sectionLabel(doc: jsPDF, text: string, y: number, detail?: string) {
  setTextStyle(doc, "MontserratBold", 7.2, INK);
  doc.setCharSpace(0.45);
  doc.text(text.toUpperCase(), LEFT, y);
  doc.setCharSpace(0);
  if (detail) {
    setTextStyle(doc, "MontserratSemiBold", 5.8, MUTED);
    doc.text(detail.toUpperCase(), RIGHT, y, { align: "right" });
  }
}

function drawRule(doc: jsPDF, y: number, x1 = LEFT, x2 = RIGHT) {
  doc.setDrawColor(...RULE);
  doc.setLineWidth(0.45);
  doc.line(x1, y, x2, y);
}

function drawOutlineBox(doc: jsPDF, x: number, y: number, width: number, height: number, radius = 5) {
  doc.setDrawColor(...RULE);
  doc.setLineWidth(0.55);
  doc.roundedRect(x, y, width, height, radius, radius, "S");
}

/** Transparent signal mark inspired by the supplied wave-to-microphone icon. */
function drawSignalMark(doc: jsPDF, x: number, y: number) {
  doc.setFillColor(...SIGNAL_BLUE);
  doc.circle(x + 4, y, 3.5, "F");
  for (let i = 0; i < 9; i++) {
    doc.setDrawColor(...(i < 6 ? SIGNAL_BLUE : RULE));
    doc.setLineWidth(Math.max(0.65, 1.45 - i * 0.08));
    const xx = x + 14 + i * 5.1;
    const half = 8 - i * 0.55;
    doc.line(xx, y - half, xx + 2.5, y + half);
  }
  doc.setFillColor(...RULE);
  for (let i = 0; i < 5; i++) doc.circle(x + 61 + i * 4.2, y + (i % 2 ? 2 : -1), 0.85, "F");
  const mx = x + 88;
  doc.setDrawColor(...SIGNAL_BLUE);
  doc.setLineWidth(1.05);
  doc.roundedRect(mx, y - 7, 7, 12, 3.5, 3.5, "S");
  doc.line(mx - 2, y, mx - 2, y + 1.5);
  doc.line(mx - 2, y + 1.5, mx + 1, y + 5.5);
  doc.line(mx + 1, y + 5.5, mx + 6, y + 5.5);
  doc.line(mx + 6, y + 5.5, mx + 9, y + 1.5);
  doc.line(mx + 9, y + 1.5, mx + 9, y);
  doc.line(mx + 3.5, y + 5.5, mx + 3.5, y + 10);
  doc.line(mx, y + 10, mx + 7, y + 10);
}

function drawHeader(doc: jsPDF, session: WorksheetSession) {
  const logoW = 107;
  doc.addImage(`data:image/png;base64,${NAVY_WORDMARK_PNG}`, "PNG", LEFT, 39, logoW, (logoW * 75) / 488);

  const badges = [session.audience.toUpperCase(), `WEEK ${session.week_number}`];
  let bx = RIGHT;
  for (let i = badges.length - 1; i >= 0; i--) {
    const label = badges[i];
    setTextStyle(doc, "MontserratBold", 6.1, i === 1 ? SIGNAL_DEEP : INK);
    const width = Math.max(45, doc.getTextWidth(label) + 15);
    bx -= width;
    doc.setDrawColor(...(i === 1 ? SIGNAL_DEEP : RULE));
    doc.setLineWidth(0.55);
    doc.rect(bx, 40, width, 16, "S");
    doc.text(label, bx + width / 2, 50.5, { align: "center" });
    bx -= 6;
  }
  if (session.phase_name) {
    setTextStyle(doc, "MontserratSemiBold", 5.7, MUTED);
    doc.setCharSpace(0.55);
    doc.text(session.phase_name.toUpperCase(), RIGHT, 68, { align: "right" });
    doc.setCharSpace(0);
  }

  drawSignalMark(doc, LEFT, 83);
  setTextStyle(doc, "BebasNeue", 22, INK);
  const title = clean(session.theme_title || `Week ${session.week_number}`).toUpperCase();
  const titleLines = (doc.splitTextToSize(title, CONTENT_W - 5) as string[]).slice(0, 2);
  doc.text(titleLines, LEFT, 112, { lineHeightFactor: 0.88 });
  const subtitleY = 112 + titleLines.length * 19;
  const subtitle = clean(session.session_title);
  if (subtitle && subtitle.toLowerCase() !== clean(session.theme_title).toLowerCase()) {
    setTextStyle(doc, "CormorantItalic", 8.7, INK);
    doc.text((doc.splitTextToSize(subtitle, CONTENT_W) as string[]).slice(0, 1), LEFT, subtitleY + 1);
  }
}

function drawRuledArea(doc: jsPDF, x: number, y: number, width: number, height: number) {
  drawOutlineBox(doc, x, y, width, height);
  for (let lineY = y + WRITING_PITCH; lineY < y + height - 7; lineY += WRITING_PITCH) {
    drawRule(doc, lineY, x + 10, x + width - 10);
  }
}

function activityOptions(session: WorksheetSession): string[] {
  const raw = session.activity_options;
  if (Array.isArray(raw)) return raw.map(clean).filter(Boolean).slice(0, 6);
  return (raw || "")
    .split(/\s*\|\s*|\s*;\s*|\n+/)
    .map(clean)
    .filter(Boolean)
    .slice(0, 6);
}

function activitySurface(session: WorksheetSession, text: string): SurfaceKind {
  const mode = clean(session.activity_type).toLowerCase();
  const content = clean(text).toLowerCase();
  if (/t[ -]?chart|two columns|visible tasks|invisible load|pros? and cons?|this \/ that/.test(content)) return "tchart";
  if (mode === "scale" || /(?:mark|rate|circle)\s+(?:yourself\s+)?(?:from\s+)?1\s*(?:-|to)\s*10/.test(content)) return "scale";
  if (mode === "choice" && activityOptions(session).length > 0) return "choice";
  if (mode === "wordcloud") return "wordcloud";
  if (mode === "whiteboard" || session.audience.toLowerCase() === "child" || /draw|sketch|illustrat|body outline|diagram|map\s+one/.test(content)) return "drawing";
  return "lines";
}

function tChartLabels(text: string): [string, string] {
  const quotes = [...clean(text).matchAll(/["“]([^"”]{2,32})["”]/g)].map((match) => clean(match[1]));
  if (quotes.length >= 2) return [quotes[0], quotes[1]];
  return ["WHAT I NOTICE", "WHAT I MIGHT TRY"];
}

function drawActivityArea(doc: jsPDF, session: WorksheetSession, text: string, y: number, height: number) {
  const kind = activitySurface(session, text);
  drawOutlineBox(doc, LEFT, y, CONTENT_W, height);

  if (kind === "tchart") {
    const [leftLabel, rightLabel] = tChartLabels(text);
    doc.setDrawColor(...RULE);
    doc.line(LEFT + CONTENT_W / 2, y + 8, LEFT + CONTENT_W / 2, y + height - 8);
    drawRule(doc, y + 25, LEFT + 9, RIGHT - 9);
    setTextStyle(doc, "MontserratBold", 6.1, MUTED);
    doc.text(leftLabel.toUpperCase(), LEFT + 10, y + 17);
    doc.text(rightLabel.toUpperCase(), LEFT + CONTENT_W / 2 + 10, y + 17);
    return;
  }

  if (kind === "scale") {
    const lineY = y + height / 2 + 8;
    drawRule(doc, lineY, LEFT + 26, RIGHT - 26);
    for (let i = 1; i <= 10; i++) {
      const x = LEFT + 26 + ((CONTENT_W - 52) * (i - 1)) / 9;
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(...RULE);
      doc.circle(x, lineY, 7.2, "FD");
      setTextStyle(doc, "MontserratSemiBold", 5.8, INK);
      doc.text(String(i), x, lineY + 2, { align: "center" });
    }
    setTextStyle(doc, "Montserrat", 5.8, MUTED);
    doc.text("NOT AT ALL", LEFT + 19, y + height - 13);
    doc.text("VERY MUCH", RIGHT - 19, y + height - 13, { align: "right" });
    return;
  }

  if (kind === "choice") {
    const options = activityOptions(session);
    const colW = CONTENT_W / 2;
    options.forEach((option, index) => {
      const col = index % 2;
      const row = Math.floor(index / 2);
      const x = LEFT + 13 + col * colW;
      const yy = y + 24 + row * 29;
      doc.setDrawColor(...RULE);
      doc.rect(x, yy - 7, 8, 8, "S");
      drawFitText(doc, option, x + 15, yy, colW - 33, 18, { maxSize: 7.2, minSize: 6.2 });
    });
    return;
  }

  if (kind === "wordcloud") {
    const widths = [74, 112, 88, 132, 96, 70];
    widths.forEach((width, index) => {
      const row = Math.floor(index / 3);
      const col = index % 3;
      const x = LEFT + 20 + col * (CONTENT_W - 40) / 3;
      const yy = y + 33 + row * 45;
      drawRule(doc, yy, x, Math.min(RIGHT - 15, x + width));
    });
    return;
  }

  if (kind === "drawing") {
    setTextStyle(doc, "Montserrat", 5.8, MUTED);
    doc.text("DRAW OR WRITE HERE", RIGHT - 10, y + 15, { align: "right" });
    return;
  }

  for (let lineY = y + WRITING_PITCH; lineY < y + height - 7; lineY += WRITING_PITCH) {
    drawRule(doc, lineY, LEFT + 10, RIGHT - 10);
  }
}

function drawPractice(doc: jsPDF, session: WorksheetSession, y: number) {
  sectionLabel(doc, "This week's practice", y, "One small action at a time");
  const top = y + 12;
  const gap = 10;
  const colW = (CONTENT_W - gap * 2) / 3;
  PRACTICE_SLOTS.forEach((slot, index) => {
    const x = LEFT + index * (colW + gap);
    drawOutlineBox(doc, x, top, colW, 100, 4);
    doc.setDrawColor(...RULE);
    doc.rect(x + 10, top + 11, 8, 8, "S");
    setTextStyle(doc, "MontserratBold", 6.2, INK);
    doc.text(slot.printLabel, x + 24, top + 18);
    const fallback = session.audience.toLowerCase() === "child"
      ? "Ask a trusted grown-up to help you choose one small practice."
      : slot.purpose;
    drawFitText(doc, excerpt(firstOf(practiceText(session, slot.key), fallback), 320), x + 10, top + 38, colW - 20, 51, {
      maxSize: 7,
      minSize: 6.2,
    });
  });
}

function drawFooter(doc: jsPDF) {
  drawRule(doc, FOOTER_RULE_Y);
  setTextStyle(doc, "Montserrat", 6.2, MUTED);
  doc.text("mindcast.co.nz", LEFT, 809);
  setTextStyle(doc, "BebasNeue", 7.2, INK);
  doc.setCharSpace(1.05);
  doc.text("NOTICE IT. NAME IT. DO IT.", PAGE_W / 2, 809, { align: "center" });
  doc.setCharSpace(0);
  setTextStyle(doc, "Montserrat", 6.2, MUTED);
  doc.text("1 / 1", RIGHT, 809, { align: "right" });
}

export function generateWorksheetPdf(session: WorksheetSession): jsPDF {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  registerFonts(doc);
  doc.setProperties({
    title: `Mindcast - Week ${session.week_number} ${session.audience} - ${session.theme_title}`,
    subject: `${session.phase_name || ""} one-page A4 worksheet`,
    author: "Mindcast Limited",
    keywords: `${session.audience} week ${session.week_number} worksheet`,
    creator: "Mindcast",
  });

  drawHeader(doc, session);

  const signal = firstOf(
    session.audience.toLowerCase() === "child" ? session.kids_signal_metaphor : undefined,
    session.signal_metaphor,
    session.opening_hook,
    "Pause, notice what is here, and choose the signal that matters.",
  );
  sectionLabel(doc, "The signal", 166, "The idea to carry");
  drawOutlineBox(doc, LEFT, 176, CONTENT_W, 52);
  drawFitText(doc, excerpt(signal, 420), LEFT + 13, 194, CONTENT_W - 26, 27, {
    maxSize: 7.7,
    minSize: 6.5,
  });

  const reflection = firstOf(
    session.journaling_prompt,
    session.audience.toLowerCase() === "child" ? session.kids_picture_book_question : undefined,
    session.private_write_prompt,
    session.video_question_1,
    session.opening_question,
    "What feels most important to notice and name today?",
  );
  sectionLabel(doc, session.audience.toLowerCase() === "child" ? "Draw or write your reflection" : "Your reflection", 247, "Private unless you choose to share");
  drawFitText(doc, `“${excerpt(reflection, 360)}”`, LEFT, 265, CONTENT_W, 36, {
    maxSize: 11,
    minSize: 8.2,
    font: "CormorantItalic",
  });
  drawRuledArea(doc, LEFT, 304, CONTENT_W, 86);

  const isChild = session.audience.toLowerCase() === "child";
  const activity = firstOf(
    isChild ? session.experiential_exercise : session.workbook_activity,
    isChild ? session.workbook_activity : session.experiential_exercise,
    session.thought_provoking_question,
    "Use the space below to notice, sort, map or draw what this week's idea means in your life.",
  );
  sectionLabel(doc, "Activity", 411, "Use the space in the way the facilitator explains");
  drawFitText(doc, excerpt(activity, 460), LEFT, 429, CONTENT_W, 48, {
    maxSize: 7.6,
    minSize: 6.4,
  });
  drawActivityArea(doc, session, activity, 482, 130);

  drawPractice(doc, session, 635);
  drawFooter(doc);
  return doc;
}

export function downloadWorksheetPdf(session: WorksheetSession) {
  const filename = `mindcast-week-${String(session.week_number).padStart(2, "0")}-${session.audience.toLowerCase()}-worksheet.pdf`;
  generateWorksheetPdf(session).save(filename);
}

export async function generateWorksheetPdfBlob(session: WorksheetSession): Promise<Blob> {
  return generateWorksheetPdf(session).output("blob");
}

export async function generateWorksheetPdfDataUri(session: WorksheetSession): Promise<string> {
  return generateWorksheetPdf(session).output("datauristring");
}
