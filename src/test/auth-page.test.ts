import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const read = (path: string) => readFileSync(resolve(root, path), "utf8");

describe("account access page", () => {
  const auth = read("src/pages/Auth.tsx");
  const shell = read("src/components/auth/AuthShell.tsx");

  it("uses the established Mindcast language", () => {
    expect(shell).toContain('NOTICE IT.\\nNAME IT.\\nDO IT.');
    expect(shell).not.toContain("pause, reflect and reconnect");
  });

  it("offers email, Google and Facebook for account creation", () => {
    expect(auth).toContain("Sign up with email");
    expect(auth).toContain("Sign up with Google");
    expect(auth).toContain("Sign up with Facebook");
    expect(auth).toContain('provider: "facebook"');
  });

  it("sends new accounts into the required safeguarding setup", () => {
    expect(auth).toContain('navigate("/onboarding"');
    expect(auth).toContain('authReturnUrl("/onboarding", "signup")');
  });
});
