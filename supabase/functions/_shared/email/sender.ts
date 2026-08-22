// sender.ts — canonical From header for Mindcast application email.

export const MINDCAST_FROM_NAME = "M🎙️N D C A S T";
export const DEFAULT_FROM_ADDRESS = "hello@mindcast.co.nz";

/**
 * Keep the configured mailbox while enforcing the customer-facing brand name.
 * FROM_EMAIL may be either `hello@example.com` or `Old name <hello@example.com>`.
 */
export function mindcastFrom(configured?: string | null): string {
  const raw = configured?.trim() || DEFAULT_FROM_ADDRESS;
  const bracketed = raw.match(/<\s*([^<>\s]+@[^<>\s]+)\s*>$/)?.[1];
  const bare = /^[^\s<>]+@[^\s<>]+$/.test(raw) ? raw : undefined;
  const address = bracketed || bare || DEFAULT_FROM_ADDRESS;

  return `${MINDCAST_FROM_NAME} <${address}>`;
}
