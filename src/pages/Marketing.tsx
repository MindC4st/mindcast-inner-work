import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Download, Check, Facebook, Instagram, Linkedin, Mail, MessageCircle, Twitter } from "lucide-react";

/* ── Asset content (Mindcast 52-week membership, Taupō NZ) ────────────── */

const FACEBOOK_POST = `Something a bit different today.

I've spent the last year quietly building something called Mindcast — a facilitated 52-week journey for people who want more than another self-development app: real practice, real people, real change.

Here's the honest truth: most of us consume incredible content and forget 90% of it by Thursday. Mindcast changes that by turning inner work into a weekly rhythm you actually keep.

Every week you:
🎬 Gather for a live Sunday session — one theme, on the big screen, together
📝 Answer that week's reflection in your own private journal
💬 Go deeper midweek in your Life Group
🎯 Carry one small practice into your everyday life

It runs across three tracks — adults, teens and children — so the whole family can grow alongside each other.

Membership is open now here in Taupō. You move through all 52 weeks at your own pace, with a community walking it beside you.

No experience needed. No guru energy. Just honest humans doing the inner work, together.

Interested? Drop a comment or send me a message.

#Mindcast #InnerWork #Taupō #PersonalGrowth #NewZealand #CommunityFirst #MindcastNZ`;

const INSTAGRAM_CAPTION = `What if you actually remembered — and lived — the things you learn?

Mindcast is a facilitated 52-week journey that turns passive listening into real change. Each week: a live Sunday session, a private reflection, and a midweek Life Group.

Adults, teens and kids each have their own track, so the whole family grows together.

This isn't another app. It's a room full of people who show up for each other.

Link in bio to become a member 🤍

#Mindcast #MindcastNZ #InnerWork #Taupō #PersonalDevelopment #CommunityOverContent #NoticeNameRewire #NewZealand #WeeklyPractice #GroupGrowth #MindfulLiving #NZLife`;

const STORY_SCRIPT = `SLIDE 1:
You learn something powerful every week.
But how much do you actually live?

SLIDE 2:
Most of us forget 90% of it
by the end of the week.

SLIDE 3:
Mindcast changes that.
Gather. Reflect. Go deeper. Live it.
A 52-week journey with a real community.

SLIDE 4:
Live Sunday sessions in Taupō.
Adults, teens and kids each have a track.

SLIDE 5:
Want in?
DM me or tap the link in bio.
No pressure. Just honest humans
doing the work, together.`;

const LINKEDIN_POST = `I've been thinking a lot about why smart, motivated people still struggle to change.

It's not a knowledge problem — we have more access to brilliant ideas than ever. The content is extraordinary.

The problem is implementation. We learn alone, we forget fast, and we move on without ever sitting with what we heard.

That's why I built Mindcast.

It's a facilitated 52-week journey — part live gathering, part reflection practice, part accountability circle. Every week, a community meets for a live Sunday session on one theme, reflects privately in their own journal, and goes deeper together in a midweek Life Group. Adults, teens and children each have their own parallel track.

The methodology is simple: Notice what's happening inside you. Name it out loud. Rewire one thing at a time. Quietly radical.

Membership is open now here in Taupō, New Zealand — a full 52-week journey with a community walking it beside you.

No self-help clichés. No guru energy. Just a room full of people committed to doing the inner work — together.

If this sounds like something you've been looking for, I'd love to hear from you.

— Ashleigh Carlson, Founder of Mindcast

#Mindcast #InnerWork #PersonalGrowth #Taupō`;

const OUTREACH_DM = `Hey [NAME],

I wanted to reach out personally because I think you'd be a great fit for something I'm building.

It's called Mindcast — a facilitated 52-week journey where a community meets for a live Sunday session, reflects privately through the week, and goes deeper together in a midweek Life Group.

Membership is open now here in Taupō, with tracks for adults, teens and kids. No pressure at all — just thought of you and wanted to share.

Happy to tell you more if you're curious. Hope you're well!

Ashleigh`;

const EMAIL_TEMPLATE = `Subject: Something I'm building — thought you might be interested

Hi there,

I wanted to share something I've been quietly working on.

Mindcast is a facilitated 52-week journey for people who want more than passive self-development — built around a simple methodology: Notice. Name. Rewire.

Membership is open now in Taupō. Here's what each week looks like:

- A live Sunday session on one theme, together on the big screen
- A private reflection you keep in your own journal
- A midweek Life Group to go deeper
- One small practice to carry into your everyday life
- Parallel tracks for adults, teens and children
- Access to the Mindcast member portal

This isn't about fixing anyone. It's about creating a space where people can show up, reflect, and grow — at their own pace, with real support.

If this resonates, I'd love to have you join. Just reply to this email or visit mindcast.co.nz to learn more.

Warm regards,
Ashleigh Carlson
Founder, Mindcast`;

const TWITTER_THREAD = `1/ You learn brilliant ideas every week. You nod along. And then… nothing changes. Sound familiar?

2/ Mindcast fixes that. A facilitated 52-week journey: a live Sunday session, a private reflection, and a midweek Life Group. Simple. Structured. Powerful.

3/ It runs in Taupō, NZ, with parallel tracks for adults, teens and children — the whole family grows together.

4/ This is for anyone tired of consuming self-development content without actually developing. No guru energy. No fluff. Just honest humans doing the inner work.

5/ Want in? DM me or head to mindcast.co.nz. Let's do this together.`;

