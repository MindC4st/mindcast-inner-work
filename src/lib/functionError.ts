import { FunctionsHttpError, FunctionsFetchError, FunctionsRelayError } from "@supabase/supabase-js";

// Turn a supabase.functions.invoke() failure into something a human can act on.
//
// Why this exists: on any non-2xx, supabase-js throws a FunctionsHttpError whose
// `message` is the fixed string "Edge Function returned a non-2xx status code".
// The response our function actually sent — {"error":"Unknown bracelet"} and its
// status — is on `error.context`, which is an unread Response. So the default
// `err.message` tells you only that something failed, never what, and every
// distinct failure looks identical at the door.

export type FunctionFailure = {
  /** HTTP status from the function, or 0 when the request never got there. */
  status: number;
  /** The function's own `error` string, when it sent one. */
  serverMessage: string | null;
  /** What to actually show a person. */
  message: string;
};

/**
 * Read the real status and body out of an invoke() error.
 *
 * `messages` maps a status code to the copy for that case; `fallback` covers
 * anything unmapped. Callers supply their own wording because "404" means
 * "bracelet not linked" at the door and something else elsewhere.
 */
export async function describeFunctionError(
  err: unknown,
  messages: Record<number, string>,
  fallback = "Something went wrong. Please try again.",
): Promise<FunctionFailure> {
  if (err instanceof FunctionsHttpError) {
    const res = err.context as Response | undefined;
    const status = res?.status ?? 0;

    // The body is JSON in the normal case, but a crashed function can return
    // HTML or nothing at all — never let parsing it throw over the top of the
    // error we are trying to report.
    let serverMessage: string | null = null;
    try {
      const body = await res?.clone().json();
      const raw = (body as { error?: unknown })?.error;
      if (typeof raw === "string" && raw.trim()) serverMessage = raw.trim();
    } catch {
      /* not JSON — fall back to the status-based copy */
    }

    return { status, serverMessage, message: messages[status] ?? serverMessage ?? fallback };
  }

  // Never reached the function: offline, DNS, CORS, or the project is paused.
  if (err instanceof FunctionsFetchError || err instanceof FunctionsRelayError) {
    return {
      status: 0,
      serverMessage: null,
      message: "Couldn't reach the server. Check the connection and try again.",
    };
  }

  const message = err instanceof Error && err.message ? err.message : fallback;
  return { status: 0, serverMessage: null, message };
}
