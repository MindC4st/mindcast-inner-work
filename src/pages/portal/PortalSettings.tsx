import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import PortalLayout from "@/components/portal/PortalLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useWebPush } from "@/hooks/useWebPush";
import { Bell, BellOff, Mail, AlertTriangle, Loader2 } from "lucide-react";

type DisplayMode = "full" | "first_initial" | "anonymous";

const previewFor = (first: string, last: string, mode: DisplayMode): string => {
  if (mode === "anonymous") return "Anonymous";
  if (mode === "full") return `${first} ${last}`.trim() || "Member";
  return last ? `${first} ${last[0].toUpperCase()}.` : (first || "Member");
};

const PortalSettings = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [name, setName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [liveMode, setLiveMode] = useState<DisplayMode>("first_initial");
  const [emailReminders, setEmailReminders] = useState(true);
  const [pushReminders, setPushReminders] = useState(true);
  const [saving, setSaving] = useState(false);
  const { state: pushState, enable: enablePush, disable: disablePush } = useWebPush();

  useEffect(() => {
    if (!profile) return;
    setName(profile.name || "");
    const p: any = profile;
    setFirstName(p.first_name || "");
    setLastName(p.last_name || "");
    setLiveMode((p.live_display_mode as DisplayMode) || "first_initial");
    setEmailReminders(p.notify_practice_email ?? true);
    setPushReminders(p.notify_practice_push ?? true);
  }, [profile]);

  const preview = useMemo(() => previewFor(firstName, lastName, liveMode), [firstName, lastName, liveMode]);

  const handleDelete = async () => {
    if (deleting) return;
    setDeleting(true);
    try {
      const { data, error } = await supabase.functions.invoke("delete-account", { body: {} });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      toast({ title: "Account deleted", description: "Your account and data have been removed." });
      await signOut();
      navigate("/");
    } catch (e: any) {
      setDeleting(false);
      toast({ title: "Couldn't delete account", description: e?.message ?? "Please try again or contact us.", variant: "destructive" });
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({
      name,
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      live_display_mode: liveMode,
      notify_practice_email: emailReminders,
      notify_practice_push: pushReminders,
    } as any).eq("user_id", user.id);
    setSaving(false);
    if (error) {
      toast({ title: "Failed to save", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Profile updated" });
    }
  };

  const handleEnablePush = async () => {
    const result = await enablePush();
    if (!result.ok) {
      toast({ title: "Couldn't enable push", description: result.error, variant: "destructive" });
    } else {
      toast({ title: "Push enabled on this device" });
    }
  };

  const handleDisablePush = async () => {
    await disablePush();
    toast({ title: "Push disabled on this device" });
  };

  return (
    <PortalLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="portal-heading text-3xl text-foreground mb-2">Profile</h1>
        <p className="text-sm text-muted-foreground mb-8 font-body font-light">Manage your account.</p>

        <div className="border border-foreground/[0.08] p-6 md:p-8 space-y-6 max-w-lg">
          <div>
            <label className="portal-label block mb-2">NAME</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-transparent border-b border-foreground/15 text-foreground px-0 py-3 text-sm font-body font-light focus:border-foreground/40 focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="portal-label block mb-2">EMAIL</label>
            <p className="text-sm text-foreground/50 font-body font-light py-3">{user?.email}</p>
          </div>

          <div>
            <label className="portal-label block mb-2">MEMBERSHIP</label>
            <p className="text-sm text-foreground/50 font-body font-light py-3">Pilot — Term 1 2026</p>
          </div>

          <button
            onClick={handleSave}
            disabled={saving || !name}
            className="bg-primary text-primary-foreground px-6 py-3 text-[11px] tracking-[0.2em] font-body hover:bg-primary/90 transition-colors disabled:opacity-40"
          >
            {saving ? "SAVING..." : "SAVE CHANGES"}
          </button>
        </div>

        {/* ===== LIVE SESSION DISPLAY ===== */}
        <div className="border border-foreground/[0.08] p-6 md:p-8 space-y-6 max-w-lg mt-6">
          <div>
            <h2 className="portal-heading text-xl text-foreground mb-1">Live session display</h2>
            <p className="text-xs text-muted-foreground font-body font-light leading-relaxed">
              Choose how your name appears on screen when you share a reflection during Mindcast LIVE sessions.
              You can also change this from the live join screen.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="portal-label block mb-2">FIRST NAME</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full bg-transparent border-b border-foreground/15 text-foreground px-0 py-3 text-sm font-body font-light focus:border-foreground/40 focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="portal-label block mb-2">LAST NAME</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full bg-transparent border-b border-foreground/15 text-foreground px-0 py-3 text-sm font-body font-light focus:border-foreground/40 focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="portal-label block mb-3">SHOW MY NAME AS</label>
            <div className="space-y-2">
              {([
                { v: "full",          label: "Full name",         hint: `e.g. ${previewFor(firstName || "Ash", lastName || "Carmichael", "full")}` },
                { v: "first_initial", label: "First + initial",   hint: `e.g. ${previewFor(firstName || "Ash", lastName || "Carmichael", "first_initial")}` },
                { v: "anonymous",     label: "Anonymous",         hint: "No name shown on screen" },
              ] as const).map(opt => (
                <button
                  key={opt.v}
                  onClick={() => setLiveMode(opt.v)}
                  className={`w-full flex items-center justify-between text-left px-3 py-2.5 border rounded-sm transition-colors ${
                    liveMode === opt.v
                      ? "border-primary bg-primary/5"
                      : "border-foreground/10 hover:border-foreground/30"
                  }`}
                >
                  <div>
                    <p className="text-sm text-foreground font-body">{opt.label}</p>
                    <p className="text-[11px] text-muted-foreground font-body font-light mt-0.5">{opt.hint}</p>
                  </div>
                  <span className={`w-4 h-4 rounded-full border-2 ${liveMode === opt.v ? "border-primary bg-primary" : "border-foreground/30"}`} />
                </button>
              ))}
            </div>
          </div>

          <div className="border-l-2 border-primary/40 pl-4 py-2">
            <p className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground font-body mb-1">Preview on screen</p>
            <p className="text-sm text-foreground font-body italic">"{preview}"</p>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-primary text-primary-foreground px-6 py-3 text-[11px] tracking-[0.2em] font-body hover:bg-primary/90 transition-colors disabled:opacity-40"
          >
            {saving ? "SAVING..." : "SAVE CHANGES"}
          </button>
        </div>

        {/* ===== PRACTICE REMINDERS ===== */}
        <div className="border border-foreground/[0.08] p-6 md:p-8 space-y-6 max-w-lg mt-6">
          <div>
            <h2 className="portal-heading text-xl text-foreground mb-1">Practice reminders</h2>
            <p className="text-xs text-muted-foreground font-body font-light leading-relaxed">
              We send your weekly practice prompts on Monday and Wednesday evenings, plus a gentle
              Sunday morning nudge before the live session. Two channels — pick whichever feels right.
            </p>
          </div>

          {/* Email toggle */}
          <button
            onClick={() => setEmailReminders(v => !v)}
            className="w-full flex items-center justify-between px-4 py-3 border border-foreground/10 rounded-sm hover:border-foreground/30 transition-colors"
          >
            <div className="flex items-center gap-3 text-left">
              <Mail size={18} className="text-foreground/60" />
              <div>
                <p className="text-sm text-foreground font-body">Email reminders</p>
                <p className="text-[11px] text-muted-foreground font-body font-light">Works everywhere — the reliable floor.</p>
              </div>
            </div>
            <span className={`w-9 h-5 rounded-full relative transition-colors shrink-0 ${emailReminders ? "bg-primary" : "bg-foreground/15"}`}>
              <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${emailReminders ? "left-[18px]" : "left-0.5"}`} />
            </span>
          </button>

          {/* Push toggle + device enable */}
          <div className="border border-foreground/10 rounded-sm">
            <button
              onClick={() => setPushReminders(v => !v)}
              className="w-full flex items-center justify-between px-4 py-3"
            >
              <div className="flex items-center gap-3 text-left">
                <Bell size={18} className="text-foreground/60" />
                <div>
                  <p className="text-sm text-foreground font-body">Phone push notifications</p>
                  <p className="text-[11px] text-muted-foreground font-body font-light">Installed PWA only. Feels like a real phone alert.</p>
                </div>
              </div>
              <span className={`w-9 h-5 rounded-full relative transition-colors shrink-0 ${pushReminders ? "bg-primary" : "bg-foreground/15"}`}>
                <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${pushReminders ? "left-[18px]" : "left-0.5"}`} />
              </span>
            </button>

            {pushReminders && (
              <div className="border-t border-foreground/10 px-4 py-3 bg-foreground/[0.02]">
                {pushState.status === "unsupported" && (
                  <p className="text-[11px] text-muted-foreground font-body font-light">
                    This browser doesn't support push notifications. Try opening the site in Chrome or installing the PWA to your home screen on iOS 16.4+.
                  </p>
                )}
                {pushState.status === "denied" && (
                  <p className="text-[11px] text-muted-foreground font-body font-light">
                    Notifications are blocked for this site. Allow them in your browser settings to enable push on this device.
                  </p>
                )}
                {(pushState.status === "default" || pushState.status === "granted-no-sub") && (
                  <button
                    onClick={handleEnablePush}
                    className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 text-[11px] tracking-[0.2em] font-body hover:bg-primary/90 transition-colors"
                  >
                    <Bell size={13} /> Enable on this device
                  </button>
                )}
                {pushState.status === "subscribed" && (
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[11px] text-foreground font-body">✓ This device is subscribed.</p>
                    <button
                      onClick={handleDisablePush}
                      className="flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-foreground tracking-widest uppercase font-body"
                    >
                      <BellOff size={12} /> Turn off
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-primary text-primary-foreground px-6 py-3 text-[11px] tracking-[0.2em] font-body hover:bg-primary/90 transition-colors disabled:opacity-40"
          >
            {saving ? "SAVING..." : "SAVE CHANGES"}
          </button>

          {/* Danger zone — permanent account + data deletion */}
          <div className="mt-12 pt-8 border-t border-destructive/20">
            <h2 className="portal-heading text-xl text-destructive mb-1 flex items-center gap-2">
              <AlertTriangle size={16} /> Delete account
            </h2>
            <p className="text-sm text-muted-foreground font-body font-light mb-4 max-w-md">
              Permanently deletes your account, your private journal, and your data,
              and ends any membership. This cannot be undone.
            </p>
            {!confirmDelete ? (
              <button
                onClick={() => setConfirmDelete(true)}
                className="border border-destructive/40 text-destructive px-5 py-2.5 text-[11px] tracking-[0.2em] font-body hover:bg-destructive/5 transition-colors"
              >
                DELETE MY ACCOUNT
              </button>
            ) : (
              <div className="border border-destructive/30 bg-destructive/5 rounded-sm p-5 max-w-md">
                <p className="text-sm text-foreground font-body mb-3">
                  Type <strong>DELETE</strong> to confirm.
                </p>
                <input
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="DELETE"
                  className="w-full bg-transparent border-b border-foreground/15 text-foreground text-sm font-body px-0 py-2 mb-4 focus:border-destructive/50 focus:outline-none"
                />
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleDelete}
                    disabled={deleting || confirmText.trim().toUpperCase() !== "DELETE"}
                    className="flex items-center gap-2 bg-destructive text-destructive-foreground px-5 py-2.5 text-[11px] tracking-[0.2em] font-body hover:bg-destructive/90 transition-colors disabled:opacity-40"
                  >
                    {deleting ? <><Loader2 size={13} className="animate-spin" /> DELETING…</> : "PERMANENTLY DELETE"}
                  </button>
                  <button
                    onClick={() => { setConfirmDelete(false); setConfirmText(""); }}
                    disabled={deleting}
                    className="text-[11px] tracking-[0.2em] font-body text-muted-foreground hover:text-foreground"
                  >
                    CANCEL
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </PortalLayout>
  );
};

export default PortalSettings;
