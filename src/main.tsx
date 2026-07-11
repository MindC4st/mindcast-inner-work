import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initObservability } from "./lib/observability";

// Env-gated; no-op unless VITE_SENTRY_DSN / VITE_POSTHOG_KEY are set.
initObservability();

createRoot(document.getElementById("root")!).render(<App />);

// Register the Web Push service worker. Skipped in dev because Vite serves
// from a different origin pattern than prod and the SW would intercept HMR.
if ("serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch((err) => {
      console.warn("Service worker registration failed:", err);
    });
  });
}
