import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Check, MapPin, Calendar, Clock, Users, Zap, Headphones, BookOpen, BarChart3, Share2, Lock } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const whatYouGet = [
  { icon: Headphones, text: "Access to the Mindcast member portal for 10 weeks" },
  { icon: Headphones, text: "All 10 podcast episodes curated and ad-free in your portal" },
  { icon: BookOpen, text: "Reflection questions at key moments to guide your thinking" },
  { icon: Lock, text: "A personal record of all your reflections and commitments" },
  { icon: BarChart3, text: "Implementation tracking — see your progress across the full term" },
  { icon: Share2, text: "Shared group insights (you control what's private and what's shared)" },
];

const faqs = [
  { q: "What happens each week?", a: "We gather on Tuesday evening, watch or listen to a curated podcast episode together, then work through a guided discussion using the companion workbook. It's structured but relaxed — no pressure to share more than you're comfortable with." },
  { q: "Do I need any experience?", a: "None at all. The pilot is designed for anyone curious about doing inner work in community. No therapy background, no meditation practice, no prerequisites." },
  { q: "What if I miss a week?", a: "Life happens. You'll have access to the recording and workbook so you can catch up. We just ask that you commit to attending most sessions." },
  { q: "Is this therapy?", a: "No. MINDCAST is a structured life practice. We complement therapy but don't replace it. If you're in crisis, please reach out to a professional." },
  { q: "Can I get a refund?", a: "Full refunds are available up to 7 days before the first session (14 April 2026). After that, partial refunds may be considered on a case-by-case basis." },
  { q: "What happens after the 10 weeks?", a: "Pilot members will have first access to the full MINDCAST membership when it launches. Your founding member pricing will be locked in." },
];

