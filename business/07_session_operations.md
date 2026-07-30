# 07 · Session Operations — Running the Room

*Written from the perspective of a youth-work / venue operations lead. These are
the on-the-ground procedures for a live Sunday session: devices, movement in and
out of the room, and keeping parents informed. Have the safeguarding elements
reviewed alongside [L3](legal/03_safeguarding_ethics_anticult.md) and your insurer.*

---

## 1. Phones in the room

### Teens — phones go in the lockers
**Teen sessions are phone-free.** Teens do not bring cellphones into the room.
Lockers are provided at the door; each teen locks their phone away and carries
the key on their wrist as a bracelet for the session.

This is not a discipline measure, and we say so out loud. There are three
reasons, and they are all about the young person:

- **Safety and trust.** A phone-free room is a room where **nobody can be
  recorded**. Teens will not open up about what is actually going on for them if
  there is any chance it ends up on someone's camera roll or in a group chat.
  Removing the devices removes the fear, and what is said in the room genuinely
  stays in the room.
- **Working their own brains.** The session asks them to think, imagine, create
  and problem-solve. When a phone is within reach, that work gets outsourced —
  to a search bar, to an AI, to whatever is on the feed. We want them building
  their own thinking, in their own words, at their own pace.
- **Coming back to themselves.** Away from notifications, comparison and other
  people's opinions, a teen can hear what they actually think and what actually
  matters to them. That reconnection to their authentic self is the whole point
  of the hour — and it cannot happen through a screen.

**How it runs in practice:**
- Lockers sit at the teen entrance; a host is on the door for the first 10
  minutes and again at the close.
- Teen phone → locker → **key on the wrist** (bracelet-style, so it cannot be
  put down and lost).
- Emergencies are covered: a **facilitator's phone stays in the room**, and any
  parent who needs to reach their teen mid-session calls the session line and we
  fetch them. No teen is ever unreachable in a real emergency — the parent route
  simply goes through an adult.
- Genuine exceptions (a medical device, an app-managed condition, an
  arrangement made in advance) are approved quietly by the facilitator. We do
  not make a young person explain a medical need in front of the room.
- **Teen reflections are captured on paper** in their workbook, not in the app,
  during the session. They can add to their private journal in the app later at
  home if they choose.

### Adults — phones stay with them and are used
**Adult sessions are the opposite: phones are actively part of the experience.**
Adults use their phone to check in, join the session code, answer the reflective
question, take part in the live activity (word cloud, poll, Q&A), and write their
weekly intention before they leave. We ask only that phones stay on silent and
are used for the session rather than through it.

### Children — no devices
Children do not use devices in their sessions. The children's track runs on
story, conversation, movement and the colouring/workbook pages. A parent or
guardian accesses any digital kids content on their behalf.

---

## 2. Leaving the room mid-session

People are allowed to leave. Nobody is ever prevented, guilted or blocked — that
is a core promise in the [Anti-Cult Charter](legal/03_safeguarding_ethics_anticult.md).
What differs by age is **who gets told and who takes responsibility**.

### A child wants to leave
1. A helper goes with the child — **a child is never left alone** and never
   leaves the building unaccompanied.
2. The helper stays with them in a visible, supervised space (foyer or quiet
   corner), and settles them if it is simply a wobble. Many children return
   happily after a few minutes.
3. If they do not want to return, the helper **texts the parent/guardian
   immediately** and the child **waits with the helper until collected**.
4. The child is only released to the parent/guardian, or to a person previously
   named on their household record.
5. Log it: time out, reason (if known), who was notified, time collected.

### A teen wants to leave
Teens are given **autonomy** — they may step out or leave. What we guarantee is
that **the parent always knows where they are**.

1. The teen tells a facilitator or host they are leaving (we ask, we do not
   demand a reason).
2. They collect their phone from the locker on the way out.
3. The facilitator marks them **left early** in the app, which **notifies the
   linked adult automatically** (see §3).
4. If the teen is **being collected**, they wait in the supervised foyer, same
   as a child.
5. If the teen normally **makes their own way home** (per their household
   record), they are free to go — the notification is what keeps the parent
   informed.