/* ── Asset definitions ───────────────────────────────────────────────── */

interface Asset {
  title: string;
  platform: string;
  description: string;
  filename: string;
  content: string;
  icon: React.ReactNode;
}

const assets: Asset[] = [
  {
    title: "Facebook Post",
    platform: "Facebook",
    description: "Conversational post for your personal feed or page. Copy, paste, post.",
    filename: "mindcast-facebook-post.txt",
    content: FACEBOOK_POST,
    icon: <Facebook className="w-4 h-4" />,
  },
  {
    title: "Instagram Caption",
    platform: "Instagram",
    description: "Punchy caption for a feed post. Pair with a Mindcast brand image.",
    filename: "mindcast-instagram-caption.txt",
    content: INSTAGRAM_CAPTION,
    icon: <Instagram className="w-4 h-4" />,
  },
  {
    title: "Instagram Story Script",
    platform: "Stories",
    description: "5-slide story script. Each slide is a single punchy message.",
    filename: "mindcast-story-script.txt",
    content: STORY_SCRIPT,
    icon: <Instagram className="w-4 h-4" />,
  },
  {
    title: "LinkedIn Post",
    platform: "LinkedIn",
    description: "First-person founder post. Professional but personal.",
    filename: "mindcast-linkedin-post.txt",
    content: LINKEDIN_POST,
    icon: <Linkedin className="w-4 h-4" />,
  },
  {
    title: "Personal Outreach Message",
    platform: "DM / Text",
    description: "Genuine 1-on-1 message for WhatsApp, Messenger, or text.",
    filename: "mindcast-outreach-dm.txt",
    content: OUTREACH_DM,
    icon: <MessageCircle className="w-4 h-4" />,
  },
  {
    title: "Email Template",
    platform: "Email",
    description: "Full email with subject line, body, and PS. Ready to send.",
    filename: "mindcast-membership-email.txt",
    content: EMAIL_TEMPLATE,
    icon: <Mail className="w-4 h-4" />,
  },
  {
    title: "Twitter / X Thread",
    platform: "Twitter / X",
    description: "5-tweet thread, each under 280 characters.",
    filename: "mindcast-twitter-thread.txt",
    content: TWITTER_THREAD,
    icon: <Twitter className="w-4 h-4" />,
  },
];

/* ── Download helper ─────────────────────────────────────────────────── */

function downloadFile(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/* ── Card component ──────────────────────────────────────────────────── */

const AssetCard = ({ asset }: { asset: Asset }) => {
  const [downloaded, setDownloaded] = useState(false);

  const handleDownload = () => {
    downloadFile(asset.filename, asset.content);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2000);
  };

  const preview = asset.content.split("\n").slice(0, 5).join("\n");

  return (
    <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-body font-bold text-foreground text-base">{asset.title}</h3>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] tracking-[0.15em] font-semibold uppercase font-body">
          {asset.icon}
          {asset.platform}
        </span>
      </div>

      {/* Description */}
      <p className="text-muted-foreground text-sm font-body mb-4 leading-relaxed">{asset.description}</p>

      {/* Preview */}
      <div className="bg-muted/50 rounded-lg p-4 mb-5 flex-1 overflow-hidden">
        <pre className="text-xs text-foreground/70 font-body whitespace-pre-wrap leading-relaxed line-clamp-5">
          {preview}
        </pre>
      </div>

      {/* Download button */}
      <button
        onClick={handleDownload}
        className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg text-xs tracking-[0.15em] uppercase font-body font-semibold transition-all duration-200 ${
          downloaded
            ? "bg-green-600 text-white"
            : "bg-primary text-primary-foreground hover:opacity-90"
        }`}
      >
        {downloaded ? (
          <>
            <Check className="w-4 h-4" />
            Downloaded
          </>
        ) : (
          <>
            <Download className="w-4 h-4" />
            Download {asset.filename.split(".").pop()?.toUpperCase()}
          </>
        )}
      </button>
    </div>
  );
};

/* ── Page ─────────────────────────────────────────────────────────────── */

const Marketing = () => (
  <>
    <Navbar />

    {/* Hero */}
    <section className="section-navy pt-32 pb-20 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <span className="inline-block text-[10px] tracking-[0.3em] uppercase text-cream/40 font-body mb-4">
          Membership Growth Kit
        </span>
        <h1 className="font-display text-4xl md:text-5xl text-cream tracking-tight mb-4">
          Grow Your Mindcast Community
        </h1>
        <p className="font-body text-cream/60 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
          Download and share these ready-to-go assets across Facebook, Instagram, LinkedIn and email.
          Everything is written and designed — just post it.
        </p>
      </div>
    </section>

    {/* Assets grid */}
    <section className="bg-background py-16 px-6">
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        {assets.map((asset) => (
          <AssetCard key={asset.filename} asset={asset} />
        ))}
      </div>
    </section>

    <Footer />
  </>
);

export default Marketing;
