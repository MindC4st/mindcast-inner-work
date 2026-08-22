import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AmbientVideo from "@/components/AmbientVideo";


const foundations = [
  {
    title: "Space Over Information",
    subhead: "Why We Exist",
    subheadText: "Most people don't need more information—they need space to slow down, notice what is actually shaping them, and practise making intentional choices.",
    standard: "Life is noisy, fast, and full of competing demands. Mindcast creates a regular place to come back to yourself, reflect without pressure, and take one practical thing into the week that genuinely helps.",
  },
  {
    title: "The Practice of Showing Up",
    subhead: "What We Do",
    subheadText: "We explore one theme each week, ask better questions, and turn reflection into action. The content matters, but the real product is the habit of coming back each week and doing it alongside other people.",
    standard: "Every session follows a simple, repeatable rhythm: Notice It. Name It. Do It.",
  },
  {
    title: "Real People, No Preaching",
    subhead: "Who We Do It For",
    subheadText: "Built for ordinary people trying to live well in a noisy world—parents, teenagers, young people, and busy adults.",
    standard: "You will not be preached at, diagnosed, fixed, or told who you should become. Mindcast is a place to think, connect, and practise becoming more yourself, together.",
  },
  {
    title: "Shared Language at Home",
    subhead: "Generational Impact",
    subheadText: "Real behavioural change starts with a shared language at home.",
    standard: "Designed for multi-generational participation, Mindcast equips parents, teens, and young people with a unified framework for reflection, making growth a collective household practice rather than an isolated effort.",
  },
  {
    title: "Safe by Design",
    subhead: "Psychological Safety",
    subheadText: "Safety isn't added after the program is built; it shapes how every session runs.",
    standard: "Clear boundaries, privacy, moderated interactions, and trained facilitators safeguard the room. Mindcast is a personal development space—not therapy or medical care—and our facilitators operate strictly within that scope.",
  },
  {
    title: "Honest & Unpressured",
    subhead: "Intellectual Integrity",
    subheadText: "No magic, no gurus, and no promise that one exercise works for everyone.",
    standard: "We ground our curriculum in practical frameworks, stay transparent about our limits, and maintain clear membership pathways—with zero artificial urgency, guilt, or forced disclosure.",
  },
];