6. If anything about the departure concerns us — distress, a safety worry,
   someone waiting outside — we do **not** simply let them walk. We stay with
   them and call the parent directly.

> **The principle:** a teen gets to make their own decision; a parent gets to
> know where their young person is. Those two things are not in conflict, and
> saying so out loud at intake is what makes the policy land well with both.

### An adult wants to leave
They leave. No notification, no follow-up required. A host may quietly check
they are alright on the way out.

---

## 3. Attendance notifications to a linked adult

Every child and teen profile is linked to an adult (guardian) in their household.
Attendance events send that adult a short message, so parents always know their
young person's whereabouts without having to ask.

**The three messages:**

| Event | When it fires | Message |
|---|---|---|
| **Present** | On check-in (NFC bracelet tap or kiosk) | *"[Name] marked present at Mindcast today, 9:58am."* |
| **Absent** | Shortly after the session starts, if no check-in | *"[Name] was not marked present at Mindcast today."* |
| **Left early** | When a facilitator marks them out | *"[Name] left the Mindcast session early at 10:42am."* |

**Rules that make this work:**
- Notifications go to the **linked guardian(s)** on the household record — never
  to anyone else, and never to the room.
- **Only for under-18s** (child + teen tracks). Adults are not tracked or
  reported on.
- The **absent** message is deliberately neutral in tone: it states a fact, it
  does not accuse. Many absences are ordinary.
- Message content is **attendance only** — never what the young person said,
  wrote, or reflected on. Journals stay private, including from parents of
  teens (a linked guardian can read a child's journal; that is a separate,
  explicit setting).
- Parents can see the same record in the portal, so a missed text is not a
  problem.
- Delivery is SMS-first (parents read texts), with email fallback.

**Technical note — this is built.** Arrival fires from the NFC check-in; a
member is marked out by scanning the same bracelet at the kiosk in *Leaving
early* mode (they're collecting their phone there anyway); the absence sweep runs
on demand. Every message is logged for audit, and a guardian can see the record
in the portal. Two setup steps remain: add an **SMS account** (Twilio env vars —
until then messages are logged as *skipped*, so you can rehearse the whole flow
for free) and **schedule the absence sweep** ~20–30 min after the session starts.
Guardians need a phone number on their profile. Budget a few cents per message in
[02](02_financial_forecast.md).

---

## 4. Door and room routine (the weekly rhythm)

**Before (30 min):** venue open, AV + big screen tested, session code up,
lockers unlocked and ready, NFC kiosk live, workbooks and handouts on the table,
helpers briefed on today's activity.

**Arrival (15 min):** hosts greet by name; **adults** tap in on the NFC kiosk;
**teens** lock phones and take a wrist key, then tap in; **children** are signed
in by their adult. Names appear on the welcome wall as people arrive.

**During:** facilitator runs the deck; a host stays near the door for late
arrivals and anyone stepping out; the moderator approves anything going on
screen.

**Close:** members write their weekly intention before they leave; teens collect
phones from the lockers; helpers do a room sweep; attendance is finalised (any
*left early* marks confirmed).

**After (15 min):** facilitator debrief — what landed, what did not, anything to
follow up pastorally, anything to flag to the Safeguarding Lead.

---

## 5. What to say at intake (so none of this is a surprise)
Put these in the welcome pack and say them at the first session:
- *"Teen sessions are phone-free — here's why, and here's how a parent reaches
  you in an emergency."*
- *"You can leave at any time. If you're under 18, we'll let your parent know
  you've left — that's the only condition."*
- *"Parents get a text when your young person arrives, if they don't, and if they
  leave early. We never share what anyone says in the room."*

## Decisions to confirm
- Locker supplier + number of lockers (match expected teen numbers, plus spares).
- The **session line** number a parent calls to reach a teen mid-session.
- SMS provider + who pays for messages (see [02](02_financial_forecast.md)).
- How long after start the **absent** sweep runs (suggest 20–30 min).
- Whether teen guardians can opt out of the present/absent texts once a teen is
  16+ (worth offering — it respects growing independence).
