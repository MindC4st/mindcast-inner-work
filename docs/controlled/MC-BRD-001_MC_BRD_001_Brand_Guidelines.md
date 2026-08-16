# MC-BRD-001 — Brand Guidelines

> Source: Notion Document Hub (controlled copy). Category: Brand & Identity. Status: —.
> Regenerate with `node scripts/fetch-controlled-docs.mjs`.

> 🎨 **Mindcast Limited · Taupō, Aotearoa New Zealand**  
MC-BRD-001 · Version 1.0 · August 2026 · Brand & Identity
## Brand Guidelines
Mindcast is a broadcast you tune into with other people in a room. Everything we make should feel like a clear signal — calm, deliberate, human, and never shouting.
**Document owner:** Founder (Ashleigh Carlson)  
**Applies to:** All staff, contractors, agencies  
**Next review:** August 2027  
**Status:** Live
## 1 · The idea behind the identity
Mindcast is not a podcast, an app, or a course. It is a weekly gathering where a signal is transmitted and received in person. The broadcast metaphor is analogue: a radio dial, a level meter, a tuning needle finding a station. Warm, patient, physical.
The visual line is **navy ink on ivory paper, with one blue signal running through it.**
> _Tune into your inner self. Awareness into action, together._
Three rules govern everything:
1. **One accent, used sparingly.** Signal Blue earns attention because it is rare.
1. **Type does the work.** Bebas Neue set large and tight is the loudest thing we do; decoration is secondary.
1. **No pressure.** No urgency banners, countdowns, manufactured scarcity or guilt. The voice invites; it does not sell through pressure.
## 2 · Colour
The source of truth is `src/index.css`. Do not introduce a hard-coded brand colour outside this system unless explicitly documented.
### Core palette
- **Ink Navy — **`**#102438**` — primary text, footers, table headers; token `--navy`.
- **Signal Blue — **`**#3585AF**` — accent, links, active states, signal bar and focus rings; token `--blue`.
- **Signal Deep — **`**#307191**` — filled buttons, pressed/hover states and small coloured text; token `--primary`.
- **Ivory — **`**#FFFAF5**` — primary page background; token `--ivory` / `--cream`.
- **Navy Mid — **`**#1C3E5A**` — secondary text, pull quotes and subheads.
- **Mist — **`**#C5E3F3**` — tints, inactive signal segments, chart fills and quiet surfaces.
### Supporting palette
- **Deep Navy — **`**#0A1120**` — admin console/facilitator dark surface only.
- **Slate — **`**#8E9299**` — muted labels on dark surfaces.
- **Silver — **`**#7B929D**` — muted labels on light surfaces, captions and metadata.
- **Line — **`**#E1E7EF**` — rules, borders and dividers.
- **Paper — **`**#FFFFFF**` — cards/documents sitting on Ivory.
### Functional status colours only
Active `#10B981` · Trialling `#0EA5E9` · Past due `#F59E0B` · Paused `#64748B` · Error `#EF4444`.
**Bronze is retired.** Any legacy `--bronze` reference aliases to Signal Blue. Do not reintroduce gold/bronze; it pushes the identity toward luxury/spiritual-guru territory.
### Usage ratio
Aim for approximately **70% Ivory / 22% Ink Navy / 6% Mist / 2% Signal Blue**. If a layout feels flat, use more whitespace and stronger hierarchy rather than more blue.
### Accessibility
- Ink Navy on Ivory ≈ 14.8:1 — AAA.
- Signal Deep on Ivory ≈ 4.9:1 — use for body-size coloured text.
- Signal Blue on Ivory ≈ 3.9:1 — large text/non-text UI only.
- White on Signal Deep ≈ 4.6:1 — AA.
- Every interactive control requires a visible `2px solid #3585AF` focus ring with `2px` offset.
## 3 · Typography
**Bebas Neue — Display.** Headings, titles, wordmark, navigation labels and statistics. Uppercase; tracking roughly `0.02em–0.14em`. Never running body text or below 11px.
**Montserrat — Body.** Reading text, forms, tables, UI and buttons. Body 15–16px, line-height about 1.72 and max line length around 74 characters.
**Cormorant Garamond — Voice.** Human moments: pull quotes, title standfirsts, affirmations and selected testimonials. Usually italic; never functional UI or legal text.
**Inter — Utility only.** Dense numeric/admin tables where needed; not member-facing brand copy.
**Type scale:** 10 · 12 · 13 · 15 · 18 · 22 · 26 · 32 · 44 · 52 px.
## 4 · The signal bar
The signature device appears on every controlled document, deck and letterhead: **18 vertical segments** like a broadcast meter. The first seven are Signal Blue, the remainder Mist. Segment heights: **30 · 44 · 58 · 72 · 86 · 100 · 86**, then a flat **34** for the tail.
Meaning: **the signal is being received, and there is room to grow.** Use 14–16px height, full content width, 3px gaps, directly beneath the wordmark. Never recolour it, invert it to gold, or animate it in printed/legal contexts.
## 5 · Wordmark
`Mind` in Ink Navy + `cast` in Signal Blue, Bebas Neue, uppercase, tracking `0.10em`; one word, no space.
- Clear space: at least the cap-height of the M on every side.
- Minimum size: 90px screen / 24mm print.
- Dark surface: Mind in Ivory; cast remains Signal Blue.
- Single-colour fallback: all Ink Navy or all Ivory.
- Never stretch, outline, glow, shadow, rotate, place over busy photography, add a tagline lock-up, or substitute the typeface.
## 6 · Voice and tone
We sound like a steady person who has done the work and is not selling you anything.
**We write:** “Come back in seven days.” · “This week's practice.” · “You can leave at any time.” · “Mindcast is not therapy. If you need clinical support, we'll help you find it.”
**We do not write:** “Don't miss out.” · “Unlock your potential today.” · “You'll lose your progress.” · “Transform your life in 52 weeks.” · artificial ‘investment’ framing.
Use New Zealand English: organise, colour, programme for a course of study, program for software. Use correct macrons: Taupō, Māori, kōrero, whānau. Dates: **Sunday 14 September 2026**. Currency: **$30 NZD**.
Forbidden across Mindcast surfaces: **“click here”, “subscribe now”, “limited time only”, “hurry”, “last chance”, countdown timers, fake scarcity, exit-intent pressure and guilt-based retention copy.** Never position the founder as a teacher, guru, healer or authority. We facilitate; we do not create dependency.
## 7 · Imagery
Photograph real rooms and real members where written consent permits: hands, chairs in a circle, the venue at dusk, a workbook on a knee, someone laughing mid-sentence. Natural light; restrained grain is welcome.
Avoid generic wellness/spiritual imagery: meditating beach stock, lotus flowers, mandalas, glowing brains, chakra diagrams, sunrise motivational imagery or religious/new-age iconography. A 4% grain overlay may be used on full-bleed imagery, never over text.
## 8 · Applying the brand to documents
Every controlled document uses: wordmark/entity line top-left · document ID/version/date top-right · signal bar · eyebrow → title → standfirst → control block → content → navy footer.
Document IDs: `MC-[DOMAIN]-[NNN]`: **BRD** Brand · **GOV** Governance · **MEM** Member-facing · **HR** People & employment · **SAF** Safeguarding · **SEC** Data & security · **FIN** Finance & operations · **TRN** Training.
## 9 · Assets and source of truth
- Design tokens: `src/index.css :root`
- Tailwind mapping: `tailwind.config.ts`
- Fonts: `@fontsource/*` — self-hosted; no runtime Google Fonts.
- PWA icons: `public/pwa-icon-512.png`, `public/favicon.png`
- Theme colour: `index.html` → `#3585af`
- Canva Brand Kit must mirror this document.
Anyone changing a brand colour changes `src/index.css` first and then updates this controlled document. A stray hard-coded hex in a component is a bug, not a design decision. The current admin-console dark-surface literals are the temporary documented exception pending a dark-token pass.
