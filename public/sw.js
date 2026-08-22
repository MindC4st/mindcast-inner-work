// Mindcast service worker — offline app-shell + Web Push.
//
// Caching strategy (deliberately conservative so we NEVER serve stale live
// session or journal data):
//   - Navigations        → network-first, fall back to cached shell, then offline page.
//   - Static build assets → stale-while-revalidate (hashed filenames, safe to reuse).
//   - Supabase API/Realtime/Functions & any POST → network-only, never cached.
//   - Push / notificationclick → unchanged from the push-only SW.
//
// Bump CACHE_VERSION to invalidate old caches on deploy.

const CACHE_VERSION = "mindcast-v1";
const SHELL_CACHE = `${CACHE_VERSION}-shell`;
const ASSET_CACHE = `${CACHE_VERSION}-assets`;
const OFFLINE_URL = "/offline.html";

// Minimal shell precache. The SPA entry (index.html) is cached at runtime on
// first navigation; here we only guarantee the offline fallback + icons.
const PRECACHE = [OFFLINE_URL, "/manifest.json", "/pwa-icon-192.png"];

const DEFAULT_ICON = "/pwa-icon-192.png";
const DEFAULT_BADGE = "/pwa-icon-192.png";

// Requests we must always hit the network for (live data, auth, APIs).
function isNetworkOnly(url) {
  return (
    url.hostname.endsWith(".supabase.co") ||
    url.pathname.startsWith("/functions/") ||
    url.pathname.startsWith("/rest/") ||
    url.pathname.startsWith("/realtime/") ||
    url.pathname === "/auth" ||
    url.pathname.startsWith("/auth/")
  );
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((c) => c.addAll(PRECACHE)).catch(() => {}),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.filter((k) => !k.startsWith(CACHE_VERSION)).map((k) => caches.delete(k)),
      );
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return; // never cache mutations

  let url;
  try { url = new URL(request.url); } catch { return; }
  if (url.origin !== self.location.origin || isNetworkOnly(url)) return; // network-only

  // App navigations: network-first so members always get fresh HTML, with an
  // offline fallback to keep the installed app from showing a browser error.
  if (request.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          const fresh = await fetch(request);
          const cache = await caches.open(SHELL_CACHE);
          cache.put("/index.html", fresh.clone()).catch(() => {});
          return fresh;
        } catch {
          const cache = await caches.open(SHELL_CACHE);
          return (await cache.match("/index.html")) || (await cache.match(OFFLINE_URL)) ||
            new Response("Offline", { status: 503, headers: { "Content-Type": "text/plain" } });
        }
      })(),
    );
    return;
  }

  // Static assets: stale-while-revalidate.
  if (["script", "style", "image", "font"].includes(request.destination)) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(ASSET_CACHE);
        const cached = await cache.match(request);
        const network = fetch(request)
          .then((resp) => { if (resp && resp.ok) cache.put(request, resp.clone()); return resp; })
          .catch(() => cached);
        return cached || network;
      })(),
    );
  }
});

self.addEventListener("push", (event) => {
  if (!event.data) return;
  let payload = {};
  try { payload = event.data.json(); }
  catch (e) { payload = { title: "Mindcast", body: event.data.text() || "" }; }
  const title = payload.title || "Mindcast";
  const opts = {
    body: payload.body || "",
    icon: payload.icon || DEFAULT_ICON,
    badge: payload.badge || DEFAULT_BADGE,
    tag: payload.tag,
    data: { url: payload.url || "/" },
  };
  event.waitUntil(self.registration.showNotification(title, opts));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || "/";
  event.waitUntil((async () => {
    const allClients = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    for (const client of allClients) {
      try {
        const u = new URL(client.url);
        if (u.pathname === targetUrl || client.url.endsWith(targetUrl)) return client.focus();
      } catch (_) { /* ignore */ }
    }
    return self.clients.openWindow(targetUrl);
  })());
});
