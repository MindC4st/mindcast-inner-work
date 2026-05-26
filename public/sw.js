// Mindcast service worker — Web Push handler.
//
// Push payload shape (sent by the send-practice-reminder edge fn):
//   { title, body, icon, badge, url, tag }
//
// Behaviour:
//  - push event → showNotification with the given title/body
//  - notificationclick → focus an existing tab on that URL or open one

const DEFAULT_ICON = "/pwa-icon-192.png";
const DEFAULT_BADGE = "/pwa-icon-192.png";

self.addEventListener("install", (event) => {
  // Activate this SW immediately on first install so push starts working
  // without requiring a page reload.
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  if (!event.data) return;
  let payload = {};
  try {
    payload = event.data.json();
  } catch (e) {
    payload = { title: "Mindcast", body: event.data.text() || "" };
  }
  const title = payload.title || "Mindcast";
  const opts = {
    body: payload.body || "",
    icon: payload.icon || DEFAULT_ICON,
    badge: payload.badge || DEFAULT_BADGE,
    tag: payload.tag,             // collapses prior notifications with the same tag
    data: { url: payload.url || "/" },
    // Avoid noise: no vibration / sound on weekly nudges. Keep it gentle.
  };
  event.waitUntil(self.registration.showNotification(title, opts));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || "/";
  event.waitUntil((async () => {
    const allClients = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    // Try to focus an existing tab if one's already on the target URL.
    for (const client of allClients) {
      try {
        const url = new URL(client.url);
        if (url.pathname === targetUrl || client.url.endsWith(targetUrl)) {
          return client.focus();
        }
      } catch (_) { /* ignore parse errors */ }
    }
    // Otherwise open a new one.
    return self.clients.openWindow(targetUrl);
  })());
});
