import jsPDF from "jspdf";

export type WorksheetSession = {
  week_number: number;
  phase_name?: string;
  theme_title: string;
  session_title?: string;
  audience: string;
  signal_metaphor?: string;
  journaling_prompt?: string;
  experiential_exercise?: string;
  weekly_practice_mon?: string;
  weekly_practice_wed?: string;
  weekly_practice_sun?: string;
  core_affirmation?: string;
};

// Mindcast brand palette
const NAVY = "#0a1120";
const NAVY_MID = "#3b4660";
const BRONZE = "#b8895a";
const BLUE = "#3585af";
const BLUE_LIGHT = "#5ba0c9";
const IVORY = "#fffaf6";
const WARM_BORDER = "#e5dfd6";
const CREAM_BG = "#f8f4ef";

/** Draw the navy header bar with text-only Mindcast logo */
function drawHeader(doc: jsPDF, s: WorksheetSession, W: number, M: number) {
  const barH = 72;
  doc.setFillColor(NAVY);
  doc.rect(0, 0, W, barH, "F");

  // Left: "M" letter mark (stylised)
  doc.setFillColor(BRONZE);
  doc.roundedRect(M, 14, 22, 22, 3, 3, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(IVORY);
  doc.text("M", M + 6, 30);

  // Mindcast wordmark
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(IVORY);
  doc.text("MINDCAST", M + 32, 23, { charSpace: 1.5 });

  // Tagline
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6);
  doc.setTextColor(IVORY);
  doc.text("notice. name. rewire.", M + 32, 33);

  // Right: audience badge
  doc.setFillColor(BLUE);
  doc.roundedRect(W - M - 48, 12, 48, 18, 2, 2, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6);
  doc.setTextColor(IVORY);
  doc.text(s.audience.toUpperCase(), W - M - 24, 24, { align: "center", charSpace: 1.5 });

  // Week number badge
  doc.setFillColor(NAVY_MID);
  doc.roundedRect(W - M - 48, 34, 48, 18, 2, 2, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(BRONZE);
  doc.text(`WEEK ${s.week_number}`, W - M - 24, 46, { align: "center", charSpace: 1.5 });

  // Phase
  if (s.phase_name) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(5.5);
    doc.setTextColor(IVORY);
    doc.text((s.phase_name || "").toUpperCase(), W - M - 24, 63, { align: "center", charSpace: 1.2 });
  }
}

/** Draw the theme title area below the header */
function drawTitle(doc: jsPDF, s: WorksheetSession, W: number, M: number, y: number): number {
  let yy = y;

  // Theme title — large
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(NAVY);
  const themeLines = doc.splitTextToSize(s.theme_title.toUpperCase(), W - M * 2);
  doc.text(themeLines, M, yy);
  yy += themeLines.length * 22 + 2;

  // Session subtitle
  if (s.session_title) {
    doc.setFont("times", "italic");
    doc.setFontSize(10);
    doc.setTextColor(NAVY_MID);
    doc.text(s.session_title, M, yy);
    yy += 16;
  }

  return yy;
}

/** Draw a section label */
function sectionLabel(doc: jsPDF, text: string, M: number, y: number, W: number): number {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(BRONZE);
  doc.text(text.toUpperCase(), M, y, { charSpace: 2 });

  // Underline accent
  doc.setDrawColor(BRONZE);
  doc.setLineWidth(0.5);
  doc.line(M, y + 2, M + 40, y + 2);

  return y + 16;
}

/** Draw an italic quote (the Signal) */
function drawQuote(doc: jsPDF, text: string, M: number, y: number, W: number): number {
  let yy = y;

  // Left decorative accent
  doc.setDrawColor(BLUE_LIGHT);
  doc.setLineWidth(2);
  doc.line(M, yy, M, yy + 40);

  doc.setFont("times", "italic");
  doc.setFontSize(11);
  doc.setTextColor(NAVY);
  const lines = doc.splitTextToSize(`"${text}"`, W - M * 2 - 20);
  doc.text(lines, M + 14, yy + 6);
  yy += Math.max(40, lines.length * 13 + 6);

  return yy;
}

/** Draw journaling prompt + writing lines */
function drawReflection(doc: jsPDF, prompt: string, M: number, y: number, W: number, lineCount = 5): number {
  let yy = sectionLabel(doc, "Reflection", M, y, W);

  // Prompt
  doc.setFont("times", "italic");
  doc.setFontSize(10);
  doc.setTextColor(NAVY);
  const lines = doc.splitTextToSize(`"${prompt}"`, W - M * 2);
  doc.text(lines, M, yy);
  yy += lines.length * 13 + 6;

  // Writing lines
  doc.setDrawColor(WARM_BORDER);
  doc.setLineWidth(0.5);
  for (let i = 0; i < lineCount; i++) {
    yy += 18;
    doc.line(M, yy, W - M, yy);
  }
  yy += 10;

  return yy;
}

