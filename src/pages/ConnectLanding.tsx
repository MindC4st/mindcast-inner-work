import { Link } from "react-router-dom";
import { ArrowLeft, Eye, MessageSquare, CheckCircle, Shield } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

/* Mindcast Connect brand palette — warm consent-first tones */
const MC = {
  bg: "#F7F3EF",           /* warm off-white */
  card: "#FFFFFF",
  shared: "#F2EDE8",       /* shared space warm */
  blueLight: "#BFD0E0",    /* partner A primary */
  blueDark: "#3A4F63",     /* partner A dark */
  lilacLight: "#D4C4E0",   /* partner B primary */
  lilacDark: "#3E2E4C",    /* partner B dark */
  accent: "#9DA8BF",       /* blue accent */
  lilacAccent: "#A78DBF",  /* lilac accent */
  text: "#2C2C2C",
  muted: "#75726F",
  destructive: "#C44D4D",
};

const FRAMEWORK = [
  {
    icon: Eye,
    title: "Notice",
    desc: "Privately reflect on what happened and how it landed. No pressure, no audience.",
    color: MC.blueLight,
    darkColor: MC.blueDark,
  },
  {
    icon: MessageSquare,
    title: "Name",
    desc: "Clarify the feeling, need, request, and boundary — AI helps organise your thoughts without judgement.",
    color: MC.lilacLight,
    darkColor: MC.lilacDark,
  },
  {
    icon: CheckCircle,
    title: "Rewire",
    desc: "Work together on one concrete behaviour change or repair action. End every session with a next step.",
    color: MC.blueLight,
    darkColor: MC.blueDark,
  },
];

const PROCESS = [
  { step: "01", title: "Write privately", desc: "Reflect on what happened and what you felt in your own private space." },
  { step: "02", title: "AI helps organise", desc: "Your assistant structures your thoughts into clear categories — no judgement." },
  { step: "03", title: "Approve what is shared", desc: "Toggle what your partner sees. Nothing is shared until you approve it." },
  { step: "04", title: "Enter shared conversation", desc: "Approved reflections appear in a guided shared space for both partners." },
  { step: "05", title: "Commit to one next step", desc: "End every session with one clear, practical action you both agree on." },
];

const POSITIONING = ["not therapy", "not group chat", "not forced sharing", "a structured relationship practice"];

