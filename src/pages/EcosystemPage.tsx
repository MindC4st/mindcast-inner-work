import { motion } from "framer-motion";
import { Radio, Heart, Sparkles, Moon } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ImagePlaceholderDark } from "@/components/ImagePlaceholder";

const products = [
  {
    icon: Radio,
    name: "MINDCAST LIVE",
    tagline: "The weekly gathering for people doing the inner work.",
    who: "For anyone seeking a weekly practice in community. Auckland-based, expanding globally.",
    features: ["Weekly in-person talks and guided reflection", "Companion worksheets for every session", "Kids track running alongside for ages 4–12"],
    cta: "EXPLORE LIVE EVENTS",
    link: "/live",
  },
  {
    icon: Heart,
    name: "MINDCAST RELATIONSHIPS",
    tagline: "A consent-first app for couples and families doing hard conversations.",
    who: "For couples, co-parents, and families navigating conflict, repair, and deeper connection.",
    features: ["Structured conversation frameworks", "Consent check-ins before every session", "Repair protocols for when things go wrong"],
    cta: "COMING SOON",
    link: "#",
  },
  {
    icon: Sparkles,
    name: "LITTLE MINDS BIG QUESTIONS",
    tagline: "AI-generated metaphors for the big questions kids ask parents.",
    who: "For parents of children aged 4–14 navigating death, identity, fairness, and meaning.",
    features: ["Age-appropriate AI-powered responses", "Story-based metaphors kids understand", "Family conversation starters"],
    cta: "COMING SOON",
    link: "#",
  },
  {
    icon: Moon,
    name: "MINDCAST WELLNESS",
    tagline: "Cycle-synced nutrition, movement, and nervous system tools for women.",
    who: "For women wanting to align their health practices with their menstrual cycle phases.",
    features: ["Four-phase tracking and guidance", "Nutrition and movement recommendations", "Nervous system regulation tools"],
    cta: "COMING SOON",
    link: "#",
  },
];

const EcosystemPage = () => (
  <>
    <Navbar />
    <section className="section-navy min-h-[50vh] flex items-center pt-16">
      <div className="container mx-auto px-6 text-center py-24">
        <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="heading-display text-5xl sm:text-6xl md:text-8xl max-w-4xl mx-auto leading-[0.9]">
          FOUR TOOLS. ONE PRACTICE.
        </motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="mt-8 text-cream/60 font-body text-base max-w-xl mx-auto">
          Each product works standalone. Together, they form a complete inner work system.
        </motion.p>
      </div>
    </section>

    {products.map((p, i) => (
      <section key={p.name} className={`${i % 2 === 0 ? "section-white" : "section-navy"} py-24`}>
        <div className="container mx-auto px-6">
          <div className={`grid md:grid-cols-2 gap-12 items-center max-w-5xl mx-auto ${i % 2 !== 0 ? "" : ""}`}>
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className={i % 2 !== 0 ? "md:order-2" : ""}>
              {i % 2 === 0 ? (
                <div className="border-[3px] border-primary p-1"><div className="bg-primary/5 flex items-center justify-center h-72 md:h-96"><span className="text-xs tracking-widest text-primary/30">[IMAGE: {p.name} App Screenshot / Mockup]</span></div></div>
              ) : (
                <ImagePlaceholderDark label={`${p.name} App Screenshot / Mockup`} className="w-full h-72 md:h-96" />
              )}
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }} className={i % 2 !== 0 ? "md:order-1" : ""}>
              <p.icon className={`w-10 h-10 mb-4 ${i % 2 === 0 ? "text-primary" : "text-cream"}`} />
              <h2 className={`heading-display text-4xl md:text-5xl mb-3 ${i % 2 === 0 ? "text-primary" : ""}`}>{p.name}</h2>
              <p className={`font-body text-base mb-4 ${i % 2 === 0 ? "text-muted-foreground" : "text-cream/60"}`}>{p.tagline}</p>
              <p className={`font-body text-sm mb-6 ${i % 2 === 0 ? "text-muted-foreground" : "text-cream/50"}`}>{p.who}</p>
              <ul className="space-y-3 mb-8">
                {p.features.map((f) => (
                  <li key={f} className={`text-sm font-body flex items-start gap-3 ${i % 2 === 0 ? "text-primary/70" : "text-cream/70"}`}>
                    <span className="mt-1.5 w-1.5 h-1.5 bg-current flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              {p.link === "#" ? (
                <span className={`text-xs tracking-widest ${i % 2 === 0 ? "text-primary/30" : "text-cream/30"}`}>{p.cta}</span>
              ) : (
                <a href={p.link} className={i % 2 === 0 ? "btn-navy text-xs" : "btn-outlined text-xs"}>{p.cta}</a>
              )}
            </motion.div>
          </div>
        </div>
      </section>
    ))}

    <Footer />
  </>
);

export default EcosystemPage;
