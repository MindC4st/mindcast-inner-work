import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Radio, History, Users, Baby, BookOpen, Clapperboard, ClipboardList } from "lucide-react";

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
    // Check is_admin on profiles
    supabase
      .from("profiles")
      .select("is_admin")
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => {
        if (!data?.is_admin) {
          toast({ title: "Access denied", description: "You don't have access to that page.", variant: "destructive" });
          navigate("/");
        }
      });
  }, [user, loading]);

  const tiles = [
    { label: "Session Planning", icon: Calendar, to: "/admin/sessions", desc: "Plan and manage weekly sessions" },
    { label: "Live Session", icon: Radio, to: "/admin/live", desc: "Run the live session experience" },
    { label: "History", icon: History, to: "/admin/history", desc: "Review past sessions and data" },
    { label: "Framework", icon: Calendar, to: "/admin/framework", desc: "Edit the session running order" },
    { label: "Kids Planning", icon: Baby, to: "/admin/kids", desc: "Plan children's programme" },
    { label: "Members", icon: Users, to: "/admin/members", desc: "Manage members and NFC IDs" },
    { label: "Curriculum", icon: BookOpen, to: "/admin/curriculum", desc: "52-week programme overview" },
    { label: "Session Runner", icon: Clapperboard, to: "/admin/session-runner", desc: "Run live sessions on TV" },
    { label: "Pilot Applications", icon: ClipboardList, to: "/admin/applications", desc: "Review pilot intake answers" },
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
