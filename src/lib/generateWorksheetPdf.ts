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
import { splitKidsGame } from "@/lib/kidsGame";

export type WorksheetSession = {
  week_number: number;
  phase_name?: string;
  theme_title: string;
  session_title?: string;
  audience: string;
  opening_hook?: string;
  opening_question?: string;
  previous_week_callback?: string;
  last_week_theme?: string;
  core_concept?: string;
  teaching_points?: string;
  ancient_wisdom_reframe?: string;
  signal_metaphor?: string;
  kids_signal_metaphor?: string;
  video_description?: string;
  video_question_1?: string;
  video_question_2?: string;
  kids_picture_book?: string;
  kids_picture_book_author?: string;
  kids_picture_book_question?: string;
  kids_colouring_prompt?: string;
  thought_provoking_question?: string;
  experiential_exercise?: string;
  private_write_prompt?: string;
  journaling_prompt?: string;
  intention_prompt?: string;
  practice_sun_today?: string;
  practice_midweek?: string;
  practice_fri?: string;
  weekly_practice_mon?: string;
  weekly_practice_wed?: string;
  weekly_practice_sun?: string;
  weekly_practice_fri?: string;
  core_affirmation?: string;
  closing_quote?: string;
  closing_quote_attribution?: string;
  kids_game?: string;
  kids_game_equipment?: string;
  kids_game_under5?: string;
};

export type WorksheetPageKey =
  | "welcome"
  | "voices"
  | "ancient"
  | "video"
  | "coloring"
  | "deeper"
  | "reflection"
  | "intention"
  | "affirmation"
  | "closing_game";

const STANDARD_PAGE_KEYS: readonly WorksheetPageKey[] = [
  "welcome", "voices", "ancient", "video", "deeper", "reflection", "intention", "affirmation",
];

const CHILD_PAGE_KEYS: readonly WorksheetPageKey[] = [
  "welcome", "voices", "ancient", "video", "coloring", "deeper", "reflection", "intention", "closing_game",
];

export const worksheetPageKeysForTrack = (audience: string): readonly WorksheetPageKey[] =>
  audience.toLowerCase() === "child" ? CHILD_PAGE_KEYS : STANDARD_PAGE_KEYS;

const PAGE_META: Record<WorksheetPageKey, { title: string; tab: string; beat: string }> = {
  welcome: { title: "Welcome + Opening Question", tab: "WELCOME", beat: "Notice it" },
  voices: { title: "Return to Your Intention", tab: "RETURN", beat: "Notice it" },
  ancient: { title: "Inner Wisdom + In Today's World", tab: "WISDOM", beat: "Notice it" },
  video: { title: "This Week's Listen", tab: "LISTEN", beat: "Name it" },
  coloring: { title: "Colouring Activity", tab: "COLOUR", beat: "Name it" },
  deeper: { title: "Go Deeper + Together", tab: "DEEPER", beat: "Name it" },
  reflection: { title: "Reflect & Share", tab: "REFLECT", beat: "Name it" },
  intention: { title: "Before You Leave", tab: "PRACTICE", beat: "Do it" },
  affirmation: { title: "Closing Affirmation", tab: "CLOSE", beat: "Do it" },
  closing_game: { title: "The Closing Game / Activity", tab: "GAME", beat: "Do it" },
};

// MC-BRD-001 print palette. Large surfaces use pale tints so the workbook
// keeps the reference's paper-and-ink feel and remains photocopy friendly.
const INK: [number, number, number] = [0x10, 0x24, 0x38];
const NAVY: [number, number, number] = [0x16, 0x28, 0x3a];
const SIGNAL_BLUE: [number, number, number] = [0x35, 0x85, 0xaf];
const SIGNAL_DEEP: [number, number, number] = [0x2b, 0x70, 0x91];
const PALE_BLUE: [number, number, number] = [0xeb, 0xf5, 0xf8];
const PALE_BLUE_2: [number, number, number] = [0xe0, 0xef, 0xf4];
const RULE: [number, number, number] = [0xc4, 0xd4, 0xdc];
const MUTED: [number, number, number] = [0x5c, 0x6b, 0x77];
const WHITE: [number, number, number] = [0xff, 0xff, 0xff];

