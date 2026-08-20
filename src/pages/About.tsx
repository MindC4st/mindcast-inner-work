import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ImagePlaceholder, { ImagePlaceholderDark } from "@/components/ImagePlaceholder";
import AmbientVideo from "@/components/AmbientVideo";
import mindcastBuilding from "@/assets/mindcast-building.png";
import aboutTheRoom from "@/assets/about-the-room.jpg";


const values = [
  { title: "CONSENT BEFORE EVERYTHING", desc: "You decide what you share, what you explore, and how far you go. Always." },
  { title: "EVIDENCE WHERE POSSIBLE, HONESTY ABOUT THE REST", desc: "We use what the research says. Where it's silent, we say so. No false certainty. No magic." },
  { title: "INNER WORK IS FOR EVERYONE", desc: "Not just the wealthy. Not just the already-well. Not just those with time. This is for the rest of us." },
  { title: "COMMUNITY OVER CONTENT", desc: "The most powerful thing we offer isn't a podcast or a framework. It's the room you walk into each week." },
  { title: "SAFETY IS NON-NEGOTIABLE", desc: "Physically, emotionally, psychologically. We build spaces where people can be honest without being harmed." },
  { title: "ONE STEP AT A TIME", desc: "We don't ask you to transform. We ask you to notice one thing, name one thing, change one thing. Then come back next week." },
];

