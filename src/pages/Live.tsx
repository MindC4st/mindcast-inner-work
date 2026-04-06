import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ImagePlaceholderDark } from "@/components/ImagePlaceholder";
import ImagePlaceholder from "@/components/ImagePlaceholder";
import { useState } from "react";

const upcomingSessions = [
  { date: "SUNDAY 15 MARCH — 6:00PM", speaker: "DR. SARAH CHEN", topic: "The Anatomy of a Difficult Conversation", location: "VENUE TBC, AUCKLAND CENTRAL", duration: "90 MINUTES" },
  { date: "SUNDAY 22 MARCH — 6:00PM", speaker: "JAMES WHITTAKER", topic: "Nervous System Regulation in Daily Life", location: "VENUE TBC, AUCKLAND CENTRAL", duration: "90 MINUTES" },
  { date: "SUNDAY 29 MARCH — 6:00PM", speaker: "AROHA MITCHELL", topic: "Parts Work: Meeting Your Inner Critic", location: "VENUE TBC, AUCKLAND CENTRAL", duration: "90 MINUTES" },
  { date: "SUNDAY 5 APRIL — 6:00PM", speaker: "TOM EASTWOOD", topic: "Boundaries Without Guilt", location: "VENUE TBC, AUCKLAND CENTRAL", duration: "90 MINUTES" },
];

const pastSessions = [
  { date: "8 MARCH 2026", topic: "Grief as a Teacher" },
  { date: "1 MARCH 2026", topic: "The Practice of Repair" },
  { date: "22 FEB 2026", topic: "Embodied Listening" },
  { date: "15 FEB 2026", topic: "Consent in Everyday Life" },
  { date: "8 FEB 2026", topic: "Parenting Without Scripts" },
  { date: "1 FEB 2026", topic: "Rewiring Shame Responses" },
];

const formatSteps = [
  "DOORS OPEN — Arrive, settle, connect",
  "THE TALK — 20 minutes. One idea. No fluff.",
  "GUIDED REFLECTION — A short practice led by the speaker",
  "PAIR SHARE — Share one takeaway with the person beside you",
  "COMMUNITY CONNECT — Open conversation, tea, real talk",
  "CLOSE — A single sentence to carry into the week",
  "KIDS RETURN — Little Minds finishes alongside",
];

const speakers = [
  { name: "DR. SARAH CHEN", specialty: "Attachment & Communication", tag: "Researcher" },
  { name: "JAMES WHITTAKER", specialty: "Somatic & Nervous System", tag: "Practitioner" },
  { name: "AROHA MITCHELL", specialty: "IFS & Parts Work", tag: "Practitioner" },
  { name: "TOM EASTWOOD", specialty: "Boundaries & Consent", tag: "Lived Experience" },
];

