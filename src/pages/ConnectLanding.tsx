import { Link } from "react-router-dom";
import { ArrowLeft, Eye, MessageSquare, CheckCircle, Shield } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const FRAMEWORK = [
  {
    icon: Eye,
    title: "Notice",
    desc: "Privately reflect on what happened and how it landed. No pressure, no audience.",
  },
  {
    icon: MessageSquare,
    title: "Name",
    desc: "Clarify the feeling, need, request, and boundary — AI helps organise your thoughts without judgement.",
  },
  {
    icon: CheckCircle,
    title: "Rewire",
    desc: "Work together on one concrete behaviour change or repair action. End every session with a next step.",
  },
];

const PROCESS = [
  { step: "01", title: "Write privately", desc: "Reflect on what happened and what you felt in your own private space." },
  { step: "02", title: "AI helps organise", desc: "Your assistant structures your thoughts into clear categories — no judgement." },
  { step: "03", title: "Approve what is shared", desc: "Toggle what your partner sees. Nothing is shared until you approve it." },
  { step: "04", title: "Enter shared conversation", desc: "Approved reflections appear in a guided shared space for both partners." },
  { step: "05", title: "Commit to one next step", desc: "End every session with one clear, practical action you both agree on." },
];

const ConnectLanding = () => (
  <div className="min-h-screen bg-background">
    <Navbar />

    {/* Hero */}
    <section className="section-navy pt-32 pb-20 px-6">
      <div className="container max-w-4xl mx-auto text-center">
        <Link to="/" className="inline-flex items-center gap-2 text-cream/30 text-[10px] tracking-[0.12em] font-body hover:text-cream/60 transition-colors mb-12">
          <ArrowLeft size={12} /> BACK TO MINDCAST
        </Link>

        <p className="text-cream/40 text-[11px] tracking-[0.2em] font-body mb-6">MINDCAST RELATIONSHIPS</p>
        <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-cream mb-6" style={{ lineHeight: 1.2 }}>
          Private thoughts.<br />Structured repair.
        </h1>
        <p className="text-cream/50 font-body text-base leading-relaxed max-w-2xl mx-auto mb-8">
          A consent-first relationship platform that helps you reflect privately, share intentionally, and work toward better conversations. Not therapy. Not group chat. A structured relationship practice.
        </p>
        <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-cream/10 text-cream/40 text-xs font-body tracking-wider">
          COMING SOON
        </div>
      </div>
    </section>

    {/* Framework */}
    <section className="section-navy py-20 px-6" style={{ borderTop: "1px solid rgba(53,133,175,0.1)" }}>
      <div className="container max-w-5xl mx-auto">
        <p className="text-cream/40 text-[11px] tracking-[0.2em] font-body text-center mb-3">THE FRAMEWORK</p>
        <h2 className="font-display text-2xl md:text-3xl font-bold text-cream text-center mb-14">
          Notice. Name. Rewire.
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {FRAMEWORK.map((f) => (
            <div key={f.title} className="p-6 rounded-xl border border-cream/[0.06] bg-cream/[0.02]">
              <f.icon size={24} className="text-[#9B89B4] mb-4" />
              <h3 className="font-display text-lg font-bold text-cream mb-2">{f.title}</h3>
              <p className="text-cream/40 font-body text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* How It Works */}
    <section className="section-navy py-20 px-6" style={{ borderTop: "1px solid rgba(53,133,175,0.1)" }}>
      <div className="container max-w-4xl mx-auto">
        <p className="text-cream/40 text-[11px] tracking-[0.2em] font-body text-center mb-3">PROCESS</p>
        <h2 className="font-display text-2xl md:text-3xl font-bold text-cream text-center mb-14">
          How it works
        </h2>

        <div className="space-y-0">
          {PROCESS.map((p) => (
            <div key={p.step} className="flex gap-6 lg:gap-10 py-8 border-b border-cream/[0.06] last:border-0">
              <span className="font-body font-light text-4xl lg:text-5xl text-[#9B89B4]/30 flex-shrink-0 w-16">{p.step}</span>
              <div>
                <h3 className="font-display text-lg font-bold text-cream mb-2">{p.title}</h3>
                <p className="text-cream/40 font-body text-sm leading-relaxed">{p.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Safety */}
    <section className="section-navy py-20 px-6" style={{ borderTop: "1px solid rgba(53,133,175,0.1)" }}>
      <div className="container max-w-3xl mx-auto">
        <div className="p-8 rounded-xl border border-cream/[0.06] bg-cream/[0.02] flex items-start gap-6">
          <Shield className="text-red-400 flex-shrink-0 mt-1" size={24} />
          <div>
            <h3 className="font-display text-lg font-bold text-cream mb-3">Your safety matters</h3>
            <p className="text-cream/40 font-body text-sm leading-relaxed">
              If you feel unsafe, do not use shared features. This platform does not replace emergency or professional support. If you or someone you know is in danger, please contact your local crisis service.
            </p>
          </div>
        </div>
      </div>
    </section>

    <Footer />
  </div>
);

export default ConnectLanding;
