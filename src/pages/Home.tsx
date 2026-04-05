import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowRight } from "lucide-react";

const APPS = [
  {
    name: "Little Minds Big Questions",
    tagline: "Gentle answers to children's biggest questions.",
    description: "AI-powered bedtime stories for parents navigating the hard questions — death, fairness, love, and more.",
    path: "/little-minds",
    color: "#6B9FD4",
    emoji: "✦",
    platform: "App — iOS & Android",
    status: "available" as const,
  },
  {
    name: "Signal",
    tagline: "A wellness companion for your cycle.",
    description: "Track your cycle, understand your body, and align your energy with your natural rhythms.",
    path: "/signal",
    color: "#C4526E",
    emoji: "◑",
    platform: "App — iOS & Android",
    status: "coming_soon" as const,
  },
  {
    name: "Mindcast Connect",
    tagline: "A private space for couples to grow closer.",
    description: "AI-guided conversations for two people working through the real challenges of being together.",
    path: "/connect",
    color: "#9B89B4",
    emoji: "◌",
    platform: "App — iOS & Android",
    status: "coming_soon" as const,
  },
  {
    name: "Mindcast Community",
    tagline: "The weekly gathering.",
    description: "Where it all started. Join a weekly session and discover what's possible when a community thinks together.",
    path: "/sessions",
    color: "#C4A96E",
    emoji: "○",
    platform: "Weekly in-person + online",
    status: "available" as const,
  },
];

const STEPS = [
  { num: "1", title: "We watch something together", desc: "A curated podcast or video chosen each week. No lecturing. Just a conversation starter." },
  { num: "2", title: "We reflect", desc: "AI-generated questions specific to that week's video. Your workbook. Your answers. Nobody else's." },
  { num: "3", title: "We set one goal", desc: "One thing. Before next week. Then we report back." },
];

