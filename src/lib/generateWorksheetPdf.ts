import jsPDF from "jspdf";

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

// Brand palette — Deep Signal Navy / White / Static Grey / Silver /
// Warm White / Signal Blue / Soft Blue. No gold.
const NAVY = "#0a1120";
const WHITE = "#ffffff";
const GREY = "#8e9299";
const SILVER = "#e2e8f0";
const WARM_WHITE = "#fffaf6";
const BLUE = "#3585af";
const SOFT_BLUE = "#c5e3f3";

/** Draw the navy header bar with text-only Mindcast logo */
function drawHeader(doc: jsPDF, s: WorksheetSession, W: number, M: number) {
  const barH = 72;
  doc.setFillColor(NAVY);
  doc.rect(0, 0, W, barH, "F");

  // Left: "M" letter mark (stylised)
  doc.setFillColor(BLUE);
  doc.roundedRect(M, 14, 22, 22, 3, 3, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(WARM_WHITE);
  doc.text("M", M + 6, 30);

  // Mindcast wordmark
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(WARM_WHITE);
  doc.text("MINDCAST", M + 32, 23, { charSpace: 1.5 });

  // Tagline
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6);
  doc.setTextColor(SILVER);
  doc.text("notice. name. rewire.", M + 32, 33);

  // Right: audience badge
  doc.setFillColor(BLUE);
  doc.roundedRect(W - M - 48, 12, 48, 18, 2, 2, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6);
  doc.setTextColor(WHITE);
  doc.text(s.audience.toUpperCase(), W - M - 24, 24, { align: "center", charSpace: 1.5 });

  // Week number badge
  doc.setFillColor(SILVER);
  doc.roundedRect(W - M - 48, 34, 48, 18, 2, 2, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(NAVY);
  doc.text(`WEEK ${s.week_number}`, W - M - 24, 46, { align: "center", charSpace: 1.5 });

  // Phase
  if (s.phase_name) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(5.5);
    doc.setTextColor(SILVER);
    doc.text((s.phase_name || "").toUpperCase(), W - M - 24, 63, { align: "center", charSpace: 1.2 });
  }
}

/** Draw the theme title area below the header */
function drawTitle(doc: jsPDF, s: WorksheetSession, W: number, M: number, y: number): number {
  let yy = y;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(NAVY);
  const themeLines = doc.splitTextToSize(s.theme_title.toUpperCase(), W - M * 2);
  doc.text(themeLines, M, yy);
  yy += themeLines.length * 20 + 2;

  if (s.session_title) {
    doc.setFont("times", "italic");
    doc.setFontSize(10);
    doc.setTextColor(GREY);
    doc.text(s.session_title, M, yy);
    yy += 14;
  }

  return yy;
}

/** Draw a section label */
function sectionLabel(doc: jsPDF, text: string, M: number, y: number, W: number): number {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(BLUE);
  doc.text(text.toUpperCase(), M, y, { charSpace: 2 });

  doc.setDrawColor(BLUE);
  doc.setLineWidth(0.5);
  doc.line(M, y + 2, M + 40, y + 2);

  return y + 16;
}

/** Draw an italic quote (The Signal) */
function drawQuote(doc: jsPDF, text: string, M: number, y: number, W: number): number {
  let yy = y;

  doc.setDrawColor(SOFT_BLUE);
  doc.setLineWidth(2);
  const lines = doc.splitTextToSize(`"${text}"`, W - M * 2 - 20);
  const blockH = Math.max(34, lines.length * 13 + 6);
  doc.line(M, yy, M, yy + blockH - 6);

  doc.setFont("times", "italic");
  doc.setFontSize(11);
  doc.setTextColor(NAVY);
  doc.text(lines, M + 14, yy + 6);
  yy += blockH;

  return yy;
}

/** Draw the two video reflective questions, each with answer lines. */
function drawVideoQuestions(
  doc: jsPDF,
  q1: string, q2: string,
  M: number, y: number, W: number,
  linesPerQuestion: number,
): number {
  let yy = sectionLabel(doc, "While You Watch", M, y, W);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(NAVY);

  [q1, q2].forEach((q, i) => {
    if (!q) return;
    const qLines = doc.splitTextToSize(`${i + 1}. ${q}`, W - M * 2);
    doc.text(qLines, M, yy);
    yy += qLines.length * 11 + 4;

    doc.setDrawColor(SILVER);
    doc.setLineWidth(0.5);
    for (let l = 0; l < linesPerQuestion; l++) {
      yy += 16;
      doc.line(M, yy, W - M, yy);
    }
    yy += 10;
  });

  return yy;
}

