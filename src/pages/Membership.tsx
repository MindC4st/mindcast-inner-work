import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Ripple from "@/components/brand/Ripple";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { PRICING, formatWeekly } from "@/lib/membershipPricing";
import lifeGroup from "@/assets/home-life-group.jpg";
import familyWorkbooks from "@/assets/home-family-workbooks.jpg";
import threeWorkbooks from "@/assets/home-three-workbooks.jpg";
import membershipTrial from "@/assets/membership-trial.jpg";

// /membership — the most commercially important page in the product, built to
// the charter, not to SaaS convention. The rules this page must never break:
//
//   - The free trial pass and the concession place carry the same visual
//     weight as the paid tiers. Neither is a footnote.
//   - No urgency devices of any kind: no countdowns, no "spots left", no
//     strikethrough anchor pricing, no "most popular" steering badges, no
//     exit-intent modals, no guilt. This is a charter obligation.
//   - Concession is one step with no explanation asked — the database schema
//     has no column for a reason, deliberately.
//   - Cancellation terms are stated here, before anyone pays.
//
// Pricing figures come from src/lib/membershipPricing.ts (single source);
// actual billing is governed by the Stripe prices behind
// create-subscription-checkout.

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.6 },
};

/* ── Tier card ─────────────────────────────────────────────────────────── */

type TierAction =
  | { kind: "link"; to: string; label: string }
  | { kind: "concession" };

type Tier = {
  name: string;
  price: string;
  per?: string;
  body: string;
  detail?: string;
  action: TierAction;
};

const ConcessionButton = () => {
  const { user } = useAuth();
  const [state, setState] = useState<"idle" | "busy" | "done" | "already" | "error">("idle");

  const request = async () => {
    if (!user) return; // rendered as a link in that case
    setState("busy");
    const { error } = await supabase
      .from("concession_requests")
      .insert({ user_id: user.id, status: "requested" });
    if (!error) setState("done");
    else if (error.code === "23505") setState("already");
    else setState("error");
  };

  if (!user) {
    return (
      <Link
        to="/portal/login?next=/membership"
        className="block w-full text-center border-2 border-primary text-primary font-display tracking-widest text-sm px-6 py-3.5 hover:bg-primary hover:text-primary-foreground transition-colors"
      >
        SIGN IN TO REQUEST
      </Link>
    );
  }
  if (state === "done" || state === "already") {
    return (
      <p role="status" className="text-center font-body text-sm text-primary py-3.5">
        {state === "done"
          ? "Done. We'll set it up and let you know — nothing more to do."
          : "Your request is already with us."}
      </p>
    );
  }
  return (
    <>
      <button
        onClick={request}
        disabled={state === "busy"}
        className="block w-full text-center border-2 border-primary text-primary font-display tracking-widest text-sm px-6 py-3.5 hover:bg-primary hover:text-primary-foreground transition-colors disabled:opacity-60"
      >
        {state === "busy" ? "REQUESTING…" : "REQUEST A CONCESSION PLACE"}
      </button>
      {state === "error" && (
        <p role="alert" className="text-center font-body text-xs text-destructive mt-2">
          That didn't go through. Try again, or just mention it at the door — that works too.
        </p>
      )}
    </>
  );
};

const TierCard = ({ tier }: { tier: Tier }) => (
  <motion.div
    {...fadeUp}
    className="bg-card border border-border p-8 flex flex-col"
    role="group"
    aria-label={`${tier.name} — ${tier.price}${tier.per ?? ""}`}
  >
    <h3 className="font-display text-3xl tracking-wide text-foreground">{tier.name}</h3>
    <p className="mt-4 mb-1">
      <span className="font-display text-5xl text-foreground">{tier.price}</span>
      {tier.per && <span className="font-body text-sm text-muted-foreground ml-2">{tier.per}</span>}
    </p>
    {tier.detail && <p className="font-body text-xs text-primary mb-3">{tier.detail}</p>}
    <p className="font-body text-sm text-muted-foreground leading-relaxed flex-1 mb-8">{tier.body}</p>
    {tier.action.kind === "link" ? (
      <Link
        to={tier.action.to}
        className="block w-full text-center bg-primary text-primary-foreground font-display tracking-widest text-sm px-6 py-3.5 hover:bg-primary/90 transition-colors"
      >
        {tier.action.label}
      </Link>
    ) : (
      <ConcessionButton />
    )}
  </motion.div>
);

/* ── Page ──────────────────────────────────────────────────────────────── */

