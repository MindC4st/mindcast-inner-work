import { describe, it, expect } from "vitest";
import { FunctionsHttpError, FunctionsFetchError } from "@supabase/supabase-js";
import { describeFunctionError } from "./functionError";

const httpError = (status: number, body?: unknown) =>
  new FunctionsHttpError(
    new Response(body === undefined ? null : JSON.stringify(body), {
      status,
      headers: { "Content-Type": "application/json" },
    }),
  );

describe("describeFunctionError", () => {
  it("recovers the status that invoke() hides behind its generic message", async () => {
    const err = httpError(404, { error: "Unknown bracelet" });
    // This is the whole point: err.message alone tells you nothing.
    expect(err.message).toBe("Edge Function returned a non-2xx status code");

    const failure = await describeFunctionError(err, { 404: "Bracelet not linked yet." });
    expect(failure.status).toBe(404);
    expect(failure.serverMessage).toBe("Unknown bracelet");
    expect(failure.message).toBe("Bracelet not linked yet.");
  });

  it("falls back to the function's own error when the status is unmapped", async () => {
    const failure = await describeFunctionError(httpError(418, { error: "I am a teapot" }), {});
    expect(failure.message).toBe("I am a teapot");
  });

  it("uses the caller's fallback when there is no usable body", async () => {
    const failure = await describeFunctionError(httpError(500), {}, "Please see a facilitator.");
    expect(failure.status).toBe(500);
    expect(failure.serverMessage).toBeNull();
    expect(failure.message).toBe("Please see a facilitator.");
  });

  it("does not throw when the function returned HTML instead of JSON", async () => {
    const err = new FunctionsHttpError(
      new Response("<html>502 Bad Gateway</html>", { status: 502 }),
    );
    const failure = await describeFunctionError(err, {}, "Try again.");
    expect(failure.status).toBe(502);
    expect(failure.message).toBe("Try again.");
  });

  it("distinguishes never reaching the server from a server rejection", async () => {
    const failure = await describeFunctionError(new FunctionsFetchError(new TypeError("offline")), {
      404: "Bracelet not linked yet.",
    });
    expect(failure.status).toBe(0);
    expect(failure.message).toMatch(/couldn't reach the server/i);
  });
});
