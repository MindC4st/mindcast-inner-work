import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const APP_DATA: Record<string, {
  name: string;
  tagline: string;
  description: string;
  color: string;
  features: { title: string; desc: string }[];
  link?: string;
}> = {
  "little-minds": {
    name: "Little Minds Big Questions",
    tagline: "Gentle answers to children's biggest questions.",
    description: "AI-powered bedtime stories for parents navigating the hard questions — death, fairness, love, and more.",
    color: "#6B9FD4",
    features: [
      { title: "Ask any question", desc: "Type or record your child's question in their own voice" },
      { title: "AI-powered metaphor stories", desc: "Every story is unique, age-appropriate, and answered with warmth" },
      { title: "Read it together", desc: "Stories are read aloud with your choice of bedtime or daytime voice" },
    ],
    link: "https://littlemindsbigquestions.com",
  },
  signal: {
    name: "Signal",
    tagline: "A wellness companion for your cycle.",
    description: "Track your cycle, understand your body, and align your energy with your natural rhythms.",
    color: "#C4526E",
    features: [
      { title: "Understand your cycle", desc: "Phase-based insights that actually make sense of your energy and mood" },
      { title: "Move with your body", desc: "Workouts and nutrition guided by where you are in your cycle" },
      { title: "Daily rituals, not rules", desc: "Habits built around you, not against you" },
    ],
  },
  connect: {
    name: "Mindcast Connect",
    tagline: "A private space for couples to grow closer.",
    description: "AI-guided conversations for two people working through the real challenges of being together.",
    color: "#9B89B4",
    features: [
      { title: "Private and safe", desc: "Your conversations never leave your private space" },
      { title: "AI that reframes, not judges", desc: "Difficult feelings are reworded with kindness before being shared" },
      { title: "Evidence-based tools", desc: "Activities drawn from Gottman, Sue Johnson, and attachment theory" },
    ],
  },
};

const SubAppLanding = () => {
  const { appSlug } = useParams<{ appSlug: string }>();
  const app = APP_DATA[appSlug || ""];

  if (!app) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0D0B14" }}>
        <p className="text-white/40 font-body">App not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "#0D0B14", color: "#fff" }}>
      {/* Hero */}
      <section className="px-6 md:px-12 pt-16 pb-20 max-w-2xl mx-auto text-center">
        <Link to="/" className="inline-flex items-center gap-2 text-white/20 text-[10px] tracking-[0.12em] font-body hover:text-white/40 transition-colors mb-12">
          <ArrowLeft size={12} /> BACK TO MINDCAST
        </Link>
        <h1 className="font-display text-3xl md:text-4xl font-bold mb-3" style={{ color: app.color }}>
          {app.name}
        </h1>
        <p className="text-white/60 text-lg font-body mb-3">{app.tagline}</p>
        <p className="text-white/30 text-sm font-body max-w-md mx-auto">{app.description}</p>
      </section>

      {/* Features */}
      <section className="px-6 md:px-12 py-16 border-t border-white/[0.06]">
        <div className="max-w-2xl mx-auto space-y-10">
          {app.features.map((f, i) => (
            <div key={i} className="flex gap-5 items-start">
              <span
                className="w-8 h-8 flex items-center justify-center text-xs font-display font-bold shrink-0 mt-0.5"
                style={{ color: app.color, border: `1px solid ${app.color}30` }}
              >
                {i + 1}
              </span>
              <div>
                <h3 className="font-display text-sm font-bold text-white mb-1">{f.title}</h3>
                <p className="text-white/35 text-sm font-body">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTAs */}
      <section className="px-6 md:px-12 py-16 border-t border-white/[0.06] text-center">
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href={app.link || "#"}
            className="px-8 py-3.5 text-xs tracking-[0.15em] font-display font-bold transition-colors"
            style={{ background: app.color, color: "#0D0B14" }}
          >
            DOWNLOAD ON iOS
          </a>
          <a
            href="#"
            className="px-8 py-3.5 border text-xs tracking-[0.15em] font-body transition-colors"
            style={{ borderColor: `${app.color}30`, color: `${app.color}` }}
          >
            DOWNLOAD ON ANDROID
          </a>
        </div>
      </section>
    </div>
  );
};

export default SubAppLanding;
