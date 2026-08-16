// Builds a "Websites" wireframe board in Notion: one page per website, with
// the page sections mirrored as editable blocks + 🖼 IMAGE SLOT callouts.
// Idempotent: re-running archives and rebuilds the site page so it can act as
// the source-of-truth regeneration for the copy manifest below.
// Usage: $env:NOTION_TOKEN=... ; node scripts/build-website-wireframes.mjs

const TOKEN = process.env.NOTION_TOKEN;
if (!TOKEN) { console.error("NOTION_TOKEN not set"); process.exit(1); }

const H = { Authorization: `Bearer ${TOKEN}`, "Notion-Version": "2022-06-28", "Content-Type": "application/json" };
async function api(url, opts) {
  const r = await fetch(url, opts);
  if (!r.ok) throw new Error(`${r.status} ${await r.text()}`);
  return r.json();
}

const PARENT = process.env.WEBSITES_PARENT || "3bc0d85f-784c-8096-bea1-e686ed52614b"; // "MINDCAST — Home"

async function searchPage(title) {
  const s = await api("https://api.notion.com/v1/search", {
    method: "POST", headers: H,
    body: JSON.stringify({ query: title, filter: { value: "page", property: "object" }, page_size: 20 }),
  });
  return s.results.find((p) => {
    const t = Object.values(p.properties || {}).find((v) => v.type === "title")?.title?.map((x) => x.plain_text).join("") || "";
    return t === title;
  });
}

function pageTitle(p) {
  if (p.type === "child_page") return p.child_page?.title || "";
  return Object.values(p.properties || {}).find((v) => v.type === "title")?.title?.map((x) => x.plain_text).join("") || "";
}

async function createPage(parentId, title, icon) {
  return api("https://api.notion.com/v1/pages", {
    method: "POST", headers: H,
    body: JSON.stringify({ parent: { page_id: parentId }, icon: icon ? { type: "emoji", emoji: icon } : undefined, properties: { title: { title: [{ text: { content: title } }] } } }),
  });
}

async function archivePage(id) {
  return api(`https://api.notion.com/v1/pages/${id}`, { method: "PATCH", headers: H, body: JSON.stringify({ archived: true }) });
}

function blocks(content) {
  const out = [];
  for (const b of content) {
    const [type, ...rest] = b;
    const text = rest[0] ?? "";
    if (type === "h1") out.push({ object: "block", type: "heading_1", heading_1: { rich_text: [{ type: "text", text: { content: text } }] } });
    else if (type === "h2") out.push({ object: "block", type: "heading_2", heading_2: { rich_text: [{ type: "text", text: { content: text } }] } });
    else if (type === "h3") out.push({ object: "block", type: "heading_3", heading_3: { rich_text: [{ type: "text", text: { content: text } }] } });
    else if (type === "p") out.push({ object: "block", type: "paragraph", paragraph: { rich_text: [{ type: "text", text: { content: text } }] } });
    else if (type === "q") out.push({ object: "block", type: "quote", quote: { rich_text: [{ type: "text", text: { content: text } }] } });
    else if (type === "b") out.push({ object: "block", type: "bulleted_list_item", bulleted_list_item: { rich_text: [{ type: "text", text: { content: text } }] } });
    else if (type === "d") out.push({ object: "block", type: "divider", divider: {} });
    else if (type === "img") out.push({ object: "block", type: "callout", callout: { icon: { type: "emoji", emoji: "🖼️" }, rich_text: [{ type: "text", text: { content: `IMAGE SLOT — ${text} (drag your image here; delete this line if none)` } }] } });
  }
  return out;
}

async function appendChildren(pageId, content) {
  return api(`https://api.notion.com/v1/blocks/${pageId}/children`, {
    method: "PATCH", headers: H,
    body: JSON.stringify({ children: blocks(content) }),
  });
}

