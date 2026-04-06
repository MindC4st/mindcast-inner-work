import { Link } from "react-router-dom";
import { ArrowLeft, Activity, Moon, Utensils, Dumbbell } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import signalLogo from "@/assets/signal-logo.png";
import signalSquare from "@/assets/signal-square.png";

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
  <div className="min-h-screen bg-background">
    <Navbar />

    {/* Hero */}
    <section className="section-navy pt-32 pb-20 px-6">
      <div className="container max-w-5xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-cream/30 text-[10px] tracking-[0.12em] font-body hover:text-cream/60 transition-colors mb-12">
          <ArrowLeft size={12} /> BACK TO MINDCAST
        </Link>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <img src={signalLogo} alt="Signal by Mindcast" className="h-12 mb-6" />
            <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-cream mb-4" style={{ lineHeight: 1.2 }}>
              A wellness companion for your cycle.
            </h1>
            <p className="text-cream/50 font-body text-base leading-relaxed mb-8">
              Track your cycle, understand your body, and align your energy with your natural rhythms. Signal delivers phase-specific guidance for movement, nutrition, and nervous system care.
            </p>
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-cream/10 text-cream/40 text-xs font-body tracking-wider">
              COMING SOON
            </div>
          </div>

          <div className="flex justify-center">
            <div className="relative w-64 h-64 md:w-80 md:h-80">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-[#C4526E]/20 to-[#4A236E]/20 blur-2xl" />
              <img src={signalSquare} alt="Signal app" className="relative z-10 w-full h-full object-contain rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* Features */}
    <section className="section-navy py-20 px-6" style={{ borderTop: "1px solid rgba(53,133,175,0.1)" }}>
      <div className="container max-w-5xl mx-auto">
        <p className="text-cream/40 text-[11px] tracking-[0.2em] font-body text-center mb-3">WHAT SIGNAL DOES</p>
        <h2 className="font-display text-2xl md:text-3xl font-bold text-cream text-center mb-14">
          Your body already knows. Signal helps you listen.
        </h2>

        <div className="grid sm:grid-cols-2 gap-8">
          {FEATURES.map((f, i) => (
            <div key={i} className="p-6 rounded-xl border border-cream/[0.06] bg-cream/[0.02]">
              <f.icon size={24} className="text-[#C4526E] mb-4" />
              <h3 className="font-display text-lg font-bold text-cream mb-2">{f.title}</h3>
              <p className="text-cream/40 font-body text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Phases */}
    <section className="section-navy py-20 px-6" style={{ borderTop: "1px solid rgba(53,133,175,0.1)" }}>
      <div className="container max-w-5xl mx-auto">
        <p className="text-cream/40 text-[11px] tracking-[0.2em] font-body text-center mb-3">THE FOUR PHASES</p>
        <h2 className="font-display text-2xl md:text-3xl font-bold text-cream text-center mb-14">
          Different phases, different needs.
        </h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {PHASES.map((p) => (
            <div key={p.name} className="p-5 rounded-xl border border-cream/[0.06] bg-cream/[0.02] text-center">
              <div className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: `${p.color}25` }}>
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: p.color }} />
              </div>
              <h3 className="font-display text-sm font-bold text-cream mb-2">{p.name}</h3>
              <p className="text-cream/35 font-body text-xs leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    <Footer />
  </div>
);

export default SignalLanding;
