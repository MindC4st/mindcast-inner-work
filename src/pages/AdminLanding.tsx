import { Link } from "react-router-dom";
import { Calendar, History, Users, Baby, Clapperboard, ClipboardList, Mail, Home, CalendarClock, CreditCard, MessageSquare, Nfc, CalendarDays, LayoutDashboard } from "lucide-react";

const AdminLanding = () => {

  const tiles = [
    { label: "Dashboard", icon: LayoutDashboard, to: "/admin/dashboard", desc: "Member registrations, status & attendance" },
    { label: "Program Schedule", icon: CalendarDays, to: "/admin/program", desc: "Set Week 1 date & timezone for unlocks" },
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