// ── Copy manifest (mirrors www.mindcast.co.nz) ──────────────────────────────
const HOME = [
  ["h2", "Hero"],
  ["p", "COMING SOON · AOTEAROA NEW ZEALAND"],
  ["h1", "Tune into your inner self."],
  ["p", "We consume more self-development than any generation before us — and apply almost none of it. Mindcast is a weekly live gathering built for follow-through: a room that holds you accountable to the things you already know you should do."],
  ["b", "CTA: Join the waitlist →"],
  ["b", "CTA: See how it works"],
  ["img", "hero — a family gathered together with open workbooks"],
  ["d"],

  ["h2", "Manifesto"],
  ["p", "You are unaware, and you don't change."],
  ["p", "You are aware, and you still don't change."],
  ["p", "You are aware — and you do."],
  ["p", "Mindcast is the room built for that third one."],
  ["q", "UNCONSCIOUS → CONSCIOUS → CHANGED."],
  ["b", "NOT THERAPY · NOT RELIGION · NOT SELF-HELP · NOT A PODCAST"],
  ["p", "A STRUCTURED WEEKLY PRACTICE."],
  ["d"],

  ["h2", "The idea"],
  ["h3", "WE ALL KNOW WHAT TO DO. WHY AREN'T WE DOING IT?"],
  ["p", "We've listened to the podcast. Read the book. Saved the reel. Then Monday arrives and nothing actually changes."],
  ["p", "Mindcast is a weekly live room built for the missing step — follow-through. A community that helps you bring the unconscious to the conscious, set one honest intention, and come back the following week to be held to it."],
  ["b", "Format — Live, in person"],
  ["b", "Cadence — Weekly"],
  ["b", "Tracks — Adults · Teens · Kids"],
  ["b", "Status — Coming soon"],
  ["b", "CTA: Join the waitlist →"],
  ["img", "a facilitator leading a warm gathering"],
  ["d"],

  ["h2", "Three tracks · one theme"],
  ["h3", "EVERY AGE. THE SAME WORK."],
  ["p", "Whānau-wide behaviour change starts with a shared language. Adults, teens and kids each have their own workbook — different depth, different words, same weekly theme — so the conversation keeps going in the car, at the dinner table, at bedtime."],
  ["h3", "Adults — A Reflective Workbook"],
  ["p", "A guided digital course book with live prompts, Q&A, and space to write into what the theme surfaces for you."],
  ["h3", "Teens — A Teen Workbook"],
  ["p", "Age-appropriate prompts and reflections in their own room — real language, real questions, no talking down."],
  ["h3", "Children — Colouring & Picture-book"],
  ["p", "Gentle activities and colouring pages built around the same weekly theme, so the little ones grow into the practice."],
  ["q", "One wristband. One theme. One conversation the whole whānau can keep having."],
  ["img", "a Mindcast wristband being tapped at the door"],
  ["d"],

  ["h2", "The weekly rhythm"],
  ["h3", "REFLECT. GATHER. COMMIT."],
  ["p", "A cadence built around the only thing that actually changes behaviour — coming back next week and being asked whether you did it."],
  ["h3", "1 · Reflect on last week"],
  ["p", "Every session begins the same way — we return to the intention you set seven days ago. Did you do it? What got in the way? Where did the old pattern win? No shame, just honest data. This is the accountability loop most self-development is missing."],
  ["h3", "2 · This week's lesson"],
  ["p", "Adults, teens and kids move into their own rooms and work the same theme in parallel — live facilitation, workbook prompts, real conversation. The goal isn't more information. It's bringing the unconscious to the conscious."],
  ["h3", "3 · One intention. Actioned."],
  ["p", "Before you leave, you write down one specific thing you'll do this week. It goes in your workbook, and it comes back with you next Sunday. That's how a room turns into a life. That's how a community changes."],
  ["d"],

  ["h2", "The venue"],
  ["h3", "A SPACE BUILT FOR FOLLOW-THROUGH"],
  ["p", "Every detail designed so Sunday gatherings and Tuesday Life Groups have a permanent, purpose-built home — theatre, breakout rooms, cafe, and a playground so parents can stay present."],
  ["img", "Mindcast venue — theatre, breakout rooms, cafe, playground"],
  ["b", "THEATRE — 120-seat auditorium with stage and LED wall"],
  ["b", "BREAKOUT ROOMS — glass-walled rooms for 15-person Life Groups"],
  ["b", "CAFE — espresso, communal tables, pre-session gathering"],
  ["b", "INDOOR PLAYGROUND — soft-play and climbing, visible from the cafe"],
  ["q", "The structure was the container that made everything else possible."],
  ["p", "Ashleigh Carlson · Founder"],
  ["d"],

  ["h2", "Founder"],
  ["q", "We don't have a knowledge problem. We have a follow-through problem. Mindcast is the room that finally closes that gap — together, every week."],
  ["p", "ASHLEIGH CARLSON · Founder · Mindcast"],
  ["d"],

  ["h2", "Coming soon"],
  ["h3", "STOP CONSUMING. START DOING."],
  ["p", "The first Mindcast gatherings are forming across Aotearoa. Add your name to the waitlist and we'll invite you when doors open near you."],
  ["b", "CTA: Join the waitlist →"],
  ["b", "CTA: Read the story"],
  ["d"],

  ["h2", "Footer"],
  ["p", "Mindcast · Taupō, New Zealand · mindcast.co.nz"],
  ["b", "Explore — About, Membership, Member Sign In"],
  ["b", "Connect — Instagram, Contact"],
  ["b", "Legal — Privacy Policy, Terms of Use, Refund Policy, Child Safety"],
  ["p", "© 2026 Mindcast. Built with intention."],
  ["p", "INNER WORK FOR REAL LIFE"],
];

