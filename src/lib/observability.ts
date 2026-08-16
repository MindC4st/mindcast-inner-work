// Observability init — Sentry (crash/error + release health) and PostHog
// (product analytics + session replay + feature flags).
//
// Both are OFF unless their env vars are set, and are loaded via computed
// dynamic imports so the web build stays green even before the packages are
// installed. Install `@sentry/react` and `posthog-js`, set the env vars, and
// they activate automatically.
//
// Privacy (MC-SEC-001 / MC-SEC-003): neither transport may carry member
// journal/reflection text, safeguarding content, staff personnel records or
// credentials. Sentry strips known PII shapes before send; PostHog runs with
// full text masking and no session replay.
//
// Env:
//   VITE_SENTRY_DSN        — enable Sentry
//   VITE_POSTHOG_KEY       — enable PostHog
//   VITE_POSTHOG_HOST      — PostHog host (default https://us.i.posthog.com)
//   VITE_APP_RELEASE       — release id for source-map association (web + Capacitor)

const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

const scrub = (value: string): string =>
  value
    .replace(EMAIL_RE, "[redacted:email]")
    .replace(/\b(eyJ|sb_|sk_|sk_live_|sk_test_|service_role)[A-Za-z0-9._-]+/g, "[redacted:credential]")
    .replace(/\b\d{4}[ -]?\d{4}[ -]?\d{4}[ -]?\d{4}\b/g, "[redacted:card]");

export async function initObservability() {
  const dsn = import.meta.env.VITE_SENTRY_DSN as string | undefined;
  if (dsn) {
    try {
      const pkg = "@sentry/react";
      const Sentry = (await import(/* @vite-ignore */ pkg)) as {
        init: (options: {
          dsn: string;
          release?: string;
          environment?: string;
          tracesSampleRate?: number;
          replaysOnErrorSampleRate?: number;
          beforeSend?: (event: Record<string, unknown>) => Record<string, unknown> | null;
        }) => void;
      };
      Sentry.init({
        dsn,
        release: import.meta.env.VITE_APP_RELEASE,
        environment: import.meta.env.MODE,
        // Crash visibility during live sessions matters more than volume here.
        tracesSampleRate: 0.2,
        replaysOnErrorSampleRate: 1.0,
        // Strip PII and credentials from every event before it leaves the device.
        beforeSend: (event) => {
          try {
            const s = JSON.stringify(event);
            const scrubbed = JSON.parse(scrub(s)) as Record<string, unknown>;
            const user = scrubbed.user as Record<string, unknown> | undefined;
            if (user) {
              delete user.email;
              delete user.username;
              delete user.name;
            }
            return scrubbed;
          } catch {
            return event;
          }
        },
      });
    } catch (e) {
      console.warn("Sentry init skipped:", e);
    }
  }

  const posthogKey = import.meta.env.VITE_POSTHOG_KEY as string | undefined;
  if (posthogKey) {
    try {
      const pkg = "posthog-js";
      const posthog = (await import(/* @vite-ignore */ pkg)).default as {
        init: (key: string, options: {
          api_host: string;
          capture_pageview?: boolean;
          disable_session_recording?: boolean;
          mask_all_text?: boolean;
          mask_all_element_attributes?: boolean;
          sanitize_properties?: (props: Record<string, unknown>, event: string) => Record<string, unknown>;
        }) => void;
      };
      posthog.init(posthogKey, {
        api_host: (import.meta.env.VITE_POSTHOG_HOST as string) || "https://us.i.posthog.com",
        capture_pageview: true,
        // No session replay; full text masking on autocaptured events. Product
        // analytics only — never content capture.
        disable_session_recording: true,
        mask_all_text: true,
        mask_all_element_attributes: true,
        sanitize_properties: (props) => {
          const out: Record<string, unknown> = {};
          for (const [k, v] of Object.entries(props)) {
            out[k] = typeof v === "string" ? scrub(v) : v;
          }
          return out;
        },
      });
    } catch (e) {
      console.warn("PostHog init skipped:", e);
    }
  }
}