const PAGE_W = 595.28;
const PAGE_H = 841.89;
const LEFT = 50;
/** Ruled writing-line spacing in points; the screen facsimile must stay near it. */
const WRITING_PITCH = 24;
const TAB_W = 31;
const TAB_X = PAGE_W - TAB_W;
const RIGHT = TAB_X - 18;
const CONTENT_W = RIGHT - LEFT;
const FOOTER_RULE_Y = 792;
const CONTENT_BOTTOM = 774;

type FontName = "BebasNeue" | "Montserrat" | "MontserratSemiBold" | "MontserratBold" | "CormorantItalic";
type Ctx = { doc: jsPDF; session: WorksheetSession; pageKeys: readonly WorksheetPageKey[] };

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

const clean = (value: string | null | undefined): string => (value || "").replace(/\s+/g, " ").trim();

function excerpt(value: string | null | undefined, max = 950): string {
  const text = clean(value);
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  return `${cut.slice(0, Math.max(0, cut.lastIndexOf(" ")))}...`;
}

function firstOf(...values: Array<string | null | undefined>): string {
  return values.map(clean).find(Boolean) || "";
}

function sectionLabel(doc: jsPDF, text: string, y: number, x = LEFT) {
  doc.setFont("MontserratBold", "normal");
  doc.setFontSize(8.2);
  doc.setTextColor(...INK);
  doc.setCharSpace(0.55);
  doc.text(text.toUpperCase(), x, y);
  doc.setCharSpace(0);
}

function setTextStyle(doc: jsPDF, font: FontName, size: number, colour: [number, number, number] = INK) {
  doc.setFont(font, "normal");
  doc.setFontSize(size);
  doc.setTextColor(...colour);
}

function wrapped(doc: jsPDF, text: string, width: number, size = 9.2, font: FontName = "Montserrat") {
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
  options: { maxSize?: number; minSize?: number; font?: FontName; colour?: [number, number, number]; align?: "left" | "center" | "right" } = {},
): number {
  const font = options.font ?? "Montserrat";
  const minSize = options.minSize ?? 7.2;
  let size = options.maxSize ?? 10;
  let lines = wrapped(doc, text, width, size, font);
  let leading = size * 1.3;
  while (size > minSize && lines.length * leading > maxHeight) {
    size -= 0.35;
    leading = size * 1.3;
    lines = wrapped(doc, text, width, size, font);
  }
  setTextStyle(doc, font, size, options.colour ?? INK);
  doc.text(lines, options.align === "center" ? x + width / 2 : x, y, {
    align: options.align ?? "left",
    lineHeightFactor: 1.3,
  });
  return Math.min(maxHeight, lines.length * leading);
}

function drawRipple(doc: jsPDF, x: number, y: number) {
  doc.setFillColor(...SIGNAL_BLUE);
  doc.circle(x + 4, y, 3.6, "F");
  for (let i = 0; i < 9; i++) {
    doc.setDrawColor(...(i < 5 ? SIGNAL_BLUE : RULE));
    doc.setLineWidth(Math.max(0.65, 1.8 - i * 0.12));
    const xx = x + 13 + i * 5.1;
    doc.line(xx, y - 7 + i * 0.3, xx + 3, y + 7 - i * 0.3);
  }
}

function drawBinderHoles(doc: jsPDF) {
  doc.setFillColor(...INK);
  for (let y = 84; y <= 746; y += 73.5) {
    doc.roundedRect(0, y - 3.5, 18, 7, 3.5, 3.5, "F");
    doc.circle(22, y, 8.5, "F");
  }
}

function drawTabs(doc: jsPDF, keys: readonly WorksheetPageKey[], active: WorksheetPageKey) {
  const top = 38;
  const bottom = 778;
  const height = (bottom - top) / keys.length;
  keys.forEach((key, index) => {
    const isActive = key === active;
    const x = isActive ? TAB_X - 4 : TAB_X;
    const width = isActive ? TAB_W + 4 : TAB_W;
    const y = top + index * height;
    doc.setFillColor(...(isActive ? SIGNAL_DEEP : index % 2 === 0 ? NAVY : SIGNAL_BLUE));
    doc.roundedRect(x, y, width + 7, height + 1, 4, 4, "F");
    setTextStyle(doc, "MontserratBold", 6.1, WHITE);
    doc.setCharSpace(0.7);
    const tabLabel = PAGE_META[key].tab;
    const labelWidth = doc.getTextWidth(tabLabel);
    doc.text(tabLabel, x + width / 2 + 2, y + height / 2 + labelWidth / 2, { angle: 90 });
    doc.setCharSpace(0);
  });
}