const TIERS: Tier[] = [
  {
    name: "ADULT MEMBERSHIP",
    price: formatWeekly(PRICING.adult),
    per: "/week",
    detail: "Founding rate. Standard rate $19/week after first 100 memberships.",
    body: "The full year: every Sunday session, your workbook and saved reflections, a midweek Life Group, and your wristband at the door. App & journal access included.",
    action: { kind: "link", to: "/portal/billing", label: "START MEMBERSHIP" },
  },
  {
    name: "YOUNG PERSON PLACE",
    price: formatWeekly(PRICING.youngPersonPlace),
    per: "/week",
    detail: "Add-on to an active adult membership.",
    body: "The youth room, same rhythm. A private journal no one else reads — not even parents — and their own pass for the door. Printed workbook each week.",
    action: { kind: "link", to: "/portal/billing", label: "ADD TO MEMBERSHIP" },
  },
  {
    name: "VISITOR CARD — ADULT",
    price: "$240",
    per: "10 trips",
    detail: "$24/session. One per person per phase.",
    body: "Ten adult sessions. Worksheet included. No app or journal access.",
    action: { kind: "link", to: "/portal/billing", label: "BUY VISITOR CARD" },
  },
  {
    name: "VISITOR CARD — UNDER-18",
    price: "$120",
    per: "10 trips",
    detail: "$12/session. One per person per phase.",
    body: "Ten under-18 sessions. Worksheet included. No app or journal access.",
    action: { kind: "link", to: "/portal/billing", label: "BUY VISITOR CARD" },
  },
  {
    name: "ONE-OFF SESSION — ADULT",
    price: "$30",
    per: "session",
    detail: "Casual attendance. Worksheet included.",
    body: "One adult session. Worksheet included. No app or journal access.",
    action: { kind: "link", to: "/portal/billing", label: "BOOK SESSION" },
  },
  {
    name: "ONE-OFF SESSION — UNDER-18",
    price: "$15",
    per: "session",
    detail: "Casual attendance. Worksheet included.",
    body: "One under-18 session. Worksheet included. No app or journal access.",
    action: { kind: "link", to: "/portal/billing", label: "BOOK SESSION" },
  },
  ];

const INCLUDED: { item: string; inTier: string }[] = [
  { item: "The Sunday session, every week of the year", inTier: "Included" },
  { item: "Your workbook — digital (adults) or printed (kids & teens), with your saved reflections (adults only)", inTier: "Included" },
  { item: "Weekly worksheet included with every access type (membership, visitor card, one-off, trial); additional printed workbooks available for purchase", inTier: "Included" },
  { item: "A midweek Life Group", inTier: "Included" },
  { item: "Private digital journal — adults only (teens' journals are invisible to guardians; kids & teens receive printed worksheets each week)", inTier: "Included" },
  { item: "Teen portal access — revisit lessons, rewatch videos, see slide questions (answers not saved — privacy for under 18s)", inTier: "Included" },
  { item: "NFC wristband entry, replacement bracelets at cost", inTier: "Included" },
  { item: "One-to-one therapy or counselling", inTier: "Not included — and we'll say so plainly: Mindcast is not a clinical service" },
  { item: "Locked-in commitment", inTier: "Not included — cancel any time, two clicks, no questions" },
];