// The page body, exported so the homepage can embed it as an ivory band
// (/#about) while /about keeps working as a standalone route. Same content,
// one source — no drift between the two.
export const AboutContent = ({ membershipHref = "/membership" }: { membershipHref?: string }) => (
  <>
    <section className="section-cream min-h-[60vh] flex items-center pt-16">
      <div className="container mx-auto px-6 text-center py-24 max-w-4xl">
        <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="heading-display text-4xl sm:text-5xl md:text-7xl leading-[0.95]">
          WE WANT TO RECREATE WHAT CHURCH DID WELL — WITHOUT THE RELIGION
        </motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="mt-8 text-muted-foreground font-body text-base max-w-xl mx-auto leading-relaxed">
          A place to show up every week. A community that holds you accountable. Frameworks for the hard stuff. Tools you carry into real life.
        </motion.p>
      </div>
    </section>

    {/* The Story */}
    <section className="section-white py-24">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
          <div className="w-full h-[32rem] overflow-hidden rounded-sm">
            <AmbientVideo src="/videos/women_with_notepad.mp4" className="w-full h-full object-cover" />
          </div>
          <div>
            <h2 className="heading-display text-4xl text-primary mb-6">THE STORY</h2>
            <p className="text-muted-foreground font-body text-sm leading-relaxed mb-4">
              I loved podcasts the way some people love music. Driving was my favourite thing because it meant I could listen — really listen. But I could never retain what I was learning. The ideas would hit, stir something, then dissolve into the noise of the week.
            </p>
            <p className="text-muted-foreground font-body text-sm leading-relaxed mb-4">
              I tried the gym. I was only there out of necessity — external motivators chased, never truly wanted. I tried book clubs, but I only read non-fiction and I heard some people don't even read the book. Then I started a women in business group: we rotated roles, shared wins, and spoke our intentions aloud each week. Because we'd said them in front of each other, we actually followed through. The structure worked.
            </p>
            <p className="text-muted-foreground font-body text-sm leading-relaxed mb-4">
              But I was told to relax. To loosen the format. And I realised: I didn't want to relax. I didn't want an unorganised meeting with no shape. I wanted a room where the structure was the container that made everything else possible. I craved mental stimulation and real accountability — and I thought, surely there must be others out there who feel the same way.
            </p>
            <p className="text-muted-foreground font-body text-sm leading-relaxed mb-4">
              That's where Mindcast began. Not a book club, not a lecture — a facilitated weekly gathering. A 52-week journey where adults, teens and children each work through the same theme in their own live session, reflect in their course book, and leave with one thing to implement before next week. During the week, Life Groups meet to revisit the Sunday session and go deeper. Not to be taught. Just to do the work, side by side.
            </p>
            <p className="text-muted-foreground font-body text-sm leading-relaxed">
              So I built the room.
            </p>
          </div>
        </div>
      </div>
    </section>

    {/* The Room */}
    <section className="section-cream py-24">
      <div className="container mx-auto px-6 max-w-4xl">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="overflow-hidden rounded-sm aspect-[4/3]">
            <img src={aboutTheRoom} alt="Ashleigh Carlson presenting in the seminar room" className="w-full h-full object-cover" loading="lazy" />
          </div>
          <div>
            <h2 className="heading-display text-4xl text-primary mb-6">THE ROOM</h2>
            <p className="text-muted-foreground font-body text-sm leading-relaxed mb-4">
              Mindcast is being designed as a permanent space — a building purpose-built
              for weekly gatherings. A 120-seat theatre for Sunday sessions. Glass-walled
              breakout rooms for Tuesday Life Groups. A cafe to linger in beforehand.
              An indoor playground so parents can stay present while kids play within view.
            </p>
            <p className="text-muted-foreground font-body text-sm leading-relaxed mb-4">
              Every element — from the auditorium stage to the breakout room acoustics —
              is designed to hold the rhythm: Reflect, Gather, Commit.
            </p>
            <p className="text-muted-foreground/60 font-body text-sm italic leading-relaxed" style={{ fontFamily: "var(--font-serif)" }}>
              "I didn't invent the wisdom. I just built the room."
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
            <p className="text-xs tracking-[0.3em] text-primary/40 mb-6">FOUNDER & FACILITATOR</p>
            <p className="text-muted-foreground font-body text-sm leading-relaxed mb-4">
              I'm not a teacher (anymore). I'm not a guru. I'm not a prophet, and I'm certainly not the source of whatever wisdom surfaces in a Mindcast session.
            </p>
            <p className="text-muted-foreground font-body text-sm leading-relaxed mb-4">
              Everything we draw from — the ideas, the thinkers, the frameworks — already exists in the world. I didn't invent the wisdom. I just built the room. I created the shape of the evening. I wrote the questions. I set the table. What happens at that table belongs to everyone who sits at it.
            </p>
            <p className="text-muted-foreground font-body text-sm leading-relaxed mb-4">
              I built Mindcast because I needed it myself. I needed a place where reflection wasn't rushed, where structure created safety, and where showing up week after week meant actually growing, not just consuming. I wasn't looking to lead anyone. I was looking to find my people: those who get stimulated intellectually, who want to understand themselves better, who are tired of surfaces and small talk and pretending they're fine.
            </p>
            <p className="text-muted-foreground font-body text-sm leading-relaxed">
              So if you need a label, here's the truest one: I'm the first participant. The one who needed this badly enough to build it — and then left the door open for whoever else might need it too.
            </p>
            <p className="text-xs tracking-[0.2em] text-primary/40 mt-6">BASED IN TAUPŌ, NEW ZEALAND</p>
          </motion.div>
        </div>
      </div>
    </section>

    {/* Values */}
    <section className="section-cream py-24">
      <div className="container mx-auto px-6">
        <h2 className="heading-display text-4xl md:text-6xl text-center mb-16">OUR VALUES</h2>
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {values.map((v, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} className="border-2 border-border p-6">
              <h3 className="font-display text-lg tracking-wider text-foreground leading-snug mb-3">{v.title}</h3>
              <p className="text-muted-foreground text-sm font-body leading-relaxed">{v.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* Our Relationship With AI */}
    <section className="section-cream py-24 relative overflow-hidden">
      <AmbientVideo
        src="/videos/hero-loop.mp4"
        className="absolute inset-0 w-full h-full object-cover opacity-15"
      />
      <div className="absolute inset-0 bg-[hsl(var(--primary))]/85" />
      <div className="container mx-auto px-6 relative z-10 max-w-3xl">
        <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="heading-display text-3xl sm:text-4xl md:text-5xl text-center mb-4 leading-[1.1]">
          WE USE AI. HERE'S WHY WE'RE PROUD OF THAT.
        </motion.h2>
        <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.15 }} className="text-center text-muted-foreground font-body text-sm tracking-wide mb-12">
          A note on how Mindcast was built — and what we believe about the tools we use.
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="space-y-5 text-foreground/80 font-body text-sm leading-relaxed">
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
            Without it, this idea would still be a note on my phone. I didn't have a team, a budget, or ample free time. What I had was a clear vision and access to tools that meant I didn't need any of those things to get started. AI levelled that playing field completely.
          </p>
          <p>
            Our resources are evidence-based because AI lets us stand on the shoulders of the researchers, scientists, and authors who have spent decades studying human behaviour, healing, and connection. We don't make things up. We find the best thinking that exists, translate it into something you can actually use, and bring it into the room with us every week.
          </p>
          <p>
            That's the version of AI we're interested in: the one that makes human experience richer, more accessible, and more honest.
          </p>
        </motion.div>

        <motion.blockquote initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.3 }} className="mt-16 text-center">
          <p className="font-display text-2xl sm:text-3xl md:text-4xl tracking-wider text-foreground leading-snug">
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
          The Mindcast journey is 52 weeks of showing up, reflecting, and following through — for adults, teens and children, together. Founding membership is coming soon in Taupō.
        </motion.p>
        <motion.a href={membershipHref} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }} className="inline-block bg-primary text-primary-foreground font-display tracking-widest text-sm px-10 py-4 hover:bg-primary/90 transition-colors">
          BECOME A MEMBER &rarr;
        </motion.a>
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
