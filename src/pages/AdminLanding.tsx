import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Calendar, History, Users, Baby, Clapperboard, ClipboardList, Mail, Home, CalendarClock, CreditCard, MessageSquare, Nfc, CalendarDays } from "lucide-react";

const AdminLanding = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate("/");
      return;
    }
    // Check staff role via user_roles (never trust profiles.is_admin — it's user-writable).
    // Facilitators run sessions; admins additionally manage members/payments.
    supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .in("role", ["facilitator", "admin"])
      .maybeSingle()
      .then(({ data }) => {
        if (!data) {
          toast({ title: "Access denied", description: "You don't have access to that page.", variant: "destructive" });
          navigate("/");
        }
      });
  }, [user, loading]);

  const tiles = [
    { label: "Facilitate Live", icon: Clapperboard, to: "/mindcast-live/library", desc: "Run the Sunday session from the 52-week coursebook" },
    { label: "History", icon: History, to: "/admin/history", desc: "Review past sessions and data" },
    { label: "Framework", icon: Calendar, to: "/admin/framework", desc: "Edit the session running order" },
    { label: "Kids Planning", icon: Baby, to: "/admin/kids", desc: "Plan children's programme" },
    { label: "Members", icon: Users, to: "/admin/members", desc: "Manage members and NFC IDs" },
    { label: "Pilot Applications", icon: ClipboardList, to: "/admin/applications", desc: "Review pilot intake answers" },
    { label: "Email Reminders", icon: Mail, to: "/admin/emails", desc: "View and send weekly reminders" },
    { label: "Scheduling", icon: CalendarClock, to: "/admin/scheduling", desc: "Schedule parallel adult/teen/child tracks" },
    { label: "Households", icon: Home, to: "/admin/households", desc: "Link guardians and children" },
    { label: "Membership", icon: CreditCard, to: "/admin/membership", desc: "Subscription & payment health" },
    { label: "Q&A Moderation", icon: MessageSquare, to: "/admin/moderation", desc: "Review shared live responses" },
    { label: "Check-in Kiosk", icon: Nfc, to: "/admin/kiosk", desc: "Staff NFC bracelet scan mode" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="flex items-center justify-between px-6 md:px-12 py-5">
        <Link to="/" className="font-display text-lg font-bold tracking-[0.2em] text-foreground">MINDCAST</Link>
      </nav>

      <div className="max-w-2xl mx-auto px-6 pt-16">
        <h1 className="font-display text-2xl font-bold text-foreground mb-2">Welcome to the Mindcast admin.</h1>
        <p className="text-foreground/30 text-sm font-body mb-12">Manage sessions, members, and community.</p>

        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          {tiles.map((t) => (
            <Link
              key={t.label}
              to={t.to}
              className="border border-foreground/[0.08] p-6 hover:border-foreground/20 transition-all group"
            >
              <t.icon size={20} className="text-foreground/20 mb-4 group-hover:text-foreground/50 transition-colors" strokeWidth={1.5} />
              <h3 className="font-display text-sm font-bold text-foreground mb-1">{t.label}</h3>
              <p className="text-foreground/25 text-xs font-body">{t.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminLanding;
