// @vitest-environment node
import { it } from "vitest";
import { generateWorksheetPdf } from "@/lib/generateWorksheetPdf";
import fixture from "./fixtures/worksheet-curriculum.json";
it("debug extract", async () => {
  const worker = await import("pdfjs-dist/legacy/build/pdf.worker.mjs");
  (globalThis as any).pdfjsWorker = worker;
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const s = (fixture as any[])[0];
  const doc = generateWorksheetPdf(s as any);
  const pdf = await pdfjs.getDocument({ data: new Uint8Array(doc.output("arraybuffer")), isEvalSupported: false }).promise;
  let out = "";
  for (let p = 1; p <= pdf.numPages; p++) {
    const page = await pdf.getPage(p);
    const tc = await page.getTextContent();
    out += tc.items.map((i: any) => i.str).join("|");
  }
  console.log("EXTRACTED>>>" + out.replace(/\s+/g, "") + "<<<");
});