/** Height the video-questions block will need (without drawing). */
function measureVideoQuestions(
  doc: jsPDF,
  q1: string, q2: string,
  M: number, W: number,
  linesPerQuestion: number,
): number {
  if (!q1 && !q2) return 0;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  let h = 16; // label
  [q1, q2].forEach((q, i) => {
    if (!q) return;
    const qLines = (doc.splitTextToSize(`${i + 1}. ${q}`, W - M * 2) as string[]).length;
    h += qLines * 11 + 4 + linesPerQuestion * 16 + 10;
  });
  return h;
}

/** Draw journaling prompt + writing lines */
function drawReflection(doc: jsPDF, prompt: string, M: number, y: number, W: number, lineCount: number): number {
  let yy = sectionLabel(doc, "Reflection", M, y, W);

  doc.setFont("times", "italic");
  doc.setFontSize(10);
  doc.setTextColor(NAVY);
  const lines = doc.splitTextToSize(`"${prompt}"`, W - M * 2);
  doc.text(lines, M, yy);
  yy += lines.length * 13 + 6;

  doc.setDrawColor(SILVER);
  doc.setLineWidth(0.5);
  for (let i = 0; i < lineCount; i++) {
    yy += 17;
    doc.line(M, yy, W - M, yy);
  }
  yy += 8;

  return yy;
}

/** Measure the height the practice block will need (without drawing). */
function measurePractice(
  doc: jsPDF,
  mon: string, wed: string, sun: string,
  M: number, W: number
): number {
  const colW = (W - M * 2) / 3;
  const boxSize = 10;
  let maxH = 20;
  [mon, wed, sun].forEach((text) => {
    if (text) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      const tLines = doc.splitTextToSize(text, colW - boxSize - 6);
      const h = 20 + tLines.length * 10 + 4;
      if (h > maxH) maxH = h;
    }
  });
  return 16 + maxH + 2; // label + grid + breathing room
}

/** Draw weekly practice checkboxes — compact 3-column grid */
function drawPracticeCompact(
  doc: jsPDF,
  mon: string, wed: string, sun: string,
  M: number, y: number, W: number
): number {
  let yy = sectionLabel(doc, "This Week's Practice", M, y, W);

  const colW = (W - M * 2) / 3;
  const boxSize = 10;

  const items: [string, string][] = [
    ["Mon", mon],
    ["Wed", wed],
    ["Sun", sun],
  ];

  let maxH = 0;
  const cellY = yy;

  items.forEach(([day, text], i) => {
    const cx = M + i * colW;

    doc.setDrawColor(BLUE);
    doc.setLineWidth(0.8);
    doc.rect(cx, cellY, boxSize, boxSize);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(BLUE);
    doc.text(day.toUpperCase(), cx + boxSize + 6, cellY + 7, { charSpace: 1.2 });

    if (text) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(NAVY);
      const tLines = doc.splitTextToSize(text, colW - boxSize - 6);
      doc.text(tLines, cx + boxSize + 6, cellY + 20);
      const h = 20 + tLines.length * 10 + 4;
      if (h > maxH) maxH = h;
    } else {
      if (20 > maxH) maxH = 20;
    }
  });

  yy = cellY + maxH + 2;

  return yy;
}

/** Draw exercise text; returns y after the text (box drawn separately). */
function drawExerciseText(doc: jsPDF, text: string, M: number, y: number, W: number): number {
  let yy = sectionLabel(doc, "Activity", M, y, W);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(NAVY);
  const lines = doc.splitTextToSize(text, W - M * 2);
  doc.text(lines, M, yy);
  yy += lines.length * 11 + 6;

  return yy;
}

function measureExerciseText(doc: jsPDF, text: string, M: number, W: number): number {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  const lines = doc.splitTextToSize(text, W - M * 2);
  return 16 + lines.length * 11 + 6; // label + text + gap
}

/** Draw a subtle footer on all pages */
function drawFooter(doc: jsPDF, W: number, M: number) {
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    const H = doc.internal.pageSize.getHeight();

    doc.setDrawColor(SILVER);
    doc.setLineWidth(0.3);
    doc.line(M, H - 30, W - M, H - 30);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(6);
    doc.setTextColor(GREY);
    doc.text("mindcast.co.nz  |  notice. name. rewire.", M, H - 18, { charSpace: 1.2 });
    doc.text(`${i} / ${pages}`, W - M, H - 18, { align: "right" });
  }
}

/**
 * One A4 portrait page, in slide order:
 * Header → Theme/Session title → The Signal → Reflection →
 * Activity (large blank space, no lines) → This Week's Practice → Footer.
 */
