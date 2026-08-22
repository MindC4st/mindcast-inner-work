import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  BookOpenCheck,
  CalendarDays,
  Check,
  ChevronDown,
  Loader2,
  Repeat2,
  ScanLine,
  ShieldCheck,
  UsersRound,
  type LucideIcon,
} from "lucide-react";

import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import Ripple from "@/components/brand/Ripple";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  FAMILY_DISCOUNT_PERCENT,
  PRICING,
  formatWeekly,
  type AccessPassLookupKey,
} from "@/lib/membershipPricing";
import familyWorkbooks from "@/assets/home-family-workbooks.jpg";
import lifeGroup from "@/assets/home-life-group.jpg";
import threeWorkbooks from "@/assets/home-three-workbooks.jpg";
import membershipTrial from "@/assets/membership-trial.jpg";

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
      initial={reduceMotion ? false : { opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.16 }}
      transition={{
        duration: reduceMotion ? 0 : 0.5,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

const Eyebrow = ({ children, light = false }: { children: ReactNode; light?: boolean }) => (
  <p
    className={`font-body text-[10px] font-bold uppercase tracking-[0.3em] ${
      light ? "text-white/65" : "text-primary"
    }`}
  >
    {children}
  </p>
);

const PrimaryLink = ({ to, children }: { to: string; children: ReactNode }) => (
  <Link
    to={to}
    className="inline-flex min-h-[52px] items-center justify-center gap-2 bg-primary px-7 py-4 font-body text-[10px] font-bold uppercase tracking-[0.17em] text-primary-foreground shadow-[0_12px_28px_rgba(53,133,175,0.2)] transition-[transform,background-color] hover:-translate-y-0.5 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4"
  >
    {children}
    <ArrowRight size={15} aria-hidden="true" />
  </Link>
);

const SecondaryLink = ({ to, children }: { to: string; children: ReactNode }) => (
  <Link
    to={to}
    className="inline-flex min-h-[52px] items-center justify-center gap-2 border border-primary/35 bg-white px-7 py-4 font-body text-[10px] font-bold uppercase tracking-[0.17em] text-primary transition-[transform,border-color] hover:-translate-y-0.5 hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4"
  >
    {children}
  </Link>
);

/* -------------------------------------------------------------------------- */
/* Prepaid access checkout                                                    */
/* -------------------------------------------------------------------------- */

const AccessCheckoutButton = ({
  lookupKey,
  label = "Buy online",
}: {
  lookupKey: AccessPassLookupKey;
  label?: string;
}) => {
  const { user } = useAuth();
  const [state, setState] = useState<"idle" | "busy" | "error">("idle");

  const checkout = async () => {
    if (!user) return;
    setState("busy");
    try {
      const { data, error } = await supabase.functions.invoke("create-access-pass-checkout", {
        body: { lookup_key: lookupKey },
      });
      if (error) throw error;
      if (data?.url) {
        window.location.assign(data.url);
        return;
      }
      throw new Error(data?.error || "Checkout did not return a URL");
    } catch (error) {
      console.error("create-access-pass-checkout failed:", error);
      setState("error");
    }
  };

  if (!user) {
    return (
      <Link
        to="/auth?redirect=%2Fmembership%23flexible-access"
        className="inline-flex min-h-[50px] w-full items-center justify-center border border-primary bg-white px-5 font-body text-[10px] font-bold uppercase tracking-[0.16em] text-primary transition-colors hover:bg-primary hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4"
      >
        Sign in to buy
      </Link>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => void checkout()}
        disabled={state === "busy"}
        className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 border border-primary bg-white px-4 font-body text-[9px] font-bold uppercase tracking-[0.16em] text-primary transition-colors hover:bg-primary hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60"
      >
        {state === "busy" ? <><Loader2 size={14} className="animate-spin" /> Opening checkoutâ€¦</> : label}
      </button>

      {state === "error" ? (
        <p role="alert" className="mt-2 font-body text-xs leading-5 text-destructive">
          Checkout did not open. Please try again or contact MINDCAST.
        </p>
      ) : null}
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Hero                                                                        */
/* -------------------------------------------------------------------------- */

const MembershipHero = () => {
  const reduceMotion = useReducedMotion();

  return (
    <section className="section-cream overflow-hidden border-b border-border pt-16">
      <div className="mx-auto grid min-h-[calc(100svh-64px)] max-w-7xl items-center gap-10 px-5 py-12 sm:px-6 sm:py-16 lg:grid-cols-[1.03fr_0.97fr] lg:gap-16 lg:px-8 lg:py-20">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.65, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="flex items-center gap-3">
            <Ripple size={24} />
            <Eyebrow>Membership in TaupÅ</Eyebrow>
          </div>

          <h1 className="mt-7 max-w-4xl font-display text-[clamp(4rem,8.4vw,8.5rem)] leading-[0.82] tracking-[-0.025em] text-primary">
            A PLACE IN
            <br />
            THE ROOM.
          </h1>

          <p
            className="mt-7 max-w-2xl text-xl italic leading-8 text-foreground/75 sm:text-2xl"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            The same people. One shared idea. One small intention carried into the week.
          </p>

          <p className="mt-5 max-w-xl font-body text-sm leading-7 text-muted-foreground sm:text-base">
            MINDCAST is not a subscription to more content. It is a weekly place to slow down,
            reflect honestly and practise intentional living alongside people who keep coming back.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <PrimaryLink to="/try">Try one Sundayâ€”free</PrimaryLink>
            <SecondaryLink to="#membership-options">See membership options</SecondaryLink>
          </div>

          <ul className="mt-7 flex flex-wrap gap-x-6 gap-y-2 font-body text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            <li>No card details</li>
            <li>Bring your family</li>
            <li>Worksheet included</li>
          </ul>
        </motion.div>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: reduceMotion ? 0 : 0.7, delay: 0.12 }}
          className="relative"
        >
          <div className="aspect-[4/5] overflow-hidden rounded-2xl bg-muted shadow-[0_28px_70px_rgba(16,36,56,0.18)] lg:aspect-[5/6]">
            <img
              src={membershipTrial}
              alt="People arriving for a MINDCAST gathering in TaupÅ"
              className="h-full w-full object-cover"
            />
          </div>

          <div className="absolute inset-x-4 bottom-4 rounded-xl border border-white/15 bg-[#102438]/82 p-5 text-white backdrop-blur-md sm:inset-x-6 sm:bottom-6 sm:p-6">
            <p className="font-body text-[9px] font-bold uppercase tracking-[0.26em] text-white/60">
              The first decision is smaller than joining
            </p>
            <p className="mt-2 font-display text-3xl tracking-wide sm:text-4xl">
              COME ONCE. DECIDE AFTER.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

/* -------------------------------------------------------------------------- */
/* Entry paths                                                                 */
/* -------------------------------------------------------------------------- */

type EntryCardProps = {
  number: string;
  eyebrow: string;
  title: string;
  price: string;
  priceNote: string;
  body: string;
  bullets: string[];
  children: ReactNode;
};

const EntryCard = ({
  number,
  eyebrow,
  title,
  price,
  priceNote,
  body,
  bullets,
  children,
}: EntryCardProps) => (
  <article className="flex h-full flex-col rounded-2xl border border-border bg-white p-6 shadow-[0_14px_40px_rgba(16,36,56,0.06)] sm:p-7">
    <div className="flex items-start justify-between gap-5">
      <Eyebrow>{eyebrow}</Eyebrow>
      <span className="font-display text-3xl leading-none text-primary/20">{number}</span>
    </div>

    <h3 className="mt-6 font-display text-4xl leading-none tracking-wide text-primary">
      {title}
    </h3>

    <div className="mt-5 flex items-end gap-2 border-b border-border pb-5">
      <span className="font-display text-5xl leading-none text-foreground">{price}</span>
      <span className="pb-1 font-body text-xs text-muted-foreground">{priceNote}</span>
    </div>

    <p className="mt-5 font-body text-sm leading-6 text-muted-foreground">{body}</p>

    <ul className="mt-5 space-y-2.5">
      {bullets.map((bullet) => (
        <li key={bullet} className="flex gap-3 font-body text-xs leading-5 text-foreground/75">
          <Check size={15} className="mt-0.5 shrink-0 text-primary" aria-hidden="true" />
          {bullet}
        </li>
      ))}
    </ul>

    <div className="mt-auto pt-7">{children}</div>
  </article>
);

const EntryPaths = () => (
  <section id="membership-options" className="scroll-mt-24 bg-white py-20 sm:py-24 lg:py-28">
    <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
      <Reveal className="max-w-3xl">
        <Eyebrow>Three honest ways to begin</Eyebrow>
        <h2 className="mt-4 font-display text-[clamp(3.1rem,7vw,6.3rem)] leading-[0.88] tracking-tight text-primary">
          CHOOSE THE DOOR THAT FITS.
        </h2>
        <p className="mt-5 max-w-2xl font-body text-sm leading-7 text-muted-foreground sm:text-base">
          Try the room first, join the weekly practice, or buy a prepaid Concession Pass. Every
          price and access boundary is visible before you choose.
        </p>
      </Reveal>

      <div className="mt-10 grid gap-5 lg:grid-cols-3">
        <Reveal>
          <EntryCard
            number="01"
            eyebrow="Try the room"
            title="FREE SESSION PASS"
            price="$0"
            priceNote="one Sunday"
            body="An adult registers and can bring their children or teens to the same session. Come through the full experience before deciding anything."
            bullets={[
              "No payment or account required",
              "One pass for your family booking",
              "Printed worksheet included",
            ]}
          >
            <PrimaryLink to="/try">Get a free pass</PrimaryLink>
          </EntryCard>
        </Reveal>

        <Reveal delay={0.06}>
          <EntryCard
            number="02"
            eyebrow="Join the practice"
            title="WEEKLY MEMBERSHIP"
            price={formatWeekly(PRICING.adult)}
            priceNote="adult / week"
            body="A recurring place in the Sunday room, a midweek Life Group and a personal record of the work you carry into real life."
            bullets={[
              `Young person places are ${formatWeekly(PRICING.youngPersonPlace)}/week`,
              "Build your household before checkout",
              "Choose monthly or annual billing",
            ]}
          >
            <PrimaryLink to="/portal/billing">Build my membership</PrimaryLink>
          </EntryCard>
        </Reveal>

        <Reveal delay={0.12}>
          <EntryCard
            number="03"
            eyebrow="Keep it flexible"
            title="CONCESSION PASS"
            price="FROM $120"
            priceNote="10 sessions"
            body="Prepay ten visits without starting a weekly membership. Choose an adult or under-18 pass and use the visits as they suit your household."
            bullets={[
              `Adult pass ${formatWeekly(PRICING.visitorCardAdult10)}`,
              `Under-18 pass ${formatWeekly(PRICING.visitorCardYouth10)}`,
              "Printed worksheet included each visit",
            ]}
          >
            <SecondaryLink to="#flexible-access">Choose a pass</SecondaryLink>
          </EntryCard>
        </Reveal>
      </div>

      <p className="mt-7 text-center font-body text-xs text-muted-foreground">
        {PRICING.gstNote} Exact household totals are shown before checkout.
      </p>
    </div>
  </section>
);

/* -------------------------------------------------------------------------- */
/* Weekly membership                                                          */
/* -------------------------------------------------------------------------- */

const WEEKLY_STEPS = [
  {
    day: "SUN",
    title: "LIVE SESSION",
    body: "Explore one idea, reflect privately and leave with one small intention.",
  },
  {
    day: "MIDWEEK",
    title: "LIFE GROUP",
    body: "Return to the intention with a smaller group and talk about what actually happened.",
  },
  {
    day: "FRI",
    title: "CHECK-IN",
    body: "Notice where you got to without turning the week into a score or a streak.",
  },
  {
    day: "SUN",
    title: "COME BACK",
    body: "Begin again with something real to reflect on from the week you just lived.",
  },
];

const WeeklyMembership = () => (
  <section className="section-cream border-y border-border py-20 sm:py-24 lg:py-28">
    <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
      <div className="grid items-center gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:gap-16">
        <Reveal>
          <div className="overflow-hidden rounded-2xl bg-muted shadow-[0_20px_55px_rgba(16,36,56,0.12)]">
            <img
              src={lifeGroup}
              alt="A small MINDCAST Life Group meeting together"
              className="aspect-[4/3] h-full w-full object-cover lg:aspect-[5/6]"
              loading="lazy"
            />
          </div>
        </Reveal>

        <div>
          <Reveal>
            <Eyebrow>What the membership actually buys</Eyebrow>
            <h2 className="mt-4 font-display text-[clamp(3.2rem,7vw,6.2rem)] leading-[0.88] tracking-tight text-primary">
              NOT MORE CONTENT.
              <br />
              A REASON TO RETURN.
            </h2>
            <p className="mt-5 max-w-2xl font-body text-sm leading-7 text-muted-foreground sm:text-base">
              The live session is the beginning. Membership connects the room, the worksheet,
              the Life Group and your private reflections into one repeatable weekly practice.
            </p>
          </Reveal>

          <div className="mt-8 grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2">
            {WEEKLY_STEPS.map((step, index) => (
              <Reveal key={`${step.day}-${step.title}`} delay={index * 0.05}>
                <article className="h-full bg-white p-5 sm:p-6">
                  <div className="flex items-start justify-between gap-4">
                    <p className="font-display text-2xl tracking-[0.14em] text-primary">{step.day}</p>
                    <span className="font-display text-xl text-primary/20">0{index + 1}</span>
                  </div>
                  <h3 className="mt-4 font-display text-2xl tracking-wide text-primary">
                    {step.title}
                  </h3>
                  <p className="mt-2 font-body text-xs leading-5 text-muted-foreground">{step.body}</p>
                </article>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.16} className="mt-7">
            <PrimaryLink to="/portal/billing">Build my household</PrimaryLink>
          </Reveal>
        </div>
      </div>
    </div>
  </section>
);

/* -------------------------------------------------------------------------- */
/* Household                                                                  */
/* -------------------------------------------------------------------------- */

const HouseholdSection = () => (
  <section className="bg-white py-20 sm:py-24 lg:py-28">
    <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:px-8">
      <div>
        <Reveal>
          <Eyebrow>One household Â· age-appropriate rooms</Eyebrow>
          <h2 className="mt-4 font-display text-[clamp(3rem,6.6vw,5.8rem)] leading-[0.88] tracking-tight text-primary">
            BUILD THE MEMBERSHIP AROUND YOUR PEOPLE.
          </h2>
          <p className="mt-5 max-w-2xl font-body text-sm leading-7 text-muted-foreground sm:text-base">
            Start with an adult membership, then add the teens or children joining you. They do
            not sit through the adult lesson: each room works with the same weekly idea in a way
            designed for that stage of life.
          </p>
        </Reveal>

        <Reveal delay={0.08} className="mt-7 rounded-2xl border border-border bg-[#f7f2ea] p-5 sm:p-6">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <Eyebrow>Adult place</Eyebrow>
              <p className="mt-2 font-display text-4xl text-foreground">
                {formatWeekly(PRICING.adult)}
                <span className="ml-2 font-body text-xs text-muted-foreground">/ week</span>
              </p>
              <p className="mt-2 font-body text-xs leading-5 text-muted-foreground">
                Live sessions, Life Group, adult digital journal and weekly worksheet.
              </p>
            </div>

            <div className="border-t border-border pt-5 sm:border-l sm:border-t-0 sm:pl-5 sm:pt-0">
              <Eyebrow>Young person place</Eyebrow>
              <p className="mt-2 font-display text-4xl text-foreground">
                {formatWeekly(PRICING.youngPersonPlace)}
                <span className="ml-2 font-body text-xs text-muted-foreground">/ week</span>
              </p>
              <p className="mt-2 font-body text-xs leading-5 text-muted-foreground">
                Age-appropriate sessions, printed worksheets and relevant portal resources.
              </p>
            </div>
          </div>

          <p className="mt-5 border-t border-border pt-4 font-body text-xs leading-5 text-muted-foreground">
            Stripe automatically applies {FAMILY_DISCOUNT_PERCENT}% off when the household includes
            at least two adults and two young people: two teens, two children, or one of each.
          </p>
        </Reveal>

        <Reveal delay={0.12} className="mt-7">
          <PrimaryLink to="/portal/billing">Open the household builder</PrimaryLink>
        </Reveal>
      </div>

      <Reveal delay={0.08}>
        <div className="overflow-hidden rounded-2xl bg-muted shadow-[0_20px_55px_rgba(16,36,56,0.12)]">
          <img
            src={familyWorkbooks}
            alt="MINDCAST adult, teen and child workbooks used by one family"
            className="aspect-[4/3] h-full w-full object-cover lg:aspect-[5/6]"
            loading="lazy"
          />
        </div>
      </Reveal>
    </div>
  </section>
);

/* -------------------------------------------------------------------------- */
/* Flexible access                                                            */
/* -------------------------------------------------------------------------- */

const FLEXIBLE_ACCESS = [
  {
    name: "ADULT CONCESSION PASS",
    price: `$${PRICING.visitorCardAdult10}`,
    per: "10 sessions",
    note: "$24 per visit",
    lookupKey: "visitor_card_adult_10",
    cta: "Buy adult pass",
  },
  {
    name: "UNDER-18 CONCESSION PASS",
    price: `$${PRICING.visitorCardYouth10}`,
    per: "10 sessions",
    note: "$12 per visit",
    lookupKey: "visitor_card_youth_10",
    cta: "Buy under-18 pass",
  },
  {
    name: "ADULT ONE-OFF",
    price: `$${PRICING.oneOffAdult}`,
    per: "one session",
    note: "Worksheet included",
    lookupKey: "one_off_adult",
    cta: "Buy adult session",
  },
  {
    name: "UNDER-18 ONE-OFF",
    price: `$${PRICING.oneOffYouth}`,
    per: "one session",
    note: "Adult-led attendance",
    lookupKey: "one_off_youth",
    cta: "Buy under-18 session",
  },
] satisfies Array<{
  name: string;
  price: string;
  per: string;
  note: string;
  lookupKey: AccessPassLookupKey;
  cta: string;
}>;

const FlexibleAccess = () => (
  <section id="flexible-access" className="scroll-mt-24 section-cream border-y border-border py-20 sm:py-24">
    <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
      <Reveal className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
        <div>
          <Eyebrow>Not looking for weekly membership?</Eyebrow>
          <h2 className="mt-4 font-display text-[clamp(3rem,6vw,5.5rem)] leading-[0.88] tracking-tight text-primary">
            KEEP IT FLEXIBLE.
          </h2>
        </div>
        <p className="max-w-2xl font-body text-sm leading-7 text-muted-foreground sm:text-base">
          Concession Passes and one-off places keep the room accessible without app, journal or
          Life Group access. Every visit still includes the weekâ€™s printed worksheet.
        </p>
      </Reveal>

      <div className="mt-9 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {FLEXIBLE_ACCESS.map((option, index) => (
          <Reveal key={option.name} delay={index * 0.04}>
            <article className="flex h-full flex-col rounded-xl border border-border bg-white p-5">
              <p className="font-body text-[9px] font-bold uppercase tracking-[0.2em] text-primary">
                {option.name}
              </p>
              <p className="mt-4 font-display text-4xl leading-none text-foreground">{option.price}</p>
              <p className="mt-2 font-body text-xs text-muted-foreground">{option.per}</p>
              <p className="mt-5 border-t border-border pt-4 font-body text-[10px] font-semibold uppercase tracking-[0.12em] text-foreground/55">
                {option.note}
              </p>
              <div className="mt-auto pt-5">
                <AccessCheckoutButton lookupKey={option.lookupKey} label={option.cta} />
              </div>
            </article>
          </Reveal>
        ))}
      </div>

      <Reveal delay={0.12} className="mt-7 flex flex-col items-start justify-between gap-5 rounded-xl border border-primary/20 bg-primary/5 p-5 sm:flex-row sm:items-center">
        <div>
          <p className="font-display text-2xl tracking-wide text-foreground">BUY SECURELY ONLINE</p>
          <p className="mt-1 font-body text-xs leading-5 text-muted-foreground">
            Choose a pass above and confirm the published price in Stripe Checkout. Purchases are
            saved to the household automatically after payment.
          </p>
        </div>
        <SecondaryLink to="/contact">Ask a question</SecondaryLink>
      </Reveal>

      <p className="mt-6 text-center font-body text-xs leading-5 text-muted-foreground">
        Prefer to follow the year on paper? The dayâ€™s worksheet is {formatWeekly(PRICING.worksheet)}
        {" "}at the door or online. No account required.
      </p>
    </div>
  </section>
);

/* -------------------------------------------------------------------------- */
/* Inclusions and boundaries                                                  */
/* -------------------------------------------------------------------------- */

type Benefit = {
  icon: LucideIcon;
  title: string;
  body: string;
};

const BENEFITS: Benefit[] = [
  {
    icon: CalendarDays,
    title: "Sunday sessions",
    body: "A live facilitated session every week of the year.",
  },
  {
    icon: Repeat2,
    title: "Midweek Life Group",
    body: "A smaller room that returns to what you intended to practise.",
  },
  {
    icon: BookOpenCheck,
    title: "Weekly worksheet",
    body: "Printed for children and teens; adult members can also work digitally.",
  },
  {
    icon: UsersRound,
    title: "Three tracks",
    body: "Adult, teen and child experiences built around the same weekly idea.",
  },
  {
    icon: ShieldCheck,
    title: "Private reflection",
    body: "Adult journal responses stay private unless deliberately submitted for sharing.",
  },
  {
    icon: ScanLine,
    title: "Member access",
    body: "Portal resources and a wristband-based arrival experience for members.",
  },
];

const Inclusions = () => (
  <section className="bg-white py-20 sm:py-24 lg:py-28">
    <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
      <Reveal className="mx-auto max-w-3xl text-center">
        <Eyebrow>What sits behind the weekly price</Eyebrow>
        <h2 className="mt-4 font-display text-[clamp(3rem,6.4vw,5.8rem)] leading-[0.88] tracking-tight text-primary">
          THE ROOMâ€”AND THE PRACTICE AROUND IT.
        </h2>
      </Reveal>

      <div className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
        {BENEFITS.map((benefit, index) => {
          const Icon = benefit.icon;
          return (
            <Reveal key={benefit.title} delay={index * 0.04}>
              <article className="h-full bg-white p-6">
                <Icon size={24} strokeWidth={1.6} className="text-primary" />
                <h3 className="mt-5 font-display text-2xl tracking-wide text-primary">
                  {benefit.title.toUpperCase()}
                </h3>
                <p className="mt-2 font-body text-xs leading-5 text-muted-foreground sm:text-sm sm:leading-6">
                  {benefit.body}
                </p>
              </article>
            </Reveal>
          );
        })}
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Reveal>
          <article className="h-full rounded-2xl bg-[#102438] p-6 text-white sm:p-7">
            <Eyebrow light>What MINDCAST is not</Eyebrow>
            <h3 className="mt-4 font-display text-3xl tracking-wide">NOT THERAPY OR COUNSELLING.</h3>
            <p className="mt-3 font-body text-sm leading-6 text-white/65">
              MINDCAST is a personal-development and community experience, not a clinical or
              medical service. We say that boundary plainly before anyone joins.
            </p>
          </article>
        </Reveal>

        <Reveal delay={0.05}>
          <article className="h-full rounded-2xl bg-[#102438] p-6 text-white sm:p-7">
            <Eyebrow light>What MINDCAST does not use</Eyebrow>
            <h3 className="mt-4 font-display text-3xl tracking-wide">NO LOCK-IN OR PRESSURE.</h3>
            <p className="mt-3 font-body text-sm leading-6 text-white/65">
              Choose monthly or annual billing and see the exact household total before paying.
              Rolling memberships can be managed or cancelled through the member portal. Choose
              â€œCancel membershipâ€, then confirm in Stripe.
            </p>
          </article>
        </Reveal>
      </div>
    </div>
  </section>
);

/* -------------------------------------------------------------------------- */
/* Questions and shop                                                         */
/* -------------------------------------------------------------------------- */

const QUESTIONS = [
  {
    question: "Do I have to join before attending?",
    answer:
      "No. An adult can request one free session pass and bring their children or teens to the same session. There are no card details and nothing to cancel afterwards.",
  },
  {
    question: "Do adults, teens and children sit through the same lesson?",
    answer:
      "No. They explore the same weekly idea in separate age-appropriate rooms, using different language, examples and activities.",
  },
  {
    question: "How does household billing work?",
    answer:
      `The member portal lets you choose the number of adults, teens and children joining. Stripe applies ${FAMILY_DISCOUNT_PERCENT}% off automatically for two or more adults plus two young people in any mix. You can cancel any time: choose â€œCancel membershipâ€, then confirm in Stripe.`,
  },
  {
    question: "What is a Concession Pass?",
    answer:
      `It is a prepaid ten-session option rather than a weekly membership: ${formatWeekly(PRICING.visitorCardAdult10)} for an adult or ${formatWeekly(PRICING.visitorCardYouth10)} for an under-18. It includes the printed worksheet for each visit but not the app, journal or Life Group.`,
  },
];

const Questions = () => (
  <section className="section-cream border-y border-border py-20 sm:py-24">
    <div className="mx-auto grid max-w-6xl gap-10 px-5 sm:px-6 lg:grid-cols-[0.68fr_1.32fr] lg:gap-16 lg:px-8">
      <Reveal>
        <Eyebrow>Before you decide</Eyebrow>
        <h2 className="mt-4 font-display text-[clamp(3rem,6vw,5.2rem)] leading-[0.88] tracking-tight text-primary">
          CLEAR ANSWERS.
          <br />
          NO SMALL PRINT.
        </h2>
        <p className="mt-5 font-body text-sm leading-7 text-muted-foreground">
          If your question is not here, ask it directly. You do not need to begin checkout to get
          a straight answer.
        </p>
        <Link
          to="/contact"
          className="mt-6 inline-flex items-center gap-2 font-body text-[10px] font-bold uppercase tracking-[0.17em] text-primary underline decoration-primary/25 underline-offset-8 hover:decoration-primary"
        >
          Ask MINDCAST <ArrowRight size={14} />
        </Link>
      </Reveal>

      <div className="overflow-hidden rounded-2xl border border-border bg-white">
        {QUESTIONS.map((item) => (
          <details key={item.question} className="group border-b border-border last:border-b-0">
            <summary className="flex min-h-[72px] cursor-pointer list-none items-center justify-between gap-6 px-5 py-4 marker:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary sm:px-6 [&::-webkit-details-marker]:hidden">
              <span className="font-display text-xl tracking-wide text-foreground sm:text-2xl">
                {item.question.toUpperCase()}
              </span>
              <ChevronDown
                size={19}
                className="shrink-0 text-primary transition-transform group-open:rotate-180"
                aria-hidden="true"
              />
            </summary>
            <p className="px-5 pb-5 font-body text-sm leading-6 text-muted-foreground sm:px-6 sm:pb-6">
              {item.answer}
            </p>
          </details>
        ))}
      </div>
    </div>
  </section>
);

const ShopStrip = () => (
  <section className="bg-white py-16 sm:py-20">
    <div className="mx-auto grid max-w-6xl items-center gap-8 px-5 sm:px-6 md:grid-cols-[0.8fr_1.2fr] lg:px-8">
      <Reveal>
        <div className="aspect-[16/10] overflow-hidden rounded-2xl bg-muted">
          <img
            src={threeWorkbooks}
            alt="MINDCAST Life Binders, journals and weekly practice tools"
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </div>
      </Reveal>

      <Reveal delay={0.06}>
        <Eyebrow>Already building the practice at home?</Eyebrow>
        <h2 className="mt-4 font-display text-4xl leading-[0.92] tracking-tight text-primary sm:text-5xl">
          TAKE THE TOOLS HOME.
        </h2>
        <p className="mt-4 max-w-xl font-body text-sm leading-7 text-muted-foreground">
          Explore Life Binders, phase planners, journals and weekly practice tools designed to
          carry what happens in the room into ordinary life.
        </p>
        <div className="mt-6">
          <SecondaryLink to="/shop">Visit the shop</SecondaryLink>
        </div>
      </Reveal>
    </div>
  </section>
);

/* -------------------------------------------------------------------------- */
/* Page                                                                        */
/* -------------------------------------------------------------------------- */

export const MembershipContent = () => (
  <>
    <MembershipHero />
    <EntryPaths />
    <WeeklyMembership />
    <HouseholdSection />
    <FlexibleAccess />
    <Inclusions />
    <Questions />
    <ShopStrip />
  </>
);

const Membership = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <main>
      <MembershipContent />
    </main>
    <Footer />
  </div>
);

export default Membership;