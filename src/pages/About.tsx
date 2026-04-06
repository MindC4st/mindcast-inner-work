import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ImagePlaceholder, { ImagePlaceholderDark } from "@/components/ImagePlaceholder";


const values = [
  { title: "CONSENT BEFORE EVERYTHING", desc: "You decide what you share, what you explore, and how far you go. Always." },
  { title: "EVIDENCE WHERE POSSIBLE, HONESTY ABOUT THE REST", desc: "We use what the research says. Where it's silent, we say so. No false certainty. No magic." },
  { title: "INNER WORK IS FOR EVERYONE", desc: "Not just the wealthy. Not just the already-well. Not just those with time. This is for the rest of us." },
  { title: "COMMUNITY OVER CONTENT", desc: "The most powerful thing we offer isn't a podcast or a framework. It's the room you walk into each week." },
  { title: "SAFETY IS NON-NEGOTIABLE", desc: "Physically, emotionally, psychologically. We build spaces where people can be honest without being harmed." },
  { title: "ONE STEP AT A TIME", desc: "We don't ask you to transform. We ask you to notice one thing, name one thing, change one thing. Then come back next week." },
];

const About = () => (
  <>
    <Navbar />
    <section className="section-navy min-h-[60vh] flex items-center pt-16">
      <div className="container mx-auto px-6 text-center py-24 max-w-4xl">
        <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="heading-display text-4xl sm:text-5xl md:text-7xl leading-[0.95]">
          WE WANT TO RECREATE WHAT CHURCH DID WELL — WITHOUT THE RELIGION
        </motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="mt-8 text-cream/60 font-body text-base max-w-xl mx-auto leading-relaxed">
          A place to show up every week. A community that holds you accountable. Frameworks for the hard stuff. Tools you carry into real life.
        </motion.p>
      </div>
    </section>

    {/* The Story */}
    <section className="section-white py-24">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
          <div className="w-full h-96 overflow-hidden rounded-sm">
            <video src="/videos/women_with_notepad.mp4" autoPlay muted loop playsInline className="w-full h-full object-cover" />
          </div>
          <div>
            <h2 className="heading-display text-4xl text-primary mb-6">THE STORY</h2>
            <p className="text-muted-foreground font-body text-sm leading-relaxed mb-4">
              I started Mindcast with a question I couldn't stop asking: what if there was a place — like church, like a good AA meeting, like the best therapy group you never found — where you could show up every week, work on yourself, and leave with something real?
            </p>
            <p className="text-muted-foreground font-body text-sm leading-relaxed mb-4">
              Not a course. Not a guru. Not a highlight reel.
            </p>
            <p className="text-muted-foreground font-body text-sm leading-relaxed mb-4">
              A structured practice. Built on evidence, consent, and the kind of honest community that actually changes people.
            </p>
            <p className="text-muted-foreground font-body text-sm leading-relaxed mb-4">
              I couldn't find it. So I built it.
            </p>
            <p className="text-muted-foreground font-body text-sm leading-relaxed">
              Mindcast exists for anyone who believes that healing is a skill — not a luxury, not a mystery, not something that happens to you. Something you learn. Something you practise. One week at a time.
            </p>
          </div>
        </div>
      </div>
    </section>

    {/* The Mission */}
    <section className="section-navy py-24">
      <div className="container mx-auto px-6">
        <h2 className="heading-display text-4xl md:text-6xl text-center mb-16">THE MISSION</h2>
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        {[
            { title: "COMMUNITY", body: "A weekly gathering of people who show up for each other. Not followers. Not fans. A real group doing real work together." },
            { title: "PRACTICE", body: "Three steps. Notice what's happening inside you. Name it out loud. Rewire one thing at a time. Evidence-based. Quietly radical." },
            { title: "TOOLS", body: "Four products (Mindcast Journal, Mindcast Connect, Signal by Mindcast, Little Minds Big Questions) designed to make inner work tangible — something you can hold, track, and carry into the rest of your week." },
          ].map((pillar, i) => (
            <motion.div key={pillar.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="border-2 border-cream/20 p-8 text-center">
              <h3 className="font-display text-3xl tracking-widest mb-4">{pillar.title}</h3>
              <p className="text-cream/50 text-sm font-body leading-relaxed">{pillar.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* The Founder */}
    <section className="section-white py-24">
      <div className="container mx-auto px-6">
        <h2 className="heading-display text-4xl md:text-6xl text-primary text-center mb-16">THE FOUNDER</h2>
        <div className="grid md:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <div className="w-full h-[28rem] overflow-hidden rounded-sm">
              <video src="/videos/founder_on_couch.mp4" autoPlay muted loop playsInline className="w-full h-full object-cover" />
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.15 }}>
            <h3 className="font-display text-3xl tracking-wider text-primary mb-1">ASHLEIGH GRANT</h3>
            <p className="text-xs tracking-[0.3em] text-primary/40 mb-6">FOUNDER & FACILITATOR</p>
            <p className="text-muted-foreground font-body text-sm leading-relaxed mb-4">
              Ashleigh is the founder of Mindcast and the person who runs the room every week. She built this because she needed it and couldn't find it — a structured, honest, community-based space for people who are done with passive self-help and ready to actually do the work.
            </p>
            <p className="text-muted-foreground font-body text-sm leading-relaxed mb-4">
              After years of running businesses, building communities, and quietly asking "why doesn't this kind of space exist?", she decided to build it herself. Mindcast is the result: part live community, part structured practice, part tool for anyone who wants to do the inner work and actually have something to show for it.
            </p>
            <p className="text-muted-foreground font-body text-sm leading-relaxed">
              Based in Taupo, New Zealand. She is not a therapist, not a guru, and not here to tell you what to think. She is here to hold a space where you can figure that out for yourself.
            </p>
          </motion.div>
        </div>
      </div>
    </section>

    {/* Values */}
    <section className="section-navy py-24">
      <div className="container mx-auto px-6">
        <h2 className="heading-display text-4xl md:text-6xl text-center mb-16">OUR VALUES</h2>
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {values.map((v, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} className="border-2 border-cream/20 p-6">
              <h3 className="font-display text-lg tracking-wider text-cream leading-snug mb-3">{v.title}</h3>
              <p className="text-cream/50 text-sm font-body leading-relaxed">{v.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* Our Relationship With AI */}
    <section className="section-navy py-24 relative overflow-hidden">
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover opacity-15"
      >
        <source src="/videos/waves_pulsating.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-[hsl(var(--primary))]/85" />
      <div className="container mx-auto px-6 relative z-10 max-w-3xl">
        <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="heading-display text-3xl sm:text-4xl md:text-5xl text-center mb-4 leading-[1.1]">
          WE USE AI. HERE'S WHY WE'RE PROUD OF THAT.
        </motion.h2>
        <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.15 }} className="text-center text-cream/50 font-body text-sm tracking-wide mb-12">
          A note on how Mindcast was built — and what we believe about the tools we use.
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="space-y-5 text-cream/70 font-body text-sm leading-relaxed">
          <p>
            The images and videos on this website were generated using AI. The resources we share are researched and written by leading experts — and AI helps us surface, synthesise, and apply that knowledge faster than any team of researchers could alone.
          </p>
          <p>
            We believe AI should make us more human, not less. It should free up the hours we waste on things that don't require a human touch — so we can spend more time in rooms with real people, having conversations that actually matter.
          </p>
          <p>
            Mindcast exists because of AI. Not in spite of it.
          </p>
          <p>
            Without it, this idea would still be a note on my phone. I didn't have a team, a budget, or a background in tech. What I had was a clear vision and access to tools that meant I didn't need any of those things to get started. AI levelled that playing field completely.
          </p>
          <p>
            Our resources are evidence-based because AI lets us stand on the shoulders of the researchers, scientists, and authors who have spent decades studying human behaviour, healing, and connection. We don't make things up. We find the best thinking that exists, translate it into something you can actually use, and bring it into the room with us every week.
          </p>
          <p>
            That's the version of AI we're interested in: the one that makes human experience richer, more accessible, and more honest.
          </p>
        </motion.div>

        <motion.blockquote initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.3 }} className="mt-16 text-center">
          <p className="font-display text-2xl sm:text-3xl md:text-4xl tracking-wider text-cream leading-snug">
            "AI didn't replace the human work. It made the human work possible."
          </p>
        </motion.blockquote>
      </div>
    </section>

    {/* Closing CTA */}
    <section className="section-white py-24">
      <div className="container mx-auto px-6 text-center max-w-3xl">
        <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="heading-display text-4xl md:text-6xl text-primary mb-6">
          READY TO START?
        </motion.h2>
        <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.15 }} className="text-muted-foreground font-body text-base leading-relaxed mb-10">
          The Taupo Pilot is running now — 15 founding members, 10 weeks, every Tuesday evening. This is where Mindcast begins.
        </motion.p>
        <motion.a href="/pilot" initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }} className="inline-block bg-primary text-primary-foreground font-display tracking-widest text-sm px-10 py-4 hover:bg-primary/90 transition-colors">
          RESERVE YOUR SPOT &rarr;
        </motion.a>
      </div>
    </section>

    <Footer />
  </>
);

export default About;
