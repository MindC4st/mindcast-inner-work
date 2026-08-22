# Site Sweep Plan — UI, Components, Copy

Stage 3 deliverable. Approved decisions from the Stage 2 gate are baked in.
No code in this document.

Baseline: `main` @ `1b6a119` · `$GOOD` = `e728a16` · flattening = `75ec307` ·
choreography source = `129633a` (dark visuals retired; choreography recovered
and re-grounded on ivory).

---

## A · Animation library — keep framer-motion, uninstall GSAP

Evaluated honestly, framer-motion wins on every axis:

1. **Adoption**: framer-motion is imported in **35 files** (public pages,
   portal, curriculum, admin). GSAP is imported in **0** — only a stale
   comment in `src/App.tsx:13`.
2. **The effect itself**: the current `TracksSection` (Home) is a 300vh
   sticky pin with a true horizontal translate (`x: 0% → -66.67%`) scrubbed
   by `useScroll` — genuinely horizontal-on-vertical. The `129633a` GSAP
   version was a ScrollTrigger pin whose panels **cross-faded** (opacity
   swap on absolute-positioned panels). The framer version is *more* of a
   horizontal gallery than the GSAP one ever was.
3. **Lifecycle**: no ScrollTrigger kill/rebuild on route change to manage;
   framer's hooks unmount cleanly with the component.

**Actions**
- `npm uninstall gsap @gsap/react`; fix the stale comment in `App.tsx`.
- Port the two 129633a ideas worth keeping, natively in framer-motion:
  - Hero scroll-scrub (image scale/dim as headline leaves) — current Home
    already has an opacity transform; add the subtle scale.
  - Staggered hero headline entrance (framer variants, reduced-motion off).
- **Touch path (missing today)**: on coarse pointers the sticky pin fights
  the browser. `TracksSection` gets a third branch: native
  `overflow-x-auto` + `scroll-snap-x mandatory` strip on touch devices.
  Reduced-motion stack branch already exists and stays.

## B · What returns from git / what gets rebuilt / what stays removed

**Returns from git (by hash, re-skinned where noted)**
- Hero scrub + stagger choreography concepts from `129633a:src/pages/Home.tsx`
  — re-implemented in framer-motion on ivory. Nothing else from the dark
  build returns.

**Rebuilt fresh**
- `<SiteHeader />` (from current `Navbar.tsx`), `<SiteFooter />` (from
  `Footer.tsx`), `SignalBar`, emboss tokens/utilities, scrim utility,
  Auth binder-opening.

**Stays removed (legitimate cleanup confirmed)**
- Dark cinematic homepage visuals and dark token *usage* on public pages
  (`--surface-*` scale stays for admin console only).
- The 8 legacy marketing components (Hero, Ecosystem, LivePreview,
  MembershipSnapshot, PositioningStrip, ResourcesPreview, Testimonials,
  Waitlist).
- Legacy session-runner and retired portal components.
- The ~29 unimported shadcn primitives — **restore-on-demand only** (§D).

## C · Token additions — `src/index.css`

```text
--emboss-face: #E8DECB        (warm tonal ivory — cooled metal, kept warmth)
--emboss-hi:   rgba(255,255,255,.92)
--emboss-lo:   rgba(150,132,104,.28)
```

- New utilities: `.emboss` (raised display type), `.deboss` (recessed panel).
- Recolour `.curriculum-gold-emboss`: gradient stops `#bfae90/#b9a684`
  (tan metallics) move toward `--emboss-face` tonal range; rename class to
  `.curriculum-emboss` (single usage at `Curriculum.tsx:198`). Validate
  against the binder photo, not a swatch.
- New `.hero-scrim` utility (navy gradient scrim per spec, direction-aware).
  Rule: scrim between image and text; verify 4.5:1 against the lightest
  pixel the text crosses; ivory text only.
- Delete `--bronze` alias + `tailwind.config.ts` `bronze` mapping once the
  sweep confirms zero remaining `bronze` class usage.
- **Emboss accessibility rule** (enforced in review): display type ≥32px
  repeating information available elsewhere, watermarks, rules, panel edges
  only. Never body text, labels, fields, buttons, nav.

## D · Component consolidation list — Stage 5

Order of work, batched, gated per batch:

**Batch 5.1 — Header + Footer**
- `Navbar.tsx` → `SiteHeader.tsx`: ivory ground, navy text, Signal Blue
  active underline, hairline border on scroll (no shadow/blur). Items:
  ABOUT · CURRICULUM · SHOP · MEMBERSHIP + MEMBER LOGIN + BECOME A MEMBER.