const Pilot = () => {
  const [searchParams] = useSearchParams();
  const [spotsRemaining, setSpotsRemaining] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    canAttend: false,
    agreeTerms: false,
  });
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchSpots();
    if (searchParams.get("success") === "true") {
      setPaymentSuccess(true);
      // Verify payment by checking the session
      const sessionId = searchParams.get("session_id");
      if (sessionId) {
        supabase.functions.invoke("verify-pilot-payment", {
          body: { sessionId },
        }).then(() => fetchSpots());
      }
    }
  }, [searchParams]);

  const fetchSpots = async () => {
    const { count } = await supabase
      .from("pilot_registrations")
      .select("*", { count: "exact", head: true })
      .eq("payment_status", "paid");
    setSpotsRemaining(15 - (count || 0));
  };

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.canAttend) {
      toast.error("Please confirm you can attend Tuesday evenings in Taupō");
      return;
    }
    if (!formData.agreeTerms) {
      toast.error("Please agree to the Terms & Conditions and Privacy Policy");
      return;
    }
    if (spotsRemaining !== null && spotsRemaining <= 0) {
      toast.error("All spots have been filled. Please join the waitlist.");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-pilot-checkout", {
        body: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          canAttendTuesdays: formData.canAttend,
        },
      });

      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (err: any) {
      toast.error(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const spotsText = spotsRemaining === null
    ? "Loading..."
    : spotsRemaining > 0
      ? `${spotsRemaining} remaining`
      : "WAITLIST ONLY";

  const isSoldOut = spotsRemaining !== null && spotsRemaining <= 0;

  if (paymentSuccess) {
    return (
      <>
        <Navbar />
        <section className="section-navy min-h-[80vh] flex items-center pt-16">
          <div className="container mx-auto px-6 text-center py-24">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }}>
              <div className="w-20 h-20 border-2 border-cream/30 flex items-center justify-center mx-auto mb-8">
                <Check className="w-10 h-10 text-cream" />
              </div>
              <h1 className="heading-display text-5xl sm:text-6xl md:text-7xl mb-6">YOU'RE IN.</h1>
              <p className="text-cream/60 font-body text-base max-w-lg mx-auto mb-4">
                Welcome to the founding pilot. You'll receive a confirmation email shortly with everything you need to know before Session 1.
              </p>
              <p className="text-cream/40 font-body text-sm mb-12">
                First session: Tuesday 21 April 2026, 5:30pm — 111 Jarden Mile, Taupō
              </p>
              <Link to="/portal/login" className="inline-block text-xs font-display font-extrabold tracking-[0.2em] bg-cream py-3 px-10 hover:bg-cream/90 transition-colors" style={{ color: "hsl(210,56%,14%)" }}>
                GO TO YOUR PORTAL
              </Link>
            </motion.div>
          </div>
        </section>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />

      {/* ── HERO ── */}
      <section className="section-navy min-h-[80vh] flex items-center pt-16">
        <div className="container mx-auto px-6 text-center py-24 max-w-4xl">
          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-cream/40 text-xs tracking-[0.3em] mb-6 block">
            FOUNDING PILOT — TAUPŌ, NZ
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="heading-display text-5xl sm:text-6xl md:text-8xl leading-[0.9] mb-6"
          >
            THE FOUNDING PILOT
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-cream/70 font-display text-xl md:text-2xl tracking-wider mb-6"
          >
            10 weeks. 15 people. One conversation that changes everything.
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55 }}
            className="text-cream/45 font-body text-sm md:text-base leading-relaxed max-w-2xl mx-auto mb-10"
          >
            Mindcast is launching its first live cohort in Taupō, New Zealand. Every Tuesday evening for 10 weeks, a small group of 15 will gather to listen deeply, reflect honestly, and commit to one meaningful change each week. This is not a course. It is a practice.
          </motion.p>

          {/* Spots Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="inline-flex items-center gap-2 border border-cream/20 px-5 py-2.5 mb-10"
          >
            <Zap size={14} className="text-cream/60" />
            <span className="text-xs tracking-[0.2em] text-cream/70 font-display font-bold">
              15 SPOTS ONLY — {spotsText.toUpperCase()}
            </span>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.85 }} className="block">
            <button
              onClick={scrollToForm}
              className="inline-block text-xs font-display font-extrabold tracking-[0.2em] bg-cream py-4 px-12 hover:bg-cream/90 transition-colors"
              style={{ color: "hsl(210,56%,14%)" }}
            >
              {isSoldOut ? "JOIN THE WAITLIST" : "RESERVE YOUR SPOT — $150"}
            </button>
          </motion.div>
        </div>
      </section>

      {/* ── WHAT IS MINDCAST PILOT ── */}
      <section className="section-white py-24">
        <div className="container mx-auto px-6 max-w-3xl">
          <h2 className="heading-display text-4xl md:text-6xl text-primary text-center mb-6">WHAT IS THE PILOT?</h2>
          <p className="text-muted-foreground font-body text-sm md:text-base leading-relaxed text-center max-w-2xl mx-auto mb-16">
            Each week you will listen to a hand-picked podcast episode. At our Tuesday evening session you will discuss it with the group, work through reflection questions drawn from key moments in the episode, and commit to implementing one idea into your life before the following week. We open every session by sharing how that implementation went.
          </p>

          {/* Session Details */}
          <div className="border-[3px] border-primary p-8 md:p-12 mb-16">
            <h3 className="font-display text-xl tracking-widest text-primary mb-8 text-center">SESSION DETAILS</h3>
            <div className="grid sm:grid-cols-2 gap-6">
              {[
                { icon: Calendar, label: "10 Tuesdays starting 21 April 2026" },
                { icon: Clock, label: "5:30pm – 7:30pm" },
                { icon: MapPin, label: "111 Jarden Mile, Taupō" },
                { icon: Users, label: "15 founding members only" },
              ].map((d, i) => (
                <div key={i} className="flex items-center gap-4">
                  <d.icon className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="font-body text-sm text-foreground">{d.label}</span>
                </div>
              ))}
              <div className="flex items-center gap-4 sm:col-span-2">
                <span className="text-lg flex-shrink-0">💰</span>
                <span className="font-body text-sm text-foreground">$150 for the full 10-week term (one payment)</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FIRST EPISODE ── */}
      <section className="section-navy py-24">
        <div className="container mx-auto px-6 max-w-3xl">
          <span className="block text-cream/40 text-xs tracking-[0.3em] mb-4 text-center">SESSION 1 — YOUR FIRST EPISODE</span>
          <h2 className="heading-display text-4xl md:text-5xl text-center mb-12">THE CONVERSATION THAT STARTS EVERYTHING</h2>

          <div className="border-2 border-cream/15 p-8 md:p-10">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              {/* Podcast card thumbnail */}
              <div className="w-full md:w-48 h-48 md:h-48 bg-cream/5 border border-cream/10 flex items-center justify-center flex-shrink-0">
                <div className="text-center px-4">
                  <span className="text-cream/30 text-[10px] tracking-widest block mb-2">DIARY OF A CEO</span>
                  <span className="text-cream/20 text-[9px] tracking-wider block">WITH STEVEN BARTLETT</span>
                </div>
              </div>

              <div>
                <p className="text-cream/40 text-xs tracking-[0.2em] mb-2">EPISODE</p>
                <h3 className="font-display text-xl md:text-2xl tracking-wider text-cream mb-2 leading-tight">
                  "EVERYTHING YOU THINK YOU KNOW ABOUT MEANING AND HAPPINESS IS WRONG"
                </h3>
                <p className="text-cream/50 text-sm font-body mb-1">
                  <span className="text-cream/70">Guest:</span> Johann Hari
                </p>
                <p className="text-cream/50 text-sm font-body mb-4">
                  <span className="text-cream/70">Show:</span> Diary of a CEO with Steven Bartlett
                </p>
                <p className="text-cream/40 text-sm font-body leading-relaxed">
                  Johann Hari challenges the roots of depression, anxiety, and why modern life has engineered a disconnection crisis. This is the conversation that starts everything.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── WHAT YOU GET ── */}
      <section className="section-white py-24">
        <div className="container mx-auto px-6 max-w-3xl">
          <h2 className="heading-display text-4xl md:text-6xl text-primary text-center mb-4">WHAT YOU GET</h2>
          <p className="text-center text-muted-foreground text-sm mb-16 max-w-xl mx-auto font-body">
            Everything you need for 10 weeks of guided inner work practice.
          </p>
          <div className="space-y-5">
            {whatYouGet.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="flex items-start gap-5 border-b border-primary/10 pb-5"
              >
                <item.icon className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-sm text-foreground font-body">{item.text}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── REGISTRATION / CHECKOUT ── */}
      <section className="section-navy py-24" ref={formRef} id="reserve">
        <div className="container mx-auto px-6 max-w-xl">
          <h2 className="heading-display text-4xl md:text-5xl text-center mb-4">SECURE YOUR PLACE</h2>
          <p className="text-cream/40 text-sm font-body text-center mb-12">
            {isSoldOut
              ? "All 15 spots have been filled. Join the waitlist to be first in line for Term 2."
              : `Only ${spotsRemaining ?? "..."} of 15 spots remaining.`}
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-cream/40 text-[10px] tracking-[0.2em] mb-2">FIRST NAME *</label>
                <input
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full bg-transparent border-2 border-cream/15 text-cream px-4 py-3 text-sm font-body placeholder:text-cream/20 focus:outline-none focus:border-cream/40 transition-colors"
                  placeholder="First name"
                />
              </div>
              <div>
                <label className="block text-cream/40 text-[10px] tracking-[0.2em] mb-2">LAST NAME *</label>
                <input
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full bg-transparent border-2 border-cream/15 text-cream px-4 py-3 text-sm font-body placeholder:text-cream/20 focus:outline-none focus:border-cream/40 transition-colors"
                  placeholder="Last name"
                />
              </div>
            </div>

            <div>
              <label className="block text-cream/40 text-[10px] tracking-[0.2em] mb-2">EMAIL ADDRESS *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-transparent border-2 border-cream/15 text-cream px-4 py-3 text-sm font-body placeholder:text-cream/20 focus:outline-none focus:border-cream/40 transition-colors"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="block text-cream/40 text-[10px] tracking-[0.2em] mb-2">PHONE NUMBER (OPTIONAL)</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-transparent border-2 border-cream/15 text-cream px-4 py-3 text-sm font-body placeholder:text-cream/20 focus:outline-none focus:border-cream/40 transition-colors"
                placeholder="+64..."
              />
            </div>

            <div className="space-y-4 pt-4">
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={formData.canAttend}
                  onChange={(e) => setFormData({ ...formData, canAttend: e.target.checked })}
                  className="mt-0.5 w-4 h-4 accent-cream"
                />
                <span className="text-cream/50 text-sm font-body group-hover:text-cream/70 transition-colors">
                  I confirm I can attend Tuesday evenings in Taupō from 21 April 2026
                </span>
              </label>

              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={formData.agreeTerms}
                  onChange={(e) => setFormData({ ...formData, agreeTerms: e.target.checked })}
                  className="mt-0.5 w-4 h-4 accent-cream"
                />
                <span className="text-cream/50 text-sm font-body group-hover:text-cream/70 transition-colors">
                  I agree to the{" "}
                  <Link to="/terms" className="underline text-cream/60 hover:text-cream">Terms & Conditions</Link>
                  {" "}and{" "}
                  <Link to="/privacy" className="underline text-cream/60 hover:text-cream">Privacy Policy</Link>
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading || isSoldOut}
              className="w-full text-xs font-display font-extrabold tracking-[0.2em] bg-cream py-4 px-12 hover:bg-cream/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed mt-6"
              style={{ color: "hsl(210,56%,14%)" }}
            >
              {loading ? "PROCESSING..." : isSoldOut ? "JOIN WAITLIST" : "PAY $150 & JOIN THE PILOT"}
            </button>

            <p className="text-cream/25 text-xs font-body text-center pt-2">
              Secure payment via Stripe. One-time payment for the full 10-week term.{" "}
              <Link to="/refund" className="underline hover:text-cream/40">Refund policy</Link> applies.
            </p>
          </form>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="section-white py-24">
        <div className="container mx-auto px-6 max-w-3xl">
          <h2 className="heading-display text-4xl md:text-6xl text-primary text-center mb-16">FREQUENTLY ASKED</h2>
          <Accordion type="single" collapsible>
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="border-primary/10">
                <AccordionTrigger className="text-primary/80 text-sm tracking-wider hover:no-underline">{faq.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm font-body leading-relaxed">{faq.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="section-navy py-24">
        <div className="container mx-auto px-6 max-w-xl text-center">
          <h2 className="heading-display text-4xl md:text-5xl mb-6">THIS IS WHERE IT STARTS.</h2>
          <p className="text-cream/50 text-sm font-body mb-10 max-w-md mx-auto">
            15 people. 10 weeks. One practice. Be part of the founding group that shapes what MINDCAST becomes.
          </p>
          <button
            onClick={scrollToForm}
            className="inline-block text-xs font-display font-extrabold tracking-[0.2em] bg-cream py-4 px-12 hover:bg-cream/90 transition-colors"
            style={{ color: "hsl(210,56%,14%)" }}
          >
            {isSoldOut ? "JOIN THE WAITLIST" : "RESERVE YOUR SPOT — $150"}
          </button>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default Pilot;
