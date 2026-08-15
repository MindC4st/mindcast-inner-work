// The operations handbook — single source for /admin/handbook (screen) and
// its printable form (browser print → PDF; same source, no second copy).
//
// Written for a nervous volunteer on their second Sunday. Short numbered
// steps. Every failure mode has a stated fallback. If a step needs a login,
// a cable or a password, it says so before you're standing in front of it.

export type HandbookSection = {
  id: string;
  title: string;
  steps: string[];
  fallback?: string;
};

export type HandbookPart = {
  id: string;
  title: string;
  intro: string;
  sections: HandbookSection[];
};

export const HANDBOOK: HandbookPart[] = [
  {
    id: "admin",
    title: "ADMIN HANDBOOK — RUNNING A SUNDAY",
    intro:
      "This is everything the door and desk need, in the order the afternoon happens. You cannot break anything by reading the screen slowly. When technology fails, the paper fallback runs the room — enter it into the system afterwards, and the day still counts.",
    sections: [
      {
        id: "pre-session",
        title: "1 · Before people arrive (45 minutes out)",
        steps: [
          "Unlock, lights on, chairs set. Two safety-checked adults minimum in any room that will hold children — check the roster at /admin before anything else.",
          "Turn on the door tablet. Sign in with your own staff account (never a shared login). Open /admin/scan.",
          "Turn on each room's projector or TV. On the room device open /display/wall?room=adult, ?room=teen and ?room=kids respectively, and tap the fullscreen icon.",
          "Check the kids' and teens' walls are NOT visible from the street or through a window. Move the screen, not the rule.",
          "Print one blank roll per room from /facilitate/roll/child and /facilitate/roll/teen (the print button, top right). Put them on a clipboard at the door. That's the paper fallback — you'll probably never need it, and the day you do, you'll be glad.",
        ],
        fallback:
          "No wifi at setup? Everything below still works: scanning queues locally and syncs later. Run the room; reconcile after.",
      },
      {
        id: "door",
        title: "2 · The door — scanning people in",
        steps: [
          "Members: they tap their bracelet or show their QR pass. The screen shows their name, membership state in a word and colour, and their household.",
          "Tick who actually came, then ADMIT. Children you admit become 'expected' on their room's roll automatically.",
          "GREEN / ACTIVE — wave them through warmly.",
          "AMBER / EXPIRING — let them in; mention nothing at the door. The desk follows up in the week.",
          "RED / LAPSED — let them in tonight, quietly flag to the session lead afterwards. Nobody is ever turned away at the door in front of the room.",
          "Unrecognised bracelet: ask their name, admit manually from the member list, note it for the desk. Never block entry on a technical failure.",
        ],
        fallback:
          "Scanner dead? Paper: write names and time-in on the printed roll, tick children against their room, enter it all at /admin/scan afterwards.",
      },
      {
        id: "trial",
        title: "3 · Trial passes",
        steps: [
          "A trial guest shows a QR pass from their email (or reads out the short code under it — type it into the scanner's code box).",
          "The screen says exactly one of: VALID / ALREADY USED / EXPIRED / WRONG DATE. Each is unmistakable; believe the screen, not the ticket.",
          "VALID — admit. They appear on the welcome wall like anyone else. Nobody in the room can tell they're on a pass, and it stays that way.",
          "ALREADY USED — this usually means a shared screenshot. Be kind: 'these are one-per-person — let me get you set up with your own' → issue a new pass from /admin if appropriate, or take their details for the desk.",
          "Under-18 trial guests need guardian consent recorded on the ticket. If the screen says consent is missing, a parent present at the door can give it there; otherwise the young person waits with the parent in the adult room.",
          "To issue a pass: /admin → Members → Issue trial pass, or point them at mindcast.co.nz/try on their own phone.",
        ],
        fallback:
          "Ticket won't scan and won't type? Take their name and email on paper, admit them, and reconcile with the desk after the session.",
      },
      {
        id: "rooms",
        title: "4 · Kids and teens rooms — the roll",
        steps: [
          "Each room facilitator opens /facilitate/roll/child or /facilitate/roll/teen on their own phone before the session starts.",
          "Every child a parent signed in at the door is listed. Tap HERE as each child physically arrives in the room.",
          "The red section at the top — 'SIGNED IN AT THE DOOR, NOT IN THE ROOM' — is the one that matters. A name there means a child is between the door and the room. Resolve every one before starting: find the child, or sign them out to the parent they're with.",
          "If the staffing banner appears (too many children for the adults present), get another safety-checked adult before starting, then acknowledge the banner.",
          "During the session, every departure needs a reason and a person — the screen will not let you record 'left early' and nothing else. Collectors must already be on the child's authorised list; you cannot add one at the door.",
          "'Stepped out briefly' starts a 10-minute timer. If it expires, the adult room's device is alerted automatically — go find the child now, not at pack-down.",
          "At the end: CLOSE ROOM. It will refuse while any child is unaccounted for, and it lists the parent's name and phone for each. The room is not closed until it closes.",
        ],
        fallback:
          "Phone dead or app down? The printed roll is the roll. Mark present/out with times and who-with in pen, keep it in your hand, enter it afterwards. The rules don't change on paper: reason and person for every departure.",
      },
      {
        id: "wall",
        title: "5 · Welcome walls",
        steps: [
          "Names appear automatically as people are admitted. There is nothing to operate.",
          "If a parent asks why their child's name doesn't appear: that's consent — it's only projected when the guardian has agreed. They can change it in the portal; it takes effect on the next scan.",
          "If someone asks to be taken off the wall: portal → settings → wall display, or the desk can set it. Effective next scan; apologise, don't debug at the door.",
        ],
        fallback: "Wall frozen? Refresh the browser tab. The room works fine without it.",
      },
      {
        id: "desk",
        title: "6 · The desk — membership, moderation, documents",
        steps: [
          "Membership questions after the session, never at the door. /admin → Members shows status, household and billing state.",
          "Concession requests appear in /admin → Members with no reason attached — there isn't one, we never ask. Approve by applying the concession rate in Stripe; the member is never labelled anywhere.",
          "Moderation queue: anything members submit for the shared screen waits in /admin → Sessions → Moderation until a human approves it. Nothing goes on a wall unmoderated.",
          "Assigning training or documents: /admin → Staff training → Documents. Assign, and the staff member reads and acknowledges in their own portal; versions and signatures are tracked for you.",
          "Concerns about a child or member conduct: do not investigate at the desk. Record what you saw, tell the Safeguarding Lead tonight, and log it — MC-SAF-002 has the escalation path.",
        ],
      },
      {
        id: "failure",
        title: "7 · When systems fail",
        steps: [
          "Wifi down: keep going. Scans and rolls queue on-device and sync when it returns. The '# TO SYNC' badge tells you it's working.",
          "Tablet dies: any staff phone can run /admin/scan. Sign in as yourself.",
          "Projector dies: the session runs from the facilitator's own screen. The wall is a nicety, not a dependency.",
          "Whole platform down: paper roll, paper sign-in list, run the session. Enter everything the same evening while memories are fresh.",
          "Anything involving a child's whereabouts is never 'log it tomorrow'. Resolve it in person, then record it tonight.",
        ],
      },
    ],
  },
  {
    id: "facilitator",
    title: "FACILITATOR GUIDE — THE SLIDES AND THE ROOM",
    intro:
      "You are not performing and you are not a therapist. You're the person who keeps the room safe, keeps it moving, and lets the material do its work. The system is built so that the tech takes about four taps a night.",
    sections: [
      {
        id: "load-week",
        title: "1 · Loading the week",
        steps: [
          "Open /admin → Facilitate on the room device or your laptop.",
          "The current week is selected for you (it follows the programme schedule). Tap PRESENT to open the Facilitator View.",
          "Check the first slide shows this week's title and the right track (Adult / Teen / Kids). If it doesn't, you're on the wrong week — pick it from the list, don't improvise.",
        ],
        fallback:
          "No video? The session works without it: the slide shows the questions, and the talking is the session. Say 'we'll watch it next week' and move on — never fight a buffering screen in front of a room.",
      },
      {
        id: "flow",
        title: "2 · Session flow and timings (75 minutes)",
        steps: [
          "Arrivals and welcome wall — 10 min. Let people land; nobody reflects while finding a chair.",
          "Opening hook and video — 15 min. Play it once. Don't re-explain it; the questions do that.",
          "Reflective questions — 25 min. Two questions, on screen, one at a time. Silence is fine; sixty seconds of it is normal and you don't need to fill it.",
          "Activity or discussion — 15 min. As written on the slide. If the room is deep in real talk, the activity is optional — follow the room.",
          "Weekly practice and affirmation — 10 min. Everyone leaves with one specific thing they'll do. That's the product; never skip it to run long on discussion.",
        ],
      },
      {
        id: "distress",
        title: "3 · Distress in the room",
        steps: [
          "Someone tearful or shaky but present: acknowledge quietly ('take your time — you're all right here'), keep the room moving. Do not stop the session to process one person publicly.",
          "Someone needs out: a co-facilitator or safety adult goes with them. Never send a distressed person out alone; never leave the room without an adult either.",
          "Disclosure of harm, self-harm or suicide risk: stop being a facilitator, be a human. Listen, don't promise secrecy, don't interrogate. Tell them you'll connect them with the right person tonight.",
          "Then: Safeguarding Lead immediately — in person if in the building, by phone if not. This is a tonight conversation, never an email.",
          "If someone is in immediate danger: 111 first, Safeguarding Lead second, paperwork last.",
          "The escalation path, contacts and scripts live in MC-SAF-002 (portal → documents). Read it before your first Sunday, not during an incident.",
        ],
      },
      {
        id: "stop",
        title: "4 · When to stop the session",
        steps: [
          "Stop for: a medical event, a credible threat, a child unaccounted for, an evacuation, or a disclosure that cannot wait.",
          "Stopping looks calm: 'We're going to pause here tonight — thanks for what you brought.' No explanations from the front.",
          "A child unaccounted for outranks everything: the roll's alert reaches the adult room device; the parent is told in person, quietly, by you or the session lead.",
          "You will not be criticised for stopping a session. Ever. The only wrong call is pushing through.",
        ],
      },
      {
        id: "who-to-call",
        title: "5 · Who to call",
        steps: [
          "Immediate danger — 111.",
          "Safeguarding Lead on duty — named on the roster at /admin, with phone. This is your first call for anything involving a child or a disclosure.",
          "Session lead / admin on duty — venue, tech, people problems.",
          "Need support yourself after a hard night — say so to the session lead before you drive home. Debriefs are normal here, not weakness.",
        ],
      },
    ],
  },
];
