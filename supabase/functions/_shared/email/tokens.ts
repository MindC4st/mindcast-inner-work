// tokens.ts — canonical Mindcast email brand tokens.
//
// Email clients cannot reliably use CSS variables, so these are plain strings.
// Keep this file as the single source of truth for colours, typography,
// assets and layout used across Mindcast application emails.
//
// The visual system matches the Supabase Auth email templates:
// - warm ivory outer background
// - white content card
// - Mindcast mid-blue brand header
// - dark charcoal text
// - soft neutral secondary text
// - restrained pale dividers and panels
// - system-safe sans-serif typography

export const T = {
  // ─── Surfaces ──────────────────────────────────────────────────────────

  // Outer email background
  pageBg: "#F8F5EF",

  // Main email card
  cardBg: "#FFFFFF",

  white: "#FFFFFF",

  // Soft callout / information panels
  softPanel: "#F8F5EF",


  // ─── Brand ─────────────────────────────────────────────────────────────

  // Retained as "navy" for backwards compatibility with any existing
  // templates still referencing T.navy. This is now the primary dark text,
  // rather than the old navy brand colour.
  navy: "#303947",

  // Primary Mindcast blue
  signalBlue: "#3D8DB7",

  // Mist — inactive signal-bar segments (MC-BRD-001 §2)
  mist: "#C5E3F3",

  // Pale background used for subtle supporting areas
  accent: "#F8F5EF",


  // ─── Text ──────────────────────────────────────────────────────────────

  // Main headings / stronger text
  text: "#303947",

  // Normal paragraph copy
  bodyText: "#4D5560",

  // Secondary / helper copy
  mutedDark: "#747B84",

  // Footer and tertiary copy
  muted: "#92979D",

  // Rules / separators / subtle borders
  divider: "#E9E5DE",


  // ─── Typography ────────────────────────────────────────────────────────

  // We intentionally use email-safe system fonts rather than relying on
  // externally loaded Google Fonts. Outlook and some privacy-focused email
  // clients strip remote font imports.

  sans:
    "Arial, Helvetica, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",

  // Retained for backwards compatibility with older templates.
  // New templates should use T.sans.
  display:
    "Arial, Helvetica, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",

  serif:
    "Arial, Helvetica, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",


  // ─── Assets ────────────────────────────────────────────────────────────

  // White transparent wordmark designed for the blue masthead.
  wordmarkUrl:
    "https://pjyelgogdsuiugaudecc.supabase.co/storage/v1/object/public/assets/Wordmark-White-Transparent.png",

  // Retained only so legacy imports don't break.
  // New email layouts should not rely on external web fonts.
  fontsLink: "",


  // ─── Layout ────────────────────────────────────────────────────────────

  wrapWidth: 600,


  // ─── Sending ───────────────────────────────────────────────────────────

  from: "Mindcast <hello@mindcast.co.nz>",
} as const;