function drawBadges(doc: jsPDF, session: WorksheetSession) {
  const track = session.audience.toUpperCase();
  const week = `WEEK ${session.week_number}`;
  setTextStyle(doc, "MontserratBold", 6.5, WHITE);
  const weekW = Math.max(48, doc.getTextWidth(week) + 14);
  const trackW = Math.max(46, doc.getTextWidth(track) + 14);
  const y = 42;
  doc.setFillColor(...NAVY);
  doc.rect(RIGHT - weekW - trackW - 6, y, trackW, 16, "F");
  doc.text(track, RIGHT - weekW - 6 - trackW / 2, y + 10.5, { align: "center" });
  doc.setFillColor(...SIGNAL_DEEP);
  doc.rect(RIGHT - weekW, y, weekW, 16, "F");
  doc.text(week, RIGHT - weekW / 2, y + 10.5, { align: "center" });
  if (session.phase_name) {
    setTextStyle(doc, "MontserratSemiBold", 6.2, SIGNAL_DEEP);
    doc.setCharSpace(0.7);
    doc.text(session.phase_name.toUpperCase(), RIGHT, y + 26, { align: "right" });
    doc.setCharSpace(0);
  }
}

function drawFooter(doc: jsPDF, page: number, pages: number) {
  doc.setDrawColor(...RULE);
  doc.setLineWidth(0.55);
  doc.line(LEFT, FOOTER_RULE_Y, RIGHT, FOOTER_RULE_Y);
  setTextStyle(doc, "Montserrat", 6.6, MUTED);
  doc.text("mindcast.co.nz", LEFT, 809);
  setTextStyle(doc, "BebasNeue", 7.4, INK);
  doc.setCharSpace(1.2);
  doc.text("NOTICE IT. NAME IT. DO IT.", (LEFT + RIGHT) / 2, 809, { align: "center" });
  doc.setCharSpace(0);
  setTextStyle(doc, "Montserrat", 6.6, MUTED);
  doc.text(`${page} / ${pages}`, RIGHT, 809, { align: "right" });
}

function drawPageShell(ctx: Ctx, key: WorksheetPageKey, page: number): number {
  const { doc, session, pageKeys } = ctx;
  drawBinderHoles(doc);
  drawTabs(doc, pageKeys, key);
  const logoW = 120;
  doc.addImage(`data:image/png;base64,${NAVY_WORDMARK_PNG}`, "PNG", LEFT, 40, logoW, (logoW * 75) / 488);
  drawBadges(doc, session);

  drawRipple(doc, LEFT, 94);
  setTextStyle(doc, "MontserratSemiBold", 6.8, SIGNAL_DEEP);
  doc.setCharSpace(1.2);
  doc.text(`WORKBOOK PAGE ${String(page).padStart(2, "0")}`, LEFT + 65, 96);
  doc.setCharSpace(0);

  setTextStyle(doc, "BebasNeue", 23, INK);
  const titleLines = (doc.splitTextToSize((session.theme_title || `Week ${session.week_number}`).toUpperCase(), CONTENT_W) as string[]).slice(0, 2);
  doc.text(titleLines, LEFT, 122, { lineHeightFactor: 0.95 });
  let y = 122 + titleLines.length * 22;
  const subtitle = firstOf(session.session_title, `Week ${session.week_number}`);
  if (subtitle && subtitle.toLowerCase() !== session.theme_title.toLowerCase()) {
    setTextStyle(doc, "CormorantItalic", 9.5, INK);
    doc.text((doc.splitTextToSize(subtitle, CONTENT_W) as string[]).slice(0, 2), LEFT, y + 1);
    y += 16;
  }

  doc.setFillColor(...PALE_BLUE_2);
  doc.roundedRect(LEFT, y + 4, CONTENT_W, 24, 4, 4, "F");
  setTextStyle(doc, "MontserratBold", 7.4, SIGNAL_DEEP);
  doc.setCharSpace(0.45);
  doc.text(`${String(page).padStart(2, "0")}  ${PAGE_META[key].beat.toUpperCase()}  /  ${PAGE_META[key].title.toUpperCase()}`, LEFT + 10, y + 19);
  doc.setCharSpace(0);
  drawFooter(doc, page, pageKeys.length);
  return y + 48;
}

