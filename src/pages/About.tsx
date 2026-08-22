import type { ReactNode } from "react";
import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowDown,
  ArrowRight,
  ChevronDown,
  Quote,
} from "lucide-react";

import AmbientVideo from "@/components/AmbientVideo";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

/* -------------------------------------------------------------------------- */
/* Content                                                                     */
/* -------------------------------------------------------------------------- */

const foundations = [
  {
    number: "01",
    lens: "WHY WE EXIST",
    title: "SPACE OVER INFORMATION",
    belief:
      "I believe most people don’t need more information—they need space to slow down, notice what is actually shaping them, and practise making more intentional choices.",
    standard:
      "Life is noisy, fast, and full of competing demands. Mindcast exists to create a regular place where people can come back to themselves, reflect without pressure, and take one small thing into the week that might genuinely help.",
  },
  {
    number: "02",
    lens: "WHAT WE DO",
    title: "THE PRACTICE OF SHOWING UP",
    belief:
      "The content matters, but the real product is the practice of coming back each week and doing it alongside other people.",
    standard:
      "I’m building Mindcast—a weekly personal-development and community experience. Each week we explore one theme, ask better questions, make space for reflection, and turn that reflection into one practical intention.",
  },
  {
    number: "03",
    lens: "WHO IT’S FOR",
    title: "REAL PEOPLE, NO PREACHING",
    belief:
      "For ordinary people trying to live well in a very noisy world.",
    standard:
      "Parents, teenagers, young people, busy adults—people who want to be more intentional without being preached at, diagnosed, fixed, or told who they should become.",
  },
  {
    number: "04",
    lens: "OUR BOUNDARIES",
    title: "THE ROLE OF FACILITATOR",
    belief:
      "I am not a teacher, a guru, or a prophet. I didn’t invent the wisdom we draw from.",
    standard:
      "My job is simple: I built the room, I create the structure, and I set the table. What happens at that table belongs entirely to the people who sit at it. I am simply the first participant.",
  },
] as const;

/* -------------------------------------------------------------------------- */
/* Shared UI                                                                   */
/* -------------------------------------------------------------------------- */

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
};