- Mounted on **every public route**, including the three currently broken:
  Home (delete its inline nav — the flattening's most visible damage),
  Auth, Apply. Existing consumers (9 routes + LegalPage) migrate.
- `Footer.tsx` → `SiteFooter.tsx`, audited to system (navy strip allowed).

**Batch 5.2 — Primitive audit (restore-on-demand)**
- Confirmed: `ui/tabs.tsx` is hand-rolled → restore `@radix-ui/react-tabs`
  shadcn tabs.
- Hunt the same pattern (looks-like-a-primitive-but-isn't) via grep for
  hand-rolled `role=`/`aria-selected`/`aria-expanded`/focus-trap code:
  known suspects — `.binder-tab-top[aria-selected]` (Curriculum tabs),
  `apply/GenderRadios.tsx` (radio-group), `apply/DobInput.tsx`,
  `auth/PasswordField.tsx`, `shop/CartDrawer.tsx` (sheet/drawer?).
  Each hit: restore the radix primitive or wire to an existing one.
- Report each restored file; uninstall radix packages still orphaned after
  the audit.

**Batch 5.3 — Button / card / input / section wrapper**
- One button set on `ui/button.tsx` (cva variants). Fold in:
  `GlowButton` (glow/index.tsx), `authPrimaryButtonClass` /
  `authFieldClass` (AuthShell), any inline page buttons.
- One card, one input, one `<Section>` wrapper (the `SectionIntro` /
  `SectionHeading` duo consolidates to one).
- `glow/index.tsx` is re-grounded: keep `Reveal` (used site-wide), retire
  dark-canvas-only pieces (GlassCard/glow CTAs) or re-token them ivory.
- Every interactive control: `2px solid #3585AF` focus ring, 2px offset —
  single utility, applied at the primitive level.

**Batch 5.4 — SignalBar (Part 6)**
- `src/components/brand/SignalBar.tsx`. Segment spec (18 segments, first
  seven Signal Blue rising 30·44·58·72·86·100·86, tail flat 34 in Mist) is
  **parsed from `src/data/controlledDocs.json` (MC-BRD-001 §4)** at module
  load, with a unit test asserting the parse — the brand doc stays
  authoritative; no hardcoded heights.
- `size` prop: `worksheet` (14–16px tall, full content width),
  `slide` (≥48px, ~40% slide width — verify at 10% zoom), email variant
  already exists in `_shared/email/layout.ts` (leave, but assert same
  segment data).
- Replace the waveform-and-mic graphic in `src/lib/generateWorksheetPdf.ts`
  (~line 176) with the worksheet-size bar. No standalone mic anywhere —
  the mic lives only inside the wordmark's "i".

## E · Page order — Stage 6 (batched, gated per page)

1. **Curriculum** — emboss recolour only (validates the §C tokens against
   the benchmark page; smallest possible diff first).
2. **Auth** — biggest defect. Delete the `bg-navy` aside in
   `AuthShell.tsx:32`. Rebuild as the binder opening: `curriculum-paper`
   ground, ring-hole + tab language, embossed wordmark (display size only),
   worksheet-style fields, Signal Blue button, SiteHeader present. Stock
   reassurance copy goes.
3. **Home** — SiteHeader replaces inline nav; hero scrim; hero scrub +
   stagger; TracksSection touch branch; confirm ivory sections between
   media; dark remnants out.
4. **Shop / ShopProduct** — to system; prices in full, together
   (MC-MEM-106).
5. **Membership** — to system; same price rule.
6. **Apply** — ivory, single column, mobile-first; SiteHeader added.
7. **About** — lightest touch: keep the headline treatment exactly, keep
   scroll behaviour, migrate header/footer + any stray non-system styles.

## F · Copy sweep — Stage 7 (batched with each page batch's review)

- **Cut hedging**: "we hope", "we try to", "we believe that maybe",
  "designed to help you potentially", apologising sentences. Replacement
  register: state the fact and stop (benchmark lines already on site).
- **Mechanical guards** (grep before/after):
  - Forbidden: click here · subscribe now · limited time · hurry · last
    chance · unlock · transform your life · don't miss out · journey (noun
    for product) · manifest · countdowns/scarcity/guilt.
  - NZ English: organise/colour/programme (course) — flag US spellings.
  - Macrons: Taupō, Māori, whānau, kōrero — flag bare forms.
  - Founder never positioned as teacher/guru/healer/authority.
- Deliverable: before/after table per page, gated.

## G · Verification

- `npm run verify` (typecheck + build) after every batch.
- `e2e/public-smoke.spec.ts` updated where heroes/navs change.
- Manual: reduced-motion pass (OS setting), touch pass (devtools emulation),
  contrast spot-checks on scrimmed heroes and emboss usage, theatre
  signal-bar at 10% zoom.

## H · Dependency end-state

- Removed: `gsap`, `@gsap/react`, radix packages still orphaned after 5.2.
- Kept: `framer-motion` (sole animation library), `embla-carousel-react`
  (only if a consumer exists after the sweep — audit in 5.3, else remove).
