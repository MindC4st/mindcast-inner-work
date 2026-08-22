import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// The /curriculum page renders an HTML facsimile of the printed worksheet:
// same ink, same rule colour, same footer line, same corner badges. That only
// means anything if the two stay in step. These tests read the PDF generator
// and the screen component and assert they still agree, so re-tuning the
// printed page fails the build rather than quietly making the marketing page
// a picture of something that no longer exists.

const root = resolve(__dirname, "../..");
const pdf = readFileSync(resolve(root, "src/lib/generateWorksheetPdf.ts"), "utf8");
const sheet = readFileSync(resolve(root, "src/components/curriculum/WorkbookPage.tsx"), "utf8");

/** Pull a `const NAME: [number, number, number] = [0xAA, 0xBB, 0xCC]` as #AABBCC. */
const pdfColour = (name: string): string => {
  const m = pdf.match(new RegExp(`const ${name}[^=]*=\\s*\\[([^\\]]+)\\]`));
  if (!m) throw new Error(`${name} not found in generateWorksheetPdf.ts`);
  const hex = m[1]
    .split(",")
    .map((v) => Number(v.trim()).toString(16).padStart(2, "0"))
    .join("");
  return `#${hex.toUpperCase()}`;
};

/** Pull a plain `const NAME = 123;` numeric constant. */
const pdfNumber = (name: string): number => {
  const m = pdf.match(new RegExp(`const ${name}\\s*=\\s*([\\d.]+)`));
  if (!m) throw new Error(`${name} not found in generateWorksheetPdf.ts`);
  return Number(m[1]);
};

/** Pull an exported string constant from the screen component. */
const screenColour = (name: string): string => {
  const m = sheet.match(new RegExp(`export const ${name} = "([^"]+)"`));
  if (!m) throw new Error(`${name} not exported from WorkbookPage.tsx`);
  return m[1].toUpperCase();
};

describe("the screen worksheet matches the printed one", () => {
  it("uses the same ink", () => {
    expect(screenColour("INK")).toBe(pdfColour("INK"));
  });

  it("uses the same Signal Deep for coloured text", () => {
    // MC-BRD-001: all coloured text under 24pt is Signal Deep, which is the
    // weight that stays AA-legible on ivory.
    expect(screenColour("SIGNAL_DEEP")).toBe(pdfColour("SIGNAL_DEEP"));
  });

  it("uses the same photocopy-safe rule colour", () => {
    expect(screenColour("RULE")).toBe(pdfColour("RULE"));
  });

  it("keeps the page gutter proportional to the printed margin", () => {
    // 50pt on a 595.28pt page. The component works in percentages so the
    // sheet holds its proportions at any width.
    const expected = (pdfNumber("LEFT") / pdfNumber("PAGE_W")) * 100;
    const m = sheet.match(/const MARGIN = "([\d.]+)%"/);
    expect(m, "MARGIN not found in WorkbookPage.tsx").not.toBeNull();
    expect(Number(m![1])).toBeCloseTo(expected, 1);
  });

  it("carries the line every printed page carries", () => {
    expect(pdf).toContain("NOTICE IT. NAME IT. DO IT.");
    expect(sheet).toContain("NOTICE IT. NAME IT. DO IT.");
  });

  it("sets ruled writing lines at roughly the printed pitch", () => {
    // WRITING_PITCH is in points; the screen sets pixels. They only need to
    // stay in the same neighbourhood — this catches somebody halving it.
    const pitch = pdfNumber("WRITING_PITCH");
    const m = sheet.match(/h-\[(\d+)px\] border-b/);
    expect(m, "ruled line height not found").not.toBeNull();
    expect(Math.abs(Number(m![1]) - pitch)).toBeLessThanOrEqual(6);
  });
});

describe("the page reads as paper, not as a card", () => {
  it("gives the sheet a shadow and no border", () => {
    // A border makes it a card again. A shadow makes it a sheet lying on the
    // ivory page beneath — which is the whole point of the treatment.
    const article = sheet.slice(sheet.indexOf("motion.article"), sheet.indexOf("</motion.article>"));
    expect(article).toContain("boxShadow");
    expect(article).not.toMatch(/className="[^"]*\bborder\b(?!-)/);
  });

  it("offers expandable content rather than one long scroll", () => {
    const preview = readFileSync(
      resolve(root, "src/components/curriculum/WeekOnePreview.tsx"), "utf8");
    expect(sheet).toContain("export const Fold");
    // Every track sheet folds; a track that dumps everything at once has
    // regressed to the wall of text this replaced.
    for (const s of ["AdultSheet", "TeenSheet", "ChildSheet"]) {
      const body = preview.slice(preview.indexOf(`const ${s}`), preview.indexOf(`const ${s}`) + 2600);
      expect(body, `${s} has no Fold`).toContain("<Fold");
    }
  });
});
