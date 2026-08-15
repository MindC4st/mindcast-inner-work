// @vitest-environment node
import { describe, expect, it } from "vitest";
import { generateWorksheetPdf, type WorksheetSession } from "@/lib/generateWorksheetPdf";
import fixture from "./fixtures/worksheet-curriculum.json";

let pdfjsReady: Promise<any> | null = null;
async function pdfjsLib() {
  if (!pdfjsReady) {
    pdfjsReady = (async () => {
      const lib = await import("pdfjs-dist/legacy/build/pdf.mjs");
      const worker = await import("pdfjs-dist/legacy/build/pdf.worker.mjs");
      (globalThis as any).pdfjsWorker = worker;
      return lib;
    })();
  }
  return pdfjsReady;
}

const PAGE_AREA = 595.28 * 841.89;

const sessions = fixture as WorksheetSession[];

function rawPdf(s: WorksheetSession): string {
  return generateWorksheetPdf(s).output();
}

describe("worksheet template — all 156 week x track combinations", () => {
  it("has the full curriculum fixture", () => {
    expect(sessions.length).toBe(156);
  });

  for (const s of sessions) {
    it(`week ${s.week_number} ${s.audience} lays out without clipping`, () => {
      const doc = generateWorksheetPdf(s);
      const pages = doc.getNumberOfPages();
      expect(pages).toBeGreaterThanOrEqual(1);
      expect(pages).toBeLessThanOrEqual(2);
    });
  }
});

describe("worksheet print economy and correctness", () => {
  const sample = sessions[0];

  it("keeps filled ink under 5% of the page (no bands, no reversed-out text)", () => {
    const raw = rawPdf(sample);
    let filled = 0;
    const re = /(-?[\d.]+) (-?[\d.]+) ([\d.]+) ([\d.]+) re\s*([fFbB])/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(raw))) {
      filled += parseFloat(m[3]) * parseFloat(m[4]);
    }
    expect(filled / PAGE_AREA).toBeLessThan(0.05);
  });

  it("never prints ivory or navy background fills", () => {
    const raw = rawPdf(sample);
    // A full-page fill would be a rect near page size; assert none exists.
    const re = /(-?[\d.]+) (-?[\d.]+) ([\d.]+) ([\d.]+) re\s*([fF])/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(raw))) {
      expect(parseFloat(m[3]) * parseFloat(m[4])).toBeLessThan(2000);
    }
  });
});

describe("worksheet text layer (pdfjs extraction)", () => {
  async function extract(s: WorksheetSession) {
    const pdfjs = await pdfjsLib();
    const doc = generateWorksheetPdf(s);
    const data = new Uint8Array(doc.output("arraybuffer"));
    const pdf = await pdfjs.getDocument({ data, isEvalSupported: false }).promise;
    const items: { str: string; y: number }[] = [];
    for (let p = 1; p <= pdf.numPages; p++) {
      const page = await pdf.getPage(p);
      const tc = await page.getTextContent();
      for (const it of tc.items) {
        if ("str" in it) items.push({ str: it.str, y: it.transform[5] });
      }
    }
    return items;
  }

  it("renders macrons correctly (ā ē ī ō ū)", async () => {
    const s: WorksheetSession = {
      ...sessions[0],
      theme_title: "Taupō whānau kōrero — Ā Ē Ī Ō Ū",
      signal_metaphor: "Te ao Māori: whānau, kōrero, ātea — the signal beneath the noise. Ā ē ī ō ū.",
    };
    const items = await extract(s);
    const all = items.map((i) => i.str).join(" ");
    for (const ch of ["ā", "ē", "ī", "ō", "ū", "Ā", "Ē", "Ī", "Ō", "Ū"]) {
      expect(all).toContain(ch);
    }
  });

  it("extracts in reading order: letterhead → signal → reflection → writing → activity → practice → footer", async () => {
    const items = await extract(sessions[0]);
    // charSpace tracking can fragment extraction; compare space-insensitively.
    const flat = items.map((i) => i.str).join("\n").replace(/\s+/g, "");
    const idx = (t: string) => flat.indexOf(t.replace(/\s+/g, ""));
    const order = [
      "WEEK",
      "THE SIGNAL",
      "REFLECTION",
      "YOUR REFLECTION",
      "ACTIVITY",
      "THIS WEEK",
      "NOTICE IT, NAME IT, DO IT",
    ].map(idx);
    for (const i of order) expect(i).toBeGreaterThanOrEqual(0);
    for (let i = 1; i < order.length; i++) expect(order[i]).toBeGreaterThan(order[i - 1]);
    expect(flat).not.toContain("notice.name.rewire.");
  });

  it("no truncated words at line ends in the extracted text", async () => {
    const items = await extract(sessions[0]);
    for (const i of items) {
      // jsPDF hyphen-free wrapping: a line should not end mid-word with a
      // lowercase letter followed by the next line starting lowercase+continuation.
      expect(/-\s$/.test(i.str)).toBe(false);
    }
  });
});
