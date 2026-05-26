/**
 * One-off VAPID keypair generator for Mindcast Web Push.
 *
 * Run once locally:
 *   node scripts/gen-vapid-keys.cjs
 *
 * It prints a publicKey + privateKey. Then:
 *   1. Add to your local .env (frontend reads VITE_VAPID_PUBLIC_KEY):
 *        VITE_VAPID_PUBLIC_KEY=<publicKey>
 *   2. Add to Supabase Edge Function secrets (backend signs pushes with these):
 *        VAPID_PUBLIC_KEY  = <publicKey>
 *        VAPID_PRIVATE_KEY = <privateKey>
 *        VAPID_SUBJECT     = mailto:hello@mindcast.co.nz
 *
 * KEEP THE PRIVATE KEY SECRET. Never commit it.
 */
const webpush = require("web-push");
const { publicKey, privateKey } = webpush.generateVAPIDKeys();
console.log("\nVAPID keypair — paste into env/secrets:\n");
console.log("VAPID_PUBLIC_KEY  =", publicKey);
console.log("VAPID_PRIVATE_KEY =", privateKey);
console.log("\nFrontend (.env):");
console.log("VITE_VAPID_PUBLIC_KEY=" + publicKey);
console.log("\nSubject (any contact mailto/URL — Web Push spec requires one):");
console.log("VAPID_SUBJECT=mailto:hello@mindcast.co.nz\n");
