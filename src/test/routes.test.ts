import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// App.tsx has lost routes to merge conflicts twice now (/curriculum, then
// /apply) — in both cases the lazy import survived while the <Route> line was
// dropped, so the page built fine, deployed fine, and 404'd in production
// through the NotFound catch-all. Nothing caught it because nothing looked.
//
// This test pins the routes that must never silently disappear: the public
// marketing/acquisition pages (QR codes and posters point at them) and the
// legal pages. If a merge drops one of these lines, the build fails here
// instead of failing a visitor standing in a café.

const root = resolve(__dirname, "../..");
const app = readFileSync(resolve(root, "src/App.tsx"), "utf8");

const CRITICAL_ROUTES = [
  "/",
  "/about",
  "/curriculum",
  "/membership",
  "/apply",
  "/try",
  "/shop",
  "/privacy",
  "/terms",
  "/safeguarding",
  "/contact",
];

describe("critical routes survive merges", () => {
  for (const path of CRITICAL_ROUTES) {
    it(`still routes ${path}`, () => {
      expect(
        app.includes(`path="${path}"`),
        `App.tsx lost the ${path} route — the page will 404 in production`,
      ).toBe(true);
    });
  }

  it("still keeps a catch-all for unknown paths", () => {
    expect(app).toContain('path="*"');
  });
});
