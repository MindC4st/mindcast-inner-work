import { useCallback, useEffect, useState } from "react";
import { db } from "@/lib/db";
import { useAuth } from "@/contexts/AuthContext";

// VAPID public key is safe to ship in the bundle (it's the "public" half).
const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY as string | undefined;

type State =
  | { status: "unsupported" }
  | { status: "loading" }
  | { status: "default" }       // permission not yet asked
  | { status: "denied" }
  | { status: "subscribed"; endpoint: string }
  | { status: "granted-no-sub" }; // user said yes but we don't have an active sub

const urlBase64ToUint8Array = (base64: string): Uint8Array => {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(b64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
};

/**
 * Manage the user's Web Push subscription for this device. The subscription
 * lives in the browser (PushManager); we mirror it into Supabase
 * `push_subscriptions` so the send-practice-reminder edge fn can find it.
 */
export const useWebPush = () => {
  const { user } = useAuth();
  const [state, setState] = useState<State>({ status: "loading" });

  const isSupported =
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window;

  const refresh = useCallback(async () => {
    if (!isSupported) { setState({ status: "unsupported" }); return; }
    if (Notification.permission === "denied") { setState({ status: "denied" }); return; }
    if (Notification.permission === "default") { setState({ status: "default" }); return; }
    // Permission already granted — check whether we have a live subscription.
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) setState({ status: "subscribed", endpoint: sub.endpoint });
      else setState({ status: "granted-no-sub" });
    } catch {
      setState({ status: "granted-no-sub" });
    }
  }, [isSupported]);

  useEffect(() => { refresh(); }, [refresh]);

  /** Register the SW (idempotent — getRegistration is fine to call repeatedly). */
  const ensureRegistered = useCallback(async (): Promise<ServiceWorkerRegistration | null> => {
    if (!isSupported) return null;
    const existing = await navigator.serviceWorker.getRegistration("/sw.js");
    if (existing) return existing;
    return await navigator.serviceWorker.register("/sw.js", { scope: "/" });
  }, [isSupported]);

  /** Prompt for permission + subscribe + persist to Supabase. */
  const enable = useCallback(async (): Promise<{ ok: boolean; error?: string }> => {
    if (!isSupported) return { ok: false, error: "Push not supported on this browser/device" };
    if (!VAPID_PUBLIC_KEY) return { ok: false, error: "VITE_VAPID_PUBLIC_KEY not set" };
    if (!user) return { ok: false, error: "Sign in first" };

    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      await refresh();
      return { ok: false, error: permission === "denied" ? "Notifications blocked" : "Permission not granted" };
    }

    const reg = await ensureRegistered();
    if (!reg) return { ok: false, error: "Couldn't register service worker" };

    // Subscribe (re-uses existing sub if one is already there).
    let sub = await reg.pushManager.getSubscription();
    if (!sub) {
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY).buffer as ArrayBuffer,
      });
    }

    // PushSubscription.toJSON() exposes endpoint + keys.p256dh + keys.auth
    const json = sub.toJSON() as { endpoint?: string; keys?: { p256dh?: string; auth?: string } };
    if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) {
      return { ok: false, error: "Subscription missing keys" };
    }

    const { error } = await db
      .from("push_subscriptions")
      .upsert({
        user_id: user.id,
        endpoint: json.endpoint,
        p256dh: json.keys.p256dh,
        auth: json.keys.auth,
        user_agent: navigator.userAgent.slice(0, 250),
      }, { onConflict: "user_id,endpoint" });

    if (error) return { ok: false, error: error.message };

    setState({ status: "subscribed", endpoint: json.endpoint });
    return { ok: true };
  }, [isSupported, user, ensureRegistered, refresh]);

  /** Drop the browser subscription + remove the row from Supabase. */
  const disable = useCallback(async (): Promise<{ ok: boolean; error?: string }> => {
    if (!isSupported || !user) return { ok: false };
    const reg = await navigator.serviceWorker.getRegistration("/sw.js");
    const sub = await reg?.pushManager.getSubscription();
    const endpoint = sub?.endpoint;
    if (sub) await sub.unsubscribe();
    if (endpoint) {
      await db.from("push_subscriptions")
        .delete().eq("user_id", user.id).eq("endpoint", endpoint);
    }
    await refresh();
    return { ok: true };
  }, [isSupported, user, refresh]);

  return { state, enable, disable, refresh, isSupported };
};