const Reveal = ({ children, className = "", delay = 0 }: RevealProps) => {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.18 }}
      transition={{
        duration: reduceMotion ? 0 : 0.55,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

type SectionHeadingProps = {
  eyebrow: string;
  title: ReactNode;
  body?: ReactNode;
  align?: "left" | "center";
};

const SectionHeading = ({
  eyebrow,
  title,
  body,
  align = "left",
}: SectionHeadingProps) => (
  <div
    className={
      align === "center"
        ? "mx-auto max-w-3xl text-center"
        : "max-w-3xl"
    }
  >
    <p className="mb-4 font-body text-[11px] font-bold uppercase tracking-[0.34em] text-primary">
      {eyebrow}
    </p>

    <h2 className="font-display text-[clamp(2.8rem,7vw,5.8rem)] leading-[0.92] tracking-tight text-primary">
      {title}
    </h2>

    {body ? (
      <div className="mt-6 font-body text-base leading-7 text-muted-foreground md:text-lg md:leading-8">
        {body}
      </div>
    ) : null}
  </div>
);

/* -------------------------------------------------------------------------- */
/* Hero                                                                        */
/* -------------------------------------------------------------------------- */

const AboutHero = () => {
  const reduceMotion = useReducedMotion();

  return (
    <section className="section-cream flex min-h-[72svh] items-center border-b border-border pt-16 lg:pt-[72px]">
      <div className="mx-auto w-full max-w-7xl px-5 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-28">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: reduceMotion ? 0 : 0.7,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="grid items-end gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.55fr)] lg:gap-16"
        >
          <div>
            <p className="mb-7 font-body text-[11px] font-bold uppercase tracking-[0.42em] text-primary">
              About Mindcast
            </p>

            <h1 className="max-w-5xl font-display text-[clamp(3.3rem,10vw,7.5rem)] leading-[0.86] tracking-[-0.02em] text-primary">
              WE WANT TO RECREATE
              <br />
              WHAT CHURCH DID WELL.
              <br />
              WITHOUT THE RELIGION.
            </h1>
          </div>

          <div className="border-l-2 border-primary/25 pl-6 sm:pl-8">
            <p className="font-body text-lg leading-8 text-foreground/80">
              A place to show up every week. A community that holds you
              accountable. Frameworks for the hard stuff. Tools you carry into
              real life.
            </p>

            <p className="mt-6 font-body text-lg leading-8 text-foreground/80">
              We are often asked why a community like this requires a paid
              membership. The truth is, no institution is free—churches run on
              tithes; we run on transparency. Mindcast is a private
              organisation, funded by its members to ensure the room remains
              premium, sustainable, and entirely independent.
            </p>

            <a
              href="#the-story"
              className="mt-7 inline-flex min-h-12 items-center gap-3 font-body text-xs font-bold tracking-[0.16em] text-primary underline decoration-primary/25 underline-offset-8 transition-colors hover:decoration-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4"
            >
              READ THE STORY
              <ArrowDown size={17} aria-hidden="true" />
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

/* -------------------------------------------------------------------------- */
/* Story                                                                       */
/* -------------------------------------------------------------------------- */

const StorySection = () => (
  <section
    id="the-story"
    className="scroll-mt-20 bg-white py-20 sm:py-24 lg:py-32"
  >
    <div className="mx-auto grid max-w-7xl gap-12 px-5 sm:px-6 lg:grid-cols-[0.88fr_1.12fr] lg:gap-20 lg:px-8">
      <Reveal className="lg:sticky lg:top-28 lg:self-start">
        <div className="relative overflow-hidden rounded-2xl bg-muted shadow-[0_18px_55px_rgba(16,36,56,0.12)]">
          <AmbientVideo
            src="/videos/women_with_notepad.mp4"
            className="aspect-[4/5] h-full w-full object-cover"
          />

          <div className="absolute inset-x-4 bottom-4 rounded-xl border border-white/60 bg-white/85 p-4 shadow-[0_12px_35px_rgba(16,36,56,0.16)] backdrop-blur-[10px] sm:inset-x-5 sm:bottom-5 sm:p-5">
            <Quote
              className="mb-3 text-primary/60"
              size={21}
              aria-hidden="true"
            />

            <p className="font-display text-2xl tracking-wide text-primary sm:text-3xl">
              &ldquo;I didn&rsquo;t want to relax.&rdquo;
            </p>
          </div>
        </div>
      </Reveal>

      <Reveal delay={0.08}>
        <SectionHeading eyebrow="The origin" title="THE STORY" />

        <div className="mt-8 space-y-5 font-body text-base leading-7 text-muted-foreground md:text-lg md:leading-8">
          <p>
            I loved podcasts the way some people love music. But I could never
            retain what I was learning. The ideas would hit, stir something, and
            then dissolve into the noise of the week.
          </p>

          <p>
            I tried book clubs, but half the room hadn&apos;t read the book. I
            tried the gym, but external motivators never lasted. Then I started
            a women in business group. We rotated roles, shared wins, and spoke
            our intentions aloud each week. Because we had said them in front
            of each other, we actually followed through. The structure worked.
          </p>

          <p>But I was told to relax. To loosen the format.</p>

          <p>
            And I realised: I didn&apos;t want to relax. I didn&apos;t want an
            unorganised meeting with no shape. I wanted a room where the
            structure was the container that made everything else possible. I
            craved mental stimulation and real accountability—and I thought,
            surely there must be others who feel the same way.
          </p>

          <p>
            That&apos;s where MINDCAST began. Not a book club, not a lecture—a
            facilitated weekly gathering where people explore the same theme,
            reflect honestly, and leave with one practical intention to carry
            into the week.
          </p>
        </div>

        <p className="mt-10 border-t border-border pt-8 font-display text-4xl tracking-wide text-primary sm:text-5xl">
          SO I BUILT THE ROOM.
        </p>
      </Reveal>
    </div>
  </section>
);

/* -------------------------------------------------------------------------- */
/* Foundations browser                                                        */
/* -------------------------------------------------------------------------- */

const FoundationsSection = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const reduceMotion = useReducedMotion();
  const active = foundations[activeIndex];

  return (
    <section className="section-cream border-y border-border py-20 sm:py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <Reveal>
          <SectionHeading
            eyebrow="Why · What · Who · How"
            title="OUR CORE FOUNDATIONS"
            body={
              <p className="max-w-3xl">
                These are not slogans sitting beside the work. They explain why
                MINDCAST exists, who it is for, and the boundaries that shape
                every room we create.
              </p>
            }
          />
        </Reveal>

        <div className="mt-12 grid gap-5 lg:grid-cols-[minmax(260px,0.42fr)_minmax(0,1fr)] lg:gap-8">
          <div
            className="-mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:-mx-6 sm:px-6 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0 lg:pb-0"
            aria-label="Choose a MINDCAST foundation"
          >
            {foundations.map((foundation, index) => {
              const selected = index === activeIndex;

              return (
                <button
                  key={foundation.number}
                  type="button"
                  aria-pressed={selected}
                  aria-controls="foundation-detail"
                  onClick={() => setActiveIndex(index)}
                  className={`group min-h-[74px] min-w-[235px] snap-start rounded-xl border p-4 text-left transition-[background-color,border-color,box-shadow,transform] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 lg:min-w-0 ${
                    selected
                      ? "border-primary bg-primary text-primary-foreground shadow-[0_12px_30px_rgba(53,133,175,0.2)]"
                      : "border-border bg-white text-primary hover:-translate-y-0.5 hover:border-primary/40"
                  }`}
                >
                  <span className="flex items-center justify-between gap-4">
                    <span>
                      <span
                        className={`block font-body text-[9px] font-bold uppercase tracking-[0.18em] ${
                          selected
                            ? "text-primary-foreground/70"
                            : "text-muted-foreground"
                        }`}
                      >
                        {foundation.number} · {foundation.lens}
                      </span>

                      <span className="mt-2 block font-display text-xl tracking-wide sm:text-2xl">
                        {foundation.title}
                      </span>
                    </span>

                    <ArrowRight
                      size={18}
                      className={`shrink-0 transition-transform ${
                        selected
                          ? "translate-x-1"
                          : "group-hover:translate-x-1"
                      }`}
                      aria-hidden="true"
                    />
                  </span>
                </button>
              );
            })}
          </div>

          <div
            id="foundation-detail"
            aria-live="polite"
            className="relative min-h-[430px] overflow-hidden rounded-2xl border border-border bg-white shadow-[0_18px_55px_rgba(16,36,56,0.08)] sm:min-h-[390px]"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.article
                key={active.number}
                initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={
                  reduceMotion ? undefined : { opacity: 0, y: -8 }
                }
                transition={{
                  duration: reduceMotion ? 0 : 0.24,
                }}
                className="relative flex min-h-[430px] flex-col justify-between p-6 sm:min-h-[390px] sm:p-9 lg:p-12"
              >
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-2 -top-8 font-display text-[10rem] leading-none text-primary/[0.055] sm:text-[13rem]"
                >
                  {active.number}
                </span>

                <div className="relative max-w-3xl">
                  <p className="font-body text-[10px] font-bold uppercase tracking-[0.24em] text-primary">
                    {active.number} · {active.lens}
                  </p>

                  <h3 className="mt-4 font-display text-[clamp(2.6rem,6vw,5rem)] leading-[0.92] tracking-tight text-primary">
                    {active.title}
                  </h3>
                </div>

                <div className="relative mt-12 grid gap-7 border-t border-border pt-7 md:grid-cols-2 md:gap-10">
                  <div>
                    <p className="font-body text-[10px] font-bold uppercase tracking-[0.2em] text-primary/60">
                      The belief
                    </p>

                    <p className="mt-3 font-body text-base leading-7 text-foreground/80 md:text-lg md:leading-8">
                      {active.belief}
                    </p>
                  </div>

                  <div>
                    <p className="font-body text-[10px] font-bold uppercase tracking-[0.2em] text-primary/60">
                      How it shows up
                    </p>

                    <p className="mt-3 font-body text-base leading-7 text-muted-foreground md:text-lg md:leading-8">
                      {active.standard}
                    </p>
                  </div>
                </div>
              </motion.article>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
};

/* -------------------------------------------------------------------------- */
/* AI disclosure                                                              */
/* -------------------------------------------------------------------------- */

const AiDisclosure = () => (
  <section className="bg-white py-16 sm:py-20">
    <div className="mx-auto max-w-5xl px-5 sm:px-6 lg:px-8">
      <details className="group overflow-hidden rounded-2xl border border-border bg-card shadow-[0_12px_35px_rgba(16,36,56,0.06)]">
        <summary className="flex min-h-[88px] cursor-pointer list-none items-center justify-between gap-6 p-5 marker:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary sm:p-7 [&::-webkit-details-marker]:hidden">
          <span>
            <span className="block font-body text-[10px] font-bold uppercase tracking-[0.22em] text-primary/60">
              Transparency note
            </span>

            <span className="mt-2 block font-display text-3xl tracking-wide text-primary sm:text-4xl">
              HOW MINDCAST USES AI
            </span>
          </span>

          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-primary/20 text-primary transition-transform group-open:rotate-180">
            <ChevronDown size={20} aria-hidden="true" />
          </span>
        </summary>

        <div className="border-t border-border px-5 py-7 sm:px-7 sm:py-9">
          <div className="grid gap-7 md:grid-cols-3 md:gap-9">
            <div>
              <h3 className="font-display text-2xl tracking-wide text-primary">
                CREATION
              </h3>

              <p className="mt-3 font-body text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
                Some images and videos on this website were created with AI. We
                use it to make a small team capable of expressing a much larger
                vision.
              </p>
            </div>

            <div>
              <h3 className="font-display text-2xl tracking-wide text-primary">
                RESEARCH
              </h3>

              <p className="mt-3 font-body text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
                Our curriculum draws from published research and established
                thinkers. AI helps us search, organise, and synthesise; human
                judgement decides what belongs in the room.
              </p>
            </div>

            <div>
              <h3 className="font-display text-2xl tracking-wide text-primary">
                THE BOUNDARY
              </h3>

              <p className="mt-3 font-body text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
                AI supports the work. It does not replace live facilitation,
                human connection, or responsibility for what MINDCAST publishes
                and teaches.
              </p>
            </div>
          </div>
        </div>
      </details>
    </div>
  </section>
);

/* -------------------------------------------------------------------------- */
/* CTA                                                                         */
/* -------------------------------------------------------------------------- */

const AboutCta = ({ membershipHref }: { membershipHref: string }) => (
  <section className="section-cream border-t border-border py-20 sm:py-24 lg:py-32">
    <div className="mx-auto max-w-4xl px-5 text-center sm:px-6 lg:px-8">
      <Reveal>
        <p className="font-body text-[11px] font-bold uppercase tracking-[0.34em] text-primary">
          The next question
        </p>

        <h2 className="mt-5 font-display text-[clamp(3.4rem,9vw,7.5rem)] leading-[0.86] tracking-tight text-primary">
          WHAT DOES A WEEK ACTUALLY LOOK LIKE?
        </h2>

        <p className="mx-auto mt-7 max-w-2xl font-body text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
          Look inside the curriculum, follow the Sunday-to-Friday rhythm, and
          see how one theme is adapted for adults, teens, and children.
        </p>

        <div className="mt-9 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
          <Link
            to="/curriculum"
            className="inline-flex min-h-[52px] items-center justify-center gap-2 bg-primary px-7 py-4 font-body text-xs font-bold tracking-[0.14em] text-primary-foreground shadow-[0_10px_30px_rgba(53,133,175,0.22)] transition-[transform,background-color] hover:-translate-y-0.5 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4"
          >
            LOOK INSIDE THE CURRICULUM
            <ArrowRight size={17} aria-hidden="true" />
          </Link>

          <Link
            to="/try"
            className="inline-flex min-h-[52px] items-center justify-center gap-2 border border-primary/40 bg-white px-7 py-4 font-body text-xs font-bold tracking-[0.14em] text-primary transition-[transform,border-color] hover:-translate-y-0.5 hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4"
          >
            TRY A SESSION FIRST
          </Link>
        </div>

        <p className="mt-6 font-body text-sm text-muted-foreground">
          Already ready?{" "}
          <Link
            to={membershipHref}
            className="font-semibold text-primary underline decoration-primary/25 underline-offset-4 hover:decoration-primary"
          >
            View membership options.
          </Link>
        </p>
      </Reveal>
    </div>
  </section>
);

/* -------------------------------------------------------------------------- */
/* Page                                                                        */
/* -------------------------------------------------------------------------- */

// Kept as an export so existing imports continue to compile.
// Home should link to /about rather than rendering this full page
// inside the homepage.
export const AboutContent = ({
  membershipHref = "/membership",
}: {
  membershipHref?: string;
}) => (
  <>
    <AboutHero />
    <StorySection />
    <FoundationsSection />
    <AiDisclosure />
    <AboutCta membershipHref={membershipHref} />
  </>
);

const About = () => (
  <div className="min-h-screen bg-white">
    <Navbar />

    <main>
      <AboutContent />
    </main>

    <Footer />
  </div>
);

export default About;