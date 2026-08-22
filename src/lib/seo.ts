// Search metadata — one table, used three ways: applied at runtime on route
// change, baked into static HTML at build time by scripts/prerender-seo.mjs,
// and turned into sitemap.xml by the same script. One source, so a page's
// description cannot say one thing to Google and another to LinkedIn.
//
// ── Why prerendering matters here ────────────────────────────────────────
// This is a client-rendered SPA. Google will execute the JavaScript and
// eventually see a runtime-applied description, but Facebook, LinkedIn,
// WhatsApp, Slack and iMessage do not run JS at all — they read the HTML they
// are served and stop. Without static per-route HTML, every shared Mindcast
// link previews as the homepage. That is what the prerender step fixes.
//
// ── The line this file must not cross ─────────────────────────────────────
// Mindcast is not therapy, not counselling, and not a mental-health service.
// People increasingly search for support in places that are not clinical, and
// some of those searches come from people in real distress. So:
//
//   · We target DISAMBIGUATION intent — "church without religion", "secular
//     Sunday gathering", "is this therapy" — where the honest answer is
//     exactly what the searcher wants to know.
//   · We do NOT target clinical or distress intent. No copy here mentions
//     depression, anxiety, trauma, crisis, diagnosis or treatment, and none
//     of it positions Mindcast as a replacement for professional care.
//   · BANNED_CLAIMS below is enforced by seo.test.ts across every string in
//     this file. It fails the build rather than relying on anyone remembering.
//
// Saying plainly "this is not therapy" is both the safe answer and the
// accurate one, and it happens to match what people actually type.

export const SITE = {
  name: "Mindcast",
  /**
   * Canonical origin. `www` on purpose: the apex has no A record, so
   * canonicals pointing at the bare domain would resolve to nothing. This is
   * the same misconfiguration that broke password-reset links.
   */
  origin: "https://www.mindcast.co.nz",
  locale: "en_NZ",
  twitter: "@mindcastnz",
  /** 1200×630 social card. */
  image: "https://pjyelgogdsuiugaudecc.supabase.co/storage/v1/object/public/assets/ogimage.png",
} as const;

export interface PageSeo {
  /** Route path, exactly as registered in App.tsx. */
  path: string;
  /** <title>. Aim for ≤ 60 characters so it is not truncated in results. */
  title: string;
  /** Meta description. 120–160 characters is the readable window. */
  description: string;
  /**
   * Share headline. Falls back to `title` minus the brand suffix. Social
   * cards have less room and no brand column, so they get their own line.
   */
  ogTitle?: string;
  /** Weekly-ish content ranks better when the sitemap says so honestly. */
  changefreq?: "daily" | "weekly" | "monthly" | "yearly";
  priority?: number;
}

/**
 * Every publicly crawlable page. A route absent from here is not in the
 * sitemap and gets the site default — which is the correct outcome for member
 * and staff surfaces, and is asserted in the tests.
 */
