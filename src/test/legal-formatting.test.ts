import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import path from "path";

// Legal-page formatting is owned by LegalPage + the Tailwind Typography
// plugin. jsdom can't compute generated CSS, so these tests pin the things
// that make the formatting real: the plugin enabled, the prose contract in
// LegalPage, and every legal page rendering through the same component.

const root = process.cwd();
const read = (p: string) => readFileSync(path.resolve(root, p), "utf8");

describe("legal page formatting", () => {
  it("11. the Tailwind Typography plugin is enabled (prose utilities generate)", () => {
    const config = read("tailwind.config.ts");
    expect(config).toContain('@tailwindcss/typography');
    expect(config).toMatch(/plugins:\s*\[[^\]]*typography[^\]]*\]/);
  });

  it("11b. LegalPage defines the shared prose contract", () => {
    const legal = read("src/components/legal/LegalPage.tsx");
    // The spacing contract: headings, paragraphs, lists all styled.
    expect(legal).toContain("prose");
    expect(legal).toContain("prose-h2:mt-12");
    expect(legal).toContain("prose-h2:mb-6");
    expect(legal).toContain("prose-p:leading-[1.8]");
    expect(legal).toContain("prose-p:my-6");
    expect(legal).toContain("prose-li:my-3");
  });

  it("12. Privacy / Terms / Refund / Safeguarding / Contact all render through LegalPage", () => {
    for (const page of ["PrivacyPage", "TermsPage", "RefundPage", "SafeguardingPage", "ContactPage"]) {
      const src = read(`src/pages/${page}.tsx`);
      expect(src, `${page} must use LegalPage`).toContain("LegalPage");
    }
  });

  it("13. paragraph / H2 / list spacing is part of the contract", () => {
    const legal = read("src/components/legal/LegalPage.tsx");
    // Clear separation before every H2 and between paragraphs/lists.
    expect(legal).toContain("prose-h2:mt-12");
    expect(legal).toContain("prose-p:my-6");
    expect(legal).toContain("prose-li:leading-[1.7]");
    expect(legal).toContain("prose-h3:mt-10");
  });

  it("14. long emails/URLs/legislation names wrap — no horizontal overflow", () => {
    const legal = read("src/components/legal/LegalPage.tsx");
    // Container-level wrapping plus link-level break-all for long URLs.
    expect(legal).toContain("break-words");
    expect(legal).toContain("prose-a:break-all");
    // The layout stays constrained-width.
    expect(legal).toContain("max-w-3xl");
  });
});
