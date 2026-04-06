import { motion } from "framer-motion";
import { Check, MapPin, Calendar, Clock, Users } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const included = [
  "10 weekly live podcast discussion sessions",
  "Companion workbook for every session",
  "Private group chat with fellow pilot members",
  "Direct access to the facilitator",
  "Input into the future of MINDCAST",
  "Founding member status — locked in forever",
];

const faqs = [
  { q: "What happens each week?", a: "We gather on Tuesday evening, watch or listen to a curated podcast episode together, then work through a guided discussion using the companion workbook. It's structured but relaxed — no pressure to share more than you're comfortable with." },
  { q: "Do I need any experience?", a: "None at all. The pilot is designed for anyone curious about doing inner work in community. No therapy background, no meditation practice, no prerequisites." },
  { q: "What if I miss a week?", a: "Life happens. You'll have access to the recording and workbook so you can catch up. We just ask that you commit to attending most sessions." },
  { q: "Is this therapy?", a: "No. MINDCAST is a structured life practice. We complement therapy but don't replace it. If you're in crisis, please reach out to a professional." },
  { q: "Can I get a refund?", a: "Full refunds are available up to 7 days before the first session (14 April 2026). After that, partial refunds may be considered on a case-by-case basis." },
  { q: "What happens after the 10 weeks?", a: "Pilot members will have first access to the full MINDCAST membership when it launches. Your founding member pricing will be locked in." },
];

const Pilot = () => (
  <>
    <Navbar />

    {/* Hero */}
    <section className="section-navy min-h-[70vh] flex items-center pt-16">
      <div className="container mx-auto px-6 text-center py-24">
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-cream/40 text-xs tracking-[0.3em] mb-6 block"
        >
          FOUNDING PILOT — 15 SPOTS ONLY
        </motion.span>
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="heading-display text-5xl sm:text-6xl md:text-8xl max-w-5xl mx-auto leading-[0.9]"
        >
          10 WEEKS OF INNER WORK. IN PERSON. TOGETHER.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-cream/60 font-body text-base max-w-2xl mx-auto"
        >
          A weekly podcast discussion group for people who want to grow — not just consume content.
          Watch. Reflect. Discuss. Repeat.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-12 flex flex-wrap gap-6 justify-center text-cream/50 text-xs tracking-[0.2em]"
        >
          <span className="flex items-center gap-2"><MapPin size={14} /> TAUPŌ, NZ</span>
          <span className="flex items-center gap-2"><Calendar size={14} /> STARTS 21 APRIL 2026</span>
          <span className="flex items-center gap-2"><Clock size={14} /> TUESDAY EVENINGS</span>
          <span className="flex items-center gap-2"><Users size={14} /> 15 SPOTS</span>
        </motion.div>
      </div>
    </section>

    {/* What's Included */}
    <section className="section-white py-24">
      <div className="container mx-auto px-6 max-w-3xl">
        <h2 className="heading-display text-4xl md:text-6xl text-primary text-center mb-4">WHAT'S INCLUDED</h2>
        <p className="text-center text-muted-foreground text-sm mb-16 max-w-xl mx-auto font-body">
          Everything you need for 10 weeks of guided inner work practice.
        </p>
        <div className="space-y-4">
          {included.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="flex items-start gap-4 border-b border-primary/10 pb-4"
            >
              <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <span className="text-sm text-foreground font-body">{item}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* Pricing */}
    <section className="section-navy py-24">
      <div className="container mx-auto px-6 max-w-xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="border-2 border-cream/20 p-12"
        >
          <span className="text-cream/40 text-xs tracking-[0.3em] block mb-4">FOUNDING PILOT</span>
          <h3 className="heading-display text-6xl md:text-7xl mb-2">$150</h3>
          <p className="text-cream/50 text-sm font-body mb-2">for the full 10-week term</p>
          <p className="text-cream/30 text-xs font-body mb-8">That's $15 per session — less than a coffee and cake.</p>
          <a
            href="#reserve"
            className="inline-block text-xs font-display font-extrabold tracking-[0.2em] bg-cream text-navy py-4 px-12 hover:bg-cream/90 transition-colors mb-4"
            style={{ color: "hsl(210,56%,14%)" }}
          >
            RESERVE YOUR SPOT
          </a>
          <p className="text-cream/30 text-xs font-body">Only 15 spots available. No waitlist.</p>
        </motion.div>
      </div>
    </section>

    {/* How It Works */}
    <section className="section-white py-24">
      <div className="container mx-auto px-6 max-w-3xl">
        <h2 className="heading-display text-4xl md:text-6xl text-primary text-center mb-16">HOW IT WORKS</h2>
        <div className="space-y-8">
          {[
            { step: "01", title: "GATHER", desc: "We meet Tuesday evening in Taupō. Settle in. Leave the week behind." },
            { step: "02", title: "WATCH", desc: "A curated podcast episode — chosen for its relevance to real life, not just theory." },
            { step: "03", title: "REFLECT", desc: "Work through the companion workbook. Your thoughts. Your pace. No wrong answers." },
            { step: "04", title: "DISCUSS", desc: "Guided small-group conversation. Go as deep as you're comfortable." },
            { step: "05", title: "COMMIT", desc: "One thing to take into the week. Small, practical, yours." },
          ].map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="flex gap-6 items-start border-b border-primary/10 pb-8"
            >
              <span className="font-display text-3xl text-primary/20">{s.step}</span>
              <div>
                <h3 className="font-display text-lg tracking-widest text-primary mb-1">{s.title}</h3>
                <p className="text-muted-foreground text-sm font-body">{s.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* FAQ */}
    <section className="section-navy py-24">
      <div className="container mx-auto px-6 max-w-3xl">
        <h2 className="heading-display text-4xl md:text-6xl text-center mb-16">FREQUENTLY ASKED</h2>
        <Accordion type="single" collapsible>
          {faqs.map((faq, i) => (
            <AccordionItem key={i} value={`faq-${i}`} className="border-cream/10">
              <AccordionTrigger className="text-cream/80 text-sm tracking-wider hover:no-underline">{faq.q}</AccordionTrigger>
              <AccordionContent className="text-cream/50 text-sm font-body leading-relaxed">{faq.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>

    {/* Final CTA */}
    <section className="section-white py-24">
      <div className="container mx-auto px-6 max-w-xl text-center">
        <h2 className="heading-display text-4xl md:text-5xl text-primary mb-6">THIS IS WHERE IT STARTS.</h2>
        <p className="text-muted-foreground text-sm font-body mb-8 max-w-md mx-auto">
          15 people. 10 weeks. One practice. Be part of the founding group that shapes what MINDCAST becomes.
        </p>
        <a
          href="#reserve"
          className="inline-block text-xs font-display font-extrabold tracking-[0.2em] bg-primary text-cream py-4 px-12 hover:bg-primary/90 transition-colors"
        >
          RESERVE YOUR SPOT — $150
        </a>
      </div>
    </section>

    <Footer />
  </>
);

export default Pilot;
