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
  ["h2", "Hero"],
  ["h3", "A ROOM IN TAUPŌ. THE SAME PEOPLE. EVERY WEEK."],
  ["p", "Nobody here buys a subscription. You decide to turn up — for a year, with people who will notice when you don't."],
  ["d"],

  ["h2", "Come and sit in the room first"],
  ["p", "Before any of the prices below"],
  ["p", "A free trial pass gets you one full Sunday — the session, the room, the people. No card details, no obligation, and nobody in the room will know or care that you're on a pass."],
  ["p", "If it isn't for you, that's a fine answer and we won't chase you about it."],
  ["b", "CTA: Get a free session pass"],
  ["img", "a Mindcast session in progress — chairs in a circle, people talking"],
  ["d"],

  ["h2", "Membership"],
  ["p", "All prices in New Zealand dollars, GST inclusive."],
  ["h3", "ADULT — $29/week"],
  ["p", "The founding rate applies to the first hundred adult memberships and stays locked for twelve months. Standard rate $35/week."],
  ["p", "The full year: every Sunday session, your workbook and saved reflections, a midweek Life Group, and your wristband at the door."],
  ["h3", "TEEN — $22/week"],
  ["p", "The teen room, same rhythm. A private journal no one else reads — not even parents — and their own pass for the door."],
  ["h3", "KIDS ADD-ON — $15/week"],
  ["p", "Added to an adult or family membership. The kids' room: a picture book, a game, colouring that goes home on the fridge. Children are signed in and out by you, every week."],
  ["h3", "FAMILY BUNDLE — $79/week"],
  ["p", "Two adults plus up to three children or teens. One payment, the whole household. Everyone walks in on the same Sunday and everyone has their own room to be in."],
  ["h3", "CONCESSION — $19/week"],
  ["p", "Same membership. Everything included. If the standard rate is the thing standing between you and the room, this is the rate. One step to request. No means testing, no proof, no explanation — we don't ask, and nobody else can tell."],
  ["h3", "TRIAL PASS — $0, one session"],
  ["p", "One Sunday, the whole thing, free. Single use, requested in one click, delivered as a QR pass. Bring the family — they're on the same ticket."],
  ["p", "Not ready for any of it? The day's worksheet is $5 at the door or online, and you can follow the whole year that way. No account needed."],
  ["d"],

  ["h2", "What's in it — and what isn't"],
  ["b", "The Sunday session, every week of the year — Included"],
  ["b", "Your workbook — digital and printed, with your saved reflections — Included"],
  ["b", "A midweek Life Group — Included"],
  ["b", "Private journal (private means private — teens' journals are invisible to guardians) — Included"],
  ["b", "NFC wristband entry, replacement bracelets at cost — Included"],
  ["b", "One-to-one therapy or counselling — Not included (Mindcast is not a clinical service)"],
  ["b", "Locked-in commitment — Not included (cancel any time, two clicks, no questions)"],
  ["d"],

  ["h2", "Leaving is two clicks"],
  ["p", "Cancel any time from your account. Two clicks, no phone call, no retention offer, no 'are you sure?' survey. Your journal and reflections stay yours to export."],
  ["q", "We would rather you left easily and remembered the room well."],
  ["img", "workbooks laid out on a table before a session"],
  ["b", "CTA: Become a member"],
];

