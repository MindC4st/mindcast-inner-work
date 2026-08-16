import { defineConfig } from "@playwright/test";

// Critical-path smoke tests run against the deployed site (no webServer) so
// they're cheap in CI and double as a post-deploy smoke. Override with
// PLAYWRIGHT_BASE_URL for a preview URL.
export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  retries: 1,
  reporter: [["list"]],
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "https://www.mindcast.co.nz",
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { browserName: "chromium" } }],
});
