// @vitest-environment node
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
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

describe("one-page worksheet contract", () => {
  it("has the full 52 week x three track curriculum fixture", () => {
    expect(sessions).toHaveLength(156);
  });

  it("maps every track to one A4 worksheet rather than one page per slide", () => {
    for (const track of ["Adult", "Teen", "Child"]) {
      expect(worksheetPageKeysForTrack(track)).toEqual(["worksheet"]);
    }
  });

  for (const session of sessions) {
    it(`week ${session.week_number} ${session.audience} renders one page`, () => {
      expect(generateWorksheetPdf(session).getNumberOfPages()).toBe(1);
    });
  }
});

describe("print-cost and binder rules", () => {
  const source = readFileSync(resolve(__dirname, "../lib/generateWorksheetPdf.ts"), "utf8");
  const sample = sessions[0];

  it("does not draw binder holes, slide tabs or coloured panel fills", () => {
    expect(source).not.toContain("drawBinderHoles");
    expect(source).not.toContain("drawTabs");
    expect(source).not.toContain("PALE_BLUE");
    expect(source).not.toContain("WORKBOOK PAGE");
    const raw = generateWorksheetPdf(sample).output();
    expect(raw).not.toMatch(/[\d.]+ [\d.]+ [\d.]+ [\d.]+ re\s*[fF]/);
  });

  it("keeps every text item inside the printable page", async () => {
    const [page] = await extractPages(sample);
    for (const y of page.ys) {
      expect(y).toBeGreaterThan(20);
      expect(y).toBeLessThan(825);
    }
  });
});

describe("connected fields and adaptive activity space", () => {
  const adult: WorksheetSession = {
    ...sessions[0],
    theme_title: "The Signal and the Noise",
    session_title: "What Are You Actually Receiving?",
    signal_metaphor: "Your mind is a phone with many tabs open. Choose the one signal that matters.",
    journaling_prompt: "What quiet signal is the noise drowning out?",
    workbook_activity: "Make the invisible visible. Two columns: “Visible tasks” and “Invisible load”.",
    activity_type: "whiteboard",
    practice_sun_today: "Catch the hum once today.",
    practice_midweek: "Name one invisible responsibility.",
    practice_fri: "Choose one concrete next step.",
  };

  it("puts only the compact worksheet sections on one page", async () => {
    const [page] = await extractPages(adult);
    const text = flat(page.text);
    for (const heading of ["THE SIGNAL", "YOUR REFLECTION", "ACTIVITY", "THIS WEEK'S PRACTICE", "1 / 1"]) {
      expect(text).toContain(flat(heading));
    }
    expect(text).toContain(flat("VISIBLE TASKS"));
    expect(text).toContain(flat("INVISIBLE LOAD"));
    expect(text).not.toContain(flat("CLOSING AFFIRMATION"));
  });

  it("renders scale and choice controls from the connected activity fields", async () => {
    const scale = flat((await extractPages({ ...adult, activity_type: "scale", workbook_activity: "Rate yourself from 1 to 10." }))[0].text);
    expect(scale).toContain(flat("NOT AT ALL"));
    expect(scale).toContain(flat("VERY MUCH"));

    const choice = flat((await extractPages({
      ...adult,
      activity_type: "choice",
      activity_options: "Pause | Ask | Share | Rest",
      workbook_activity: "Choose the response you want to practise.",
    }))[0].text);
    for (const option of ["Pause", "Ask", "Share", "Rest"]) expect(choice).toContain(flat(option));
  });

  it("keeps the Child colouring page and closing game out of the worksheet", async () => {
    const child: WorksheetSession = {
      ...adult,
      audience: "Child",
      kids_picture_book_question: "Which colour feels most like today?",
      workbook_activity: "Draw the signal you noticed in the story.",
    };
    const all = flat((await extractPages(child))[0].text);
    expect(all).toContain(flat("DRAW OR WRITE YOUR REFLECTION"));
    expect(all).not.toContain(flat("COLOURING ACTIVITY"));
    expect(all).not.toContain(flat("THE CLOSING GAME"));
  });

  it("renders macrons correctly", async () => {
    const all = (await extractPages({
      ...adult,
      theme_title: "Taupō whānau kōrero - Ā Ē Ī Ō Ū",
      signal_metaphor: "Te ao Māori: whānau, kōrero, ātea. Ā ē ī ō ū.",
    }))[0].text;
    for (const character of ["ā", "ē", "ī", "ō", "ū", "Ā", "Ē", "Ī", "Ō", "Ū"]) {
      expect(all).toContain(character);
    }
  });

  it("does not restore the retired tagline", async () => {
    const all = flat((await extractPages(adult))[0].text);
    expect(all).not.toContain(flat("notice.name.rewire."));
    expect(all).toContain(flat("NOTICE IT. NAME IT. DO IT."));
  });
});

describe("paid portal worksheet access", () => {
  const root = resolve(__dirname, "../..");
  const downloads = readFileSync(resolve(root, "src/pages/portal/PortalDownloads.tsx"), "utf8");
  const migration = readFileSync(
    resolve(root, "supabase/migrations/20260830140000_curriculum_worksheet_fields.sql"),
    "utf8",
  );

  it("defaults teen accounts to their own track and gates downloads on membership", () => {
    expect(downloads).toContain("useEntitlement");
    expect(downloads).toContain("setAudience(track)");
    expect(downloads).toContain("const canDownload = isAdmin || isMember");
    expect(downloads).toContain("db.rpc(\"curriculum_for_track\"");
  });

  it("whitelists the worksheet activity fields in the track-safe RPC", () => {
    for (const field of ["workbook_activity", "activity_type", "activity_options", "kids_activity_type"]) {
      expect(migration).toContain(`'${field}'`);
    }
    expect(migration).toContain("public.can_access_track(v_audience)");
    expect(migration).toContain("public.lesson_unlocked(c.week_number)");
  });
});
