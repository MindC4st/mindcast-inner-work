// Builds a "Websites" wireframe board in Notion: one page per website, with
// the page sections mirrored as editable blocks + 🖼 IMAGE SLOT callouts.
// Usage: $env:NOTION_TOKEN=... ; node scripts/build-website-wireframes.mjs
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const TOKEN = process.env.NOTION_TOKEN;
if (!TOKEN) { console.error("NOTION_TOKEN not set"); process.exit(1); }

const H = { Authorization: `Bearer ${TOKEN}`, "Notion-Version": "2022-06-28", "Content-Type": "application/json" };
async function api(url, opts) {
  const r = await fetch(url, opts);
  if (!r.ok) throw new Error(`${r.status} ${await r.text()}`);
  return r.json();
}

const PARENT = process.env.WEBSITES_PARENT || "3bc0d85f-784c-8096-bea1-e686ed52614b"; // "MINDCAST — Home"

async function createPage(parentId, title, icon) {
  return api("https://api.notion.com/v1/pages", {
    method: "POST", headers: H,
    body: JSON.stringify({ parent: { page_id: parentId }, icon: icon ? { type: "emoji", emoji: icon } : undefined, properties: { title: { title: [{ text: { content: title } }] } } }),
  });
}

function blocks(content) {
  const out = [];
  for (const b of content) {
    const [type, ...rest] = b;
    if (type === "h1") out.push({ object: "block", type: "heading_1", heading_1: { rich_text: [{ type: "text", text: { content: rest[0] } }] } });
    else if (type === "h2") out.push({ object: "block", type: "heading_2", heading_2: { rich_text: [{ type: "text", text: { content: rest[0] } }] } });
    else if (type === "h3") out.push({ object: "block", type: "heading_3", heading_3: { rich_text: [{ type: "text", text: { content: rest[0] } }] } });
    else if (type === "p") out.push({ object: "block", type: "paragraph", paragraph: { rich_text: [{ type: "text", text: { content: rest[0] } }] } });
    else if (type === "q") out.push({ object: "block", type: "quote", quote: { rich_text: [{ type: "text", text: { content: rest[0] } }] } });
    else if (type === "b") out.push({ object: "block", type: "bulleted_list_item", bulleted_list_item: { rich_text: [{ type: "text", text: { content: rest[0] } }] } });
    else if (type === "d") out.push({ object: "block", type: "divider", divider: {} });
    else if (type === "img") out.push({ object: "block", type: "callout", callout: { icon: { type: "emoji", emoji: "🖼️" }, rich_text: [{ type: "text", text: { content: `IMAGE SLOT — ${rest[0]} (drag your image here; delete this line if none)` } }] } });
  }
  return out;
}

async function appendChildren(pageId, content) {
  return api(`https://api.notion.com/v1/blocks/${pageId}/children`, {
    method: "PATCH", headers: H,
    body: JSON.stringify({ children: blocks(content) }),
  });
}

const website = await createPage(PARENT, "🌐 Websites — wireframes", "🌐");
await appendChildren(website.id, [
  ["h1", "Website wireframes"],
  ["p", "One page per website. Each section below mirrors a section on the live site. Edit the copy directly; drag images onto the 🖼️ IMAGE SLOT blocks. A sync script reads these blocks back into the code."],
  ["d"],
]);

// ── Mindcast ────────────────────────────────────────────────────────────────
const mc = await createPage(website.id, "Mindcast — mindcast.co.nz", "📻");

const home = await createPage(mc.id, "Home", "🏠");
await appendChildren(home.id, [
  ["h1", "Home"],
  ["img", "hero — full-width navy/ivory, wordmark + broadcast/ripple device"],
  ["h2", "Headline"],
  ["p", "Mindcast exists to close the gap between knowing and doing."],
  ["h2", "Subcopy"],
  ["p", "A weekly facilitated gathering where ordinary people become more themselves — together, every week, for as long as they want to keep coming."],
  ["d"],
  ["h2", "The method"],
  ["q", "Notice it. Name it. Do it."],
  ["p", "UNCONSCIOUS → CONSCIOUS → CHANGED"],
  ["d"],
  ["h2", "The rhythm"],
  ["h3", "Sunday · The Gathering"],
  ["p", "Every session begins the same way — we return to the intention you set seven days ago. Did you do it? What got in the way? No shame, just honest data."],
  ["h3", "In the Rooms"],
  ["p", "Adults, teens and kids move into their own rooms and work the same theme in parallel — live facilitation, workbook prompts, real conversation."],
  ["h3", "Before You Leave"],
  ["p", "You write down one specific thing you'll do this week. It goes in your workbook, and it comes back with you next Sunday."],
  ["img", "rooms — three tracks side by side (Adults / Teens / Children)"],
  ["d"],
  ["h2", "Tracks"],
  ["b", "Adults — the same theme, worked deeply"],
  ["b", "Teens — their own room, their own journal (private, even from parents)"],
  ["b", "Children — picture book, game and colouring that goes home on the fridge"],
  ["d"],
  ["h2", "What Mindcast is not"],
  ["b", "Not therapy, medicine, a church or a guru-led teaching"],
  ["b", "No pressure, no scarcity, no guilt — ever"],
]);

const membership = await createPage(mc.id, "Membership", "💳");
await appendChildren(membership.id, [
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
]);

const about = await createPage(mc.id, "About", "📖");
await appendChildren(about.id, [
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
]);

console.log("website hub:", website.id);
console.log("mindcast:", mc.id);
console.log("pages: home", home.id, "| membership", membership.id, "| about", about.id);
