import { useState } from "react";
import {
  Download, Check, Copy, Facebook, Instagram, Linkedin, Mail, MessageCircle,
  Twitter, CalendarDays, Clapperboard,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { toast } from "sonner";
import ThreeTracksCampaign from "@/components/marketing/ThreeTracksCampaign";
import posterSundayIsFree from "@/assets/marketing/social-sunday-is-free.png";
import posterKidsNextRoom from "@/assets/marketing/social-kids-next-room.png";
import posterNoPhones from "@/assets/marketing/social-no-phones.png";
import posterComeBack from "@/assets/marketing/social-come-back.png";
import posterThoughtful from "@/assets/marketing/social-thoughtful-conversations.png";
import posterOneCommunity from "@/assets/marketing/social-one-community.png";

/* â”€â”€ Asset content (Mindcast 52-week membership, TaupÅ NZ) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

const FACEBOOK_POST = `Something a bit different today.

I've spent the last year quietly building something called Mindcast â€” a facilitated 52-week journey for people who want more than another self-development app: real practice, real people, real change.

Here's the honest truth: most of us consume incredible content and forget 90% of it by Thursday. Mindcast changes that by turning inner work into a weekly rhythm you actually keep.

Every week you:
ðŸŽ¬ Gather for a live Sunday session â€” one theme, on the big screen, together
ðŸ“ Answer that week's reflection in your own private journal
ðŸ’¬ Go deeper midweek in your Life Group
ðŸŽ¯ Carry one small practice into your everyday life

It runs across three tracks â€” adults, teens and children â€” so the whole family can grow alongside each other.

Membership is open now here in TaupÅ. You move through all 52 weeks at your own pace, with a community walking it beside you.

No experience needed. No guru energy. Just honest humans doing the inner work, together.

Interested? Drop a comment or send me a message.

#Mindcast #InnerWork #TaupÅ #PersonalGrowth #NewZealand #CommunityFirst #MindcastNZ`;

const INSTAGRAM_CAPTION = `What if you actually remembered â€” and lived â€” the things you learn?

Mindcast is a facilitated 52-week journey that turns passive listening into real change. Each week: a live Sunday session, a private reflection, and a midweek Life Group.

Adults, teens and kids each have their own track, so the whole family grows together.

This isn't another app. It's a room full of people who show up for each other.

Link in bio to become a member ðŸ¤

#Mindcast #MindcastNZ #InnerWork #TaupÅ #PersonalDevelopment #CommunityOverContent #NoticeItNameItDoIt #NewZealand #WeeklyPractice #GroupGrowth #MindfulLiving #NZLife`;

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
Live Sunday sessions in TaupÅ.
Adults, teens and kids each have a track.

SLIDE 5:
Want in?
DM me or tap the link in bio.
No pressure. Just honest humans
doing the work, together.`;

const LINKEDIN_POST = `I've been thinking a lot about why smart, motivated people still struggle to change.

It's not a knowledge problem â€” we have more access to brilliant ideas than ever. The content is extraordinary.

The problem is implementation. We learn alone, we forget fast, and we move on without ever sitting with what we heard.

That's why I built Mindcast.

It's a facilitated 52-week journey â€” part live gathering, part reflection practice, part accountability circle. Every week, a community meets for a live Sunday session on one theme, reflects privately in their own journal, and goes deeper together in a midweek Life Group. Adults, teens and children each have their own parallel track.

The methodology is simple: Notice what's happening inside you. Name it out loud. Then do one thing about it. Quietly radical.

Membership is open now here in TaupÅ, New Zealand â€” a full 52-week journey with a community walking it beside you.

No self-help clichÃ©s. No guru energy. Just a room full of people committed to doing the inner work â€” together.

If this sounds like something you've been looking for, I'd love to hear from you.

â€” Ashleigh Carlson, Founder of Mindcast

#Mindcast #InnerWork #PersonalGrowth #TaupÅ`;

const OUTREACH_DM = `Hey [NAME],

I wanted to reach out personally because I think you'd be a great fit for something I'm building.

It's called Mindcast â€” a facilitated 52-week journey where a community meets for a live Sunday session, reflects privately through the week, and goes deeper together in a midweek Life Group.

Membership is open now here in TaupÅ, with tracks for adults, teens and kids. No pressure at all â€” just thought of you and wanted to share.

Happy to tell you more if you're curious. Hope you're well!

Ashleigh`;

const EMAIL_TEMPLATE = `Subject: Something I'm building â€” thought you might be interested

Hi there,

I wanted to share something I've been quietly working on.

Mindcast is a facilitated 52-week journey for people who want more than passive self-development â€” built around a simple methodology: Notice It. Name It. Do It.

Membership is open now in TaupÅ. Here's what each week looks like:

- A live Sunday session on one theme, together on the big screen
- A private reflection you keep in your own journal
- A midweek Life Group to go deeper
- One small practice to carry into your everyday life
- Parallel tracks for adults, teens and children
- Access to the Mindcast member portal

This isn't about fixing anyone. It's about creating a space where people can show up, reflect, and grow â€” at their own pace, with real support.

If this resonates, I'd love to have you join. Just reply to this email or visit mindcast.co.nz to learn more.

Warm regards,
Ashleigh Carlson
Founder, Mindcast`;

const TWITTER_THREAD = `1/ You learn brilliant ideas every week. You nod along. And thenâ€¦ nothing changes. Sound familiar?

2/ Mindcast fixes that. A facilitated 52-week journey: a live Sunday session, a private reflection, and a midweek Life Group. Simple. Structured. Powerful.

3/ It runs in TaupÅ, NZ, with parallel tracks for adults, teens and children â€” the whole family grows together.

4/ This is for anyone tired of consuming self-development content without actually developing. No guru energy. No fluff. Just honest humans doing the inner work.

5/ Want in? DM me or head to mindcast.co.nz. Let's do this together.`;

/* â”€â”€ Copy kit definitions â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

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

/* â”€â”€ Figma poster designs (Campaign 08) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

interface Poster {
  headline: string;
  subtitle: string;
  caption: string;
  filename: string;
  src: string;
}

const POSTERS: Poster[] = [
  {
    headline: "Sunday is free.",
    subtitle: "Every week. No cost. No catch.",
    caption: `Sunday is free. Every week. No cost. No catch. Come and see what Mindcast feels like â€” one theme, on the big screen, together. #Mindcast #MindcastNZ #InnerWork #TaupÅ`,
    filename: "mindcast-social-sunday-is-free.png",
    src: posterSundayIsFree,
  },
  {
    headline: "Your kids are in the next room.",
    subtitle: "They learn while you grow.",
    caption: `Your kids are in the next room. They learn while you grow. One Sunday, the whole family doing the inner work â€” each in their own track. #Mindcast #MindcastNZ #FamilyGrowth #TaupÅ`,
    filename: "mindcast-social-kids-next-room.png",
    src: posterKidsNextRoom,
  },
  {
    headline: "No phones. Real talk.",
    subtitle: "Teens at Mindcast",
    caption: `No phones. Real talk. Teens at Mindcast get a room of their own â€” honest conversations, zero cringe. #Mindcast #MindcastNZ #RealTalk #Teens`,
    filename: "mindcast-social-no-phones.png",
    src: posterNoPhones,
  },
  {
    headline: "Come back in seven days.",
    subtitle: "Same table. Same hour. New conversation.",
    caption: `Come back in seven days. Same table. Same hour. New conversation. 52 weeks of showing up for yourself, together. #Mindcast #MindcastNZ #InnerWork #WeeklyRhythm`,
    filename: "mindcast-social-come-back.png",
    src: posterComeBack,
  },
  {
    headline: "Thoughtful conversations.",
    subtitle: "Every Sunday in TaupÅ",
    caption: `Thoughtful conversations. Every Sunday in TaupÅ. Not another app â€” a room full of people who show up for each other. #Mindcast #MindcastNZ #Community #TaupÅ`,
    filename: "mindcast-social-thoughtful-conversations.png",
    src: posterThoughtful,
  },
  {
    headline: "One community. Many rooms.",
    subtitle: "Adults connect. Teens belong. Children play.",
    caption: `One community. Many rooms. Adults connect. Teens belong. Children play. One theme every week, for the whole family. #Mindcast #MindcastNZ #OneCommunity #TaupÅ`,
    filename: "mindcast-social-one-community.png",
    src: posterOneCommunity,
  },
];

const THREE_TRACKS_CAPTION = `Adults connect. Teens belong. Children play. Three tracks. One theme. One community. Membership is open now in TaupÅ. #Mindcast #MindcastNZ #InnerWork #TaupÅ`;

/* â”€â”€ Social content calendar â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

interface CalendarEntry {
  day: string;
  platform: string;
  icon: LucideIcon;
  title: string;
  detail: string;
}

interface CalendarWeek {
  label: string;
  theme: string;
  entries: CalendarEntry[];
}

const CALENDAR: CalendarWeek[] = [
  {
    label: "Week 1",
    theme: "Awareness",
    entries: [
      { day: "Mon", platform: "Instagram", icon: Instagram, title: "One community. Many rooms.", detail: "Poster + caption â€” introduce the three tracks." },
      { day: "Tue", platform: "Facebook", icon: Facebook, title: "Facebook post", detail: "Copy kit â€” founder-voice intro post." },
      { day: "Wed", platform: "Instagram", icon: Instagram, title: "Thoughtful conversations.", detail: "Poster + caption â€” Sunday sessions in TaupÅ." },
      { day: "Thu", platform: "DM / Text", icon: MessageCircle, title: "Personal outreach", detail: "Copy kit â€” send to your first 20 names." },
      { day: "Fri", platform: "Stories", icon: Instagram, title: "Instagram story script", detail: "Copy kit â€” 5 slides, run the poll + question box." },
    ],
  },
  {
    label: "Week 2",
    theme: "Launch",
    entries: [
      { day: "Mon", platform: "Instagram", icon: Instagram, title: "Sunday is free.", detail: "Poster + caption â€” open invite to come and see." },
      { day: "Tue", platform: "LinkedIn", icon: Linkedin, title: "LinkedIn post", detail: "Copy kit â€” professional pivot angle." },
      { day: "Wed", platform: "Instagram", icon: Instagram, title: "No phones. Real talk.", detail: "Poster + caption â€” teen track spotlight." },
      { day: "Thu", platform: "Instagram", icon: Instagram, title: "Your kids are in the next room.", detail: "Poster + caption â€” children track spotlight." },
      { day: "Fri", platform: "Email", icon: Mail, title: "Email template", detail: "Copy kit â€” send to your list." },
      { day: "Sat", platform: "Twitter / X", icon: Twitter, title: "Twitter thread", detail: "Copy kit â€” 5 tweets." },
      { day: "Sun", platform: "In person", icon: Clapperboard, title: "Live Sunday session", detail: "Run the session â€” post â€œCome back in seven days.â€ on Monday." },
    ],
  },
];

/* â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

function downloadFile(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function downloadPoster(poster: Poster) {
  const a = document.createElement("a");
  a.href = poster.src;
  a.download = poster.filename;
  a.click();
}

async function copyText(text: string, label: string) {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  } catch {
    toast.error("Couldn't access the clipboard");
  }
}

/* â”€â”€ Copy kit card â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

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
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-body font-bold text-primary text-base">{asset.title}</h3>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] tracking-[0.15em] font-semibold uppercase font-body">
          {asset.icon}
          {asset.platform}
        </span>
      </div>

      <p className="text-muted-foreground text-sm font-body mb-4 leading-relaxed">{asset.description}</p>

      <div className="bg-muted/50 rounded-lg p-4 mb-5 flex-1 overflow-hidden">
        <pre className="text-xs text-foreground/70 font-body whitespace-pre-wrap leading-relaxed line-clamp-5">
          {preview}
        </pre>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => copyText(asset.content, asset.title)}
          className="flex items-center justify-center gap-2 py-3 rounded-lg border border-border text-[10px] tracking-[0.15em] uppercase font-body font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <Copy className="w-4 h-4" />
          Copy
        </button>
        <button
          onClick={handleDownload}
          className={`flex items-center justify-center gap-2 py-3 rounded-lg text-[10px] tracking-[0.15em] uppercase font-body font-semibold transition-all duration-200 ${
            downloaded
              ? "bg-green-600 text-white"
              : "bg-primary text-primary-foreground hover:opacity-90"
          }`}
        >
          {downloaded ? <Check className="w-4 h-4" /> : <Download className="w-4 h-4" />}
          {downloaded ? "Downloaded" : "Download TXT"}
        </button>
      </div>
    </div>
  );
};

/* â”€â”€ Poster card â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

const PosterCard = ({ poster }: { poster: Poster }) => (
  <div className="bg-card border border-border rounded-xl overflow-hidden flex flex-col">
    <img src={poster.src} alt={poster.headline} className="w-full aspect-[4/5] object-cover" />
    <div className="p-5 flex flex-col gap-3">
      <div>
        <h3 className="font-display text-xl text-primary tracking-wide">{poster.headline}</h3>
        <p className="text-[11px] font-body text-muted-foreground mt-0.5">{poster.subtitle}</p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => downloadPoster(poster)}
          className="flex items-center justify-center gap-2 py-2.5 rounded-lg bg-primary text-primary-foreground text-[10px] tracking-[0.15em] uppercase font-body font-semibold hover:opacity-90 transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          PNG
        </button>
        <button
          onClick={() => copyText(poster.caption, "Caption")}
          className="flex items-center justify-center gap-2 py-2.5 rounded-lg border border-border text-[10px] tracking-[0.15em] uppercase font-body font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <Copy className="w-3.5 h-3.5" />
          Caption
        </button>
      </div>
    </div>
  </div>
);

/* â”€â”€ Tab â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

type SubTab = "calendar" | "designs" | "copy";

const SUBTABS: { id: SubTab; label: string }[] = [
  { id: "calendar", label: "Content Calendar" },
  { id: "designs", label: "Posters & Designs" },
  { id: "copy", label: "Copy Kit" },
];

const Marketing = () => {
  const [sub, setSub] = useState<SubTab>("calendar");

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h2 className="font-display text-2xl text-primary tracking-wider">Marketing</h2>
        <p className="text-muted-foreground text-sm font-body mt-1">
          Campaign 08 asset library â€” the social content calendar, Figma posters and the ready-to-post copy kit. In-house only, not public facing.
        </p>
      </div>

      <div className="flex gap-1 rounded-md border border-border bg-card p-1 w-fit mb-2 overflow-x-auto max-w-full">
        {SUBTABS.map((t) => (
          <button key={t.id} onClick={() => setSub(t.id)}
            className={`px-3.5 py-1.5 text-[11px] font-body tracking-widest uppercase rounded-sm whitespace-nowrap transition-colors ${sub === t.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {sub === "calendar" && (
        <div className="space-y-8">
          {CALENDAR.map((week) => (
            <div key={week.label}>
              <div className="flex items-baseline gap-3 mb-3">
                <h3 className="font-body font-bold text-primary text-sm">{week.label}</h3>
                <span className="text-[10px] font-body tracking-[0.2em] uppercase text-primary">{week.theme}</span>
              </div>
              <div className="rounded-lg border border-border bg-card divide-y divide-border">
                {week.entries.map((e) => (
                  <div key={`${week.label}-${e.day}`} className="flex items-start gap-4 px-5 py-4">
                    <span className="w-10 shrink-0 text-[10px] font-body tracking-[0.2em] uppercase text-muted-foreground pt-0.5">{e.day}</span>
                    <span className="inline-flex items-center gap-1.5 w-28 shrink-0 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[10px] tracking-[0.12em] font-semibold uppercase font-body">
                      <e.icon size={11} />
                      {e.platform}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-body font-semibold text-foreground">{e.title}</p>
                      <p className="text-[11px] font-body text-muted-foreground mt-0.5">{e.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          <p className="text-[11px] font-body text-muted-foreground flex items-center gap-2">
            <CalendarDays size={12} />
            Pair every calendar entry with its poster or copy from the other two tabs.
          </p>
        </div>
      )}

      {sub === "designs" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <div className="bg-card border border-border rounded-xl overflow-hidden flex flex-col">
              <ThreeTracksCampaign />
              <div className="p-5 flex flex-col gap-3">
                <div>
                  <h3 className="font-display text-xl text-primary tracking-wide">Three tracks. One theme. One community.</h3>
                  <p className="text-[11px] font-body text-muted-foreground mt-0.5">Live component â€” scales to any width.</p>
                </div>
                <button
                  onClick={() => copyText(THREE_TRACKS_CAPTION, "Caption")}
                  className="flex items-center justify-center gap-2 py-2.5 rounded-lg border border-border text-[10px] tracking-[0.15em] uppercase font-body font-semibold text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                  Caption
                </button>
              </div>
            </div>
            {POSTERS.map((p) => (
              <PosterCard key={p.filename} poster={p} />
            ))}
          </div>
        </div>
      )}

      {sub === "copy" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {assets.map((asset) => (
            <AssetCard key={asset.filename} asset={asset} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Marketing;