// The page body, exported so the homepage can embed it as an ivory band
// (/#membership) while /membership keeps working as a standalone route.
export const MembershipContent = () => (
  <>
    {/* 1 · What you are joining — said plainly, before any price appears. */}
    <section className="section-cream min-h-[72vh] flex items-center pt-16">
      <div className="container mx-auto px-6 py-24 max-w-4xl text-center">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}>
          <Ripple size={44} className="mx-auto mb-8 text-primary" animate />
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="heading-display text-5xl sm:text-6xl md:text-8xl leading-[0.92] text-foreground"
        >
          A ROOM IN TAUPŌ.
          <br />
          THE SAME PEOPLE.
          <br />
          EVERY WEEK.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="font-serif italic text-xl md:text-2xl text-muted-foreground mt-8 max-w-2xl mx-auto"
        >
          Nobody here buys a subscription. You decide to turn up — for a year, with people who
          will notice when you don't.
        </motion.p>
      </div>
    </section>

    {/* 2 · The trial pass — equal weight, above the tiers, no card, no catch. */}
    <section className="section-cream py-24">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div {...fadeUp} className="relative overflow-hidden aspect-[4/3]">
            <img
              src={membershipTrial}
              alt="Mindcast playground and gathering space"
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </motion.div>
          <motion.div {...fadeUp}>
            <p className="text-[11px] tracking-[0.3em] font-body font-bold text-primary uppercase mb-4">
              Before any of the prices below
            </p>
            <h2 className="heading-display text-4xl md:text-6xl text-foreground mb-6">
              COME AND SIT IN THE ROOM FIRST
            </h2>
            <p className="font-body text-base text-muted-foreground leading-relaxed mb-4">
              A free trial pass gets you one full Sunday — the session, the room, the people. No
              card details, no obligation, and nobody in the room will know or care that you're
              on a pass.
            </p>
            <p className="font-body text-base text-muted-foreground leading-relaxed mb-8">
              If it isn't for you, that's a fine answer and we won't chase you about it.
            </p>
            <Link
              to="/try"
              className="inline-block bg-primary text-primary-foreground font-display tracking-widest text-sm px-10 py-4 hover:bg-primary/90 transition-colors"
            >
              GET A FREE SESSION PASS
            </Link>
          </motion.div>
        </div>
      </div>
    </section>

    {/* 3 + 4 · Tiers, concession among them as a peer. */}
    <section className="section-white py-24">
      <div className="container mx-auto px-6 max-w-6xl">
        <motion.div {...fadeUp} className="text-center mb-16 max-w-2xl mx-auto">
          <h2 className="heading-display text-4xl md:text-6xl text-foreground mb-4">MEMBERSHIP</h2>
          <p className="font-body text-sm text-muted-foreground">{PRICING.gstNote}</p>
        </motion.div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {TIERS.map((t) => (
            <TierCard key={t.name} tier={t} />
          ))}
          {/* The trial pass sits in the same grid as the paid tiers — equal weight. */}
          <motion.div
            {...fadeUp}
            className="bg-card border border-border p-8 flex flex-col"
            role="group"
            aria-label="Free trial pass — $0, one session"
          >
            <h3 className="font-display text-3xl tracking-wide text-foreground">TRIAL PASS</h3>
            <p className="mt-4 mb-1">
              <span className="font-display text-5xl text-foreground">$0</span>
              <span className="font-body text-sm text-muted-foreground ml-2"> one session</span>
            </p>
            <p className="font-body text-sm text-muted-foreground leading-relaxed flex-1 mb-8">
              One Sunday, the whole thing, free. Single use, requested in one click, delivered as
              a QR pass. Bring the family — they're on the same ticket.
            </p>
            <Link
              to="/try"
              className="block w-full text-center bg-primary text-primary-foreground font-display tracking-widest text-sm px-6 py-3.5 hover:bg-primary/90 transition-colors"
            >
              GET A FREE PASS
            </Link>
          </motion.div>
        </div>
        <motion.p {...fadeUp} className="text-center font-body text-sm text-muted-foreground mt-10 max-w-2xl mx-auto">
          Not ready for any of it? The day's worksheet is {formatWeekly(PRICING.worksheet)} at the
          door or online (worksheets are included with every access type; additional printed
          workbooks available for purchase), and you can follow the whole year that way. No account needed.
        </motion.p>
      </div>
    </section>

    {/* 5 · What membership includes and does not — plain table, no asterisks. */}
    <section className="section-cream py-24">
      <div className="container mx-auto px-6 max-w-3xl">
        <motion.h2 {...fadeUp} className="heading-display text-4xl md:text-5xl text-foreground text-center mb-12">
          WHAT'S IN IT — AND WHAT ISN'T
        </motion.h2>
        <motion.div {...fadeUp} className="border border-border divide-y divide-border bg-card">
          {INCLUDED.map((row) => (
            <div key={row.item} className="grid sm:grid-cols-[1fr_auto] gap-2 px-6 py-4">
              <p className="font-body text-sm text-foreground">{row.item}</p>
              <p className="font-body text-sm text-muted-foreground sm:text-right">{row.inTier}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>

    {/* 6 · The product line — take the room home. */}
    <section className="section-white border-t border-border py-24">
      <div className="container mx-auto px-6 max-w-3xl text-center">
        <motion.div {...fadeUp}>
          <Ripple size={36} className="mx-auto mb-6 text-primary" />
          <h2 className="heading-display text-4xl md:text-6xl text-foreground mb-6">
            TAKE MINDCAST HOME
          </h2>
          <p className="font-body text-base text-muted-foreground leading-relaxed max-w-xl mx-auto mb-4">
            The MINDCAST product line carries what happens in the room into ordinary life —
            13-week phase planners, refillable life binders, companion journals, weekly practice
            boards, family intention boards and prompt tiles. Premium, wipe-clean and built for
            repeated use, so the tools keep working whether or not you're here this week.
          </p>
          <p className="font-serif italic text-lg text-muted-foreground max-w-xl mx-auto mb-10">
            Practical tools for the week — not merchandise.
          </p>
          <div className="relative overflow-hidden max-w-2xl mx-auto aspect-[5/2] mb-10">
            <img
              src={threeWorkbooks}
              alt="Binders and stationery set on display"
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
          <Link
            to="/shop"
            className="inline-block bg-primary text-primary-foreground font-display tracking-widest text-sm px-10 py-4 hover:bg-primary/90 transition-colors"
          >
            SHOP NOW
          </Link>
        </motion.div>
      </div>
    </section>
  </>
);

const Membership = () => (
  <>
    <Navbar />
    <MembershipContent />
    <Footer />
  </>
);

export default Membership;
