import { describe, expect, it } from "vitest";
import {
  AUTH_PATH,
  DEFAULT_AUTH_DESTINATION,
  authPathFor,
  safeAuthDestination,
} from "@/lib/authRoutes";

describe("canonical auth routing", () => {
  it("uses /auth as the single sign-in entry point", () => {
    expect(AUTH_PATH).toBe("/auth");
    expect(authPathFor()).toBe("/auth");
  });

  it("preserves an in-app return journey", () => {
    expect(authPathFor("/live/ROOM-1?view=prompt#answer")).toBe(
      "/auth?redirect=%2Flive%2FROOM-1%3Fview%3Dprompt%23answer",
    );
  });

  it("rejects external and protocol-relative redirects", () => {
    expect(safeAuthDestination("https://example.com")).toBe(DEFAULT_AUTH_DESTINATION);
    expect(safeAuthDestination("//example.com/path")).toBe(DEFAULT_AUTH_DESTINATION);
    expect(safeAuthDestination("/\\example.com/path")).toBe(DEFAULT_AUTH_DESTINATION);
    expect(safeAuthDestination(null)).toBe(DEFAULT_AUTH_DESTINATION);
  });
});
