# 10 · Video Sourcing Worklist — Removing All Reuse

*Every week should have its own video. This is the exact list of weeks that
currently share one, with a search brief for each, plus how to verify before it
goes near a room.*

> **Why this list exists rather than a set of replacement URLs:** YouTube is
> blocked from the environment these docs were generated in, so no candidate URL
> could be checked. A YouTube ID is an opaque 11-character string — an unverified
> one is not merely a dead link, it can silently resolve to a **completely
> different video**. On the children's track that is a safeguarding incident, not
> a typo. So: briefs and a verifier here, sourcing done where the links can
> actually be opened.

## How to work through it
1. Pick a week below, search with the brief, and **watch enough to be sure**.
2. Paste the URL into the lesson editor: **`/mindcast-live/edit/<week>`** → the
   **Video** slide → the track you're editing. It saves straight to the session.
3. When a batch is done, run the verifier:
   ```
   node scripts/verify-video-urls.mjs           # all tracks
   node scripts/verify-video-urls.mjs child     # one track
   ```
   It confirms each video **exists and is embeddable**, prints its **real title and
   channel** (so you can catch a wrong-but-valid ID), and fails if any reuse
   remains. Exit code is non-zero on problems, so it can gate a deploy.
4. Only keep videos from an **official/authorised channel** — the creator's own,
   TED, RSA, a publisher. Re-uploads are a copyright problem
   (see [IP review](legal/05_ip_review_52_weeks.md)).


---

## Adult track — 13 new videos needed