const ABOUT = [
  ["h1", "About"],
  ["img", "about hero"],
  ["h3", "WE WANT TO RECREATE WHAT CHURCH DID WELL — WITHOUT THE RELIGION"],
  ["p", "A place to show up every week. A community that holds you accountable. Frameworks for the hard stuff. Tools you carry into real life."],
  ["d"],

  ["h2", "The story"],
  ["p", "I loved podcasts the way some people love music. Driving was my favourite thing because it meant I could listen — really listen. But I could never retain what I was learning. The ideas would hit, stir something, then dissolve into the noise of the week."],
  ["p", "I tried the gym. I was only there out of necessity — external motivators chased, never truly wanted. I tried book clubs, but I only read non-fiction and I heard some people don't even read the book. Then I started a women in business group: we rotated roles, shared wins, and spoke our intentions aloud each week. Because we'd said them in front of each other, we actually followed through. The structure worked."],
  ["p", "But I was told to relax. To loosen the format. And I realised: I didn't want to relax. I didn't want an unorganised meeting with no shape. I wanted a room where the structure was the container that made everything else possible. I craved mental stimulation and real accountability — and I thought, surely there must be others out there who feel the same way."],
  ["p", "That's where Mindcast began. Not a book club, not a lecture — a facilitated weekly gathering. A 52-week journey where adults, teens and children each work through the same theme in their own live session, reflect in their course book, and leave with one thing to implement before next week. During the week, Life Groups meet to revisit the Sunday session and go deeper. Not to be taught. Just to do the work, side by side."],
  ["p", "So I built the room."],
  ["d"],

  ["h2", "The room"],
  ["p", "Mindcast is being designed as a permanent space — a building purpose-built for weekly gatherings. A 120-seat theatre for Sunday sessions. Glass-walled breakout rooms for Tuesday Life Groups. A cafe to linger in beforehand. An indoor playground so parents can stay present while kids play within view."],
  ["p", "Every element — from the auditorium stage to the breakout room acoustics — is designed to hold the rhythm: Reflect, Gather, Commit."],
  ["img", "Mindcast venue"],
  ["q", "I didn't invent the wisdom. I just built the room."],
  ["d"],

  ["h2", "The mission"],
  ["h3", "COMMUNITY"],
  ["p", "A weekly gathering of people who show up for each other. Not followers. Not fans. A real group doing real work together — in person, face to face."],
  ["h3", "PRACTICE"],
  ["p", "A 52-week journey with a weekly rhythm: a facilitated Sunday session works through the theme, you reflect in your course book and set one intention, then a midweek Life Group revisits it and goes deeper — and every session opens by asking whether last week's intention actually happened."],
  ["h3", "TOOLS"],
  ["p", "A live digital course book, guided reflection and journaling, weekly practices, and Life Groups — designed to make the inner work tangible and trackable across the whole 52-week journey."],
  ["d"],

  ["h2", "The founder"],
  ["h3", "ASHLEIGH CARLSON · FOUNDER & FACILITATOR"],
  ["p", "I'm not a teacher (anymore). I'm not a guru. I'm not a prophet, and I'm certainly not the source of whatever wisdom surfaces in a Mindcast session."],
  ["p", "Everything we draw from — the ideas, the thinkers, the frameworks — already exists in the world. I didn't invent the wisdom. I just built the room. I created the shape of the evening. I wrote the questions. I set the table. What happens at that table belongs to everyone who sits at it."],
  ["p", "I built Mindcast because I needed it myself. I needed a place where reflection wasn't rushed, where structure created safety, and where showing up week after week meant actually growing, not just consuming. I wasn't looking to lead anyone. I was looking to find my people: those who get stimulated intellectually, who want to understand themselves better, who are tired of surfaces and small talk and pretending they're fine."],
  ["p", "So if you need a label, here's the truest one: I'm the first participant. The one who needed this badly enough to build it — and then left the door open for whoever else might need it too."],
  ["p", "BASED IN TAUPŌ, NEW ZEALAND"],
  ["d"],

  ["h2", "Our values"],
  ["b", "CONSENT BEFORE EVERYTHING — you decide what you share, what you explore, and how far you go. Always."],
  ["b", "EVIDENCE WHERE POSSIBLE, HONESTY ABOUT THE REST — we use what the research says. Where it's silent, we say so. No false certainty. No magic."],
  ["b", "INNER WORK IS FOR EVERYONE — not just the wealthy, the already-well, or those with time. This is for the rest of us."],
  ["b", "COMMUNITY OVER CONTENT — the most powerful thing we offer isn't a podcast or a framework. It's the room you walk into each week."],
  ["b", "SAFETY IS NON-NEGOTIABLE — physically, emotionally, psychologically. We build spaces where people can be honest without being harmed."],
  ["b", "ONE STEP AT A TIME — we don't ask you to transform. We ask you to notice one thing, name one thing, change one thing. Then come back next week."],
  ["d"],

  ["h2", "We use AI. Here's why we're proud of that."],
  ["p", "A note on how Mindcast was built — and what we believe about the tools we use."],
  ["p", "The images and videos on this website were generated using AI. The resources we share are researched and written by leading experts — and AI helps us surface, synthesise, and apply that knowledge faster than any team of researchers could alone."],
  ["p", "We believe AI should make us more human, not less. It should free up the hours we waste on things that don't require a human touch — so we can spend more time in rooms with real people, having conversations that actually matter."],
  ["p", "Mindcast exists because of AI. Not in spite of it."],
  ["p", "Without it, this idea would still be a note on my phone. I didn't have a team, a budget, or ample free time. What I had was a clear vision and access to tools that meant I didn't need any of those things to get started. AI levelled that playing field completely."],
  ["p", "Our resources are evidence-based because AI lets us stand on the shoulders of the researchers, scientists, and authors who have spent decades studying human behaviour, healing, and connection. We don't make things up. We find the best thinking that exists, translate it into something you can actually use, and bring it into the room with us every week."],
  ["p", "That's the version of AI we're interested in: the one that makes human experience richer, more accessible, and more honest."],
  ["q", "AI didn't replace the human work. It made the human work possible."],
  ["d"],

  ["h2", "Ready to start?"],
  ["p", "The Mindcast journey is 52 weeks of showing up, reflecting, and following through — for adults, teens and children, together. Founding membership is coming soon in Taupō."],
  ["b", "CTA: Become a member →"],
];

