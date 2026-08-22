import type { ReactNode } from "react";
import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowDown,
  ArrowRight,
  ChevronDown,
  NotebookPen,
  Quote,
  Repeat2,
  UsersRound,
} from "lucide-react";

import AmbientVideo from "@/components/AmbientVideo";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

/* -------------------------------------------------------------------------- */
/* Content                                                                     */
/* -------------------------------------------------------------------------- */

const missionPillars = [
  {
    title: "THE ROOM",
    eyebrow: "Community",
    icon: UsersRound,
    body: "A real group of people who return each week, reflect alongside one another, and make showing up feel normal.",
  },
  {
    title: "THE RHYTHM",
    eyebrow: "Practice",
    icon: Repeat2,
    body: "One theme, better questions, one practical intention, and a reason to come back to it before the week disappears.",
  },
  {
    title: "THE TOOLS",
    eyebrow: "Into real life",
    icon: NotebookPen,
    body: "A live coursebook, private reflection, weekly check-ins, and Life Groups that carry the practice beyond Sunday.",
  },
] as const;

const foundations = [
  {
    number: "01",
    lens: "WHY WE EXIST",
    title: "SPACE OVER INFORMATION",
    belief:
      "Most people don’t need more information. They need space to slow down, notice what is actually shaping them, and practise making more intentional choices.",
    standard:
      "Life is noisy, fast, and full of competing demands. MINDCAST creates a regular place to come back to yourself, reflect without pressure, and take one small thing into the week that might genuinely help.",
  },
  {
    number: "02",
    lens: "WHAT WE DO",
    title: "THE PRACTICE OF SHOWING UP",
    belief:
      "Each week we explore one theme, ask better questions, make space for reflection, and turn that reflection into one practical intention.",
    standard:
      "The content matters, but the real product is the practice of coming back each week and doing it alongside other people. The rhythm is simple: Notice It. Name It. Do It.",
  },
  {
    number: "03",
    lens: "WHO IT’S FOR",
    title: "REAL PEOPLE, NO PREACHING",
    belief:
      "MINDCAST is for ordinary people trying to live well in a noisy world—parents, teenagers, young people, and busy adults.",
    standard:
      "You will not be preached at, diagnosed, fixed, or told who you should become. This is a place to think, connect, and practise becoming more yourself, together.",
  },
  {
    number: "04",
    lens: "WHAT CONNECTS US",
    title: "SHARED LANGUAGE AT HOME",
    belief: "Real behavioural change starts with a shared language at home.",
    standard:
      "Adults, teens, and children explore the same weekly theme in age-appropriate spaces. That gives households a natural way to reflect and grow together without expecting everyone to have the same experience.",
  },
  {
    number: "05",
    lens: "HOW WE HOLD THE ROOM",
    title: "SAFE BY DESIGN",
    belief:
      "Safety is not added after the programme is built. It shapes how every session works.",
    standard:
      "Clear boundaries, privacy, moderated interactions, age-appropriate participation, and trained facilitators protect the experience. MINDCAST is personal development and community—not therapy or medical care—and we stay inside that boundary.",
  },
  {
    number: "06",
    lens: "HOW WE EARN TRUST",
    title: "HONEST & UNPRESSURED",
    belief: "No magic. No guru. No promise that one exercise works for everyone.",
    standard:
      "We use research where it helps, distinguish evidence from teaching tools, and stay open about what we do not know. There is no forced disclosure, artificial urgency, guilt, or pressure to perform a particular kind of growth.",
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
              About MINDCAST
            </p>

            <h1 className="max-w-5xl font-display text-[clamp(3.3rem,12vw,9rem)] leading-[0.84] tracking-[-0.025em] text-primary">
              A PLACE TO COME BACK TO YOURSELF.
            </h1>
          </div>

          <div className="border-l-2 border-primary/25 pl-6 sm:pl-8">
            <p className="font-body text-lg leading-8 text-foreground/80">
              MINDCAST is a weekly personal-development and community practice
              for adults, teens, and children—built around better questions,
              honest reflection, and one small intention taken into real life.
            </p>

            <a
              href="#the-story"
              className="mt-7 inline-flex min-h-12 items-center gap-3 font-body text-xs font-bold tracking-[0.16em] text-primary underline decoration-primary/25 underline-offset-8 transition-colors hover:decoration-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4"
            >
              READ HOW IT STARTED
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

          <div className="absolute inset-x-4 bottom-4 rounded-xl border border-white/20 bg-[#102438]/70 p-4 text-white backdrop-blur-md sm:inset-x-5 sm:bottom-5 sm:p-5">
            <Quote
              className="mb-3 text-white/60"
              size={21}
              aria-hidden="true"
            />

            <p className="font-display text-2xl tracking-wide sm:text-3xl">
              THE STRUCTURE WORKED.
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
/* Mission                                                                     */
/* -------------------------------------------------------------------------- */

const MissionSection = () => (
  <section className="section-cream border-y border-border py-20 sm:py-24 lg:py-32">
    <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
      <Reveal>
        <SectionHeading
          eyebrow="The mission"
          title="MAKE INTENTIONAL LIVING A PRACTICE, NOT ANOTHER IDEA."
          body={
            <p className="max-w-3xl">
              We create a regular place where ordinary people can slow down,
              understand themselves better, and practise making more
              intentional choices alongside others.
            </p>
          }
        />
      </Reveal>

      <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-border bg-border lg:grid-cols-3">
        {missionPillars.map((pillar, index) => {
          const Icon = pillar.icon;

          return (
            <Reveal key={pillar.title} delay={index * 0.08}>
              <article className="h-full bg-white p-6 sm:p-8 lg:p-9">
                <div className="flex items-start justify-between gap-5">
                  <Icon
                    className="text-primary"
                    size={28}
                    strokeWidth={1.7}
                    aria-hidden="true"
                  />

                  <span className="font-display text-3xl text-primary/20">
                    0{index + 1}
                  </span>
                </div>

                <p className="mt-10 font-body text-[10px] font-bold uppercase tracking-[0.22em] text-primary/70">
                  {pillar.eyebrow}
                </p>

                <h3 className="mt-2 font-display text-4xl tracking-wide text-primary">
                  {pillar.title}
                </h3>

                <p className="mt-4 font-body text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
                  {pillar.body}
                </p>
              </article>
            </Reveal>
          );
        })}
      </div>
    </div>
  </section>
);

/* -------------------------------------------------------------------------- */
/* Founder                                                                     */
/* -------------------------------------------------------------------------- */

const FounderSection = () => (
  <section className="bg-white py-20 sm:py-24 lg:py-32">
    <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
      <Reveal>
        <SectionHeading
          eyebrow="The first participant"
          title="THE FOUNDER"
        />
      </Reveal>

      <div className="mt-12 grid items-center gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:gap-20">
        <Reveal>
          <div className="overflow-hidden rounded-2xl bg-muted shadow-[0_18px_55px_rgba(16,36,56,0.12)]">
            <AmbientVideo
              src="/videos/founder_on_couch.mp4"
              className="aspect-[4/3] h-full w-full object-cover lg:aspect-[5/6]"
            />
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <p className="font-body text-[11px] font-bold uppercase tracking-[0.28em] text-primary/70">
            Founder &amp; Facilitator · Taupō, New Zealand
          </p>

          <h3 className="mt-3 font-display text-5xl tracking-wide text-primary sm:text-6xl">
            ASHLEIGH CARLSON
          </h3>

          <div className="mt-8 space-y-5 font-body text-base leading-7 text-muted-foreground md:text-lg md:leading-8">
            <p>
              I am not here as a guru, a prophet, or the source of whatever
              wisdom surfaces in a MINDCAST session. The ideas, thinkers, and
              frameworks we draw from already exist in the world.
            </p>

            <p>
              My role is to shape and protect the room: choose the theme, write
              the questions, set the pace, and create enough structure for
              people to reflect honestly. I facilitate the conversation; I do
              not tell people what their answers should be.
            </p>

            <p>
              I am also the first participant. I built MINDCAST because I
              wanted a place like this in my own life. I am not standing above
              the room—I am sitting in it too.
            </p>
          </div>

          <blockquote className="mt-9 border-l-2 border-primary pl-6">
            <p className="font-display text-3xl leading-tight tracking-wide text-primary sm:text-4xl">
              “I BUILT THE DOOR—THEN LEFT IT OPEN.”
            </p>
          </blockquote>
        </Reveal>
      </div>
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
                MINDCAST exists, who it is for, and the standards that shape
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
    <MissionSection />
    <FounderSection />
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