*What to look for:* 12–20 min talk (TED / RSA / creator's own channel). Evidence, a how-to, or a personal story that lands the theme.

**`sPOuCd6cBao`** is used by 5 weeks — keep it on **wk13 (Integration — What We Now See)**, replace the rest:

- [ ] **Week 26 — Integration — What We Have Released**
  - *Theme:* Thirteen weeks of unlearning. Phase 2 closes with integration — taking stock of what has been released, what has been rewired, and what you're carryin…
  - *Search:* `Integration — What We Have Released` + terms from the theme; 12–20 min talk (ted / rsa / creator's own channel)
  - *Edit at:* `/mindcast-live/edit/26` → Video slide → Adult

- [ ] **Week 39 — Integration — Who You Are Becoming**
  - *Theme:* Thirteen weeks of rebuilding. Phase 3 closes with integration — taking stock of the identity that has been constructed, the habits that have been plan…
  - *Search:* `Integration — Who You Are Becoming` + terms from the theme; 12–20 min talk (ted / rsa / creator's own channel)
  - *Edit at:* `/mindcast-live/edit/39` → Video slide → Adult

- [ ] **Week 51 — The Ongoing Practice — There Is No Arrival**
  - *Theme:* There is no arrival. Not in Week 52, not in five years, not ever. The inner work is not a problem to be solved and a destination to be reached. It is …
  - *Search:* `The Ongoing Practice — There Is No Arrival` + terms from the theme; 12–20 min talk (ted / rsa / creator's own channel)
  - *Edit at:* `/mindcast-live/edit/51` → Video slide → Adult

- [ ] **Week 52 — Integration — A Year of Becoming**
  - *Theme:* Fifty-two weeks. Four phases. One year of genuine inner work — seeing clearly, unlearning what no longer serves, rebuilding from values, and living it…
  - *Search:* `Integration — A Year of Becoming` + terms from the theme; 12–20 min talk (ted / rsa / creator's own channel)
  - *Edit at:* `/mindcast-live/edit/52` → Video slide → Adult

**`iCvmsMzlF7o`** is used by 4 weeks — keep it on **wk10 (The Masks We Wear)**, replace the rest:

- [ ] **Week 20 — Unlearning Scarcity — There Is Enough**
  - *Theme:* Scarcity thinking is one of the most pervasive and unexamined belief systems in contemporary life. It runs in the background of most decisions — there…
  - *Search:* `Unlearning Scarcity — There Is Enough` + terms from the theme; 12–20 min talk (ted / rsa / creator's own channel)
  - *Edit at:* `/mindcast-live/edit/20` → Video slide → Adult

- [ ] **Week 22 — Setting Down the Armour**
  - *Theme:* We all developed protective mechanisms — ways of keeping ourselves safe from vulnerability, hurt, and rejection. Those mechanisms were often necessary…
  - *Search:* `Setting Down the Armour` + terms from the theme; 12–20 min talk (ted / rsa / creator's own channel)
  - *Edit at:* `/mindcast-live/edit/22` → Video slide → Adult

- [ ] **Week 42 — The Courage to Be Seen**
  - *Theme:* Living It — Phase 4 — requires something that all the inner work has been building toward: the courage to be genuinely seen. Not the performance of au…
  - *Search:* `The Courage to Be Seen` + terms from the theme; 12–20 min talk (ted / rsa / creator's own channel)
  - *Edit at:* `/mindcast-live/edit/42` → Video slide → Adult

**`lmyZMtPVodo`** is used by 2 weeks — keep it on **wk1 (The Signal and the Noise)**, replace the rest:

- [ ] **Week 40 — From Self-Development to Service**
  - *Theme:* Three phases of inner work — seeing, unlearning, rebuilding — have been preparation for this: the turn outward. Phase 4 is not about more self-develop…
  - *Search:* `From Self-Development to Service` + terms from the theme; 12–20 min talk (ted / rsa / creator's own channel)
  - *Edit at:* `/mindcast-live/edit/40` → Video slide → Adult

**`D9Ihs241zeg`** is used by 2 weeks — keep it on **wk2 (The Stories We Carry)**, replace the rest:

- [ ] **Week 25 — The Stories That No Longer Serve**
  - *Theme:* In Phase 1 we identified the stories we carry. Now, in the final weeks of Phase 2, we do the unlearning. Not all stories can be released immediately —…
  - *Search:* `The Stories That No Longer Serve` + terms from the theme; 12–20 min talk (ted / rsa / creator's own channel)
  - *Edit at:* `/mindcast-live/edit/25` → Video slide → Adult

**`IvtZBUSplr4`** is used by 2 weeks — keep it on **wk7 (The Inner Critic)**, replace the rest:

- [ ] **Week 17 — Forgiving Yourself**
  - *Theme:* For many people, forgiving others is difficult — but forgiving themselves is nearly impossible. We hold ourselves to a standard of perfection that we …
  - *Search:* `Forgiving Yourself` + terms from the theme; 12–20 min talk (ted / rsa / creator's own channel)
  - *Edit at:* `/mindcast-live/edit/17` → Video slide → Adult

**`iG9CE55wbtY`** is used by 2 weeks — keep it on **wk14 (The Permission You're Still Waiting For)**, replace the rest:

- [ ] **Week 27 — Who Are You Now? — Rebuilding Identity**
  - *Theme:* Having released much of what was inherited, imposed, or outdated in Phase 2, the question that opens Phase 3 is genuinely new: who are you now? Not th…
  - *Search:* `Who Are You Now? — Rebuilding Identity` + terms from the theme; 12–20 min talk (ted / rsa / creator's own channel)
  - *Edit at:* `/mindcast-live/edit/27` → Video slide → Adult

**`NiuDFBNDoSk`** is used by 2 weeks — keep it on **wk15 (Letting Go of Who You Were Supposed to Be)**, replace the rest:

- [ ] **Week 32 — How You Speak to Yourself**
  - *Theme:* In Phase 1 we identified the inner critic. In Phase 2 we built the inner coach. In Phase 3 we practise the daily language — the specific quality of in…
  - *Search:* `How You Speak to Yourself` + terms from the theme; 12–20 min talk (ted / rsa / creator's own channel)
  - *Edit at:* `/mindcast-live/edit/32` → Video slide → Adult

**`jHeeHg_MXNE`** is used by 2 weeks — keep it on **wk28 (What Do You Actually Value?)**, replace the rest:

- [ ] **Week 43 — Living Your Values Under Pressure**
  - *Theme:* Values are easy to hold in quiet moments. The test is whether they hold under pressure — when it costs something to live them, when the easier path is…
  - *Search:* `Living Your Values Under Pressure` + terms from the theme; 12–20 min talk (ted / rsa / creator's own channel)
  - *Edit at:* `/mindcast-live/edit/43` → Video slide → Adult


---

## Teen track — 13 new videos needed

*What to look for:* 5–12 min, energetic, teen-facing voice. Avoid lecture tone; creators teens already watch work best.

**`W1eYrhGeffc`** is used by 3 weeks — keep it on **wk12 (The Habit Loop — How We Got Here)**, replace the rest:

- [ ] **Week 27 — Who Are You Now? — Rebuilding Identity**
  - *Theme:* After two phases of looking honestly at what you've absorbed and what you're releasing, we arrive at the most important question of Phase 3: who are Y…
  - *Search:* `Who Are You Now? — Rebuilding Identity` + terms from the theme; 5–12 min, energetic, teen-facing voice
  - *Edit at:* `/mindcast-live/edit/27` → Video slide → Teen

- [ ] **Week 29 — The Habits That Build You**
  - *Theme:* We mapped habits in Phase 1 and cleared some in Phase 2. Now we build the ones that actually express who you're choosing to be. Not willpower-based ha…
  - *Search:* `The Habits That Build You` + terms from the theme; 5–12 min, energetic, teen-facing voice
  - *Edit at:* `/mindcast-live/edit/29` → Video slide → Teen

**`jqONINYF17M`** is used by 3 weeks — keep it on **wk13 (Integration — What We Now See)**, replace the rest:

- [ ] **Week 26 — Integration — What We Have Released**
  - *Theme:* Thirteen weeks of unlearning. Today we close Phase 2 by taking stock of what you've actually released — not what you've fixed, but what you've set dow…
  - *Search:* `Integration — What We Have Released` + terms from the theme; 5–12 min, energetic, teen-facing voice
  - *Edit at:* `/mindcast-live/edit/26` → Video slide → Teen

- [ ] **Week 39 — Integration — Who You Are Becoming**
  - *Theme:* Thirteen weeks of rebuilding. Today we close Phase 3 by naming what has actually been built — not what you've fixed or resolved, but what is genuinely…
  - *Search:* `Integration — Who You Are Becoming` + terms from the theme; 5–12 min, energetic, teen-facing voice
  - *Edit at:* `/mindcast-live/edit/39` → Video slide → Teen

**`RcGyVTAoXEU`** is used by 2 weeks — keep it on **wk1 (The Signal and the Noise)**, replace the rest:

- [ ] **Week 3 — The Pattern Interrupt**
  - *Theme:* You know those moments where you react to something and immediately think 'why did I do that'? That's the pattern. Today we figure out what's actually…
  - *Search:* `The Pattern Interrupt` + terms from the theme; 5–12 min, energetic, teen-facing voice
  - *Edit at:* `/mindcast-live/edit/3` → Video slide → Teen

**`pN34FNbOKXc`** is used by 2 weeks — keep it on **wk2 (The Stories We Carry)**, replace the rest:

- [ ] **Week 18 — Rewiring the Critic — Building the Inner Coach**
  - *Theme:* Last time we met the inner critic. Now we do something with it. Not silence it forever — but replace it with something way more useful: a voice that's…
  - *Search:* `Rewiring the Critic — Building the Inner Coach` + terms from the theme; 5–12 min, energetic, teen-facing voice
  - *Edit at:* `/mindcast-live/edit/18` → Video slide → Teen

**`IvtZBUSplr4`** is used by 2 weeks — keep it on **wk7 (The Inner Critic)**, replace the rest:

- [ ] **Week 17 — Forgiving Yourself**
  - *Theme:* You know all those mistakes, embarrassments, and bad calls you keep replaying — especially at 2am? This week we talk about why being permanently hard …
  - *Search:* `Forgiving Yourself` + terms from the theme; 5–12 min, energetic, teen-facing voice
  - *Edit at:* `/mindcast-live/edit/17` → Video slide → Teen

**`cDDWvj_q-o8`** is used by 2 weeks — keep it on **wk11 (Seeing Others Clearly)**, replace the rest:

- [ ] **Week 48 — Leaving People Better Than You Found Them**
  - *Theme:* Here is one of the simplest and most powerful practices available to you: leave people slightly better than you found them. Not dramatically — not fix…
  - *Search:* `Leaving People Better Than You Found Them` + terms from the theme; 5–12 min, energetic, teen-facing voice
  - *Edit at:* `/mindcast-live/edit/48` → Video slide → Teen

**`NiuDFBNDoSk`** is used by 2 weeks — keep it on **wk15 (Letting Go of Who You Were Supposed to Be)**, replace the rest:

- [ ] **Week 32 — How You Speak to Yourself**
  - *Theme:* The voice in your head is the one you'll hear more than any other person's voice in your entire life. What quality is it? What does it say on a hard d…
  - *Search:* `How You Speak to Yourself` + terms from the theme; 5–12 min, energetic, teen-facing voice
  - *Edit at:* `/mindcast-live/edit/32` → Video slide → Teen

**`iCvmsMzlF7o`** is used by 2 weeks — keep it on **wk22 (Setting Down the Armour)**, replace the rest:

- [ ] **Week 42 — The Courage to Be Seen**
  - *Theme:* All this inner work — all the honesty and growth and becoming — only matters when it shows up in how you actually live. Phase 4 is about the courage t…
  - *Search:* `The Courage to Be Seen` + terms from the theme; 5–12 min, energetic, teen-facing voice
  - *Edit at:* `/mindcast-live/edit/42` → Video slide → Teen

**`jHeeHg_MXNE`** is used by 2 weeks — keep it on **wk28 (What Do You Actually Value?)**, replace the rest:

- [ ] **Week 43 — Living Your Values Under Pressure**
  - *Theme:* Values are easy when everything is fine. The real test is whether they hold when something costs you — when your friends expect something different, w…
  - *Search:* `Living Your Values Under Pressure` + terms from the theme; 5–12 min, energetic, teen-facing voice
  - *Edit at:* `/mindcast-live/edit/43` → Video slide → Teen

**`WPPPFqsECz0`** is used by 2 weeks — keep it on **wk35 (Creativity and Expression)**, replace the rest:

- [ ] **Week 50 — Gratitude as a Practice, Not a Feeling**
  - *Theme:* Gratitude is not a feeling you get when good things happen. It is a deliberate practice — choosing to notice and name what is already present and valu…
  - *Search:* `Gratitude as a Practice, Not a Feeling` + terms from the theme; 5–12 min, energetic, teen-facing voice
  - *Edit at:* `/mindcast-live/edit/50` → Video slide → Teen

**`sPOuCd6cBao`** is used by 2 weeks — keep it on **wk51 (The Ongoing Practice — There Is No Arrival)**, replace the rest:

- [ ] **Week 52 — Integration — A Year of Becoming**
  - *Theme:* Fifty-two weeks. A whole year. You've seen yourself clearly, released what wasn't yours, built something real, and started living it outward. Today we…
  - *Search:* `Integration — A Year of Becoming` + terms from the theme; 5–12 min, energetic, teen-facing voice
  - *Edit at:* `/mindcast-live/edit/52` → Video slide → Teen


---

## Child track — 32 new videos needed

*What to look for:* 3–6 min, animated or story-led, gentle. Read-alouds of the week's picture book are ideal.

**`9_1Rt1R4xbM`** is used by 6 weeks — keep it on **wk11 (Seeing Others Clearly)**, replace the rest:

- [ ] **Week 21 — The Relationships That Shaped You**
  - *Theme:* All the people in our lives — family, friends, teachers — teach us things about what being close to someone feels like. Some of those things are wonde…
  - *Search:* `The Relationships That Shaped You` + terms from the theme; 3–6 min, animated or story-led, gentle
  - *Edit at:* `/mindcast-live/edit/21` → Video slide → Child

- [ ] **Week 31 — The People You Choose**
  - *Theme:* The people we spend time with help shape who we become — because we learn from them, we pick up their habits and feelings, and we become more ourselve…
  - *Search:* `The People You Choose` + terms from the theme; 3–6 min, animated or story-led, gentle
  - *Edit at:* `/mindcast-live/edit/31` → Video slide → Child

- [ ] **Week 36 — Purpose — What You're Here For**
  - *Theme:* Every person has gifts — things they're naturally good at, things they love, and ways they can help others. When we use our gifts to help and contribu…
  - *Search:* `Purpose — What You're Here For` + terms from the theme; 3–6 min, animated or story-led, gentle
  - *Edit at:* `/mindcast-live/edit/36` → Video slide → Child

- [ ] **Week 44 — Conflict as a Growth Practice**
  - *Theme:* Sometimes we disagree with people — friends, family, classmates. That's completely normal! Today we learn that disagreements don't have to break frien…
  - *Search:* `Conflict as a Growth Practice` + terms from the theme; 3–6 min, animated or story-led, gentle
  - *Edit at:* `/mindcast-live/edit/44` → Video slide → Child

- [ ] **Week 48 — Leaving People Better Than You Found Them**
  - *Theme:* One of the most wonderful things you can do is make people feel better just by being with them. Not by saying the perfect thing or doing something big…
  - *Search:* `Leaving People Better Than You Found Them` + terms from the theme; 3–6 min, animated or story-led, gentle
  - *Edit at:* `/mindcast-live/edit/48` → Video slide → Child

**`VWOgrMXBE4U`** is used by 5 weeks — keep it on **wk13 (Integration — What We Now See)**, replace the rest:

- [ ] **Week 26 — Integration — What We Have Released**
  - *Theme:* We've been on the second part of our big adventure — learning how to put down some heavy things, say sorry properly, be brave about our fears, and sta…
  - *Search:* `Integration — What We Have Released` + terms from the theme; 3–6 min, animated or story-led, gentle
  - *Edit at:* `/mindcast-live/edit/26` → Video slide → Child

- [ ] **Week 39 — Integration — Who You Are Becoming**
  - *Theme:* We've been building for 13 weeks! Today we celebrate everything we've grown and built — and get ready for the most exciting phase yet: going out into …
  - *Search:* `Integration — Who You Are Becoming` + terms from the theme; 3–6 min, animated or story-led, gentle
  - *Edit at:* `/mindcast-live/edit/39` → Video slide → Child

- [ ] **Week 51 — The Ongoing Practice — There Is No Arrival**
  - *Theme:* Growing up is not something you finish. Every day there are new things to discover, new ways to be kind and brave and curious, new things to learn abo…
  - *Search:* `The Ongoing Practice — There Is No Arrival` + terms from the theme; 3–6 min, animated or story-led, gentle
  - *Edit at:* `/mindcast-live/edit/51` → Video slide → Child

- [ ] **Week 52 — Integration — A Year of Becoming**
  - *Theme:* We've been on an adventure together for a whole year! Today we celebrate everything we've seen, learned, let go of, built, and shared. And then we loo…
  - *Search:* `Integration — A Year of Becoming` + terms from the theme; 3–6 min, animated or story-led, gentle
  - *Edit at:* `/mindcast-live/edit/52` → Video slide → Child

**`rrkrvAUbU9Y`** is used by 5 weeks — keep it on **wk20 (Unlearning Scarcity — There Is Enough)**, replace the rest:

- [ ] **Week 37 — Money, Abundance and Your Relationship With Resources**
  - *Theme:* Money is something that grown-ups think about a lot — and most children hear messages about it without fully understanding them. Today we think about …
  - *Search:* `Money, Abundance and Your Relationship With Resources` + terms from the theme; 3–6 min, animated or story-led, gentle
  - *Edit at:* `/mindcast-live/edit/37` → Video slide → Child

- [ ] **Week 40 — From Self-Development to Service**
  - *Theme:* We've spent all year learning about ourselves — our feelings, our habits, our strengths, and our values. Now comes the most exciting part: using every…
  - *Search:* `From Self-Development to Service` + terms from the theme; 3–6 min, animated or story-led, gentle
  - *Edit at:* `/mindcast-live/edit/40` → Video slide → Child

- [ ] **Week 45 — Generosity as a Way of Being**
  - *Theme:* Generosity means giving something to others — and it doesn't have to be something you buy! Time, kindness, attention, encouragement, help — these are …
  - *Search:* `Generosity as a Way of Being` + terms from the theme; 3–6 min, animated or story-led, gentle
  - *Edit at:* `/mindcast-live/edit/45` → Video slide → Child

- [ ] **Week 46 — Enough — Living From Sufficiency**
  - *Theme:* Today we practise something really important: being happy with what we have, right now — not because we stop wanting to grow and get better, but becau…
  - *Search:* `Enough — Living From Sufficiency` + terms from the theme; 3–6 min, animated or story-led, gentle
  - *Edit at:* `/mindcast-live/edit/46` → Video slide → Child

**`nj2ofrX7jAk`** is used by 4 weeks — keep it on **wk1 (The Signal and the Noise)**, replace the rest:

- [ ] **Week 4 — What Your Body Is Telling You**
  - *Theme:* Our bodies are amazing messengers! They tell us when we're scared, excited, tired, or happy — all with feelings inside our body. Today we learn to lis…
  - *Search:* `What Your Body Is Telling You` + terms from the theme; 3–6 min, animated or story-led, gentle
  - *Edit at:* `/mindcast-live/edit/4` → Video slide → Child

- [ ] **Week 33 — Creating Structure That Serves You**
  - *Theme:* Having a routine — a regular order for how we do things — actually helps us feel safer, calmer, and more able to enjoy the fun parts of our day. Today…
  - *Search:* `Creating Structure That Serves You` + terms from the theme; 3–6 min, animated or story-led, gentle
  - *Edit at:* `/mindcast-live/edit/33` → Video slide → Child

- [ ] **Week 34 — Rest as a Practice, Not a Reward**
  - *Theme:* Rest is not just sleep — it's also the quiet, gentle times when our brain and body get to recover and refuel. Today we learn about the importance of r…
  - *Search:* `Rest as a Practice, Not a Reward` + terms from the theme; 3–6 min, animated or story-led, gentle
  - *Edit at:* `/mindcast-live/edit/34` → Video slide → Child

**`0ZcfX2862XE`** is used by 4 weeks — keep it on **wk5 (The Mirror — How We See Ourselves)**, replace the rest:

- [ ] **Week 7 — The Inner Critic**
  - *Theme:* Sometimes we have a mean little voice in our head that says unkind things about us — like 'you can't do that' or 'you're not good enough.' Today we fi…
  - *Search:* `The Inner Critic` + terms from the theme; 3–6 min, animated or story-led, gentle
  - *Edit at:* `/mindcast-live/edit/7` → Video slide → Child

- [ ] **Week 25 — The Stories That No Longer Serve**
  - *Theme:* Sometimes the things we believe about ourselves are a bit out of date — like a picture of you from when you were really little. The picture might have…
  - *Search:* `The Stories That No Longer Serve` + terms from the theme; 3–6 min, animated or story-led, gentle
  - *Edit at:* `/mindcast-live/edit/25` → Video slide → Child

- [ ] **Week 41 — Teaching What You've Learned**
  - *Theme:* One of the best ways to really know something is to teach it to someone else. Today we practise sharing the things we've learned this year — with our …
  - *Search:* `Teaching What You've Learned` + terms from the theme; 3–6 min, animated or story-led, gentle
  - *Edit at:* `/mindcast-live/edit/41` → Video slide → Child

**`7H2pBdLnmGs`** is used by 4 weeks — keep it on **wk9 (The Wounds We Carry)**, replace the rest:

- [ ] **Week 16 — The Forgiveness Loop**
  - *Theme:* Sometimes people hurt our feelings or do things that aren't fair — and it can be really hard to stop feeling angry or sad about it. Today we talk abou…
  - *Search:* `The Forgiveness Loop` + terms from the theme; 3–6 min, animated or story-led, gentle
  - *Edit at:* `/mindcast-live/edit/16` → Video slide → Child

- [ ] **Week 23 — Grief and Growth — What Endings Make Possible**
  - *Theme:* Sometimes things end or change — friends move away, pets die, families change, things we loved go away. It's completely normal and okay to feel really…
  - *Search:* `Grief and Growth — What Endings Make Possible` + terms from the theme; 3–6 min, animated or story-led, gentle
  - *Edit at:* `/mindcast-live/edit/23` → Video slide → Child

- [ ] **Week 49 — Your Legacy — What You're Building Beyond Yourself**
  - *Theme:* Even at your age, you are leaving something in the world — in how you treat your friends, how you show kindness, what you teach younger children, the …
  - *Search:* `Your Legacy — What You're Building Beyond Yourself` + terms from the theme; 3–6 min, animated or story-led, gentle
  - *Edit at:* `/mindcast-live/edit/49` → Video slide → Child

**`BVAaomgzFCM`** is used by 3 weeks — keep it on **wk3 (The Pattern Interrupt)**, replace the rest:

- [ ] **Week 24 — Rewiring Fear — From Threat to Signal**
  - *Theme:* Everyone feels scared sometimes — and that's completely okay. Fear is actually really useful when it warns us about real danger. But sometimes our fea…
  - *Search:* `Rewiring Fear — From Threat to Signal` + terms from the theme; 3–6 min, animated or story-led, gentle
  - *Edit at:* `/mindcast-live/edit/24` → Video slide → Child

- [ ] **Week 30 — Your Body as Foundation**
  - *Theme:* Our bodies are the most amazing machines — they need certain things to work really well: good sleep, movement, healthy food, and ways to calm down whe…
  - *Search:* `Your Body as Foundation` + terms from the theme; 3–6 min, animated or story-led, gentle
  - *Edit at:* `/mindcast-live/edit/30` → Video slide → Child

**`hpnI3MCTJSA`** is used by 3 weeks — keep it on **wk12 (The Habit Loop — How We Got Here)**, replace the rest:

- [ ] **Week 29 — The Habits That Build You**
  - *Theme:* Habits are things we practise so often they become automatic — we do them without even thinking. Today we think about the habits that GROW us — the sm…
  - *Search:* `The Habits That Build You` + terms from the theme; 3–6 min, animated or story-led, gentle
  - *Edit at:* `/mindcast-live/edit/29` → Video slide → Child

- [ ] **Week 47 — The Long Game — Patience and Persistence**
  - *Theme:* Some of the most important things take a long time to grow — like trees, like friendships, like becoming really good at something. Today we learn abou…
  - *Search:* `The Long Game — Patience and Persistence` + terms from the theme; 3–6 min, animated or story-led, gentle
  - *Edit at:* `/mindcast-live/edit/47` → Video slide → Child

**`H14bBuluwB8`** is used by 3 weeks — keep it on **wk14 (The Permission You're Still Waiting For)**, replace the rest:

- [ ] **Week 15 — Letting Go of Who You Were Supposed to Be**
  - *Theme:* Sometimes grown-ups and other people have ideas about what we should be when we grow up, or how we should act, or what we should like. Those ideas com…
  - *Search:* `Letting Go of Who You Were Supposed to Be` + terms from the theme; 3–6 min, animated or story-led, gentle
  - *Edit at:* `/mindcast-live/edit/15` → Video slide → Child

- [ ] **Week 27 — Who Are You Now? — Rebuilding Identity**
  - *Theme:* We've been on a huge adventure learning about ourselves — now comes the most exciting part: BUILDING! Today we start thinking about who we are CHOOSIN…
  - *Search:* `Who Are You Now? — Rebuilding Identity` + terms from the theme; 3–6 min, animated or story-led, gentle
  - *Edit at:* `/mindcast-live/edit/27` → Video slide → Child

**`IRVxOCKxDyI`** is used by 3 weeks — keep it on **wk19 (Breaking the People-Pleasing Pattern)**, replace the rest:

- [ ] **Week 28 — What Do You Actually Value?**
  - *Theme:* Values are like the most important rules you make for yourself — not rules from other people, but the things YOU decide are most important about how y…
  - *Search:* `What Do You Actually Value?` + terms from the theme; 3–6 min, animated or story-led, gentle
  - *Edit at:* `/mindcast-live/edit/28` → Video slide → Child

- [ ] **Week 43 — Living Your Values Under Pressure**
  - *Theme:* Sometimes it's hard to do the right thing — especially when other people want us to do something different. Today we practise staying true to our valu…
  - *Search:* `Living Your Values Under Pressure` + terms from the theme; 3–6 min, animated or story-led, gentle
  - *Edit at:* `/mindcast-live/edit/43` → Video slide → Child

**`YRaVl-VjF2g`** is used by 2 weeks — keep it on **wk10 (The Masks We Wear)**, replace the rest:

- [ ] **Week 38 — The Community You Build**
  - *Theme:* We all belong to communities — our family, our class, our sports team, our neighbourhood. A good community is one where people care for each other, he…
  - *Search:* `The Community You Build` + terms from the theme; 3–6 min, animated or story-led, gentle
  - *Edit at:* `/mindcast-live/edit/38` → Video slide → Child

**`VXez46_LZSE`** is used by 2 weeks — keep it on **wk18 (Rewiring the Critic — Building the Inner Coach)**, replace the rest:

- [ ] **Week 32 — How You Speak to Yourself**
  - *Theme:* We've been building our inner coach — the kind, honest voice inside us. This week we practise using that voice every day. Today we design our personal…
  - *Search:* `How You Speak to Yourself` + terms from the theme; 3–6 min, animated or story-led, gentle
  - *Edit at:* `/mindcast-live/edit/32` → Video slide → Child


---

## Summary

| Track | Weeks | Distinct videos now | New videos needed |
|---|---|---|---|
| Adult | 52 | 39 | 13 |
| Teen | 52 | 39 | 13 |
| Child | 52 | 20 | 32 |
| **Total** | **156** | — | **58** |

The **child track is the priority** — 44 of its 52 weeks currently share a video,
one appearing six times. It is also the track where a wrong video matters most.

## Definition of done
- `node scripts/verify-video-urls.mjs` exits 0 (no dead links, no reuse).
- Every video watched by a human before it is used with a group.
- Every source confirmed as an official/authorised channel.
