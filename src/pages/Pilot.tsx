import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Radio, BookOpen, Users, Home, Sparkles, Nfc } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// Membership — the Mindcast 52-week journey. Replaces the retired founding-pilot
// page (10-episode / Tuesday-podcast framing). No venue, no date — Coming Soon.
// The weekly rhythm: a facilitated Sunday session across three tracks, reflected
// in the course book, then a midweek Life Group that revisits and goes deeper.

const RHYTHM = [
  { icon: Radio, title: "SUNDAY SESSION", body: "A facilitated live session — adults, teens and children each work through the same weekly theme in their own room." },
  { icon: BookOpen, title: "COURSE BOOK", body: "Reflect and journal in your live digital course book, and leave with one intention to act on before next week." },
  { icon: Users, title: "LIFE GROUP", body: "Midweek, your Life Group meets to revisit the Sunday session, go deeper, and hold each other to what you set." },
  { icon: Home, title: "PRACTICE AT HOME", body: "Every track follows the same theme, so the practice is shared and continued together as a household." },
];

const INCLUDED = [
  { icon: Radio, text: "Weekly live sessions for adults, teens and children" },
  { icon: BookOpen, text: "A live digital course book across the full 52-week journey" },
  { icon: Users, text: "Midweek Life Groups to reflect and follow through" },
  { icon: Sparkles, text: "Private journaling — yours to keep, yours to revisit" },
  { icon: Nfc, text: "Tap-in with your Mindcast wristband at the door" },
  { icon: Home, text: "Household membership — one payer, the whole family" },
];

const Pilot = () => (
  <>
    <Navbar />

    {/* Hero */}
    <section className="section-navy min-h-[70vh] flex items-center pt-16">
      <div className="container mx-auto px-6 text-center py-24 max-w-4xl">
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[11px] tracking-[0.4em] font-body text-cream/50 uppercase mb-5">
          Membership · Coming soon
        </motion.p>
        <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="heading-display text-4xl sm:text-6xl md:text-7xl leading-[0.95]">
          THE 52-WEEK JOURNEY
        </motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mt-8 text-cream/60 font-body text-base max-w-xl mx-auto leading-relaxed">
          Fifty-two weeks of showing up, reflecting, and following through — for adults, teens and children, together. Awareness into action, every week.
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="mt-10 flex flex-wrap gap-4 justify-center">
          <Link to="/portal/login" className="inline-block bg-cream text-navy font-display tracking-widest text-sm px-10 py-4 hover:bg-cream/90 transition-colors" style={{ color: "hsl(210,56%,14%)" }}>
            BECOME A MEMBER &rarr;
          </Link>
          <Link to="/about" className="inline-block border border-cream/25 text-cream font-display tracking-widest text-sm px-10 py-4 hover:border-cream/50 transition-colors">
            OUR STORY
          </Link>
        </motion.div>
      </div>
    </section>

    {/* Weekly rhythm */}
    <section className="section-white py-24">
      <div className="container mx-auto px-6 max-w-5xl">
        <h2 className="heading-display text-4xl md:text-6xl text-primary text-center mb-4">THE WEEKLY RHYTHM</h2>
        <p className="text-center text-muted-foreground font-body text-sm max-w-xl mx-auto mb-16">
          Notice. Name. Rewire. A structure built for follow-through, not just insight.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {RHYTHM.map((r, i) => (
            <motion.div key={r.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="border-2 border-primary/15 p-6">
              <r.icon className="w-7 h-7 text-primary mb-5" strokeWidth={1.5} />
              <h3 className="font-display text-xl tracking-wider text-primary mb-2">{r.title}</h3>
              <p className="text-muted-foreground font-body text-sm leading-relaxed">{r.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* What's included */}
    <section className="section-navy py-24">
      <div className="container mx-auto px-6 max-w-4xl">
        <h2 className="heading-display text-4xl md:text-6xl text-center mb-16">WHAT'S INCLUDED</h2>
        <div className="grid sm:grid-cols-2 gap-x-10 gap-y-5 max-w-3xl mx-auto">
          {INCLUDED.map((item) => (
            <div key={item.text} className="flex items-start gap-3">
              <item.icon className="w-5 h-5 text-primary shrink-0 mt-0.5" strokeWidth={1.5} />
              <p className="text-cream/70 font-body text-sm leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Closing */}
    <section className="section-white py-24">
      <div className="container mx-auto px-6 text-center max-w-3xl">
        <h2 className="heading-display text-4xl md:text-6xl text-primary mb-6">JOIN THE JOURNEY</h2>
        <p className="text-muted-foreground font-body text-base leading-relaxed mb-10">
          Founding membership is opening soon in Taupō, New Zealand. Create your account to be first through the doors.
        </p>
        <Link to="/portal/login" className="inline-block bg-primary text-primary-foreground font-display tracking-widest text-sm px-10 py-4 hover:bg-primary/90 transition-colors">
          BECOME A MEMBER &rarr;
        </Link>
      </div>
    </section>

    <Footer />
  </>
);

export default Pilot;
