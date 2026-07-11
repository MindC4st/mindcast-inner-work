// Observability init — Sentry (crash/error + release health) and PostHog
// (product analytics + session replay + feature flags).
//
// Both are OFF unless their env vars are set, and are loaded via computed
// dynamic imports so the web build stays green even before the packages are
// installed. Install `@sentry/react` and `posthog-js`, set the env vars, and
// they activate automatically.
//
// Env:
//   VITE_SENTRY_DSN        — enable Sentry
//   VITE_POSTHOG_KEY       — enable PostHog
//   VITE_POSTHOG_HOST      — PostHog host (default https://us.i.posthog.com)
//   VITE_APP_RELEASE       — release id for source-map association (web + Capacitor)

export async function initObservability() {
  const dsn = import.meta.env.VITE_SENTRY_DSN as string | undefined;
  if (dsn) {
    try {
      const pkg = "@sentry/react";
      const Sentry: any = await import(/* @vite-ignore */ pkg);
      Sentry.init({
        dsn,
        release: import.meta.env.VITE_APP_RELEASE,
        environment: import.meta.env.MODE,
        // Crash visibility during live sessions matters more than volume here.
        tracesSampleRate: 0.2,
        replaysOnErrorSampleRate: 1.0,
      });
    } catch (e) {
      console.warn("Sentry init skipped:", e);
    }
  }

  const posthogKey = import.meta.env.VITE_POSTHOG_KEY as string | undefined;
  if (posthogKey) {
    try {
      const pkg = "posthog-js";
      const posthog: any = (await import(/* @vite-ignore */ pkg)).default;
      posthog.init(posthogKey, {
        api_host: (import.meta.env.VITE_POSTHOG_HOST as string) || "https://us.i.posthog.com",
        capture_pageview: true,
        // Session replay is opt-in per project settings; masked by default.
        disable_session_recording: false,
      });
    } catch (e) {
      console.warn("PostHog init skipped:", e);
    }
  }
}