export const PUBLIC_PAGES: PageSeo[] = [
  {
    path: "/",
    title: "Mindcast — A Weekly Gathering Without the Religion",
    description:
      "Everything church did well — a room, the same people, every week, a shared idea to carry home — without the religion. Adults, teens and children in Taupō, New Zealand.",
    ogTitle: "Everything church did well. Without the religion.",
    changefreq: "weekly",
    priority: 1,
  },
  {
    path: "/about",
    title: "Why We Built a Church Without the Religion | Mindcast",
    description:
      "Community, ritual and accountability are worth keeping. The doctrine isn't. Why Mindcast borrows the structure of a Sunday gathering and leaves the belief behind.",
    ogTitle: "We wanted what church did well, without the religion",
    changefreq: "monthly",
    priority: 0.8,
  },
  {
    path: "/curriculum",
    title: "The 52-Week Curriculum — Look Inside | Mindcast",
    description:
      "A structured year of personal development, not 52 unrelated topics: See Clearly, Unlearn, Rebuild, Live It. Preview Week 1 for adults, teens and children.",
    ogTitle: "Look inside the 52-week Mindcast curriculum",
    changefreq: "weekly",
    priority: 0.9,
  },
  {
    path: "/membership",
    title: "Membership & Prices | Mindcast Taupō",
    description:
      "Every price in one place, a free first session, and a concession rate you can request without explaining yourself. No contracts and no countdowns.",
    ogTitle: "Membership — every price, stated plainly",
    changefreq: "monthly",
    priority: 0.8,
  },
  {
    path: "/try",
    title: "Come to One Session, Free | Mindcast Taupō",
    description:
      "Sit in a Mindcast session once, free, and see what it is. One pass per person, the whole family on the same ticket, worksheet included. No card, no chase.",
    ogTitle: "Come and sit in it once, free",
    changefreq: "monthly",
    priority: 0.9,
  },
  {
    path: "/apply",
    title: "Apply for the Taupō Pilot Group | Mindcast",
    description:
      "Ten Tuesday nights, nine places, no cost. Mindcast's first pilot group is for people aged 30 to 45 in Taupō. Apply before 9am, Tuesday 29 September.",
    ogTitle: "Apply for the Mindcast pilot group",
    changefreq: "weekly",
    priority: 0.9,
  },
  {
    path: "/shop",
    title: "Session Worksheets | Mindcast",
    description:
      "The week's worksheet on its own — the key idea, the reflection and the practice, without an account. Follow the year from wherever you are.",
    changefreq: "weekly",
    priority: 0.5,
  },
  {
    path: "/safeguarding",
    title: "Child Safety & Safeguarding | Mindcast",
    description:
      "How Mindcast keeps children and young people safe: sign-in and sign-out, who may collect a child, staff checks, and how to raise a concern.",
    changefreq: "yearly",
    priority: 0.4,
  },
  {
    path: "/privacy",
    title: "Privacy Policy | Mindcast",
    description:
      "What Mindcast records, who can see it, and what stays private. Member reflections are never shown to facilitators, staff or anyone else.",
    changefreq: "yearly",
    priority: 0.3,
  },
  {
    path: "/terms",
    title: "Terms of Use | Mindcast",
    description: "The terms that apply to Mindcast membership, sessions and this website.",
    changefreq: "yearly",
    priority: 0.2,
  },
  {
    path: "/refund",
    title: "Refund Policy | Mindcast",
    description:
      "How cancellations and refunds work at Mindcast. Cancel any time; the terms are stated before you pay, not after.",
    changefreq: "yearly",
    priority: 0.2,
  },
  {
    path: "/contact",
    title: "Contact | Mindcast",
    description:
      "Get in touch with the Mindcast team in Taupō. General enquiries, membership questions, safeguarding concerns, privacy requests, and press.",
    ogTitle: "Contact Mindcast — we're a small team in Taupō",
    changefreq: "monthly",
    priority: 0.5,
  },
];

/**
 * Route prefixes that must never be crawled or listed: member surfaces, staff
 * surfaces, live-session displays and single-use token links.
 *
 * The current robots.txt allows all of these. `/b/<token>` in particular is a
 * bracelet's single-use sign-in link — indexing one would publish a member's
 * door credential in a search result.
 */
export const PRIVATE_PREFIXES = [
  "/auth",
  "/portal",
  "/admin",
  "/mindcast-live",
  "/display",
  "/kiosk",
  "/live",
  "/join",
  "/b/",
  "/checkin",
  "/dashboard",
  "/workbook",
  "/onboarding",
  "/reset-password",
  "/training",
  "/marketing",
] as const;

/**
 * Language that would position Mindcast as a clinical service. Enforced over
 * every string in this file by seo.test.ts.
 *
 * `\btherap` catches therapy/therapist/therapeutic in one. "Counsel" is
 * matched as a whole word so "counsel" the verb is caught but ordinary words
 * are not. Each entry is here because a plausible SEO instinct would reach
 * for it.
 */