export function generateWorksheetPdf(s: WorksheetSession): jsPDF {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 44;
  const FOOTER_RESERVE = 38;

  const mon = s.weekly_practice_mon || "";
  const wed = s.weekly_practice_wed || "";
  const sun = s.weekly_practice_sun || "";
  const hasPractice = Boolean(mon || wed || sun);

  // --- Measurement pass: reserve the bottom of the page for the practice ---
  const practiceH = hasPractice ? measurePractice(doc, mon, wed, sun, M, W) : 0;
  const exerciseTextH = s.experiential_exercise
    ? measureExerciseText(doc, s.experiential_exercise, M, W)
    : 0;

  const vq1 = (s.video_question_1 || "").trim();
  const vq2 = (s.video_question_2 || "").trim();

  // Fixed content above the activity box.
  let y = 88; // after header
  y += 20 + 2; // theme title (1 line typical)
  if (s.session_title) y += 14;
  if (s.signal_metaphor) {
    doc.setFont("times", "italic");
    doc.setFontSize(11);
    const qLines = (doc.splitTextToSize(`"${s.signal_metaphor}"`, W - M * 2 - 20) as string[]).length;
    y += 16 + Math.max(34, qLines * 13 + 6); // label + quote
  }

  // Video reflective questions (2 answer lines each; drop to 1 when tight).
  const bottomLimit = H - FOOTER_RESERVE - practiceH;
  let vqLineCount = 2;
  let videoQH = measureVideoQuestions(doc, vq1, vq2, M, W, vqLineCount);

  let reflectionPromptH = 0;
  if (s.journaling_prompt) {
    doc.setFont("times", "italic");
    doc.setFontSize(10);
    const pLines = (doc.splitTextToSize(`"${s.journaling_prompt}"`, W - M * 2) as string[]).length;
    reflectionPromptH = 16 + pLines * 13 + 6; // label + prompt
  }

  // Reflection writing lines: fit as many as we can while leaving the
  // activity a generous blank space (min 110pt).
  let lineCount = 0;
  if (s.journaling_prompt) {
    let spaceForLines = bottomLimit - (y + videoQH + reflectionPromptH) - exerciseTextH - 110 - 16;
    if (spaceForLines < 2 * 17 && vqLineCount === 2 && (vq1 || vq2)) {
      // Tight — shrink the video-question answer space to one line each.
      vqLineCount = 1;
      videoQH = measureVideoQuestions(doc, vq1, vq2, M, W, vqLineCount);
      spaceForLines = bottomLimit - (y + videoQH + reflectionPromptH) - exerciseTextH - 110 - 16;
    }
    lineCount = Math.max(2, Math.min(3, Math.floor(spaceForLines / 17)));
  }

  // --- Draw pass ---
  drawHeader(doc, s, W, M);
  y = 88;
  y = drawTitle(doc, s, W, M, y);

  if (s.signal_metaphor) {
    y = sectionLabel(doc, "The Signal", M, y, W);
    y = drawQuote(doc, s.signal_metaphor, M, y, W);
  }

  if (vq1 || vq2) {
    y = drawVideoQuestions(doc, vq1, vq2, M, y, W, vqLineCount);
  }

  if (s.journaling_prompt) {
    y = drawReflection(doc, s.journaling_prompt, M, y, W, lineCount);
  }

  // Activity: instructions, then a large blank box (no lines) that fills
  // whatever space remains above This Week's Practice.
  if (s.experiential_exercise) {
    y = drawExerciseText(doc, s.experiential_exercise, M, y, W);
    const boxTop = y;
    const boxBottom = bottomLimit - 4;
    const boxH = Math.max(40, boxBottom - boxTop);
    doc.setDrawColor(SILVER);
    doc.setLineWidth(0.8);
    doc.roundedRect(M, boxTop, W - M * 2, boxH, 4, 4, "S");
    y = boxTop + boxH + 8;
  }

  if (hasPractice) {
    y = drawPracticeCompact(doc, mon, wed, sun, M, bottomLimit + 2, W);
  }

  drawFooter(doc, W, M);

  return doc;
}

export function downloadWorksheetPdf(s: WorksheetSession) {
  const doc = generateWorksheetPdf(s);
  const filename = `mindcast-week-${String(s.week_number).padStart(2, "0")}-${s.audience.toLowerCase()}.pdf`;
  doc.save(filename);
}

/** Generate PDF and return as a Blob (for server-side / storage upload) */
export async function generateWorksheetPdfBlob(s: WorksheetSession): Promise<Blob> {
  const doc = generateWorksheetPdf(s);
  return doc.output("blob");
}

/** Generate PDF and return as base64 data URI */
export async function generateWorksheetPdfDataUri(s: WorksheetSession): Promise<string> {
  const doc = generateWorksheetPdf(s);
  return doc.output("datauristring");
}