const MEMBERSHIP = [
  ["h1", "Membership"],
  ["img", "membership hero"],
  ["h2", "Full year"],
  ["p", "Every Sunday session, your workbook and saved reflections, a midweek Life Group, and your wristband at the door."],
  ["h2", "Teen room"],
  ["p", "The teen room, same rhythm. A private journal no one else reads — not even parents — and their own pass for the door."],
  ["h2", "Kids room"],
  ["p", "A picture book, a game, colouring that goes home on the fridge. Children are signed in and out by you, every week."],
  ["h2", "Household"],
  ["p", "One payment, the whole household. Everyone walks in on the same Sunday and everyone has their own room to be in."],
  ["h2", "Honest rate"],
  ["p", "If the standard rate is the thing standing between you and the room, this is the rate. No means testing, no proof, no explanation."],
  ["img", "pricing cards"],
];

const ABOUT = [
  ["h1", "About"],
  ["img", "about hero / founder"],
  ["h2", "The story"],
  ["p", "Mindcast began from a simple question about what actually changes people — and the answer was a room, not an app."],
  ["h2", "The room"],
  ["p", "The most powerful thing we offer isn't a podcast or a framework. It's the room you walk into each week."],
  ["h2", "The mission"],
  ["b", "COMMUNITY — a weekly gathering of people who show up for each other."],
  ["b", "PRACTICE — a 52-week journey with a weekly rhythm: Sunday session, reflection, intention, Life Group."],
  ["b", "TOOLS — a live digital course book, guided reflection and journaling, weekly practices."],
  ["h2", "Our values"],
  ["b", "Community over content"],
  ["b", "Draw out, do not preach"],
  ["b", "Everyone can afford to belong"],
  ["b", "Safe by design"],
  ["b", "Honest about what we are"],
  ["b", "No pressure, ever"],
  ["d"],
  ["h2", "Principles"],
  ["b", "Consent before everything"],
  ["b", "Evidence where possible, honesty about the rest"],
  ["b", "Inner work is for everyone"],
  ["b", "Safety is non-negotiable"],
  ["b", "One step at a time"],
];

// ── Build ───────────────────────────────────────────────────────────────────
let hub = await searchPage("🌐 Websites — wireframes");
if (!hub) {
  hub = await createPage(PARENT, "🌐 Websites — wireframes", "🌐");
  await appendChildren(hub.id, [
    ["h1", "Website wireframes"],
    ["p", "One page per website. Edit the copy directly; drag images onto the 🖼️ IMAGE SLOT blocks. Run scripts/sync-website-content.mjs to pull changes back into the repo."],
    ["d"],
  ]);
}

// Idempotent rebuild of the site page.
const hubKids = await api(`https://api.notion.com/v1/blocks/${hub.id}/children?page_size=50`, { headers: H });
const existing = hubKids.results.find((p) => pageTitle(p) === "Mindcast — mindcast.co.nz");
if (existing) await archivePage(existing.id);

const site = await createPage(hub.id, "Mindcast — mindcast.co.nz", "📻");
const home = await createPage(site.id, "Home", "🏠");
await appendChildren(home.id, HOME);
const membership = await createPage(site.id, "Membership", "💳");
await appendChildren(membership.id, MEMBERSHIP);
const about = await createPage(site.id, "About", "📖");
await appendChildren(about.id, ABOUT);

console.log("hub:", hub.id);
console.log("site:", site.id);
console.log("home:", home.id, "| membership:", membership.id, "| about:", about.id);
