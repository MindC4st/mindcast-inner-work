import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { UserCheck, Check, Loader2, Radio, ArrowLeft, EyeOff } from "lucide-react";
import PortalLayout from "@/components/portal/PortalLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

// Member self check-in. Marks attendance at today's live session; the member's
// name is then pulled onto the display Welcome Wall (opening slide on the big
// screen) in real time. Reads today's scheduled_sessions row for the member's
// track and writes a check_ins row.

const trackForAgeGroup = (age?: string | null): string => {
  const a = (age || "adult").toLowerCase();
  if (a === "teen") return "Teen";
  if (a === "child" || a === "kids") return "Child";
  return "Adult";
};

type Sched = { id: string; track: string; week_number: number; room: string | null; status: string };

const PortalCheckIn = () => {
  const { profile } = useAuth();
  const [today, setToday] = useState<Sched | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const displayName = (profile?.name || "").trim();

  useEffect(() => {
    if (!profile) return;
    const date = new Date().toISOString().slice(0, 10);
    const track = trackForAgeGroup((profile as any).age_group);
    (supabase as any)
      .from("scheduled_sessions")
      .select("id, track, week_number, room, status")
      .eq("session_date", date).eq("track", track).neq("status", "cancelled")
      .maybeSingle()
      .then(({ data }: { data: Sched | null }) => { setToday(data); setLoading(false); });
  }, [profile]);

  const checkIn = async (anonymous: boolean) => {
    if (saving || done) return;
    setSaving(true);
    const { error } = await (supabase as any).from("check_ins").insert({
      display_name: anonymous ? "Anonymous" : (displayName || "Member"),
      profile_id: (profile as any)?.id ?? null,
      scheduled_session_id: today?.id ?? null,
      is_anonymous: anonymous,
    });
    setSaving(false);
    if (error) {
      toast({ title: "Check-in failed", description: error.message, variant: "destructive" });
      return;
    }
    setDone(true);
    toast({ title: anonymous ? "Checked in privately" : "You're checked in", description: anonymous ? "Your name stays off the wall." : "Look for your name on the welcome screen." });
  };

  return (
    <PortalLayout>
      <Link to="/portal/dashboard" className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors text-sm mb-6">
        <ArrowLeft size={15} /> Back
      </Link>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <p className="text-[10px] font-body tracking-[0.3em] uppercase text-primary mb-2">Check-in</p>
        <h1 className="font-display text-3xl md:text-4xl tracking-wider text-foreground mb-6">YOU'RE HERE</h1>

        {loading ? (
          <div className="py-16 grid place-items-center text-muted-foreground"><Loader2 className="animate-spin" /></div>
        ) : done ? (
          <motion.div initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="border border-primary/30 bg-primary/5 rounded-lg p-8 text-center">
            <div className="w-14 h-14 rounded-full bg-primary/10 grid place-items-center mx-auto mb-4">
              <Check size={26} className="text-primary" />
            </div>
            <p className="font-display text-2xl tracking-wide text-foreground mb-1">Welcome{displayName ? `, ${displayName.split(" ")[0]}` : ""}.</p>
            <p className="text-sm text-muted-foreground font-body">Your name is heading to the welcome wall now.</p>
            {today && (
              <Link to="/portal/dashboard" className="inline-block mt-6 text-[11px] tracking-widest uppercase font-body text-primary hover:underline">
                Back to portal →
              </Link>
            )}
          </motion.div>
        ) : (
          <>
            {today ? (
              <div className="mb-6 flex items-center gap-2 text-primary text-[11px] font-body tracking-widest uppercase">
                <Radio size={13} /> {today.status === "live" ? "Live now" : "Today"} · {today.track} · Week {today.week_number}{today.room ? ` · ${today.room}` : ""}
              </div>
            ) : (
              <p className="mb-6 text-sm text-muted-foreground font-body">No session is scheduled for your track today — you can still check yourself in below.</p>
            )}

            <button onClick={() => checkIn(false)} disabled={saving}
              className="w-full flex items-center justify-center gap-2.5 bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground rounded-lg py-5 text-sm font-body tracking-widest uppercase transition-all active:scale-[0.99]">
              {saving ? <Loader2 size={18} className="animate-spin" /> : <UserCheck size={18} />}
              {displayName ? `Check in as ${displayName.split(" ")[0]}` : "Check in"}
            </button>

            <button onClick={() => checkIn(true)} disabled={saving}
              className="w-full mt-3 flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground text-[11px] font-body tracking-widest uppercase py-2 transition-colors">
              <EyeOff size={13} /> Check in privately (keep my name off the wall)
            </button>
          </>
        )}
      </motion.div>
    </PortalLayout>
  );
};

export default PortalCheckIn;