const Live = () => {
  const [notifyEmail, setNotifyEmail] = useState("");
  const [notified, setNotified] = useState(false);

  return (
    <>
      <Navbar />
      <section className="section-navy min-h-[60vh] flex items-center pt-16">
        <div className="container mx-auto px-6 text-center py-24">
          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-cream/40 text-xs tracking-[0.3em]">
            AUCKLAND, NZ — SUNDAYS
          </motion.span>
          <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="heading-display text-5xl sm:text-6xl md:text-8xl max-w-5xl mx-auto leading-[0.9] mt-6">
            THE WEEKLY GATHERING FOR PEOPLE DOING THE INNER WORK
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-8 text-cream/60 font-body text-base max-w-xl mx-auto">
            Every week. One talk. One practice. One community that shows up.
          </motion.p>
        </div>
      </section>

      {/* Upcoming Sessions */}
      <section className="section-white py-24">
        <div className="container mx-auto px-6">
          <h2 className="heading-display text-4xl md:text-6xl text-primary text-center mb-16">UPCOMING SESSIONS</h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {upcomingSessions.map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="border-[3px] border-primary p-8">
                <ImagePlaceholder label="Speaker portrait" className="w-full h-48 mb-6" />
                <p className="text-xs tracking-widest text-primary/50 mb-2">{s.date}</p>
                <h3 className="font-display text-2xl tracking-wider text-primary mb-1">{s.speaker}</h3>
                <p className="text-sm text-muted-foreground mb-4">{s.topic}</p>
                <p className="text-xs text-primary/40 tracking-wider mb-1">{s.location}</p>
                <p className="text-xs text-primary/40 tracking-wider mb-6">{s.duration}</p>
                <div className="flex flex-col gap-3">
                  <div className="flex gap-3">
                    <button className="btn-navy text-xs py-3 flex-1">RESERVE MY SPOT</button>
                    <button className="btn-outlined text-xs py-3 flex-1 border-primary text-primary hover:bg-primary hover:text-cream">LEARN MORE</button>
                  </div>
                  {i === 0 && <Link to="/session/communication-reset" className="btn-navy text-xs py-3 text-center bg-cream/10 border-primary/30">OPEN COMPANION MODULE</Link>}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Past Sessions */}
      <section className="section-white py-24 border-t-2 border-primary/10">
        <div className="container mx-auto px-6">
          <span className="block text-center text-primary/40 text-xs tracking-[0.3em] mb-4">PREVIOUS TALKS</span>
          <h2 className="heading-display text-4xl md:text-6xl text-primary text-center mb-16">PAST SESSIONS</h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {pastSessions.map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} className="border-2 border-primary/20 p-6 relative">
                <span className="absolute top-4 right-4 bg-primary text-cream text-[10px] tracking-widest px-3 py-1">MEMBER ONLY</span>
                <ImagePlaceholder label="Session photo" className="w-full h-36 mb-4" />
                <p className="text-xs tracking-widest text-primary/40 mb-2">{s.date}</p>
                <h3 className="font-display text-lg tracking-wider text-primary mb-4">{s.topic}</h3>
                <button className="btn-navy text-xs py-2 w-full opacity-50 cursor-not-allowed">WATCH RECORDING</button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* The Format */}
      <section className="section-navy py-24">
        <div className="container mx-auto px-6 max-w-3xl">
          <h2 className="heading-display text-4xl md:text-6xl text-center mb-16">THE FORMAT</h2>
          <div className="space-y-6">
            {formatSteps.map((step, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} className="flex gap-6 items-start border-b border-cream/10 pb-6">
                <span className="font-display text-3xl text-cream/20">{String(i + 1).padStart(2, "0")}</span>
                <p className="text-cream/70 font-body text-sm pt-2">{step}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Kids Track */}
      <section className="section-white py-24">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 max-w-5xl mx-auto">
            <div className="bg-primary p-12 flex items-center">
              <h2 className="heading-display text-4xl md:text-5xl text-cream">LITTLE MINDS RUNS ALONGSIDE</h2>
            </div>
            <div className="bg-background border-[3px] border-primary border-l-0 p-12 flex flex-col justify-center">
              <p className="text-muted-foreground font-body text-sm leading-relaxed mb-6">
                Ages 4–12. Same time. Same venue. Kids explore big questions through story, metaphor and play while adults gather.
              </p>
              <button className="btn-navy text-xs self-start">LEARN ABOUT LITTLE MINDS</button>
            </div>
          </div>
        </div>
      </section>

      {/* Speakers */}
      <section className="section-navy py-24">
        <div className="container mx-auto px-6">
          <h2 className="heading-display text-4xl md:text-6xl text-center mb-16">VOICES WE LEARN FROM</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {speakers.map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="border-2 border-cream/20 p-6 text-center">
                <ImagePlaceholderDark label="Speaker portrait" className="w-full h-48 mb-4" />
                <h3 className="font-display text-lg tracking-wider mb-1">{s.name}</h3>
                <p className="text-cream/50 text-xs mb-2">{s.specialty}</p>
                <span className="text-cream/30 text-[10px] tracking-widest border border-cream/20 px-3 py-1">{s.tag}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Email Capture */}
      <section className="section-white py-24">
        <div className="container mx-auto px-6 max-w-md text-center">
          <h2 className="heading-display text-3xl md:text-4xl text-primary mb-8">GET NOTIFIED BEFORE EACH SESSION</h2>
          {notified ? (
            <p className="font-display text-2xl text-primary">YOU'RE ON THE LIST.</p>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); if (notifyEmail) setNotified(true); }} className="flex gap-3">
              <input type="email" placeholder="EMAIL ADDRESS" value={notifyEmail} onChange={(e) => setNotifyEmail(e.target.value)} required className="flex-1 border-2 border-primary text-primary px-4 py-3 text-sm tracking-widest placeholder:text-primary/30 focus:outline-none bg-transparent" />
              <button type="submit" className="btn-navy text-xs py-3">NOTIFY ME</button>
            </form>
          )}
        </div>
      </section>

      <Footer />
    </>
  );
};

export default Live;
