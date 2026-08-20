// Bake per-route metadata into static HTML after `vite build`, and emit
// sitemap.xml from the same table.
//
// WHY THIS EXISTS
// Mindcast is a client-rendered SPA. Googlebot will run the JavaScript and
// eventually see what src/components/Seo.tsx applies, but Facebook, LinkedIn,
// WhatsApp, Slack, iMessage and most other link unfurlers do not execute JS at
// all — they fetch the HTML, read the <head>, and stop. Without this step,
// every Mindcast link ever shared previews with the homepage's title and
// description, whatever page it actually points at.
//
// HOW IT WORKS WITH VERCEL
// vercel.json rewrites extensionless paths to /index.html, but Vercel checks
// the filesystem BEFORE applying rewrites. So writing dist/curriculum/index.html
// means /curriculum is served that file, and the rewrite never fires. The
// bundle is identical in each copy — only the <head> differs — so the client
// still boots into the same SPA and takes over routing from there.
//
// This is a build step, not a framework. If the site ever moves to a
// framework with real SSR, delete this file.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dist = resolve(root, "dist");

/**
 * Read the SEO table out of the TypeScript source.
 *
 * Deliberately parsed rather than imported: this script runs as plain node
 * after the build, and adding a TS loader (or a second build of the same file)
 * to a post-build hook is more machinery than one table is worth. The tests
 * import the real module, so a shape change is caught there.
 */
const seoSrc = readFileSync(resolve(root, "src/lib/seo.ts"), "utf8");

const block = (name) => {
  const start = seoSrc.indexOf(`export const ${name}`);
  if (start === -1) throw new Error(`${name} not found in src/lib/seo.ts`);
  // Start at the assignment, not the first bracket — the type annotation
  // (`: PageSeo[]`) sits between the two and would otherwise be read as an
  // empty array literal.
  const assign = seoSrc.indexOf("= [", start);
  if (assign === -1) throw new Error(`${name} is not an array literal`);
  const open = assign + 2;
  let depth = 0;
  for (let i = open; i < seoSrc.length; i++) {
    if (seoSrc[i] === "[") depth++;
    else if (seoSrc[i] === "]" && --depth === 0) return seoSrc.slice(open, i + 1);
  }
  throw new Error(`unterminated ${name}`);
};

const field = (entry, key) => {
  const m = entry.match(new RegExp(`${key}:\\s*("(?:[^"\\\\]|\\\\.)*")`, "s"));
  if (!m) return null;
  return JSON.parse(m[1].replace(/\n\s*/g, " "));
};

const pages = block("PUBLIC_PAGES")
  .split(/\{\s*\n/)
  .slice(1)
  .map((chunk) => {
    const path = field(chunk, "path");
    if (!path) return null;
    const changefreq = chunk.match(/changefreq:\s*"([a-z]+)"/)?.[1] ?? "monthly";
    const priority = chunk.match(/priority:\s*([\d.]+)/)?.[1] ?? "0.5";
    return {
      path,
      title: field(chunk, "title"),
      description: field(chunk, "description"),
      ogTitle: field(chunk, "ogTitle"),
      changefreq,
      priority,
    };
  })
  .filter(Boolean);

const origin = seoSrc.match(/origin:\s*"([^"]+)"/)?.[1];
if (!origin) throw new Error("SITE.origin not found in src/lib/seo.ts");

if (pages.length === 0) throw new Error("parsed zero pages — the SEO table shape changed");

const esc = (s) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const canonical = (p) => `${origin}${p === "/" ? "" : p.replace(/\/$/, "")}`;
const ogTitle = (p) => p.ogTitle ?? p.title.replace(/\s*[|—]\s*Mindcast.*$/i, "").trim();

/* ── rewrite one page's <head> ────────────────────────────────────────────*/

const template = readFileSync(resolve(dist, "index.html"), "utf8");

/** Replace a tag's content attribute, or append the tag if it is missing. */
const upsert = (html, matcher, tag) =>
  matcher.test(html) ? html.replace(matcher, tag) : html.replace("</head>", `    ${tag}\n  </head>`);

let written = 0;

for (const page of pages) {
  let html = template;

  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(page.title)}</title>`);
  html = upsert(html, /<meta name="description"[^>]*>/, `<meta name="description" content="${esc(page.description)}">`);
  html = upsert(html, /<link rel="canonical"[^>]*>/, `<link rel="canonical" href="${canonical(page.path)}">`);
  html = upsert(html, /<meta property="og:title"[^>]*>/, `<meta property="og:title" content="${esc(ogTitle(page))}">`);
  html = upsert(html, /<meta property="og:description"[^>]*>/, `<meta property="og:description" content="${esc(page.description)}">`);
  html = upsert(html, /<meta property="og:url"[^>]*>/, `<meta property="og:url" content="${canonical(page.path)}">`);
  html = upsert(html, /<meta name="twitter:title"[^>]*>/, `<meta name="twitter:title" content="${esc(ogTitle(page))}">`);
  html = upsert(html, /<meta name="twitter:description"[^>]*>/, `<meta name="twitter:description" content="${esc(page.description)}">`);

  // "/" is dist/index.html itself; everything else gets a directory index so
  // Vercel's filesystem check finds it before the SPA rewrite.
  const out = page.path === "/" ? resolve(dist, "index.html") : resolve(dist, `.${page.path}/index.html`);
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, html);
  written++;
}

/* ── sitemap ──────────────────────────────────────────────────────────────*/
// Generated from the same table, so a page cannot be in the sitemap without
// having a real title and description — or be given metadata and then quietly
// left out of the sitemap.

const today = new Date().toISOString().slice(0, 10);
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages
  .map(
    (p) => `  <url>
    <loc>${canonical(p.path)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`,
  )
  .join("\n")}
</urlset>
`;
writeFileSync(resolve(dist, "sitemap.xml"), sitemap);

if (!existsSync(resolve(dist, "robots.txt"))) {
  throw new Error("dist/robots.txt missing — public/robots.txt should have been copied by vite");
}

console.log(`prerender-seo: ${written} pages, sitemap with ${pages.length} urls`);