function drawPanel(doc: jsPDF, x: number, y: number, width: number, height: number, tint: [number, number, number] = PALE_BLUE) {
  doc.setFillColor(...tint);
  doc.setDrawColor(...RULE);
  doc.setLineWidth(0.45);
  doc.roundedRect(x, y, width, height, 7, 7, "FD");
}

function drawWritingArea(doc: jsPDF, y: number, height: number, options: { label?: string; columns?: number } = {}) {
  if (options.label) {
    sectionLabel(doc, options.label, y);
    y += 10;
  }
  const safeHeight = Math.min(height, CONTENT_BOTTOM - y);
  drawPanel(doc, LEFT, y, CONTENT_W, safeHeight, PALE_BLUE);
  doc.setDrawColor(...RULE);
  doc.setLineWidth(0.45);
  const columns = options.columns ?? 1;
  for (let c = 1; c < columns; c++) {
    const x = LEFT + (CONTENT_W * c) / columns;
    doc.line(x, y + 8, x, y + safeHeight - 8);
  }
  for (let lineY = y + 25; lineY < y + safeHeight - 8; lineY += WRITING_PITCH) doc.line(LEFT + 10, lineY, RIGHT - 10, lineY);
}

function drawCheckbox(doc: jsPDF, x: number, y: number, labelText: string, width: number, size = 8.2) {
  doc.setDrawColor(...SIGNAL_BLUE);
  doc.setLineWidth(0.65);
  doc.rect(x, y - 7, 8, 8, "S");
  const lines = wrapped(doc, labelText, width - 16, size);
  setTextStyle(doc, "Montserrat", size, INK);
  doc.text(lines, x + 15, y, { lineHeightFactor: 1.25 });
  return Math.max(14, lines.length * size * 1.25);
}

function drawWelcome(ctx: Ctx, key: WorksheetPageKey, page: number) {
  const { doc, session } = ctx;
  let y = drawPageShell(ctx, key, page);
  sectionLabel(doc, session.audience === "Child" ? "Our opening question" : "Opening question", y);
  y += 15;
  const prompt = firstOf(session.opening_question, session.opening_hook, session.audience === "Child" ? "What are you bringing into the room today?" : "What are you noticing as you arrive today?");
  drawPanel(doc, LEFT, y, CONTENT_W, 82);
  drawFitText(doc, excerpt(prompt, 520), LEFT + 18, y + 27, CONTENT_W - 36, 52, { maxSize: 15, minSize: 10.5, font: "CormorantItalic" });
  y += 102;
  drawWritingArea(doc, y, 255, { label: session.audience === "Child" ? "Draw or write what is here with you" : "What I am arriving with" });
  y += 286;
  sectionLabel(doc, "A quick check-in", y);
  y += 18;
  const prompts = session.audience === "Child"
    ? ["Something I can see", "Something I can feel", "Something I want to learn"]
    : ["What feels loud?", "What feels quiet?", "What deserves my attention?"];
  const colW = (CONTENT_W - 20) / 3;
  prompts.forEach((promptText, index) => {
    const x = LEFT + index * (colW + 10);
    setTextStyle(doc, "MontserratSemiBold", 7.4, SIGNAL_DEEP);
    doc.text(promptText.toUpperCase(), x, y);
    doc.setDrawColor(...RULE);
    doc.line(x, y + 28, x + colW, y + 28);
    doc.line(x, y + 53, x + colW, y + 53);
  });
}

