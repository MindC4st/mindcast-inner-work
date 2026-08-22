import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const read = (path: string) => readFileSync(resolve(root, path), "utf8");

describe("teen portal is read-only", () => {
  it("does not render the digital journal for Teen or Child tracks", () => {
    const week = read("src/pages/portal/PortalWeek.tsx");
    expect(week).toContain('track !== "Child" && track !== "Teen"');
    expect(week).toContain("Teen accounts do not include a digital journal.");
  });

  it("keeps teen navigation to history, downloads, profile and the door pass", () => {
    const layout = read("src/components/portal/PortalLayout.tsx");
    expect(layout).toContain('const isTeen = profile?.age_group?.toLowerCase() === "teen"');
    expect(layout).toContain('["Dashboard", "Sessions", "Profile", "Door pass"]');
    expect(layout).toContain('!isTeen && (');
    expect(layout).toContain('{ label: "Downloads", to: "/portal/downloads"');
  });

  it("redirects teen accounts away from adult-only portal routes", () => {
    const app = read("src/App.tsx");
    expect(app).toContain("const AdultPortalRoute");
    for (const path of ["/portal/group", "/portal/insights", "/portal/progress", "/portal/family", "/portal/billing"]) {
      expect(app).toContain(`<Route path="${path}" element={<AdultPortalRoute>`);
    }
  });

  it("blocks legacy digital workbook and community submission writes", () => {
    const migration = read("supabase/migrations/20260830170000_under18_paper_only_enforcement.sql");
    for (const table of ["workbook_entries", "teen_workbook_entries", "kids_workbook_entries", "story_submissions", "word_submissions"]) {
      expect(migration).toContain(`ON public.${table}`);
    }
    expect(migration).toContain("Under-18 accounts are read-only and cannot submit.");
  });
});
