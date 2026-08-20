// tokens.ts — the sampled palette for email. Mirrors the worksheet, not src/index.css.
// Email clients cannot use CSS variables, so these are plain strings.

export const T = {
  // Surfaces
  pageBg: "#EFE9DC", // warm cream — the outer background
  cardBg: "#F8F4E8", // lighter cream — the 600px card
  white: "#FFFFFF",

  // Brand
  navy: "#102438",
  signalBlue: "#3585AF",
  accent: "#DEE9EC", // pale blue-grey for callout boxes

  // Text
  bodyText: "#2A4257",
  muted: "#8A8574",
  divider: "#DED7C6",

  // Fonts (with fallback stacks — Outlook strips the Google Fonts link)
  display: "'Bebas Neue','Haettenschweiler','Arial Narrow',Impact,sans-serif",
  serif: "'Cormorant Garamond',Georgia,'Iowan Old Style','Palatino Linotype',Palatino,serif",
  sans: "'Montserrat',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif",

  // Assets
  wordmarkUrl: "https://pjyelgogdsuiugaudecc.supabase.co/storage/v1/object/public/assets/wordmark-blue-bluemic-transparent.png",
  fontsLink: "https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Montserrat:wght@400;500;600&family=Cormorant+Garamond:ital@1&display=swap",

  // Layout
  wrapWidth: 600,
  from: "Mindcast <hello@mindcast.co.nz>",
} as const;