function drawReturn(ctx: Ctx, key: WorksheetPageKey, page: number) {
  const { doc, session } = ctx;
  let y = drawPageShell(ctx, key, page);
  const isChild = session.audience === "Child";
  sectionLabel(doc, isChild ? "Last week we learnt" : "Last week's intention", y);
  y += 15;
  const callback = firstOf(isChild ? session.last_week_theme : session.previous_week_callback, isChild ? "Draw or write one thing you remember from last week." : "What did you mean to notice, name or do after the last session?");
  drawPanel(doc, LEFT, y, CONTENT_W, 76);
  drawFitText(doc, excerpt(callback, 520), LEFT + 16, y + 24, CONTENT_W - 32, 46, { maxSize: 11.5, minSize: 8.5, font: isChild ? "MontserratSemiBold" : "CormorantItalic" });
  y += 96;
  if (isChild) {
    drawWritingArea(doc, y, 285, { label: "Draw or write what you remember" });
    y += 316;
    sectionLabel(doc, "Today I feel", y);
    y += 20;
    ["Ready", "Curious", "Unsure", "Something else"].forEach((value, index) => {
      const colW = CONTENT_W / 4;
      drawCheckbox(doc, LEFT + index * colW, y, value, colW - 4, 7.6);
    });
    return;
  }
  sectionLabel(doc, "How far did it travel?", y);
  y += 20;
  [
    "I did not notice it.",
    "I noticed something, but could not name it.",
    "I noticed it and named it, but did not change anything.",
    "I noticed it, named it and did something about it.",
  ].forEach((value) => { y += drawCheckbox(doc, LEFT, y, value, CONTENT_W, 8.4) + 4; });
  y += 8;
  drawWritingArea(doc, y, 205, { label: "What did I learn from what happened?" });
}

function drawWisdom(ctx: Ctx, key: WorksheetPageKey, page: number) {
  const { doc, session } = ctx;
  let y = drawPageShell(ctx, key, page);
  const isChild = session.audience === "Child";
  const wisdom = firstOf(session.ancient_wisdom_reframe, "People have been exploring this idea for a very long time.");
  const world = firstOf(isChild ? session.kids_signal_metaphor : undefined, session.signal_metaphor, session.core_concept);
  const cardH = 150;
  sectionLabel(doc, "Inner wisdom", y);
  y += 12;
  drawPanel(doc, LEFT, y, CONTENT_W, cardH);
  drawFitText(doc, excerpt(wisdom, 900), LEFT + 17, y + 24, CONTENT_W - 34, cardH - 38, { maxSize: 11.2, minSize: 7.3, font: "CormorantItalic" });
  y += cardH + 18;
  sectionLabel(doc, "In today's world - the signal", y);
  y += 12;
  drawPanel(doc, LEFT, y, CONTENT_W, cardH, PALE_BLUE_2);
  drawFitText(doc, excerpt(world, 900), LEFT + 17, y + 24, CONTENT_W - 34, cardH - 38, { maxSize: 10.5, minSize: 7.3 });
  y += cardH + 19;
  drawWritingArea(doc, y, 150, { label: isChild ? "The picture in my mind" : "The connection I notice" });
}

function drawListen(ctx: Ctx, key: WorksheetPageKey, page: number) {
  const { doc, session } = ctx;
  let y = drawPageShell(ctx, key, page);
  const isChild = session.audience === "Child";
  sectionLabel(doc, isChild ? "This week's picture book" : "This week's listen", y);
  y += 14;
  const sourceTitle = firstOf(isChild ? session.kids_picture_book : undefined, session.session_title, session.video_description, "This week's source");
  const sourceMeta = isChild && session.kids_picture_book_author ? `by ${session.kids_picture_book_author}` : firstOf(session.video_description, "Listen for what supports, challenges or changes the week's idea.");
  drawPanel(doc, LEFT, y, CONTENT_W, 74);
  setTextStyle(doc, "MontserratBold", 11, INK);
  doc.text((doc.splitTextToSize(sourceTitle, CONTENT_W - 34) as string[]).slice(0, 2), LEFT + 17, y + 24);
  drawFitText(doc, excerpt(sourceMeta, 260), LEFT + 17, y + 52, CONTENT_W - 34, 18, { maxSize: 7.8, minSize: 7, colour: MUTED });
  y += 94;
  if (isChild) {
    const question = firstOf(session.kids_picture_book_question, session.video_question_1, "What did you notice in the story?");
    sectionLabel(doc, "Talk about the story", y);
    y += 16;
    drawFitText(doc, question, LEFT, y, CONTENT_W, 60, { maxSize: 14, minSize: 10, font: "CormorantItalic" });
    y += 70;
    drawWritingArea(doc, y, 310, { label: "Draw or write your answer" });
    return;
  }
  [
    firstOf(session.video_question_1, "What idea or moment stayed with you?"),
    firstOf(session.video_question_2, "How does it connect with your own life?"),
  ].forEach((question, index) => {
    sectionLabel(doc, `Question ${index + 1}`, y);
    y += 15;
    y += drawFitText(doc, question, LEFT, y, CONTENT_W, 44, { maxSize: 11.2, minSize: 8.2, font: "CormorantItalic" }) + 8;
    const areaH = index === 0 ? 126 : Math.max(92, CONTENT_BOTTOM - y);
    drawWritingArea(doc, y, areaH);
    y += areaH + 17;
  });
}

