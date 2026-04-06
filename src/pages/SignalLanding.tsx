import { Link } from "react-router-dom";
import { ArrowLeft, Activity, Moon, Utensils, Dumbbell } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import signalLogo from "@/assets/signal-logo.png";
import signalSquare from "@/assets/signal-square.png";
import signalBodyscan from "@/assets/signal-bodyscan.png";
import signalMeditation from "@/assets/signal-meditation.png";
import signalRecipe from "@/assets/signal-recipe.png";

/* Signal brand palette */
const SIG = {
  bg: "#FDFCFB",
  card: "#EBE1DA",
  primary: "#7F5B87",
  primarySoft: "#9974A1",
  glow: "#AF92B6",
  text: "#4A2F52",
  muted: "#D9C6B9",
  sand: "#F5EDE6",
};

const FEATURES = [
  {
    icon: Activity,
    title: "Understand your cycle",
    desc: "Phase-based insights that actually make sense of your energy and mood. Know where you are and why you feel the way you do.",
  },
  {
    icon: Dumbbell,
    title: "Move with your body",
    desc: "Workouts and nutrition guided by where you are in your cycle — not against it.",
  },
  {
    icon: Utensils,
    title: "Eat for your phase",
    desc: "Recipes and nutrition guidance tailored to what your body needs right now — from iron-rich meals during menstruation to antioxidant-packed foods at ovulation.",
  },
  {
    icon: Moon,
    title: "Daily rituals, not rules",
    desc: "Breathwork, somatic practices, and nervous system tools matched to your current phase. Habits built around you.",
  },
];

const PHASES = [
  { name: "Menstrual", color: "#4A236E", desc: "Rest and restoration. Gentle yoga, iron-rich foods, and permission to slow down." },
  { name: "Follicular", color: "#5B8DB8", desc: "Energy rising. Strength training, complex carbs, and clarity for new plans." },
  { name: "Ovulatory", color: "#F4A63A", desc: "Peak energy. High intensity, social connection, and your communicative superpower." },
  { name: "Luteal", color: "#9B8FA6", desc: "Turning inward. Intuitive movement, higher calorie needs, and deeper sleep." },
];

const SignalLanding = () => (
  <div className="min-h-screen" style={{ background: SIG.bg }}>
    <Navbar />

    {/* Hero */}
    <section className="pt-32 pb-20 px-6" style={{ background: `linear-gradient(180deg, ${SIG.card} 0%, ${SIG.bg} 100%)` }}>
      <div className="container max-w-5xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-[10px] tracking-[0.12em] hover:opacity-70 transition-opacity mb-12" style={{ color: SIG.primarySoft, fontFamily: "var(--font-body)" }}>
          <ArrowLeft size={12} /> BACK TO MINDCAST
        </Link>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <img src={signalLogo} alt="Signal by Mindcast" className="h-12 mb-6" />
            <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-4" style={{ color: SIG.text, lineHeight: 1.2 }}>
              A wellness companion for your cycle.
            </h1>
            <p className="font-body text-base leading-relaxed mb-8" style={{ color: `${SIG.text}99` }}>
              Track your cycle, understand your body, and align your energy with your natural rhythms. Signal delivers phase-specific guidance for movement, nutrition, and nervous system care.
            </p>
            <a href="https://signalnz.lovable.app/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs tracking-wider hover:opacity-80 transition-opacity" style={{ border: `1px solid ${SIG.primarySoft}30`, color: SIG.primarySoft, fontFamily: "var(--font-body)" }}>
              VISIT WEBSITE ↗
            </a>
          </div>

          <div className="flex justify-center">
            <div className="relative w-64 h-64 md:w-80 md:h-80">
              <div className="absolute inset-0 rounded-3xl blur-2xl" style={{ background: `linear-gradient(135deg, ${SIG.primary}25, ${SIG.glow}20)` }} />
              <img src={signalSquare} alt="Signal app" className="relative z-10 w-full h-full object-contain rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* Features */}
    <section className="py-20 px-6" style={{ background: SIG.bg, borderTop: `1px solid ${SIG.muted}60` }}>
      <div className="container max-w-5xl mx-auto">
        <p className="text-[11px] tracking-[0.2em] font-body text-center mb-3" style={{ color: SIG.primarySoft }}>WHAT SIGNAL DOES</p>
        <h2 className="font-display text-2xl md:text-3xl font-bold text-center mb-14" style={{ color: SIG.text }}>
          Your body already knows. Signal helps you listen.
        </h2>

        <div className="grid sm:grid-cols-2 gap-8">
          {FEATURES.map((f, i) => (
            <div key={i} className="p-6 rounded-2xl" style={{ background: SIG.card, border: `1px solid ${SIG.muted}40` }}>
              <f.icon size={24} className="mb-4" style={{ color: SIG.primary }} />
              <h3 className="font-display text-lg font-bold mb-2" style={{ color: SIG.text }}>{f.title}</h3>
              <p className="font-body text-sm leading-relaxed" style={{ color: `${SIG.text}80` }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* App Preview Images */}
    <section className="py-20 px-6" style={{ background: SIG.sand, borderTop: `1px solid ${SIG.muted}40` }}>
      <div className="container max-w-5xl mx-auto">
        <p className="text-[11px] tracking-[0.2em] font-body text-center mb-3" style={{ color: SIG.primarySoft }}>INSIDE SIGNAL</p>
        <h2 className="font-display text-2xl md:text-3xl font-bold text-center mb-14" style={{ color: SIG.text }}>
          Tools for every phase.
        </h2>
        <div className="grid grid-cols-3 gap-6">
          {[
            { src: signalBodyscan, label: "Somatic Practices" },
            { src: signalRecipe, label: "Phase Nutrition" },
            { src: signalMeditation, label: "Guided Meditations" },
          ].map((item) => (
            <div key={item.label} className="text-center">
              <div className="rounded-2xl overflow-hidden mb-3 aspect-square" style={{ background: SIG.card }}>
                <img src={item.src} alt={item.label} className="w-full h-full object-cover" />
              </div>
              <p className="font-body text-xs" style={{ color: SIG.primarySoft }}>{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Phases */}
    <section className="py-20 px-6" style={{ background: SIG.bg, borderTop: `1px solid ${SIG.muted}40` }}>
      <div className="container max-w-5xl mx-auto">
        <p className="text-[11px] tracking-[0.2em] font-body text-center mb-3" style={{ color: SIG.primarySoft }}>THE FOUR PHASES</p>
        <h2 className="font-display text-2xl md:text-3xl font-bold text-center mb-14" style={{ color: SIG.text }}>
          Different phases, different needs.
        </h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {PHASES.map((p) => (
            <div key={p.name} className="p-5 rounded-2xl text-center" style={{ background: SIG.card, border: `1px solid ${SIG.muted}30` }}>
              <div className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: `${p.color}18` }}>
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: p.color }} />
              </div>
              <h3 className="font-display text-sm font-bold mb-2" style={{ color: SIG.text }}>{p.name}</h3>
              <p className="font-body text-xs leading-relaxed" style={{ color: `${SIG.text}70` }}>{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    <Footer />
  </div>
);

export default SignalLanding;
