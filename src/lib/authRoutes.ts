export const AUTH_PATH = "/auth";
export const DEFAULT_AUTH_DESTINATION = "/portal/dashboard";

/**
 * Only permit in-app paths after authentication. This prevents a crafted
 * `redirect` query parameter from turning the sign-in page into an open
 * redirect to another site.
 */
export const safeAuthDestination = (
  candidate: string | null | undefined,
  fallback = DEFAULT_AUTH_DESTINATION,
): string => {
  if (!candidate?.startsWith("/")) return fallback;

  try {
    const internalOrigin = "https://mindcast.invalid";
    const resolved = new URL(candidate, internalOrigin);
    return resolved.origin === internalOrigin ? candidate : fallback;
  } catch {
    return fallback;
  }
};

/** Build the canonical sign-in URL, optionally with a safe return journey. */
export const authPathFor = (destination?: string): string => {
  if (!destination) return AUTH_PATH;
  return `${AUTH_PATH}?redirect=${encodeURIComponent(safeAuthDestination(destination))}`;
};