function drawColoring(ctx: Ctx, key: WorksheetPageKey, page: number) {
  const { doc, session } = ctx;
  let y = drawPageShell(ctx, key, page);
  sectionLabel(doc, "Colour the week's idea", y);
  y += 15;
  const prompt = firstOf(session.kids_colouring_prompt, session.kids_signal_metaphor, session.signal_metaphor, "Use colour, shapes and lines to show what this week's idea looks like to you.");
  drawPanel(doc, LEFT, y, CONTENT_W, 66);
  drawFitText(doc, excerpt(prompt, 500), LEFT + 16, y + 22, CONTENT_W - 32, 38, { maxSize: 10, minSize: 7.8, font: "MontserratSemiBold" });
  y += 86;
  doc.setDrawColor(...SIGNAL_BLUE);
  doc.setLineWidth(1);
  doc.setLineDashPattern([4, 4], 0);
  doc.roundedRect(LEFT, y, CONTENT_W, 430, 9, 9, "S");
  doc.setLineDashPattern([], 0);
  drawRipple(doc, LEFT + CONTENT_W / 2 - 30, y + 190);
  setTextStyle(doc, "CormorantItalic", 12, MUTED);
  doc.text("Approved colouring page or your own drawing space", LEFT + CONTENT_W / 2, y + 225, { align: "center" });
  setTextStyle(doc, "Montserrat", 7.2, MUTED);
  doc.text("The facilitator checks generated pictures before children receive them.", LEFT + CONTENT_W / 2, y + 244, { align: "center" });
}

function drawDeeper(ctx: Ctx, key: WorksheetPageKey, page: number) {
  const { doc, session } = ctx;
  let y = drawPageShell(ctx, key, page);
  const isChild = session.audience === "Child";
  sectionLabel(doc, "Go deeper", y);
  y += 13;
  drawPanel(doc, LEFT, y, CONTENT_W, 104);
  drawFitText(doc, excerpt(firstOf(session.core_concept, session.teaching_points, session.signal_metaphor), 820), LEFT + 16, y + 22, CONTENT_W - 32, 75, { maxSize: 9.7, minSize: 7.1 });
  y += 123;
  const question = isChild
    ? "What did you notice while we tried this together?"
    : firstOf(session.thought_provoking_question, "What becomes possible when you take this idea one step further?");
  sectionLabel(doc, "Together", y);
  y += 16;
  y += drawFitText(doc, question, LEFT, y, CONTENT_W, 45, { maxSize: 13, minSize: 9, font: "CormorantItalic" }) + 7;
  const activity = firstOf(session.experiential_exercise, "Try the activity together, then notice what changed.");
  drawPanel(doc, LEFT, y, CONTENT_W, 112, PALE_BLUE_2);
  drawFitText(doc, excerpt(activity, 900), LEFT + 15, y + 21, CONTENT_W - 30, 82, { maxSize: 8.7, minSize: 6.9 });
  y += 130;
  const privatePrompt = isChild
    ? "Draw or write one thing you noticed in the game. You can leave this blank."
    : firstOf(session.private_write_prompt, "What did this activity show you about your own pattern?");
  sectionLabel(doc, isChild ? "My part" : "Private write", y);
  y += 14;
  drawFitText(doc, privatePrompt, LEFT, y, CONTENT_W, 38, { maxSize: 9, minSize: 7.4, font: "MontserratSemiBold" });
  y += 42;
  drawWritingArea(doc, y, Math.max(104, CONTENT_BOTTOM - y), { columns: 2 });
  setTextStyle(doc, "MontserratBold", 6.8, SIGNAL_DEEP);
  doc.text("WHAT I NOTICED", LEFT + 10, y + 15);
  doc.text(isChild ? "WHAT I MIGHT TRY" : "WHAT I WILL TRY", LEFT + CONTENT_W / 2 + 10, y + 15);
}

