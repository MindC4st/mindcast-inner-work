import { test, expect } from "@playwright/test";

// Public critical paths — smoke tests against the deployed site. Auth and
// payment flows (signup, subscribe, cancel) need real credentials + Stripe,
// so they live in a separate opt-in suite; these guarantee the public face
// never ships broken.

const URGENCY = ["hurry", "countdown", "only X spots", "spots left", "subscribe now", "click here"];

test("home renders the hero and CTAs", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /STOP CONSUMING/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /MEMBERSHIP/i }).first()).toBeVisible();
});

test("home has no urgency or retention copy", async ({ page }) => {
  await page.goto("/");
  const body = (await page.textContent("body"))?.toLowerCase() ?? "";
  for (const word of URGENCY) {
    expect(body, `page must not contain "${word}"`).not.toContain(word);
  }
});

test("membership page shows the room, the free session pass and concession as peer tiers", async ({ page }) => {
  await page.goto("/membership");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(/ROOM|TAUPŌ/i);
  await expect(page.getByText("FREE SESSION PASS", { exact: false }).first()).toBeVisible();
  await expect(page.getByText("CONCESSION", { exact: false }).first()).toBeVisible();
  // Charter rule: no urgency anywhere on the pricing page.
  const body = (await page.textContent("body"))?.toLowerCase() ?? "";
  for (const word of URGENCY) expect(body).not.toContain(word);
});

test("membership states cancellation up front", async ({ page }) => {
  await page.goto("/membership");
  await expect(page.getByText(/LEAVING IS TWO CLICKS|cancel any time/i).first()).toBeVisible();
});

test("trial pass form renders", async ({ page }) => {
  await page.goto("/try");
  await expect(page.getByLabel(/name/i).first()).toBeVisible();
  await expect(page.getByLabel(/email/i).first()).toBeVisible();
  await expect(page.getByRole("button", { name: /continue|free pass/i })).toBeVisible();
});

test("member login renders", async ({ page }) => {
  await page.goto("/portal/login");
  await expect(page.getByRole("heading", { name: /MEMBER PORTAL/i })).toBeVisible();
  await expect(page.getByLabel(/email/i)).toBeVisible();
  await expect(page.getByLabel(/password/i)).toBeVisible();
});

test("legal pages render", async ({ page }) => {
  for (const path of ["/privacy", "/terms"]) {
    await page.goto(path);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  }
});
