// @vitest-environment node
import { describe, expect, it } from "vitest";
import {
  generateWorksheetPdf,
  worksheetPageKeysForTrack,
  type WorksheetSession,
} from "@/lib/generateWorksheetPdf";
import fixture from "./fixtures/worksheet-curriculum.json";

type PdfJs = typeof import("pdfjs-dist/legacy/build/pdf.mjs");
let pdfjsReady: Promise<PdfJs> | null = null;
async function pdfjsLib(): Promise<PdfJs> {
  if (!pdfjsReady) {
    pdfjsReady = (async () => {
      const lib = await import("pdfjs-dist/legacy/build/pdf.mjs");
      const worker = await import("pdfjs-dist/legacy/build/pdf.worker.mjs");
      (globalThis as unknown as { pdfjsWorker: unknown }).pdfjsWorker = worker;
      return lib;
    })();
  }
  return pdfjsReady;
}

const PAGE_AREA = 595.28 * 841.89;
const sessions = fixture as WorksheetSession[];
const flat = (value: string) => value.replace(/\s+/g, "").toUpperCase();

async function extractPages(session: WorksheetSession) {
  const pdfjs = await pdfjsLib();
  const data = new Uint8Array(generateWorksheetPdf(session).output("arraybuffer"));
  const pdf = await pdfjs.getDocument({ data }).promise;
  const pages: Array<{ text: string; ys: number[] }> = [];
  for (let p = 1; p <= pdf.numPages; p++) {
    const page = await pdf.getPage(p);
    const tc = await page.getTextContent();
    const text: string[] = [];
    const ys: number[] = [];
    for (const item of tc.items) {
      if ("str" in item) {
        text.push(item.str);
        ys.push(item.transform[5]);
      }
    }
    pages.push({ text: text.join(" "), ys });
  }
  return pages;
}

describe("worksheet template - live sequence parity", () => {
  it("has the full 52 week x three track curriculum fixture", () => {
    expect(sessions).toHaveLength(156);
  });

  it("maps Adult and Teen to eight pages and Child to nine", () => {
    expect(worksheetPageKeysForTrack("Adult")).toEqual([
      "welcome", "voices", "ancient", "video", "deeper", "reflection", "intention", "affirmation",
    ]);
    expect(worksheetPageKeysForTrack("Teen")).toHaveLength(8);
    expect(worksheetPageKeysForTrack("Child")).toEqual([
      "welcome", "voices", "ancient", "video", "coloring", "deeper", "reflection", "intention", "closing_game",
    ]);
  });

  for (const session of sessions) {
    it(`week ${session.week_number} ${session.audience} renders the exact live page count`, () => {
      const pages = generateWorksheetPdf(session).getNumberOfPages();
      expect(pages).toBe(session.audience === "Child" ? 9 : 8);
    });
  }
});

describe("worksheet print design", () => {
  const sample = sessions[0];

  it("uses pale writing surfaces without a full-page background fill", () => {
    const doc = generateWorksheetPdf(sample);
    const raw = doc.output();
    let filled = 0;
    const rectangles = /(-?[\d.]+) (-?[\d.]+) ([\d.]+) ([\d.]+) re\s*([fFbB])/g;
    let match: RegExpExecArray | null;
    while ((match = rectangles.exec(raw))) {
      const area = parseFloat(match[3]) * parseFloat(match[4]);
      filled += area;
      expect(area).toBeLessThan(PAGE_AREA * 0.5);
    }
    expect(filled / (PAGE_AREA * doc.getNumberOfPages())).toBeLessThan(0.55);
  });

  it("keeps every text item inside the printable page", async () => {
    const pages = await extractPages(sample);
    for (const page of pages) {
      for (const y of page.ys) {
        expect(y).toBeGreaterThan(20);
        expect(y).toBeLessThan(825);
      }
    }
  });
});

describe("worksheet text layer and page order", () => {
  const adult: WorksheetSession = {
    ...sessions[0],
    opening_question: "What are you actually receiving?",
    previous_week_callback: "Notice one signal beneath the noise.",
    ancient_wisdom_reframe: "Attention has always shaped experience.",
    video_question_1: "What was the speaker's central idea?",
    video_question_2: "Where does it show up in your life?",
    thought_provoking_question: "What changes when you choose the signal?",
    private_write_prompt: "Name one invisible load you have been carrying.",
    intention_prompt: "Choose one specific signal to follow this week.",
    practice_sun_today: "Catch the hum once today.",
    practice_midweek: "Name one visible responsibility.",
    practice_fri: "Move from helping to owning.",
    closing_quote: "My attention is mine to direct.",
  };

  it("renders one live beat per Adult page in the signed-off order", async () => {
    const pages = await extractPages(adult);
    const titles = [
      "WELCOME + OPENING QUESTION",
      "RETURN TO YOUR INTENTION",
      "INNER WISDOM + IN TODAY'S WORLD",
      "THIS WEEK'S LISTEN",
      "GO DEEPER + TOGETHER",
      "REFLECT & SHARE",
      "BEFORE YOU LEAVE",
      "CLOSING AFFIRMATION",
    ];
    expect(pages).toHaveLength(8);
    pages.forEach((page, index) => {
      expect(flat(page.text)).toContain(flat(titles[index]));
      expect(flat(page.text)).toContain(flat(`${index + 1} / 8`));
    });
  });

  it("inserts colouring before Go Deeper in the nine-page Child workbook", async () => {
    const child: WorksheetSession = {
      ...adult,
      audience: "Child",
      kids_picture_book: "The Colour Monster",
      kids_picture_book_author: "Anna Llenas",
      kids_picture_book_question: "Which colour feels most like today?",
      kids_colouring_prompt: "Colour the feelings you can notice.",
      kids_game: "Match a colour to a feeling, then choose a safe action.",
      kids_game_equipment: "Colour cards and a clear space to move.",
      kids_game_under5: "Use two colours and let children copy the facilitator.",
    };
    const pages = await extractPages(child);
    expect(pages).toHaveLength(9);
    expect(flat(pages[4].text)).toContain(flat("COLOURING ACTIVITY"));
    expect(flat(pages[5].text)).toContain(flat("GO DEEPER + TOGETHER"));
    expect(flat(pages[8].text)).toContain(flat("THE CLOSING GAME / ACTIVITY"));
    expect(flat(pages[8].text)).toContain(flat("WHAT YOU NEED"));
    expect(flat(pages[8].text)).toContain(flat("9 / 9"));
  });

  it("renders macrons correctly", async () => {
    const session: WorksheetSession = {
      ...adult,
      theme_title: "Taupō whānau kōrero - Ā Ē Ī Ō Ū",
      signal_metaphor: "Te ao Māori: whānau, kōrero, ātea. Ā ē ī ō ū.",
    };
    const all = (await extractPages(session)).map((page) => page.text).join(" ");
    for (const character of ["ā", "ē", "ī", "ō", "ū", "Ā", "Ē", "Ī", "Ō", "Ū"]) {
      expect(all).toContain(character);
    }
  });

  it("does not restore the retired tagline", async () => {
    const all = flat((await extractPages(adult)).map((page) => page.text).join(" "));
    expect(all).not.toContain(flat("notice.name.rewire."));
    expect(all).toContain(flat("NOTICE IT. NAME IT. DO IT."));
  });
});
