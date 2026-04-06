import { Link } from "react-router-dom";
import { ArrowLeft, BookOpen, Mic, Search } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import littleMindsLogo from "@/assets/littleminds-logo.png";
import littleMindsHero from "@/assets/littleminds-hero.png";
import littleMindsGarden from "@/assets/littleminds-garden.png";
import littleMindsElephant from "@/assets/littleminds-elephant.png";
import littleMindsBalloon from "@/assets/littleminds-balloon.png";
import littleMindsButterfly from "@/assets/littleminds-butterfly.png";

/* Little Minds brand palette — warm storybook tones */
const LM = {
  bg: "#F2E4D0",         /* warm parchment */
  card: "#F7EFE5",        /* lighter cream card */
  primary: "#9DC3E6",     /* sky blue */
  secondary: "#E8927C",   /* coral */
  accent: "#E8B84B",      /* golden */
  sage: "#A8C49A",        /* sage green */
  peach: "#D4956B",       /* peach */
  text: "#3B2F28",        /* dark brown */
  muted: "#8B7968",       /* warm gray-brown */
};

const STEPS = [
  {
    number: "01",
    title: "A child asks a question",
    desc: "Children often ask difficult questions about life, death, feelings, or the world. Type or record their question in their own voice.",
    image: littleMindsElephant,
  },
  {
    number: "02",
    title: "We turn it into a story",
    desc: "AI creates a gentle, metaphor-based answer suited to their age — every story is unique, warm, and thoughtful.",
    image: littleMindsBalloon,
  },
  {
    number: "03",
    title: "Share and explore",
    desc: "Responses can be saved and searched so other families can use them too. Build a library of gentle answers.",
    image: littleMindsButterfly,
  },
];

const THEMES = [
  { name: "Feelings & Emotions", color: LM.secondary },
  { name: "Death & Dying", color: "#9B8FA6" },
  { name: "Family Change", color: LM.primary },
  { name: "Friendship", color: LM.accent },
  { name: "Bodies & Growing Up", color: LM.peach },
  { name: "Worry & Anxiety", color: "#7F5B87" },
  { name: "Kindness", color: LM.sage },
  { name: "Identity", color: "#5B8DB8" },
];

const LittleMindsLanding = () => (
  <div className="min-h-screen" style={{ background: LM.bg }}>
    <Navbar />

    {/* Hero */}
    <section className="pt-32 pb-20 px-6" style={{ background: `linear-gradient(180deg, ${LM.card} 0%, ${LM.bg} 100%)` }}>
      <div className="container max-w-5xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-[10px] tracking-[0.12em] hover:opacity-70 transition-opacity mb-12" style={{ color: LM.muted, fontFamily: "var(--font-body)" }}>
          <ArrowLeft size={12} /> BACK TO MINDCAST
        </Link>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <img src={littleMindsLogo} alt="Little Minds Big Questions" className="h-24 mb-6" />
            <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-4" style={{ color: LM.text, lineHeight: 1.2 }}>
              Gentle answers to children's biggest questions.
            </h1>
            <p className="font-body text-base leading-relaxed mb-8" style={{ color: LM.muted }}>
              AI-powered metaphor stories for parents navigating the hard questions — death, fairness, love, and more. Every story is unique, age-appropriate, and answered with warmth.
            </p>
            <div className="flex flex-wrap gap-3">
              {[
                { icon: BookOpen, label: "Browse Questions" },
                { icon: Mic, label: "Voice Recording" },
                { icon: Search, label: "Story Library" },
              ].map((item) => (
                <span key={item.label} className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-body" style={{ border: `1px solid ${LM.secondary}40`, color: LM.secondary }}>
                  <item.icon size={14} /> {item.label}
                </span>
              ))}
            </div>
            <a href="https://littleminds.mindcast.co.nz/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs tracking-wider hover:opacity-80 transition-opacity mt-4" style={{ border: `1px solid ${LM.secondary}40`, color: LM.secondary, fontFamily: "var(--font-body)" }}>
              VISIT WEBSITE ↗
            </a>
          </div>

          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 rounded-3xl blur-3xl" style={{ background: `linear-gradient(135deg, ${LM.primary}30, ${LM.accent}20, ${LM.secondary}15)` }} />
              <img src={littleMindsHero} alt="Little Minds illustration" className="relative z-10 w-64 md:w-80 h-auto object-contain drop-shadow-lg" />
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* How It Works */}
    <section className="py-20 px-6" style={{ background: LM.card, borderTop: `1px solid ${LM.peach}20` }}>
      <div className="container max-w-5xl mx-auto">
        <p className="text-[11px] tracking-[0.2em] font-body text-center mb-3" style={{ color: LM.secondary }}>HOW IT WORKS</p>
        <h2 className="font-display text-2xl md:text-3xl font-bold text-center mb-14" style={{ color: LM.text }}>
          From big question to bedtime story.
        </h2>

        <div className="grid md:grid-cols-3 gap-10">
          {STEPS.map((s) => (
            <div key={s.number} className="text-center">
              <div className="w-32 h-32 mx-auto mb-5 flex items-center justify-center">
                <img src={s.image} alt={s.title} className="w-full h-full object-contain drop-shadow-sm" />
              </div>
              <span className="font-body text-xs font-bold mb-2 block" style={{ color: LM.primary }}>{s.number}</span>
              <h3 className="font-display text-lg font-bold mb-2" style={{ color: LM.text }}>{s.title}</h3>
              <p className="font-body text-sm leading-relaxed" style={{ color: LM.muted }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Garden illustration */}
    <section className="py-16 px-6" style={{ background: LM.bg }}>
      <div className="container max-w-4xl mx-auto">
        <div className="rounded-2xl overflow-hidden shadow-md">
          <img src={littleMindsGarden} alt="A magical garden — Little Minds" className="w-full h-64 md:h-80 object-cover" />
        </div>
      </div>
    </section>

    {/* Themes */}
    <section className="py-20 px-6" style={{ background: LM.card, borderTop: `1px solid ${LM.peach}20` }}>
      <div className="container max-w-4xl mx-auto">
        <p className="text-[11px] tracking-[0.2em] font-body text-center mb-3" style={{ color: LM.secondary }}>QUESTION THEMES</p>
        <h2 className="font-display text-2xl md:text-3xl font-bold text-center mb-14" style={{ color: LM.text }}>
          Topics children wonder about most.
        </h2>

        <div className="flex flex-wrap justify-center gap-3">
          {THEMES.map((t) => (
            <span
              key={t.name}
              className="px-5 py-2.5 rounded-full text-xs font-body font-medium"
              style={{ border: `1.5px solid ${t.color}40`, color: t.color, background: `${t.color}08` }}
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