const ConnectLanding = () => (
  <div className="min-h-screen" style={{ background: MC.bg, fontFamily: "'Nunito', var(--font-body), sans-serif" }}>
    <Navbar />

    {/* Hero */}
    <section className="pt-32 pb-20 px-6" style={{ background: MC.shared }}>
      <div className="container max-w-4xl mx-auto text-center">
        <Link to="/" className="inline-flex items-center gap-2 text-[10px] tracking-[0.12em] hover:opacity-70 transition-opacity mb-12" style={{ color: MC.muted, fontFamily: "var(--font-body)" }}>
          <ArrowLeft size={12} /> BACK TO MINDCAST
        </Link>

        <p className="text-[11px] tracking-[0.2em] font-body mb-6" style={{ color: MC.lilacAccent }}>MINDCAST RELATIONSHIPS</p>
        <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-6" style={{ color: MC.text, lineHeight: 1.2, fontFamily: "'Lora', var(--font-display), serif" }}>
          Private thoughts.<br />Structured repair.
        </h1>
        <p className="font-body text-base leading-relaxed max-w-2xl mx-auto mb-8" style={{ color: MC.muted }}>
          A consent-first relationship platform that helps you reflect privately, share intentionally, and work toward better conversations.
        </p>
        <a href="https://connect.mindcast.co.nz/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs tracking-wider hover:opacity-80 transition-opacity" style={{ border: `1px solid ${MC.lilacAccent}30`, color: MC.lilacAccent, fontFamily: "var(--font-body)" }}>
          VISIT WEBSITE ↗
        </a>
      </div>
    </section>

    {/* Positioning strip */}
    <section className="py-6" style={{ background: MC.bg, borderTop: `1px solid ${MC.accent}15`, borderBottom: `1px solid ${MC.accent}15` }}>
      <div className="container mx-auto px-6">
        <div className="flex flex-wrap justify-center gap-6 lg:gap-16">
          {POSITIONING.map((text, i) => (
            <span key={text} className="font-body text-sm" style={{ color: i === 3 ? MC.text : MC.muted, fontWeight: i === 3 ? 700 : 300 }}>
              {text}
            </span>
          ))}
        </div>
      </div>
    </section>

    {/* Framework — with partner color coding */}
    <section className="py-20 px-6" style={{ background: MC.bg }}>
      <div className="container max-w-5xl mx-auto">
        <p className="text-[11px] tracking-[0.2em] font-body text-center mb-3" style={{ color: MC.lilacAccent }}>THE FRAMEWORK</p>
        <h2 className="font-display text-2xl md:text-3xl font-bold text-center mb-14" style={{ color: MC.text, fontFamily: "'Lora', var(--font-display), serif" }}>
          Notice. Name. Rewire.
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {FRAMEWORK.map((f) => (
            <div key={f.title} className="p-8 rounded-[20px]" style={{ background: MC.card, border: `1px solid ${f.color}50`, boxShadow: `0 4px 24px ${f.color}10` }}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center mb-5" style={{ background: `${f.color}40` }}>
                <f.icon size={20} style={{ color: f.darkColor }} />
              </div>
              <h3 className="font-display text-xl font-bold mb-3" style={{ color: MC.text, fontFamily: "'Lora', var(--font-display), serif" }}>{f.title}</h3>
              <p className="font-body text-sm leading-relaxed" style={{ color: MC.muted }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Partner preview — two-tone cards */}
    <section className="py-16 px-6" style={{ background: MC.shared }}>
      <div className="container max-w-3xl mx-auto">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-8 rounded-[20px]" style={{ background: MC.card, borderLeft: `4px solid ${MC.blueLight}` }}>
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: MC.accent }} />
              <span className="font-body text-xs tracking-widest uppercase" style={{ color: MC.accent }}>Partner A</span>
            </div>
            <p className="font-body text-sm leading-relaxed" style={{ color: MC.muted }}>
              A private space to write what happened, how it felt, and what you need — before sharing anything.
            </p>
          </div>
          <div className="p-8 rounded-[20px]" style={{ background: MC.card, borderLeft: `4px solid ${MC.lilacLight}` }}>
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: MC.lilacAccent }} />
              <span className="font-body text-xs tracking-widest uppercase" style={{ color: MC.lilacAccent }}>Partner B</span>
            </div>
            <p className="font-body text-sm leading-relaxed" style={{ color: MC.muted }}>
              Your own private space with the same tools. Nothing is shared until both partners approve.
            </p>
          </div>
        </div>
      </div>
    </section>

    {/* How It Works */}
    <section className="py-20 px-6" style={{ background: MC.bg, borderTop: `1px solid ${MC.accent}15` }}>
      <div className="container max-w-4xl mx-auto">
        <p className="text-[11px] tracking-[0.2em] font-body text-center mb-3" style={{ color: MC.lilacAccent }}>PROCESS</p>
        <h2 className="font-display text-2xl md:text-3xl font-bold text-center mb-14" style={{ color: MC.text, fontFamily: "'Lora', var(--font-display), serif" }}>
          How it works
        </h2>

        <div className="space-y-0">
          {PROCESS.map((p) => (
            <div key={p.step} className="flex gap-6 lg:gap-10 py-8" style={{ borderBottom: `1px solid ${MC.accent}12` }}>
              <span className="font-body font-light text-4xl lg:text-5xl flex-shrink-0 w-16" style={{ color: `${MC.lilacAccent}40` }}>{p.step}</span>
              <div>
                <h3 className="font-display text-lg font-bold mb-2" style={{ color: MC.text, fontFamily: "'Lora', var(--font-display), serif" }}>{p.title}</h3>
                <p className="font-body text-sm leading-relaxed" style={{ color: MC.muted }}>{p.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Safety */}
    <section className="py-20 px-6" style={{ background: MC.shared, borderTop: `1px solid ${MC.accent}15` }}>
      <div className="container max-w-3xl mx-auto">
        <div className="p-8 rounded-[20px] flex items-start gap-6" style={{ background: MC.card, border: `1px solid ${MC.destructive}20` }}>
          <Shield className="flex-shrink-0 mt-1" size={24} style={{ color: MC.destructive }} />
          <div>
            <h3 className="font-display text-lg font-bold mb-3" style={{ color: MC.text, fontFamily: "'Lora', var(--font-display), serif" }}>Your safety matters</h3>
            <p className="font-body text-sm leading-relaxed" style={{ color: MC.muted }}>
              If you feel unsafe, do not use shared features. This platform does not replace emergency or professional support. If you or someone you know is in danger, please contact your local crisis service.
            </p>
          </div>
        </div>
      </div>
    </section>

    <Footer />
  </div>
);

export default ConnectLanding;
