import { useState, type FormEvent } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import Ripple from "@/components/brand/Ripple";
import { supabase } from "@/integrations/supabase/client";

type State = "idle" | "busy" | "success" | "error";

const Waitlist = () => {
  const reduceMotion = useReducedMotion();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [state, setState] = useState<State>("idle");
  const [error, setError] = useState("");

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanName || !cleanEmail) {
      setError("Please enter your name and email.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    setState("busy");
    const { error: insertError } = await supabase
      .from("waitlist")
      .insert({ name: cleanName, email: cleanEmail, source: "founding" });

    if (insertError) {
      // A duplicate email (unique index on lower(email)) means they are already
      // on the list — treat it as success so the form stays idempotent.
      if (insertError.code === "23505") {
        setState("success");
        return;
      }
      console.error("waitlist insert failed:", insertError);
      setState("error");
      setError("Something went wrong. Please try again in a moment.");
      return;
    }

    setState("success");
  };

  if (state === "success") {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <main>
          <section className="linen-panel flex min-h-[calc(100svh-64px)] items-center pt-16">
            <div className="mx-auto max-w-2xl px-5 py-20 text-center sm:px-6">
              <motion.div
                initial={reduceMotion ? false : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: reduceMotion ? 0 : 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                <CheckCircle2 size={40} strokeWidth={1.5} className="mx-auto text-primary" />
                <h1 className="mt-6 font-display text-[clamp(2.8rem,7vw,5rem)] leading-[0.92] tracking-tight text-primary">
                  YOU'RE ON THE LIST.
                </h1>
                <p className="mt-5 font-serif text-lg italic leading-7 text-foreground/75">
                  When membership opens, we'll invite you first.
                </p>
                <p className="mt-4 font-body text-sm leading-6 text-muted-foreground">
                  Founding members receive a complimentary NFC smart-bracelet. Keep an eye on{" "}
                  <span className="font-semibold text-foreground">{email.trim().toLowerCase()}</span>.
                </p>
              </motion.div>
            </div>
          </section>
        </main>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        <section className="linen-panel overflow-hidden border-x-0 border-t-0 pt-16">
          <div className="mx-auto grid min-h-[calc(100svh-64px)] max-w-7xl items-center gap-10 px-5 py-12 sm:px-6 sm:py-16 lg:grid-cols-[1.02fr_0.98fr] lg:gap-16 lg:px-8 lg:py-20">
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.65, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="flex items-center gap-3">
                <Ripple size={24} />
                <p className="font-body text-[10px] font-bold uppercase tracking-[0.3em] text-primary">
                  The founding waitlist
                </p>
              </div>

              <h1 className="mt-7 font-display text-[clamp(3.4rem,7.6vw,7.2rem)] leading-[0.84] tracking-[-0.02em] text-primary">
                BE FIRST
                <br />
                IN THE ROOM.
              </h1>

              <p
                className="mt-7 max-w-xl text-xl italic leading-8 text-foreground/75 sm:text-2xl"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                No account. No card. Just a name and an email — and a place near the front when
                the doors open.
              </p>

              <p className="mt-5 max-w-xl font-body text-sm leading-7 text-muted-foreground sm:text-base">
                Membership is opening soon. The first 100 founding members receive a complimentary
                NFC smart-bracelet — your physical key for tap-and-go room entry and instant
                session access.
              </p>
            </motion.div>

            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.65, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            >
              <form onSubmit={submit} className="paper-card rounded-2xl p-6 sm:p-8">
                <p className="font-body text-[9px] font-bold uppercase tracking-[0.26em] text-[hsl(var(--silver))]">
                  Join the waitlist
                </p>
                <h2 className="mt-2 font-display text-3xl tracking-wide text-primary">
                  ONE STEP. THAT'S ALL.
                </h2>

                <label className="mt-7 block">
                  <span className="font-body text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                    Name
                  </span>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoComplete="name"
                    placeholder="Your name"
                    className="mt-2 w-full border-b border-border bg-transparent py-3 font-body text-base text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary"
                  />
                </label>

                <label className="mt-5 block">
                  <span className="font-body text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                    Email
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    placeholder="you@example.com"
                    className="mt-2 w-full border-b border-border bg-transparent py-3 font-body text-base text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary"
                  />
                </label>

                {error ? (
                  <p role="alert" className="mt-4 font-body text-xs leading-5 text-destructive">
                    {error}
                  </p>
                ) : null}

                <button
                  type="submit"
                  disabled={state === "busy"}
                  className="mt-7 inline-flex min-h-[52px] w-full items-center justify-center gap-2 bg-primary px-7 py-4 font-body text-[10px] font-bold uppercase tracking-[0.17em] text-primary-foreground shadow-[0_12px_28px_rgba(53,133,175,0.2)] transition-[transform,background-color] hover:-translate-y-0.5 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 disabled:cursor-wait disabled:opacity-60"
                >
                  {state === "busy" ? (
                    <>
                      <Loader2 size={14} className="animate-spin" /> Joining…
                    </>
                  ) : (
                    <>
                      JOIN THE WAITLIST <ArrowRight size={15} aria-hidden="true" />
                    </>
                  )}
                </button>

                <p className="mt-4 text-center font-body text-xs leading-5 text-muted-foreground">
                  No account. No payment. We'll email you when membership opens.
                </p>
              </form>
            </motion.div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
};

export default Waitlist;
