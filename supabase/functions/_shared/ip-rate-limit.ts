// Per-IP sliding-window limiter for public edge functions (audit G6).
//
// In-memory by design: Deno instances are short-lived, so this is a soft
// guard that absorbs bursts and casual abuse at the edge. Hard guarantees
// (single-use tickets, per-email limits, DB triggers) live where they can be
// enforced durably. Never block legitimate door traffic on a limiter — the
// limits below sit far above real usage.

const buckets = new Map<string, number[]>();

export function ipAllowed(ip: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const hits = (buckets.get(ip) ?? []).filter((t) => now - t < windowMs);
  if (hits.length >= max) {
    buckets.set(ip, hits);
    return false;
  }
  hits.push(now);
  buckets.set(ip, hits);
  // Rough memory guard for long-lived instances.
  if (buckets.size > 10000) buckets.clear();
  return true;
}

export function clientIp(req: Request): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}