const Home = () => {
  const { session } = useAuth();
  const [activeSession, setActiveSession] = useState<any>(null);

  useEffect(() => {
    supabase
      .from("sessions")
      .select("*")
      .eq("status", "active")
      .limit(1)
      .maybeSingle()
      .then(({ data }) => setActiveSession(data));
  }, []);

  return (
    <div className="min-h-screen" style={{ background: "#0D0B14", color: "#fff" }}>
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 md:px-12 py-5">
        <Link to="/" className="font-display text-lg font-bold tracking-[0.2em] text-white">MINDCAST</Link>
        <div className="hidden md:flex items-center gap-8 text-[11px] tracking-[0.12em] font-body text-white/40">
          <Link to="/sessions" className="hover:text-white/70 transition-colors">BROWSE</Link>
          {session ? (
            <Link to="/dashboard" className="hover:text-white/70 transition-colors">DASHBOARD</Link>
          ) : (
            <Link to="/auth" className="hover:text-white/70 transition-colors">LOGIN / JOIN</Link>
          )}
        </div>
        <div className="md:hidden">
          {session ? (
            <Link to="/dashboard" className="text-white/40 text-xs font-body">Dashboard →</Link>
          ) : (
            <Link to="/auth" className="text-white/40 text-xs font-body">Join →</Link>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 md:px-12 pt-20 pb-24 md:pt-32 md:pb-32 max-w-3xl mx-auto text-center">
        <h1 className="font-display text-4xl md:text-6xl font-bold tracking-[0.08em] mb-5">Mindcast</h1>
        <p className="text-white/60 text-lg md:text-xl font-body mb-3">
          A weekly gathering for people who want to think, grow, and belong.
        </p>
        <p className="text-white/30 text-sm font-body mb-10 max-w-md mx-auto">
          No religion. No lectures. Just honest conversations about how to live.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to={activeSession ? "/workbook" : "/sessions"}
            className="px-8 py-3.5 bg-white text-[#0D0B14] text-xs tracking-[0.15em] font-display font-bold hover:bg-white/90 transition-colors"
          >
            THIS WEEK'S SESSION <ArrowRight className="inline ml-1" size={14} />
          </Link>
          <Link
            to="/about"
            className="px-8 py-3.5 border border-white/15 text-white/60 text-xs tracking-[0.15em] font-body hover:border-white/30 hover:text-white transition-colors"
          >
            WHAT IS MINDCAST?
          </Link>
        </div>
      </section>

      {/* How a session works */}
      <section className="px-6 md:px-12 py-20 border-t border-white/[0.06]">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-center font-display text-xs tracking-[0.25em] text-white/30 mb-14">HOW A SESSION WORKS</h2>
          <div className="grid md:grid-cols-3 gap-10 md:gap-8">
            {STEPS.map((s) => (
              <div key={s.num}>
                <span className="text-white/10 font-display text-5xl font-bold">{s.num}</span>
                <h3 className="font-display text-base font-bold text-white mt-3 mb-2">{s.title}</h3>
                <p className="text-white/35 text-sm font-body leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* This week's session */}
      {activeSession && (
        <section className="px-6 md:px-12 py-16 border-t border-white/[0.06]">
          <div className="max-w-xl mx-auto text-center">
            <p className="text-white/20 text-[10px] tracking-[0.2em] font-body mb-3">
              WEEK {activeSession.session_number} · {activeSession.session_date}
            </p>
            <h3 className="font-display text-xl font-bold text-white mb-2">{activeSession.title}</h3>
            {activeSession.theme && (
              <p className="text-white/40 text-sm font-body mb-6">{activeSession.theme}</p>
            )}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/workbook"
                className="px-6 py-3 bg-white/5 border border-white/10 text-white text-xs tracking-[0.12em] font-body hover:bg-white/10 transition-colors"
              >
                Members — open your workbook →
              </Link>
              {!session && (
                <Link
                  to="/auth"
                  className="px-6 py-3 text-white/30 text-xs tracking-[0.12em] font-body hover:text-white/60 transition-colors"
                >
                  Not a member? Join →
                </Link>
              )}
            </div>
          </div>
        </section>
      )}

      {/* App ecosystem */}
      <section className="px-6 md:px-12 py-20 border-t border-white/[0.06]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-center font-display text-xs tracking-[0.25em] text-white/30 mb-14">
            THE MINDCAST FAMILY
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {APPS.map((app) => (
              <Link
                key={app.name}
                to={app.path}
                className="group border border-white/[0.06] p-6 hover:border-white/15 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <span className="text-2xl" style={{ color: app.color }}>{app.emoji}</span>
                  {app.status === "coming_soon" && (
                    <span className="text-[9px] tracking-[0.12em] font-body text-white/20 border border-white/10 px-2 py-0.5">
                      COMING SOON
                    </span>
                  )}
                </div>
                <h3 className="font-display text-sm font-bold text-white mb-1">{app.name}</h3>
                <p className="text-white/50 text-xs font-body mb-3">{app.tagline}</p>
                <p className="text-white/25 text-xs font-body leading-relaxed mb-4">{app.description}</p>
                <span className="text-[9px] tracking-[0.1em] font-body text-white/15">{app.platform}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 md:px-12 py-12 border-t border-white/[0.06] text-center">
        <p className="font-display text-sm font-bold text-white/30 tracking-[0.15em] mb-2">MINDCAST</p>
        <p className="text-white/15 text-[10px] font-body tracking-[0.1em] mb-6">
          mindcast.co.nz · Built in New Zealand
        </p>
        <div className="flex justify-center gap-6 text-[10px] tracking-[0.1em] font-body text-white/20">
          <Link to="/" className="hover:text-white/40 transition-colors">Home</Link>
          <Link to="/sessions" className="hover:text-white/40 transition-colors">Sessions</Link>
          <Link to="/about" className="hover:text-white/40 transition-colors">About</Link>
        </div>
      </footer>
    </div>
  );
};

export default Home;