function drawReflection(ctx: Ctx, key: WorksheetPageKey, page: number) {
  const { doc, session } = ctx;
  let y = drawPageShell(ctx, key, page);
  const isChild = session.audience === "Child";
  sectionLabel(doc, isChild ? "Talk about the picture" : "Reflection", y);
  y += 16;
  const prompt = firstOf(isChild ? session.kids_picture_book_question : undefined, session.journaling_prompt, isChild ? "What do you want to say about your picture?" : "What feels most important to name after this session?");
  y += drawFitText(doc, `“${prompt}”`, LEFT, y, CONTENT_W, 84, { maxSize: 15.5, minSize: 10, font: "CormorantItalic" }) + 16;
  drawWritingArea(doc, y, Math.max(330, CONTENT_BOTTOM - y - 34), { label: isChild ? "Draw or write what you want to keep" : "Your reflection" });
  setTextStyle(doc, "Montserrat", 6.9, MUTED);
  doc.text(isChild ? "You choose what to share. You can keep this page private." : "This reflection belongs to you. Share only what you choose.", LEFT, CONTENT_BOTTOM);
}

function drawPractice(ctx: Ctx, key: WorksheetPageKey, page: number) {
  const { doc, session } = ctx;
  let y = drawPageShell(ctx, key, page);
  const isChild = session.audience === "Child";
  sectionLabel(doc, isChild ? "One thing this week" : "Your intention for the week", y);
  y += 15;
  const intention = firstOf(session.intention_prompt, isChild ? "One thing I want to work on this week is..." : "Write one specific thing you will notice, name or do this week.");
  drawPanel(doc, LEFT, y, CONTENT_W, 62);
  drawFitText(doc, intention, LEFT + 15, y + 21, CONTENT_W - 30, 35, { maxSize: 10.5, minSize: 8, font: "CormorantItalic" });
  y += 81;
  drawWritingArea(doc, y, 82, { label: "My one thing" });
  y += 112;
  sectionLabel(doc, "This week's practice", y);
  y += 17;
  const colW = (CONTENT_W - 18) / 3;
  PRACTICE_SLOTS.forEach((slot, index) => {
    const x = LEFT + index * (colW + 9);
    const practice = firstOf(practiceText(session, slot.key), isChild ? "Ask a grown-up to help you choose one small practice." : slot.purpose);
    drawPanel(doc, x, y, colW, 155, index === 1 ? PALE_BLUE_2 : PALE_BLUE);
    doc.setDrawColor(...SIGNAL_BLUE);
    doc.rect(x + 11, y + 12, 8, 8, "S");
    setTextStyle(doc, "MontserratBold", 7, SIGNAL_DEEP);
    doc.text(slot.printLabel, x + 25, y + 19);
    drawFitText(doc, excerpt(practice, 360), x + 11, y + 42, colW - 22, 96, { maxSize: 7.6, minSize: 6.6 });
  });
  y += 175;
  sectionLabel(doc, isChild ? "Who can help me?" : "Make it easier to follow through", y);
  y += 15;
  drawWritingArea(doc, y, Math.max(84, CONTENT_BOTTOM - y));
}

function drawAffirmation(ctx: Ctx, key: WorksheetPageKey, page: number) {
  const { doc, session } = ctx;
  let y = drawPageShell(ctx, key, page);
  sectionLabel(doc, "Closing affirmation", y);
  y += 18;
  const quote = firstOf(session.closing_quote, session.core_affirmation, session.audience === "Child" ? "I can notice, name and choose my next small step." : "I notice what is here, name what matters and choose what I do next.");
  drawPanel(doc, LEFT, y, CONTENT_W, 205, PALE_BLUE_2);
  drawRipple(doc, LEFT + 24, y + 38);
  drawFitText(doc, `“${quote}”`, LEFT + 32, y + 78, CONTENT_W - 64, 95, { maxSize: 21, minSize: 12, font: "CormorantItalic", align: "center" });
  if (session.closing_quote_attribution) {
    setTextStyle(doc, "MontserratSemiBold", 7.4, SIGNAL_DEEP);
    doc.text(`- ${session.closing_quote_attribution}`, LEFT + CONTENT_W / 2, y + 178, { align: "center" });
  }
  y += 230;
  drawWritingArea(doc, y, 190, { label: "What I am taking with me" });
  y += 220;
  sectionLabel(doc, "Close the loop", y);
  y += 20;
  const checks = session.audience === "Child" ? ["I noticed something", "I named it", "I chose one thing"] : ["I noticed it", "I named it", "I chose what I will do"];
  const colW = CONTENT_W / 3;
  checks.forEach((value, index) => drawCheckbox(doc, LEFT + index * colW, y, value, colW - 5, 7.5));
}

