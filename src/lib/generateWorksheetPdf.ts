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

/** The signal mark (MC-BRD-001 Â§4) â€” the brand's signature device, embedded
 *  as a raster so it stays pixel-identical to the site and email. Rendered at
 *  worksheet scale beneath the header. */
const SIGNAL_MARK_PNG = "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";

function drawSignalMark(doc: jsPDF, x: number, y: number) {
  const w = 100;
  const h = w * (115 / 360);
  doc.addImage(`data:image/png;base64,${SIGNAL_MARK_PNG}`, "PNG", x, y - h + 8, w, h);
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
  const quotes = [...clean(text).matchAll(/["â€œ]([^"â€]{2,32})["â€]/g)].map((match) => clean(match[1]));
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
  drawFitText(doc, `â€œ${excerpt(reflection, 360)}â€`, LEFT, 265, CONTENT_W, 36, {
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
