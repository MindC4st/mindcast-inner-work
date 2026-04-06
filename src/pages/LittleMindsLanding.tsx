import { Link } from "react-router-dom";
import { ArrowLeft, BookOpen, Mic, Search } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import littleMindsLogo from "@/assets/littleminds-logo.png";
import littleMindsHero from "@/assets/littleminds-hero.png";

const STEPS = [
  {
    number: "01",
    title: "A child asks a question",
    desc: "Children often ask difficult questions about life, death, feelings, or the world. Type or record their question in their own voice.",
  },
  {
    number: "02",
    title: "We turn it into a story",
    desc: "AI creates a gentle, metaphor-based answer suited to their age — every story is unique, warm, and thoughtful.",
  },
  {
    number: "03",
    title: "Share and explore",
    desc: "Responses can be saved and searched so other families can use them too. Build a library of gentle answers.",
  },
];

const THEMES = [
  { name: "Feelings & Emotions", color: "#E8927C" },
  { name: "Death & Dying", color: "#9B8FA6" },
  { name: "Family Change", color: "#5B8DB8" },
  { name: "Friendship", color: "#F4A63A" },
  { name: "Bodies & Growing Up", color: "#C4526E" },
  { name: "Worry & Anxiety", color: "#4A236E" },
  { name: "Kindness", color: "#6B9FD4" },
  { name: "Identity", color: "#3585af" },
];

const LittleMindsLanding = () => (
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
            <img src={littleMindsLogo} alt="Little Minds Big Questions" className="h-20 mb-6" />
            <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-cream mb-4" style={{ lineHeight: 1.2 }}>
              Gentle answers to children's biggest questions.
            </h1>
            <p className="text-cream/50 font-body text-base leading-relaxed mb-8">
              AI-powered metaphor stories for parents navigating the hard questions — death, fairness, love, and more. Every story is unique, age-appropriate, and answered with warmth.
            </p>
            <div className="flex flex-wrap gap-3">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-cream/10 text-cream/50 text-xs font-body">
                <BookOpen size={14} /> Browse Questions
              </span>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-cream/10 text-cream/50 text-xs font-body">
                <Mic size={14} /> Voice Recording
              </span>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-cream/10 text-cream/50 text-xs font-body">
                <Search size={14} /> Story Library
              </span>
            </div>
          </div>

          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-[#E8927C]/15 to-[#6B9FD4]/15 blur-2xl" />
              <img src={littleMindsHero} alt="Little Minds illustration" className="relative z-10 w-64 md:w-80 h-auto object-contain" />
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* How It Works */}
    <section className="section-navy py-20 px-6" style={{ borderTop: "1px solid rgba(53,133,175,0.1)" }}>
      <div className="container max-w-4xl mx-auto">
        <p className="text-cream/40 text-[11px] tracking-[0.2em] font-body text-center mb-3">HOW IT WORKS</p>
        <h2 className="font-display text-2xl md:text-3xl font-bold text-cream text-center mb-14">
          From big question to bedtime story.
        </h2>

        <div className="space-y-0">
          {STEPS.map((s) => (
            <div key={s.number} className="flex gap-6 lg:gap-10 py-8 border-b border-cream/[0.06] last:border-0">
              <span className="font-body font-light text-4xl lg:text-5xl text-[#6B9FD4]/30 flex-shrink-0 w-16">{s.number}</span>
              <div>
                <h3 className="font-display text-lg font-bold text-cream mb-2">{s.title}</h3>
                <p className="text-cream/40 font-body text-sm leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Themes */}
    <section className="section-navy py-20 px-6" style={{ borderTop: "1px solid rgba(53,133,175,0.1)" }}>
      <div className="container max-w-4xl mx-auto">
        <p className="text-cream/40 text-[11px] tracking-[0.2em] font-body text-center mb-3">QUESTION THEMES</p>
        <h2 className="font-display text-2xl md:text-3xl font-bold text-cream text-center mb-14">
          Topics children wonder about most.
        </h2>

        <div className="flex flex-wrap justify-center gap-3">
          {THEMES.map((t) => (
            <span
              key={t.name}
              className="px-4 py-2 rounded-full text-xs font-body border"
              style={{ borderColor: `${t.color}30`, color: t.color }}
            >
              {t.name}
            </span>
          ))}
        </div>
      </div>
    </section>

    <Footer />
  </div>
);

export default LittleMindsLanding;
