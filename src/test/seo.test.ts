import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  BANNED_CLAIMS,
  PRIVATE_PREFIXES,
  PUBLIC_PAGES,
  SITE,
  canonicalFor,
  findPage,
  isPrivatePath,
  ogTitleFor,
} from "@/lib/seo";

const root = resolve(__dirname, "../..");
const read = (p: string) => readFileSync(resolve(root, p), "utf8");

const app = read("src/App.tsx");
// Comments stripped: these files explain the rules they follow, and an
// assertion that reads the explanation as a violation teaches the next person
// to delete the explanation.
const stripHtmlComments = (s: string) => s.replace(/<!--[\s\S]*?-->/g, "");
const stripHashComments = (s: string) => s.replace(/^#.*$/gm, "");
const robots = stripHashComments(read("public/robots.txt"));
const indexHtml = stripHtmlComments(read("index.html"));
const seoSrc = read("src/lib/seo.ts");

/* ── the rule that matters most ───────────────────────────────────────────*/

describe("Mindcast never presents itself as a clinical service", () => {
  // Mindcast is not therapy and not counselling, and the people most likely to
  // find a page like this through search are not always in a position to work
  // that out for themselves. This is the check that stops an SEO instinct —
  // "people are searching for it, so put the word in" — from turning into a
  // claim the organisation cannot make.
  const strings = PUBLIC_PAGES.flatMap((p) => [p.title, p.description, p.ogTitle ?? ""]);

  it("uses no clinical language in any title, description or share card", () => {
    for (const s of strings) {
      for (const banned of BANNED_CLAIMS) {
        expect(banned.test(s), `"${s}" matches ${banned}`).toBe(false);
      }
    }
  });

  it("uses no clinical language in the static head or structured data", () => {
    const head = indexHtml.slice(indexHtml.indexOf("<head>"), indexHtml.indexOf("</head>"));
    for (const banned of BANNED_CLAIMS) {
      expect(banned.test(head), `index.html head matches ${banned}`).toBe(false);
    }
  });

  it("claims no health or medical schema.org type", () => {
    // MedicalOrganization / Physician / MedicalBusiness would assert in
    // machine-readable form exactly what the copy is careful not to say.
    for (const t of ["MedicalOrganization", "MedicalBusiness", "Physician", "MedicalClinic", "HealthAndBeautyBusiness"]) {
      expect(indexHtml, `structured data claims ${t}`).not.toContain(t);
    }
    expect(indexHtml).toContain('"@type": "Organization"');
  });

  it("keeps the banned list covering the obvious reaches", () => {
    // A guard on the guard: if somebody trims this list, these fail.
    const probe = (s: string) => BANNED_CLAIMS.some((r) => r.test(s));
    expect(probe("online therapy alternative")).toBe(true);
    expect(probe("group counselling in Taupo")).toBe(true);
    expect(probe("mental health support")).toBe(true);
    expect(probe("treatment for anxiety")).toBe(true);
    expect(probe("a weekly gathering without the religion")).toBe(false);
  });
});

/* ── coverage and quality ─────────────────────────────────────────────────*/

describe("every public page has usable metadata", () => {
  it("gives each page a distinct title and description", () => {
    const titles = PUBLIC_PAGES.map((p) => p.title);
    const descriptions = PUBLIC_PAGES.map((p) => p.description);
    expect(new Set(titles).size, "duplicate titles").toBe(titles.length);
    expect(new Set(descriptions).size, "duplicate descriptions").toBe(descriptions.length);
  });

  it("keeps titles short enough not to be truncated", () => {
    for (const p of PUBLIC_PAGES) {
      expect(p.title.length, `${p.path} title is ${p.title.length} chars`).toBeLessThanOrEqual(65);
    }
  });

  it("keeps descriptions inside the readable window", () => {
    for (const p of PUBLIC_PAGES) {
      expect(p.description.length, `${p.path} description is ${p.description.length} chars`)
        .toBeGreaterThanOrEqual(70);
      expect(p.description.length, `${p.path} description is ${p.description.length} chars`)
        .toBeLessThanOrEqual(175);
    }
  });

  it("names Mindcast in every title", () => {
    for (const p of PUBLIC_PAGES) expect(p.title).toMatch(/Mindcast/);
  });

  it("covers every public route registered in App.tsx", () => {
    // Only routes that render a page. A route whose element is <Navigate> or
    // <LegacyRedirect> resolves elsewhere and has nothing of its own to
    // describe, so it needs no metadata.
    const registered = [...app.matchAll(/<Route path="(\/[a-z-]*)" element=\{([^}]*)\}/g)]
      .filter(([, , element]) => !/Navigate|LegacyRedirect/.test(element))
      .map((m) => m[1]);
    const shouldHaveSeo = registered.filter((r) => r !== "/" && !isPrivatePath(r));
    expect(shouldHaveSeo.length, "route scan found nothing — the pattern broke").toBeGreaterThan(3);
    for (const r of shouldHaveSeo) {
      expect(findPage(r), `no SEO entry for public route ${r}`).not.toBeNull();
    }
    expect(findPage("/")).not.toBeNull();
    expect(findPage("/try")).not.toBeNull();
  });
});

/* ── search terms the founder asked for ───────────────────────────────────*/

