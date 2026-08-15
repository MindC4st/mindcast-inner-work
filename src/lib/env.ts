import { z } from "zod";

// Validate environment at module load — the first import of this file (from
// the Supabase client) runs before anything renders, so a missing variable
// fails loudly at boot instead of surfacing as an opaque network error at
// runtime. Optional keys stay optional: observability and push are features,
// not prerequisites.
const EnvSchema = z.object({
  VITE_SUPABASE_URL: z.string().url({
    message: "VITE_SUPABASE_URL must be a valid URL (e.g. https://xyz.supabase.co)",
  }),
  VITE_SUPABASE_PUBLISHABLE_KEY: z.string().min(20, {
    message: "VITE_SUPABASE_PUBLISHABLE_KEY looks missing or truncated",
  }),
  VITE_SENTRY_DSN: z.string().optional(),
  VITE_POSTHOG_KEY: z.string().optional(),
  VITE_POSTHOG_HOST: z.string().optional(),
  VITE_APP_RELEASE: z.string().optional(),
  VITE_VAPID_PUBLIC_KEY: z.string().optional(),
  VITE_BRACELET_BASE_URL: z.string().optional(),
});

export type Env = z.infer<typeof EnvSchema>;

function loadEnv(): Env {
  const parsed = EnvSchema.safeParse(import.meta.env);
  if (!parsed.success) {
    const problems = parsed.error.issues
      .map((i) => `  - ${i.path.join(".")}: ${i.message}`)
      .join("\n");
    const message = `Environment configuration is invalid:\n${problems}`;
    // Surface in the page as well as the console — a blank screen with a
    // console error is exactly the failure mode this file exists to prevent.
    if (typeof document !== "undefined") {
      const el = document.getElementById("root");
      if (el && !el.hasChildNodes()) {
        el.innerHTML = `<pre style="padding:2rem;font-family:monospace;white-space:pre-wrap">${message}</pre>`;
      }
    }
    throw new Error(message);
  }
  return parsed.data;
}

export const env = loadEnv();