function drawClosingGame(ctx: Ctx, key: WorksheetPageKey, page: number) {
  const { doc, session } = ctx;
  let y = drawPageShell(ctx, key, page);
  const game = splitKidsGame(session.kids_game);

  sectionLabel(doc, "The closing game / activity", y);
  y += 18;
  drawPanel(doc, LEFT, y, CONTENT_W, 84, PALE_BLUE_2);
  drawFitText(doc, game.title, LEFT + 18, y + 27, CONTENT_W - 36, 42, {
    maxSize: 18,
    minSize: 11,
    font: "BebasNeue",
    align: "center",
  });
  y += 104;

  sectionLabel(doc, "How to play", y);
  y += 16;
  const instructionsHeight = session.kids_game_under5 ? 230 : 300;
  drawPanel(doc, LEFT, y, CONTENT_W, instructionsHeight);
  drawFitText(doc, excerpt(game.instructions, 1500), LEFT + 16, y + 23, CONTENT_W - 32, instructionsHeight - 40, {
    maxSize: 10,
    minSize: 7,
  });
  y += instructionsHeight + 20;

  sectionLabel(doc, "What you need", y);
  y += 15;
  drawPanel(doc, LEFT, y, CONTENT_W, 78, PALE_BLUE_2);
  drawFitText(doc, firstOf(session.kids_game_equipment, "No special equipment."), LEFT + 16, y + 22, CONTENT_W - 32, 45, {
    maxSize: 9.4,
    minSize: 7.2,
    font: "MontserratSemiBold",
  });
  y += 98;

  if (session.kids_game_under5) {
    sectionLabel(doc, "For younger children", y);
    y += 15;
    drawFitText(doc, excerpt(session.kids_game_under5, 700), LEFT, y, CONTENT_W, Math.max(70, CONTENT_BOTTOM - y), {
      maxSize: 9,
      minSize: 6.9,
    });
  }
}

function drawWorksheetPage(ctx: Ctx, key: WorksheetPageKey, page: number) {
  switch (key) {
    case "welcome": return drawWelcome(ctx, key, page);
    case "voices": return drawReturn(ctx, key, page);
    case "ancient": return drawWisdom(ctx, key, page);
    case "video": return drawListen(ctx, key, page);
    case "coloring": return drawColoring(ctx, key, page);
    case "deeper": return drawDeeper(ctx, key, page);
    case "reflection": return drawReflection(ctx, key, page);
    case "intention": return drawPractice(ctx, key, page);
    case "affirmation": return drawAffirmation(ctx, key, page);
    case "closing_game": return drawClosingGame(ctx, key, page);
  }
}

export function generateWorksheetPdf(session: WorksheetSession): jsPDF {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  registerFonts(doc);
  const pageKeys = worksheetPageKeysForTrack(session.audience);
  doc.setProperties({
    title: `Mindcast - Week ${session.week_number} ${session.audience} - ${session.theme_title}`,
    subject: `${session.phase_name || ""} workbook - ${pageKeys.length} pages`,
    author: "Mindcast Limited",
    keywords: `${session.audience} week ${session.week_number} workbook`,
    creator: "Mindcast",
  });
  const ctx: Ctx = { doc, session, pageKeys };
  pageKeys.forEach((key, index) => {
    if (index > 0) doc.addPage();
    drawWorksheetPage(ctx, key, index + 1);
  });
  return doc;
}

export function downloadWorksheetPdf(session: WorksheetSession) {
  const filename = `mindcast-week-${String(session.week_number).padStart(2, "0")}-${session.audience.toLowerCase()}-workbook.pdf`;
  generateWorksheetPdf(session).save(filename);
}

export async function generateWorksheetPdfBlob(session: WorksheetSession): Promise<Blob> {
  return generateWorksheetPdf(session).output("blob");
}

export async function generateWorksheetPdfDataUri(session: WorksheetSession): Promise<string> {
  return generateWorksheetPdf(session).output("datauristring");
}