describe("the terms this site is trying to be found for", () => {
  const corpus = PUBLIC_PAGES.map((p) => `${p.title} ${p.description} ${p.ogTitle ?? ""}`).join(" ").toLowerCase();

  it("covers church-without-religion intent", () => {
    expect(corpus).toContain("without the religion");
    expect(corpus).toContain("church");
  });

  it("covers secular and non-religious phrasing", () => {
    // The words people actually type vary; the copy has to carry more than
    // one of them or it only matches a single query.
    expect(indexHtml.toLowerCase()).toContain("secular");
    expect(indexHtml.toLowerCase()).toContain("non-religious");
  });

  it("covers personal development without over-claiming", () => {
    expect(corpus).toContain("personal development");
  });

  it("carries the location, which is most of local search", () => {
    expect(corpus).toContain("taupō");
    expect(indexHtml).toContain("Taupō");
  });

  it("names the three audiences", () => {
    for (const who of ["adults", "teens", "children"]) expect(corpus).toContain(who);
  });
});

/* ── private surfaces stay out ────────────────────────────────────────────*/

describe("member and staff surfaces are not indexable", () => {
  it("recognises the private prefixes", () => {
    expect(isPrivatePath("/portal/dashboard")).toBe(true);
    expect(isPrivatePath("/admin")).toBe(true);
    expect(isPrivatePath("/b/abc123")).toBe(true);
    expect(isPrivatePath("/curriculum")).toBe(false);
    expect(isPrivatePath("/")).toBe(false);
  });

  it("disallows every private prefix in robots.txt", () => {
    for (const prefix of PRIVATE_PREFIXES) {
      expect(robots, `robots.txt does not disallow ${prefix}`).toContain(`Disallow: ${prefix}`);
    }
  });

  it("uses one wildcard group, not per-bot groups", () => {
    // A named `User-agent: Googlebot` group REPLACES the wildcard for that
    // crawler rather than adding to it, so the old per-bot `Allow: /` blocks
    // would have exempted Google, Bing, Twitter and Facebook from every
    // Disallow below them. This is the bug that check exists to prevent.
    expect(robots).not.toMatch(/User-agent:\s*(?!\*)\S/);
    expect((robots.match(/User-agent:/g) ?? []).length).toBe(1);
  });

  it("points crawlers at the sitemap", () => {
    expect(robots).toContain(`Sitemap: ${SITE.origin}/sitemap.xml`);
  });

  it("emits noindex on private routes at runtime", () => {
    const seoComponent = read("src/components/Seo.tsx");
    expect(seoComponent).toContain("noindex, nofollow");
    expect(seoComponent).toContain("isPrivatePath");
  });

  it("lists no private page in the sitemap source", () => {
    for (const p of PUBLIC_PAGES) expect(isPrivatePath(p.path), `${p.path} is private`).toBe(false);
  });
});

/* ── canonicals ───────────────────────────────────────────────────────────*/

describe("canonical URLs", () => {
  it("uses the www host", () => {
    // The apex has no A record — the same misconfiguration that broke
    // password-reset links. A canonical pointing at it would resolve to
    // nothing, and Google would be told the real page is the wrong URL.
    expect(SITE.origin).toBe("https://www.mindcast.co.nz");
    expect(SITE.origin).toMatch(/^https:\/\/www\./);
  });

  it("builds one URL per page with no trailing slash", () => {
    expect(canonicalFor("/")).toBe("https://www.mindcast.co.nz");
    expect(canonicalFor("/curriculum")).toBe("https://www.mindcast.co.nz/curriculum");
    expect(canonicalFor("/curriculum/")).toBe("https://www.mindcast.co.nz/curriculum");
  });

  it("gives every page a canonical in the static head", () => {
    expect(indexHtml).toContain('<link rel="canonical"');
  });
});

/* ── share cards ──────────────────────────────────────────────────────────*/

describe("share cards", () => {
  it("trims the brand off the social headline", () => {
    expect(ogTitleFor({ path: "/x", title: "The Curriculum | Mindcast", description: "" }))
      .toBe("The Curriculum");
  });

  it("prefers an explicit ogTitle where one is written", () => {
    const home = findPage("/")!;
    expect(ogTitleFor(home)).toBe(home.ogTitle);
  });

  it("still flags the placeholder share image", () => {
    // A square PWA icon gets letterboxed or cropped by most unfurlers. This
    // stays failing-loud in the source until a real 1200x630 card exists.
    expect(read("index.html")).toMatch(/TODO: replace with a purpose-built 1200x630 social card/);
  });
});

/* ── the prerender step ───────────────────────────────────────────────────*/

describe("prerendering", () => {
  const script = read("scripts/prerender-seo.mjs");
  const pkg = JSON.parse(read("package.json"));

  it("runs as part of the build", () => {
    // Without this, static HTML is never written and every shared link
    // previews as the homepage.
    expect(pkg.scripts.build).toContain("prerender-seo");
  });

  it("writes a directory index per page and a sitemap", () => {
    expect(script).toContain("/index.html");
    expect(script).toContain("sitemap.xml");
  });

  it("fails loudly if the SEO table shape changes under it", () => {
    // The script parses src/lib/seo.ts rather than importing it, so it has to
    // notice when that parse stops working instead of silently emitting an
    // empty sitemap.
    expect(script).toContain("parsed zero pages");
  });

  it("reads the origin from the same source the app does", () => {
    expect(script).toContain("SITE.origin not found");
    expect(seoSrc).toContain("origin:");
  });
});