// The page body, exported so the homepage can embed it as an ivory band
// (/#about) while /about keeps working as a standalone route. Same content,
// one source — no drift between the two.
export const AboutContent = ({ membershipHref = "/membership" }: { membershipHref?: string }) => (
  <>
    <section className="section-cream min-h-[60vh] flex items-center pt-16">
      <div className="container mx-auto px-6 text-center py-28 md:py-36 max-w-4xl">
        <p className="font-body text-[11px] font-bold tracking-[0.5em] text-primary uppercase mb-8">
          About Mindcast
        </p>
        <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="heading-display text-4xl sm:text-5xl md:text-7xl leading-[0.95] text-foreground mb-8">
          WE WANT TO RECREATE WHAT CHURCH DID WELL—WITHOUT THE RELIGION.
        </motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="font-body text-foreground font-medium text-xl max-w-3xl mx-auto leading-relaxed mb-6">
          A place to show up every week. A community that holds you accountable. Frameworks for the hard stuff. Tools you carry into real life.
        </motion.p>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="font-body text-muted-foreground text-base max-w-3xl mx-auto leading-relaxed">
          We are often asked why a community like this requires a paid membership. The truth is, no institution is free—churches run on tithes; we run on transparency. Mindcast is a private organisation, funded by its members to ensure the room remains premium, sustainable, and entirely independent. And as this community grows, so does our capacity to redistribute a percentage of that success directly back into the local causes our members care about.
        </motion.p>
      </div>
    </section>

    {/* The Story */}
    <section id="the-story" className="section-white py-24">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
          <div className="w-full h-[32rem] overflow-hidden rounded-sm">
            <AmbientVideo src="/videos/women_with_notepad.mp4" className="w-full h-full object-cover" />
          </div>
          <div>
            <h2 className="heading-display text-4xl text-primary mb-6">THE STORY</h2>
            <p className="text-muted-foreground font-body text-base leading-relaxed mb-4">
              I loved podcasts the way some people love music. But I could never retain what I was learning. The ideas would hit, stir something, and then dissolve into the noise of the week.
            </p>
            <p className="text-muted-foreground font-body text-base leading-relaxed mb-4">
              I tried book clubs, but half the room hadn't read the book. I tried the gym, but external motivators never lasted. Then I started a women in business group. We rotated roles, shared wins, and spoke our intentions aloud each week. Because we had said them in front of each other, we actually followed through. The structure worked.
            </p>
            <p className="text-muted-foreground font-body text-base leading-relaxed mb-4">
              But I was told to relax. To loosen the format.
            </p>
            <p className="text-muted-foreground font-body text-base leading-relaxed mb-4">
              And I realised: I didn't want to relax. I didn't want an unorganised meeting with no shape. I wanted a room where the structure was the container that made everything else possible. I craved mental stimulation and real accountability—and I thought, surely there must be others who feel the same way.
            </p>
            <p className="text-muted-foreground font-body text-base leading-relaxed mb-4">
              That's where Mindcast began. Not a book club, not a lecture—a facilitated weekly gathering. A 52-week journey where we work through the same theme, reflect in our workbooks, and leave with one thing to implement before next week. During the week, we meet to revisit the session and go deeper. Not to be taught. Just to do the work, side by side.
            </p>
            <p className="text-muted-foreground font-body text-base leading-relaxed">
              So I built the room.
            </p>
          </div>
        </div>
      </div>
    </section>

    {/* The Mission */}
    <section className="section-cream py-24">
      <div className="container mx-auto px-6">
        <h2 className="heading-display text-4xl md:text-6xl text-center mb-16">THE MISSION</h2>
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        {[
            { title: "COMMUNITY", body: "A weekly gathering of people who show up for each other. Not followers. Not fans. A real group doing real work together — in person, face to face." },
            { title: "PRACTICE", body: "A 52-week journey with a weekly rhythm: a facilitated Sunday session works through the theme, you reflect in your course book and set one intention, then a midweek Life Group revisits it and goes deeper — and every session opens by asking whether last week's intention actually happened." },
            { title: "TOOLS", body: "A live digital course book, guided reflection and journaling, weekly practices, and Life Groups — designed to make the inner work tangible and trackable across the whole 52-week journey." },
          ].map((pillar, i) => (
            <motion.div key={pillar.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="border-2 border-border p-8 text-center">
              <h3 className="font-display text-3xl tracking-widest mb-4">{pillar.title}</h3>
              <p className="text-muted-foreground text-sm font-body leading-relaxed">{pillar.body}</p>
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
              <AmbientVideo src="/videos/founder_on_couch.mp4" className="w-full h-full object-cover" />
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.15 }}>
            <h3 className="font-display text-3xl tracking-wider text-primary mb-1">ASHLEIGH CARLSON</h3>
            <p className="text-xs tracking-[0.2em] text-primary/60 mb-6">Founder &amp; Facilitator &nbsp;|&nbsp; Taupō, New Zealand</p>
            <p className="text-muted-foreground font-body text-base leading-relaxed mb-4">
              I am not a teacher, a guru, or a prophet. I didn't invent the wisdom, the ideas, or the frameworks we draw from—those already exist in the world.
            </p>
            <p className="text-muted-foreground font-body text-base leading-relaxed mb-4">
              My job is simple: I built the room. I created the shape of the evening. I wrote the questions and set the table. What happens at that table belongs entirely to everyone who sits at it.
            </p>
            <p className="text-muted-foreground font-body text-base leading-relaxed mb-4">
              I built Mindcast because I needed it myself—a place where reflection wasn't rushed, where structure created safety, and where showing up week after week meant actually growing, not just consuming. I wasn't looking to lead anyone; I was looking for my people: those tired of surfaces and small talk, ready to understand themselves better.
            </p>
            <p className="text-muted-foreground font-body text-base leading-relaxed">
              If you need a label, I am the first participant: the one who needed this room badly enough to build it, and then left the door open for whoever else might need it too.
            </p>
          </motion.div>
        </div>
      </div>
    </section>

    {/* Our Core Foundations */}
    <section className="section-cream py-24">
      <div className="container mx-auto px-6">
        <h2 className="heading-display text-4xl md:text-6xl text-center mb-16">OUR CORE FOUNDATIONS</h2>
        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {foundations.map((f, i) => (
            <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} className="border-2 border-border p-7">
              <h3 className="font-display text-2xl tracking-wider text-foreground leading-snug mb-4">{f.title}</h3>
              <p className="text-muted-foreground text-sm font-body leading-relaxed mb-3">
                <em className="text-foreground font-medium">{f.subhead}:</em> {f.subheadText}
              </p>
              <p className="text-muted-foreground/80 text-sm font-body leading-relaxed">
                <em className="text-foreground font-medium">The Standard:</em> {f.standard}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* Our Relationship With AI */}
    <section className="relative overflow-hidden min-h-screen py-16 md:py-24">
      {/* Background video — visible as ambient warmth */}
      <AmbientVideo
        src="/videos/hero-loop.mp4"
        className="absolute inset-0 w-full h-full object-cover opacity-50 md:opacity-60"
      />
      {/* Dark warm tint overlay (25-30%) with subtle vignette */}
      <div
        className="absolute inset-0"
        style={{ background: "rgba(15, 23, 42, 0.35)" }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 40%, rgba(15, 23, 42, 0.45) 100%)",
        }}
      />

      <div className="container mx-auto px-6 relative z-10 max-w-6xl">
        <div className="grid md:grid-cols-[2fr_3fr] gap-8 lg:gap-12 items-start">
          {/* LEFT COLUMN: Sticky heading & quote callout */}
          <div className="md:sticky md:top-24 md:self-start space-y-6 pb-8 md:pb-0">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="heading-display text-3xl sm:text-4xl md:text-5xl text-white leading-[1.1]"
            >
              WE USE AI. HERE'S WHY WE'RE PROUD OF THAT.
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15 }}
              className="text-white/60 font-body text-sm tracking-wide"
            >
              A note on how Mindcast was built — and what we believe about the tools we use.
            </motion.p>

            {/* Hero quote callout — desktop sticky, mobile closing badge */}
            <motion.blockquote
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="border-l-2 border-white/30 pl-5 py-3 mt-6 md:mt-10"
            >
              <p className="font-display text-xl sm:text-2xl md:text-3xl tracking-wider text-white leading-snug">
                "AI didn't replace the human work. It made the human work possible."
              </p>
            </motion.blockquote>
          </div>

          {/* RIGHT COLUMN: Frosted glass body text container */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="space-y-5 p-6 sm:p-8 lg:p-10"
            style={{
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              background: "rgba(15, 23, 42, 0.65)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              borderRadius: "16px",
            }}
          >
            <p className="font-body text-base leading-relaxed text-[#F8FAFC]">
              The images and videos on this website were generated using AI. The resources we share are researched and written by leading experts — and AI helps us surface, synthesise, and apply that knowledge faster than any team of researchers could alone.
            </p>
            <p className="font-body text-base leading-relaxed text-[#F8FAFC]">
              We believe AI should make us more human, not less. It should free up the hours we waste on things that don't require a human touch — so we can spend more time in rooms with real people, having conversations that actually matter.
            </p>
            <p className="font-body text-base leading-relaxed font-semibold text-[#F8FAFC]">
              Mindcast exists because of AI. Not in spite of it.
            </p>
            <p className="font-body text-base leading-relaxed text-[#F8FAFC]">
              Without it, this idea would still be a note on my phone. I didn't have a team, a budget, or ample free time. What I had was a clear vision and access to tools that meant I didn't need any of those things to get started. AI levelled that playing field completely.
            </p>
            <p className="font-body text-base leading-relaxed text-[#F8FAFC]">
              Our resources are evidence-based because AI lets us stand on the shoulders of the researchers, scientists, and authors who have spent decades studying human behaviour, healing, and connection. We don't make things up. We find the best thinking that exists, translate it into something you can actually use, and bring it into the room with us every week.
            </p>
            <p className="font-body text-base leading-relaxed text-[#F8FAFC]">
              That's the version of AI we're interested in: the one that makes human experience richer, more accessible, and more honest.
            </p>
          </motion.div>
        </div>
      </div>
    </section>

    {/* Interactive curriculum book-preview CTA */}
    <section className="py-20" style={{ background: "hsl(var(--cream, 0 0% 96%))" }}>
      <div className="container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center px-6 max-w-5xl">
        {/* LEFT: Copy & CTA */}
        <div className="space-y-6 order-2 lg:order-1">
          <span className="text-xs uppercase tracking-widest text-primary font-bold font-body">Inside the Practice</span>
          <h2 className="heading-display text-4xl md:text-5xl text-foreground leading-tight">OPEN THE FIRST PAGE.</h2>
          <p className="text-lg text-muted-foreground font-body leading-relaxed">
            Take a look inside the 52-week coursebook. See how quiet reflection translates into simple, weekly intentions across every stage of the journey.
          </p>
          <ul className="space-y-3 text-muted-foreground font-body font-medium">
            <li className="flex items-center gap-3">
              <span className="text-primary font-bold">✓</span> 52 Structured Weekly Themes
            </li>
            <li className="flex items-center gap-3">
              <span className="text-primary font-bold">✓</span> "Notice It. Name It. Do It." Reflection Prompts
            </li>
            <li className="flex items-center gap-3">
              <span className="text-primary font-bold">✓</span> Interactive Midweek Action Trackers
            </li>
          </ul>
          <div className="pt-4">
            <Link
              to="/curriculum"
              className="inline-flex items-center gap-3 px-8 py-4 bg-primary text-primary-foreground font-body font-semibold rounded-lg shadow-lg hover:opacity-90 transition-all"
            >
              EXPLORE THE FULL CURRICULUM →
            </Link>
          </div>
        </div>

        {/* RIGHT: 3D open-book mockup */}
        <div
          className="relative group cursor-pointer order-1 lg:order-2"
          style={{ perspective: "1200px" }}
        >
          {/* Glow */}
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/50 to-muted-foreground/30 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-500" />

          {/* Book outer box with 3D tilt on hover */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative bg-white p-8 rounded-2xl border border-border shadow-2xl transition-transform duration-500 group-hover:-translate-y-2"
            style={{
              transformStyle: "preserve-3d",
              boxShadow: "0 20px 40px -15px rgba(0,0,0,0.15)",
            }}
          >
            {/* Book spread */}
            <div className="aspect-[4/3] bg-amber-50/50 border border-amber-100/60 rounded-lg p-6 flex gap-6">
              {/* Left page */}
              <div className="w-1/2 border-r border-amber-200/50 pr-4 space-y-3">
                <div className="h-3 bg-slate-300 rounded w-1/3" />
                <div className="h-6 bg-slate-800 rounded w-3/4" />
                <div className="space-y-2 pt-4">
                  <div className="h-2 bg-slate-200 rounded w-full" />
                  <div className="h-2 bg-slate-200 rounded w-5/6" />
                  <div className="h-2 bg-slate-200 rounded w-4/6" />
                </div>
              </div>
              {/* Right page */}
              <div className="w-1/2 pl-4 space-y-3">
                <div className="h-3 bg-primary/40 rounded w-1/4" />
                <div className="h-20 bg-primary/5 border border-primary/10 rounded-lg p-3">
                  <div className="h-2 bg-primary/40 rounded w-1/2 mb-2" />
                  <div className="h-2 bg-primary/20 rounded w-full" />
                </div>
                <div className="h-2 bg-slate-200 rounded w-full" />
              </div>
            </div>

            {/* Badge */}
            <div className="absolute bottom-4 right-4 bg-primary text-primary-foreground text-xs px-3 py-1.5 rounded-full font-medium shadow-md">
              Click to Flip Through
            </div>
          </motion.div>
        </div>
      </div>
    </section>

    {/* High-intent CTA — the join lives here, at the end of the story. */}
    <section className="section-white py-24">
      <div className="container mx-auto px-6 text-center max-w-3xl">
        <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="heading-display text-4xl md:text-6xl text-primary mb-6">
          READY TO JOIN THE ROOM?
        </motion.h2>
        <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.15 }} className="text-muted-foreground font-body text-base leading-relaxed mb-10">
          One room, the same people, every week. Become a member and do the work alongside others who are done just consuming.
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }}>
          <Link to={membershipHref} className="inline-block bg-primary text-primary-foreground font-display tracking-widest text-sm px-10 py-4 hover:bg-primary/90 transition-colors">
            JOIN THE ROOM &rarr;
          </Link>
        </motion.div>
      </div>
    </section>
  </>
);

const About = () => (
  <>
    <Navbar />
    <AboutContent />
    <Footer />
  </>
);

export default About;