const HOW_IT_WORKS = [
  ["h1", "How it works"],
  ["img", "hero — a facilitator leading a warm gathering"],
  ["h3", "WE ALL KNOW WHAT TO DO. WHY AREN'T WE DOING IT?"],
  ["p", "We've listened to the podcast. Read the book. Saved the reel. Then Monday arrives and nothing actually changes."],
  ["p", "Mindcast is a weekly live room built for the missing step — a community that helps you bring the unconscious to the conscious, set one honest intention, and come back the following week to be held to it."],
  ["b", "CTA: Read the story"],
  ["d"],

  ["h2", "Every age. The same work."],
  ["h3", "ONE THEME, THREE ROOMS"],
  ["p", "Whānau-wide behaviour change starts with a shared language. Adults, teens and kids each have their own workbook — different depth, different words, same weekly theme."],
  ["h3", "Adults"],
  ["p", "A guided digital course book with live prompts, Q&A, and space to write into what the theme surfaces for you."],
  ["img", "the adult workbook open mid-session"],
  ["h3", "Teens"],
  ["p", "Age-appropriate prompts and reflections in their own room — real language, real questions, no talking down."],
  ["img", "the teen workbook"],
  ["h3", "Kids"],
  ["p", "Gentle activities and colouring pages built around the same weekly theme, so the little ones grow into the practice."],
  ["img", "a child's colouring page from the kids' room"],
  ["d"],

  ["h2", "Stats"],
  ["b", "52 — weeks in the journey"],
  ["b", "3 — rooms, one theme"],
  ["b", "1 — intention, kept weekly"],
  ["d"],

  ["h2", "Reflect. Gather. Commit."],
  ["h3", "THE RHYTHM"],
  ["p", "A cadence built around the only thing that actually changes behaviour — coming back next week and being asked whether you did it."],
  ["h3", "Sunday · The Gathering"],
  ["p", "Every session begins the same way — we return to the intention you set seven days ago. Did you do it? What got in the way? Where did the old pattern win? No shame, just honest data."],
  ["h3", "In the Rooms"],
  ["p", "Adults, teens and kids move into their own rooms and work the same theme in parallel — live facilitation, workbook prompts, real conversation. The goal isn't more information. It's bringing the unconscious to the conscious."],
  ["h3", "Before You Leave"],
  ["p", "You write down one specific thing you'll do this week. It goes in your workbook, and it comes back with you next Sunday. That's how a room turns into a life. That's how a community changes."],
  ["d"],

  ["h2", "Coming soon"],
  ["h3", "A SPACE BUILT FOR FOLLOW-THROUGH"],
  ["p", "Every detail designed so Sunday gatherings and midweek Life Groups have a permanent, purpose-built home — theatre, breakout rooms, cafe, and a playground so parents can stay present."],
  ["b", "THEATRE — 120-seat auditorium with stage and LED wall"],
  ["b", "LIFE GROUP ROOMS — glass-walled rooms for 15-person Life Groups"],
  ["b", "CAFE — espresso, communal tables, pre-session gathering"],
  ["b", "PLAYGROUND — soft-play and climbing, visible from the cafe"],
  ["img", "Mindcast venue — theatre, breakout rooms, cafe, playground"],
  ["q", "We don't have a knowledge problem. We have a follow-through problem. Mindcast is the room that finally closes that gap — together, every week."],
  ["p", "Ashleigh Carlson · Founder of Mindcast"],
  ["d"],

  ["h2", "Taupō · Sundays"],
  ["h3", "STOP CONSUMING. START DOING."],
  ["p", "One room, the same people, every week, for a year. Come and sit in it once, free, and see what it is — no card, no chase, no countdown."],
  ["b", "CTA: Get a free session pass"],
  ["b", "CTA: See membership"],
  ["d"],

  ["h2", "Footer"],
  ["p", "Mindcast · Taupō, New Zealand · mindcast.co.nz"],
  ["b", "Explore — About, Membership, Member Sign In"],
  ["b", "Connect — Instagram, Contact"],
  ["b", "Legal — Privacy Policy, Terms of Use, Refund Policy"],
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
const how = await createPage(site.id, "How it works", "🔀");
await appendChildren(how.id, HOW_IT_WORKS);

console.log("hub:", hub.id);
console.log("site:", site.id);
console.log("home:", home.id, "| how it works:", how.id, "| membership:", membership.id, "| about:", about.id);