/** Draw weekly practice checkboxes — compact 3-column grid */
function drawPracticeCompact(
  doc: jsPDF,
  mon: string, wed: string, sun: string,
  M: number, y: number, W: number
): number {
  let yy = sectionLabel(doc, "This Week's Practice", M, y, W);

  const colW = (W - M * 2) / 3;
  const gap = 10;
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

    // Checkbox
    doc.setDrawColor(BLUE);
    doc.setLineWidth(0.8);
    doc.rect(cx, cellY, boxSize, boxSize);

    // Day label
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(BLUE);
    doc.text(day.toUpperCase(), cx + boxSize + 6, cellY + 7, { charSpace: 1.2 });

    // Text
    if (text) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(NAVY);
      const tLines = doc.splitTextToSize(text, colW - boxSize - 6);
      doc.text(tLines, cx + boxSize + 6, cellY + 20);
      const h = 20 + tLines.length * 10 + 6;
      if (h > maxH) maxH = h;
    } else {
      if (20 > maxH) maxH = 20;
    }
  });

  yy = cellY + maxH + 4;

  return yy;
}

/** Draw exercise section */
function drawExercise(doc: jsPDF, text: string, M: number, y: number, W: number): number {
  let yy = sectionLabel(doc, "Activity", M, y, W);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(NAVY);
  const lines = doc.splitTextToSize(text, W - M * 2);
  doc.text(lines, M, yy);
  yy += lines.length * 11 + 6;

  // A few note lines
  doc.setDrawColor(WARM_BORDER);
  doc.setLineWidth(0.5);
  const noteLines = Math.min(3, Math.floor((50) / 18));
  for (let i = 0; i < noteLines; i++) {
    yy += 18;
    doc.line(M, yy, W - M, yy);
  }
  yy += 10;

  return yy;
}

/** Draw a subtle footer on all pages */
function drawFooter(doc: jsPDF, W: number, M: number) {
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    const H = doc.internal.pageSize.getHeight();

    // Separation line
    doc.setDrawColor(WARM_BORDER);
    doc.setLineWidth(0.3);
    doc.line(M, H - 30, W - M, H - 30);

    // Footer text
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6);
    doc.setTextColor(NAVY_MID);
    doc.text("mindcast.co.nz  |  notice. name. rewire.", M, H - 18, { charSpace: 1.2 });
    doc.text(`${i} / ${pages}`, W - M, H - 18, { align: "right" });
  }
}

/** Check if content will overflow — if so, we know we need page 2 */
function wouldOverflow(currentY: number, need: number, H: number, M: number): boolean {
  return currentY + need > H - M;
}

export function generateWorksheetPdf(s: WorksheetSession): jsPDF {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 44;
  let y = M;

  // === PAGE 1 ===
  drawHeader(doc, s, W, M);
  y = 92; // after header
  y = drawTitle(doc, s, W, M, y);

  // The Signal
  if (s.signal_metaphor) {
    y = sectionLabel(doc, "The Signal", M, y, W);
    y = drawQuote(doc, s.signal_metaphor, M, y, W);
  }

  // Reflection (compact: 4 lines)
  if (s.journaling_prompt) {
    const lineCount = wouldOverflow(y, 120, H, M) ? 3 : 4;
    y = drawReflection(doc, s.journaling_prompt, M, y, W, lineCount);
  }

  // Weekly Practice (compact grid)
  if (s.weekly_practice_mon || s.weekly_practice_wed || s.weekly_practice_sun) {
    if (wouldOverflow(y, 90, H, M)) {
      // pushes to page 2
      doc.addPage();
      y = M;
    }
    y = drawPracticeCompact(doc,
      s.weekly_practice_mon || "",
      s.weekly_practice_wed || "",
      s.weekly_practice_sun || "",
      M, y, W
    );
  }

  // === PAGE 2 (if needed) ===
  // Exercise/Activity — pushes to new page
  if (s.experiential_exercise) {
    // Check if we need a new page
    if (wouldOverflow(y, 80, H, M)) {
      doc.addPage();
      y = M;
    } else {
      y += 6;
    }
    y = drawExercise(doc, s.experiential_exercise, M, y, W);
  }

  // Notes — fill remaining space with writing lines
  {
    const remaining = H - M - y;
    if (remaining > 40) {
      y = sectionLabel(doc, "Notes", M, y, W);
      const noteLines = Math.max(2, Math.min(8, Math.floor((remaining - 30) / 18)));
      doc.setDrawColor(WARM_BORDER);
      doc.setLineWidth(0.5);
      for (let i = 0; i < noteLines; i++) {
        y += 18;
        doc.line(M, y, W - M, y);
      }
    }
  }

  // Footer on all pages
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
