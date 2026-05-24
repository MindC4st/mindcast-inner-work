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

// Mindcast palette (HSL approximations -> hex)
const NAVY = "#0a1120";
const NAVY_MID = "#3b4660";
const BRONZE = "#b8895a";
const BLUE = "#3585af";
const IVORY = "#fffaf6";
const WARM_BORDER = "#e5dfd6";

export const generateWorksheetPdf = (s: WorksheetSession): jsPDF => {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 48;
  let y = M;

  const ensure = (need: number) => {
    if (y + need > H - M) {
      doc.addPage();
      y = M;
    }
  };

  const label = (text: string) => {
    ensure(20);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(BRONZE);
    doc.text(text.toUpperCase(), M, y, { charSpace: 2 });
    y += 14;
  };

  const body = (text: string, size = 10, color = NAVY) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(size);
    doc.setTextColor(color);
    const lines = doc.splitTextToSize(text || "", W - M * 2);
    ensure(lines.length * (size + 3));
    doc.text(lines, M, y);
    y += lines.length * (size + 3);
  };

  const italic = (text: string, size = 12) => {
    doc.setFont("times", "italic");
    doc.setFontSize(size);
    doc.setTextColor(NAVY);
    const lines = doc.splitTextToSize(`"${text}"`, W - M * 2);
    ensure(lines.length * (size + 4));
    doc.text(lines, M, y);
    y += lines.length * (size + 4);
  };

  const writeLines = (count: number) => {
    ensure(count * 18 + 4);
    doc.setDrawColor(WARM_BORDER);
    doc.setLineWidth(0.5);
    for (let i = 0; i < count; i++) {
      y += 18;
      doc.line(M, y, W - M, y);
    }
    y += 8;
  };

  const divider = () => {
    ensure(20);
    y += 8;
    doc.setDrawColor(WARM_BORDER);
    doc.setLineWidth(0.5);
    doc.line(M, y, W - M, y);
    y += 16;
  };

  // ---- Header ----
  doc.setFillColor(NAVY);
  doc.rect(0, 0, W, 90, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(BRONZE);
  doc.text(`MINDCAST  ·  WEEK ${s.week_number}  ·  ${(s.phase_name || "").toUpperCase()}`, M, 32, { charSpace: 2 });
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(IVORY);
  doc.text(s.theme_title.toUpperCase(), M, 58, { charSpace: 1 });
  doc.setFont("times", "italic");
  doc.setFontSize(11);
  doc.setTextColor(IVORY);
  doc.text(s.session_title || "", M, 76);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(BLUE);
  doc.text(s.audience.toUpperCase(), W - M, 32, { align: "right", charSpace: 2 });
  y = 120;

  // ---- Signal ----
  if (s.signal_metaphor) {
    label("The Signal");
    italic(s.signal_metaphor, 13);
    divider();
  }

  // ---- Reflection ----
  if (s.journaling_prompt) {
    label("Reflection");
    italic(s.journaling_prompt, 11);
    y += 4;
    writeLines(6);
    divider();
  }

  // ---- Exercise ----
  if (s.experiential_exercise) {
    label("Experiential Exercise");
    body(s.experiential_exercise, 10);
    y += 6;
    label("Your Notes");
    writeLines(5);
    divider();
  }

  // ---- Weekly Practice ----
  label("Weekly Practice");
  const practices: [string, string | undefined][] = [
    ["Monday", s.weekly_practice_mon],
    ["Wednesday", s.weekly_practice_wed],
    ["Sunday", s.weekly_practice_sun],
  ];
  practices.forEach(([day, txt]) => {
    if (!txt) return;
    ensure(48);
    // checkbox
    doc.setDrawColor(BLUE);
    doc.setLineWidth(1);
    doc.rect(M, y - 2, 12, 12);
    // day
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(BLUE);
    doc.text(day.toUpperCase(), M + 22, y + 7, { charSpace: 1.5 });
    // text
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(NAVY);
    const lines = doc.splitTextToSize(txt, W - M * 2 - 22);
    doc.text(lines, M + 22, y + 22);
    y += 22 + lines.length * 13 + 8;
  });
  divider();

  // ---- Affirmation ----
  if (s.core_affirmation) {
    ensure(90);
    const boxY = y;
    const boxH = 80;
    doc.setDrawColor(BRONZE);
    doc.setLineWidth(0.8);
    doc.setFillColor(252, 247, 240);
    doc.roundedRect(M, boxY, W - M * 2, boxH, 4, 4, "FD");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(BRONZE);
    doc.text("AFFIRMATION", W / 2, boxY + 18, { align: "center", charSpace: 2.5 });
    doc.setFont("times", "italic");
    doc.setFontSize(14);
    doc.setTextColor(NAVY);
    const aff = doc.splitTextToSize(`"${s.core_affirmation}"`, W - M * 2 - 40);
    doc.text(aff, W / 2, boxY + 44, { align: "center" });
    y = boxY + boxH + 16;
  }

  // ---- Notes ----
  ensure(40);
  label("Notes");
  const remaining = H - M - y;
  const noteLines = Math.max(4, Math.floor(remaining / 18) - 1);
  writeLines(noteLines);

  // ---- Footer ----
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(NAVY_MID);
    doc.text("mindcast.co.nz  ·  notice. name. rewire.", M, H - 20, { charSpace: 1.5 });
    doc.text(`${i} / ${pages}`, W - M, H - 20, { align: "right" });
  }

  return doc;
};

export const downloadWorksheetPdf = (s: WorksheetSession) => {
  const doc = generateWorksheetPdf(s);
  const filename = `mindcast-week-${String(s.week_number).padStart(2, "0")}-${s.audience.toLowerCase()}.pdf`;
  doc.save(filename);
};