export const BANNED_CLAIMS: RegExp[] = [
  /\btherap/i,
  /\bcounsell?(?:ing|or|s)?\b/i,
  /\bpsychotherap/i,
  /\bclinical\b/i,
  /\bdiagnos/i,
  /\btreatment\b/i,
  /\btreat (?:your|anxiety|depression)/i,
  /\bcure\b/i,
  /\bheal(?:ing)?\b/i,
  /\bdepression\b/i,
  /\banxiety\b/i,
  /\btrauma\b/i,
  /\bcrisis\b/i,
  /\bmental health\b/i,
  /\bsupport group\b/i,
  /\brecovery programme\b/i,
];

/**
 * Tab titles for private routes.
 *
 * These pages are `noindex` and carry no description or share card — nothing
 * here is for a search engine. It is for the member with six tabs open trying
 * to find the one with their check-in on it. Longest matching prefix wins.
 */
export const PRIVATE_TITLES: [string, string][] = [
  ["/auth", "Member Login · Mindcast"],
  ["/portal/dashboard", "Dashboard · Mindcast Portal"],
  ["/portal/weeks", "Weekly Sessions · Mindcast Portal"],
  ["/portal/week", "Week · Mindcast Portal"],
  ["/portal/group", "Group · Mindcast Portal"],
  ["/portal/insights", "Insights · Mindcast Portal"],
  ["/portal/downloads", "Downloads · Mindcast Portal"],
  ["/portal/settings", "Settings · Mindcast Portal"],
  ["/portal/progress", "Progress · Mindcast Portal"],
  ["/portal/checkin", "Check-In · Mindcast Portal"],
  ["/portal/kids", "Kid Sessions · Mindcast Portal"],
  ["/portal/orders", "My Orders · Mindcast Portal"],
  ["/portal/family", "Family & Safety · Mindcast Portal"],
  ["/portal/billing", "Billing · Mindcast Portal"],
  ["/portal/pass", "Door Pass · Mindcast Portal"],
  ["/mindcast-live/library", "Coursebook Library · Mindcast"],
  ["/mindcast-live/lesson", "Lesson · Mindcast"],
  ["/mindcast-live/facilitate", "Facilitate · Mindcast"],
  ["/mindcast-live/edit", "Edit Lesson · Mindcast"],
  ["/mindcast-live/coursebook", "Coursebook (Print) · Mindcast"],
  ["/admin/staff-training", "Staff Training · Mindcast"],
  ["/admin/scan", "Door Scan · Mindcast"],
  ["/admin", "Admin · Mindcast"],
  ["/workbook", "Workbook · Mindcast"],
  ["/dashboard", "Dashboard · Mindcast"],
  ["/checkin", "Check In · Mindcast"],
  ["/join", "Join a Session · Mindcast"],
  ["/live", "Live Session · Mindcast"],
  ["/onboarding", "Get Started · Mindcast"],
  ["/reset-password", "Reset Password · Mindcast"],
];

export const privateTitleFor = (pathname: string): string | null =>
  PRIVATE_TITLES.filter(([prefix]) => pathname === prefix || pathname.startsWith(prefix))
    .sort((a, b) => b[0].length - a[0].length)[0]?.[1] ?? null;

export const findPage = (pathname: string): PageSeo | null =>
  PUBLIC_PAGES.find((p) => p.path === pathname) ?? null;

export const isPrivatePath = (pathname: string): boolean =>
  PRIVATE_PREFIXES.some((p) => pathname === p || pathname.startsWith(p));

export const canonicalFor = (pathname: string): string =>
  `${SITE.origin}${pathname === "/" ? "" : pathname.replace(/\/$/, "")}`;

/** Share headline: explicit ogTitle, else the title with the brand trimmed. */
export const ogTitleFor = (page: PageSeo): string =>
  page.ogTitle ?? page.title.replace(/\s*[|—]\s*Mindcast.*$/i, "").trim();
