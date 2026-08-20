-- Week 1 content sync + child-track alignment (source: the three rebuilt
-- Week 1 Notion pages, pulled 2026-08-20).
--
-- 1. Backfill curriculum_weeks.weekly_theme (weeks 1-32 were wiped to '' by the
--    weeks1-39 notion pull, which read the callout instead of the Weekly Theme
--    property) and kids_title (never populated).
-- 2. Sync the child Week 1 row to the rewritten 8-slide child sequence:
--    lighthouse comparison, The Quiet Book read-live delivery, Body Detective +
--    colouring, spoken reflection, one-thing intention (no if-then), closing game.
-- 3. Fill the two gaps the pull left in every track: core_concept (the pull
--    stored it in s5_source_core_concept, which the deck does not read) and
--    thought_provoking_question (Slide 5 subheading).
-- 4. Refresh week-2 callbacks for Teen + Child to mirror the updated week-1
--    intention prompts.

UPDATE public.curriculum_weeks SET weekly_theme = $w1sync$The Signal and the Noise$w1sync$, updated_at = now() WHERE week_number = 1;

UPDATE public.curriculum_weeks SET weekly_theme = $w1sync$The Stories We Carry$w1sync$, updated_at = now() WHERE week_number = 2;

UPDATE public.curriculum_weeks SET weekly_theme = $w1sync$The Pattern Interrupt$w1sync$, updated_at = now() WHERE week_number = 3;

UPDATE public.curriculum_weeks SET weekly_theme = $w1sync$What Your Body Is Telling You$w1sync$, updated_at = now() WHERE week_number = 4;

UPDATE public.curriculum_weeks SET weekly_theme = $w1sync$The Mirror — How We See Ourselves$w1sync$, updated_at = now() WHERE week_number = 5;

UPDATE public.curriculum_weeks SET weekly_theme = $w1sync$The Comparison Loop$w1sync$, updated_at = now() WHERE week_number = 6;

UPDATE public.curriculum_weeks SET weekly_theme = $w1sync$The Inner Critic$w1sync$, updated_at = now() WHERE week_number = 7;

UPDATE public.curriculum_weeks SET weekly_theme = $w1sync$Beneath the Surface — Emotions as Data$w1sync$, updated_at = now() WHERE week_number = 8;

UPDATE public.curriculum_weeks SET weekly_theme = $w1sync$The Wounds We Carry$w1sync$, updated_at = now() WHERE week_number = 9;

UPDATE public.curriculum_weeks SET weekly_theme = $w1sync$The Masks We Wear$w1sync$, updated_at = now() WHERE week_number = 10;

UPDATE public.curriculum_weeks SET weekly_theme = $w1sync$Seeing Others Clearly$w1sync$, updated_at = now() WHERE week_number = 11;

UPDATE public.curriculum_weeks SET weekly_theme = $w1sync$The Habit Loop — How We Got Here$w1sync$, updated_at = now() WHERE week_number = 12;

UPDATE public.curriculum_weeks SET weekly_theme = $w1sync$Integration — What We Now See$w1sync$, updated_at = now() WHERE week_number = 13;

UPDATE public.curriculum_weeks SET weekly_theme = $w1sync$The Permission You're Still Waiting For$w1sync$, updated_at = now() WHERE week_number = 14;

UPDATE public.curriculum_weeks SET weekly_theme = $w1sync$Letting Go of Who You Were Supposed to Be$w1sync$, updated_at = now() WHERE week_number = 15;

UPDATE public.curriculum_weeks SET weekly_theme = $w1sync$The Forgiveness Loop$w1sync$, updated_at = now() WHERE week_number = 16;

UPDATE public.curriculum_weeks SET weekly_theme = $w1sync$Forgiving Yourself$w1sync$, updated_at = now() WHERE week_number = 17;

UPDATE public.curriculum_weeks SET weekly_theme = $w1sync$Rewiring the Critic — Building the Inner Coach$w1sync$, updated_at = now() WHERE week_number = 18;

UPDATE public.curriculum_weeks SET weekly_theme = $w1sync$Breaking the People-Pleasing Pattern$w1sync$, updated_at = now() WHERE week_number = 19;

UPDATE public.curriculum_weeks SET weekly_theme = $w1sync$Unlearning Scarcity — There Is Enough$w1sync$, updated_at = now() WHERE week_number = 20;

UPDATE public.curriculum_weeks SET weekly_theme = $w1sync$The Relationships That Shaped You$w1sync$, updated_at = now() WHERE week_number = 21;

UPDATE public.curriculum_weeks SET weekly_theme = $w1sync$Setting Down the Armour$w1sync$, updated_at = now() WHERE week_number = 22;

UPDATE public.curriculum_weeks SET weekly_theme = $w1sync$Grief and Growth — What Endings Make Possible$w1sync$, updated_at = now() WHERE week_number = 23;

UPDATE public.curriculum_weeks SET weekly_theme = $w1sync$Rewiring Fear — From Threat to Signal$w1sync$, updated_at = now() WHERE week_number = 24;

UPDATE public.curriculum_weeks SET weekly_theme = $w1sync$The Stories That No Longer Serve$w1sync$, updated_at = now() WHERE week_number = 25;

UPDATE public.curriculum_weeks SET weekly_theme = $w1sync$Integration — What We Have Released$w1sync$, updated_at = now() WHERE week_number = 26;

UPDATE public.curriculum_weeks SET weekly_theme = $w1sync$Who Are You Now? — Rebuilding Identity$w1sync$, updated_at = now() WHERE week_number = 27;

UPDATE public.curriculum_weeks SET weekly_theme = $w1sync$What Do You Actually Value?$w1sync$, updated_at = now() WHERE week_number = 28;

UPDATE public.curriculum_weeks SET weekly_theme = $w1sync$The Habits That Build You$w1sync$, updated_at = now() WHERE week_number = 29;

UPDATE public.curriculum_weeks SET weekly_theme = $w1sync$Your Body as Foundation$w1sync$, updated_at = now() WHERE week_number = 30;

UPDATE public.curriculum_weeks SET weekly_theme = $w1sync$The People You Choose$w1sync$, updated_at = now() WHERE week_number = 31;

UPDATE public.curriculum_weeks SET weekly_theme = $w1sync$How You Speak to Yourself$w1sync$, updated_at = now() WHERE week_number = 32;

UPDATE public.curriculum_weeks SET kids_title = $w1sync$Finding Your Station$w1sync$, updated_at = now() WHERE week_number = 1;

UPDATE public.curriculum_weeks SET kids_title = $w1sync$What's in Your Backpack?$w1sync$, updated_at = now() WHERE week_number = 2;

UPDATE public.curriculum_weeks SET kids_title = $w1sync$The Pause Button$w1sync$, updated_at = now() WHERE week_number = 3;

UPDATE public.curriculum_weeks SET kids_title = $w1sync$Your Feelings Weather Station$w1sync$, updated_at = now() WHERE week_number = 4;

UPDATE public.curriculum_weeks SET kids_title = $w1sync$The True Mirror$w1sync$, updated_at = now() WHERE week_number = 5;

UPDATE public.curriculum_weeks SET kids_title = $w1sync$Your Own Puzzle$w1sync$, updated_at = now() WHERE week_number = 6;

UPDATE public.curriculum_weeks SET kids_title = $w1sync$Meeting the Gremlin$w1sync$, updated_at = now() WHERE week_number = 7;

UPDATE public.curriculum_weeks SET kids_title = $w1sync$The Feelings Iceberg$w1sync$, updated_at = now() WHERE week_number = 8;

UPDATE public.curriculum_weeks SET kids_title = $w1sync$The Stone in Your Pocket$w1sync$, updated_at = now() WHERE week_number = 9;

UPDATE public.curriculum_weeks SET kids_title = $w1sync$The Real Face and the Pretend Faces$w1sync$, updated_at = now() WHERE week_number = 10;

UPDATE public.curriculum_weeks SET kids_title = $w1sync$Walking Around the Picture$w1sync$, updated_at = now() WHERE week_number = 11;

UPDATE public.curriculum_weeks SET kids_title = $w1sync$The Habit Path$w1sync$, updated_at = now() WHERE week_number = 12;

UPDATE public.curriculum_weeks SET kids_title = $w1sync$Looking at Our Full Backpack$w1sync$, updated_at = now() WHERE week_number = 13;

UPDATE public.curriculum_weeks SET kids_title = $w1sync$Your Own GO Button$w1sync$, updated_at = now() WHERE week_number = 14;

UPDATE public.curriculum_weeks SET kids_title = $w1sync$My Own Picture$w1sync$, updated_at = now() WHERE week_number = 15;

UPDATE public.curriculum_weeks SET kids_title = $w1sync$Putting Down the Hot Rock$w1sync$, updated_at = now() WHERE week_number = 16;

UPDATE public.curriculum_weeks SET kids_title = $w1sync$Say Sorry and Keep Going$w1sync$, updated_at = now() WHERE week_number = 17;

UPDATE public.curriculum_weeks SET kids_title = $w1sync$Making the Kind Voice Louder$w1sync$, updated_at = now() WHERE week_number = 18;

UPDATE public.curriculum_weeks SET kids_title = $w1sync$Kind vs. People-Pleasing$w1sync$, updated_at = now() WHERE week_number = 19;

UPDATE public.curriculum_weeks SET kids_title = $w1sync$The Things That Don't Run Out$w1sync$, updated_at = now() WHERE week_number = 20;

UPDATE public.curriculum_weeks SET kids_title = $w1sync$The Gifts People Give Us$w1sync$, updated_at = now() WHERE week_number = 21;

UPDATE public.curriculum_weeks SET kids_title = $w1sync$The Shield With a Door$w1sync$, updated_at = now() WHERE week_number = 22;

UPDATE public.curriculum_weeks SET kids_title = $w1sync$The Autumn Before Spring$w1sync$, updated_at = now() WHERE week_number = 23;

UPDATE public.curriculum_weeks SET kids_title = $w1sync$The Toast Alarm vs. The Real Fire$w1sync$, updated_at = now() WHERE week_number = 24;

UPDATE public.curriculum_weeks SET kids_title = $w1sync$Updating the Photo Album$w1sync$, updated_at = now() WHERE week_number = 25;

UPDATE public.curriculum_weeks SET kids_title = $w1sync$Putting Down the Heavy Things$w1sync$, updated_at = now() WHERE week_number = 26;

UPDATE public.curriculum_weeks SET kids_title = $w1sync$Who Are You Building?$w1sync$, updated_at = now() WHERE week_number = 27;

UPDATE public.curriculum_weeks SET kids_title = $w1sync$Your Inner Compass$w1sync$, updated_at = now() WHERE week_number = 28;

UPDATE public.curriculum_weeks SET kids_title = $w1sync$Watering Your Garden$w1sync$, updated_at = now() WHERE week_number = 29;

UPDATE public.curriculum_weeks SET kids_title = $w1sync$Charging Your Superhero Suit$w1sync$, updated_at = now() WHERE week_number = 30;

UPDATE public.curriculum_weeks SET kids_title = $w1sync$Growing Friends$w1sync$, updated_at = now() WHERE week_number = 31;

UPDATE public.curriculum_weeks SET kids_title = $w1sync$Finding Your Power Phrases$w1sync$, updated_at = now() WHERE week_number = 32;

UPDATE public.curriculum_weeks SET kids_title = $w1sync$Your Personal Rhythm$w1sync$, updated_at = now() WHERE week_number = 33;

UPDATE public.curriculum_weeks SET kids_title = $w1sync$Rest Is a Superpower$w1sync$, updated_at = now() WHERE week_number = 34;

UPDATE public.curriculum_weeks SET kids_title = $w1sync$The Joy of Making$w1sync$, updated_at = now() WHERE week_number = 35;

UPDATE public.curriculum_weeks SET kids_title = $w1sync$Your Special Puzzle Piece$w1sync$, updated_at = now() WHERE week_number = 36;

UPDATE public.curriculum_weeks SET kids_title = $w1sync$What We Have and What We Share$w1sync$, updated_at = now() WHERE week_number = 37;

UPDATE public.curriculum_weeks SET kids_title = $w1sync$Being Part of Something Bigger$w1sync$, updated_at = now() WHERE week_number = 38;

UPDATE public.curriculum_weeks SET kids_title = $w1sync$Look What We've Built!$w1sync$, updated_at = now() WHERE week_number = 39;

UPDATE public.curriculum_weeks SET kids_title = $w1sync$Sharing the Treasure$w1sync$, updated_at = now() WHERE week_number = 40;

UPDATE public.curriculum_weeks SET kids_title = $w1sync$Becoming a Teacher$w1sync$, updated_at = now() WHERE week_number = 41;

UPDATE public.curriculum_weeks SET kids_title = $w1sync$The Real You, All the Way$w1sync$, updated_at = now() WHERE week_number = 42;

UPDATE public.curriculum_weeks SET kids_title = $w1sync$Compass in the Storm$w1sync$, updated_at = now() WHERE week_number = 43;

UPDATE public.curriculum_weeks SET kids_title = $w1sync$The Gentle Untangle$w1sync$, updated_at = now() WHERE week_number = 44;

UPDATE public.curriculum_weeks SET kids_title = $w1sync$Gifts That Grow$w1sync$, updated_at = now() WHERE week_number = 45;

UPDATE public.curriculum_weeks SET kids_title = $w1sync$Noticing the Garden$w1sync$, updated_at = now() WHERE week_number = 46;

UPDATE public.curriculum_weeks SET kids_title = $w1sync$Keep Watering the Plant$w1sync$, updated_at = now() WHERE week_number = 47;

UPDATE public.curriculum_weeks SET kids_title = $w1sync$Being a Sunshine Person$w1sync$, updated_at = now() WHERE week_number = 48;

UPDATE public.curriculum_weeks SET kids_title = $w1sync$Your Ripples$w1sync$, updated_at = now() WHERE week_number = 49;

UPDATE public.curriculum_weeks SET kids_title = $w1sync$Training the Gratitude Camera$w1sync$, updated_at = now() WHERE week_number = 50;

UPDATE public.curriculum_weeks SET kids_title = $w1sync$The Adventure Continues$w1sync$, updated_at = now() WHERE week_number = 51;

UPDATE public.curriculum_weeks SET kids_title = $w1sync$The Best Kind of Ending$w1sync$, updated_at = now() WHERE week_number = 52;

UPDATE public.curriculum_weeks SET
  kids_signal_metaphor = $w1sync$Sometimes lots of things can be happening at once.
People are talking.
Something is making noise.
You might be excited, tired, hungry or wiggly.
Your body can still give you one small signal to notice.
You do not have to know exactly what it means yet.$w1sync$,
  kids_source = '',
  kids_read_aloud_source_check = $w1sync$READ LIVE FROM A PURCHASED COPY — no unofficial YouTube read-alouds (copyright, and the text is not the week's book).$w1sync$,
  kids_picture_book_question = $w1sync$What kind of quiet do you like best?
You can:
- tell us
- point to a picture
- show us
- or pass

Does your body ever tell you that it wants things to be a little quieter?
How might you notice?$w1sync$,
  kids_colouring_prompt = $w1sync$Colour a lighthouse shining through wind and waves.
Then add one small body signal somewhere in your picture.
It could be:
- a tummy rumble
- tired eyes
- hot cheeks
- a fast heart
- wiggly legs
- or your own idea$w1sync$,
  kids_game = $w1sync$SIGNAL IN THE STATIC: BODY DETECTIVES
The children should not need to read game instructions from the screen.
The purpose of the game is to physically rehearse the Week 1 sequence:
NOTICE IT → NAME IT → DO IT
The game has three short rounds.

The group makes safe, ordinary noise:
- gentle humming
- quiet chatter
- soft shuffling
- light tapping on knees
Place or activate a beeping timer or shaker somewhere visible and safe.
Ask:
Can you hear the signal?
Gradually lower the room noise until the children can hear and locate it.
Then say:
The signal didn't get louder.

We made enough room to notice it.
Connect this to the week's skill:
NOTICE IT — What can I notice?
Do not frame this as needing to "quiet your mind". The point is simply that when lots of things are happening, one signal can be easier to notice when there is a little more room around it.

Say:
Now we're going to see if we can notice a signal inside our own body.
Invite children to choose one movement:
- ten gentle jumps
- march on the spot
- wiggle or dance for ten seconds
- rub their hands together if they prefer not to jump or move around
Then pause.
Ask:
What changed?
Offer simple noticing words if needed:
- heartbeat
- breathing
- warm
- cool
- sweaty
- tingly
- wiggly
- tired
- something else
Do not ask children to explain why the signal happened.
Then say:
You noticed a signal and gave it a name.
Connect this to:
NOTICE IT → NAME IT
A child may say "I don't know" or pass. Both are complete answers.

Place four simple picture cards or signs around the room:
MOVE
PAUSE / QUIET
GET SOMETHING I NEED
ASK A GROWN-UP
Explain:
I'm going to give you a body signal. Move toward one thing you might try. There might be more than one good answer.
Use ordinary scenarios such as:
Your tummy is rumbling. What could you try?
Your legs feel really wiggly after sitting for a long time. What could you try?
Everything feels very loud and your body wants a break. What could you try?
You feel shaky and you aren't sure why. What could you try?
After each scenario, reinforce:
There isn't always one correct answer.

The signal gives us something to notice. Then we can choose what to try.
Accept different choices without ranking them.
Do not teach fixed meanings such as:
- rumbling tummy always means hungry
- fast heart always means scared
- tight tummy always means worried
A body signal gives information, but it does not always tell us exactly what caused it or what we must do.

Ask:
What did we do?
Then reinforce:
First we noticed it.

Then we named what we could.

Then we did something — or asked a trusted grown-up to help us decide what to do.
For children, the Mindcast sequence can be explained as:
NOTICE IT — What can I notice?
NAME IT — What words can I use for it?
DO IT — What could I try?$w1sync$,
  kids_game_equipment = $w1sync$kitchen timer or shaker; safe visible location; four simple picture cards: MOVE, PAUSE / QUIET, GET SOMETHING I NEED, ASK A GROWN-UP$w1sync$,
  kids_game_under5 = $w1sync$Keep all three rounds shorter.
For Round 1:
- hide the signal in plain sight
- use only three noise levels: LOUD → WHISPER → QUIET
- allow children to move and point
For Round 2:
- use one movement only, such as marching or rubbing hands together
- offer two or three simple noticing words
For Round 3:
- use only two choice cards at a time
- demonstrate the options physically
- allow children to copy the facilitator instead of choosing independently

End with movement and energy rather than another long reflective discussion.
Keep the game playful, fast and concrete.
The game should reinforce the same learning introduced in the story and practised during Body Detective:
notice the signal → name what you can → choose what might help
Do not turn the activity into a test of whether children can correctly identify emotions or body sensations.
Do not tell children what a sensation means for them.
Do not imply every uncomfortable feeling needs to be removed or calmed down.
The goal is to give children a simple repeatable process:
Notice It. Name It. Do It.
---$w1sync$,
  updated_at = now()
WHERE week_number = 1;

UPDATE public.mindcast_live_sessions
SET core_concept = s5_source_core_concept, updated_at = now()
WHERE week_number = 1 AND COALESCE(btrim(core_concept), '') = '' AND COALESCE(btrim(s5_source_core_concept), '') <> '';

UPDATE public.mindcast_live_sessions SET thought_provoking_question = $w1sync$What reached you yesterday that you never deliberately chose to give attention to?$w1sync$, updated_at = now() WHERE week_number = 1 AND audience = 'Adult';

UPDATE public.mindcast_live_sessions SET thought_provoking_question = $w1sync$What have you heard, seen or experienced often enough that it started to feel normal?$w1sync$, updated_at = now() WHERE week_number = 1 AND audience = 'Teen';

UPDATE public.mindcast_live_sessions SET
  ancient_wisdom_reframe = $w1sync$A lighthouse does not stop a storm.
The wind can be loud.
The waves can be big.
But the lighthouse gives you one steady thing to notice.$w1sync$,
  signal_metaphor = $w1sync$Sometimes lots of things can be happening at once.
People are talking.
Something is making noise.
You might be excited, tired, hungry or wiggly.
Your body can still give you one small signal to notice.
You do not have to know exactly what it means yet.$w1sync$,
  opening_hook = $w1sync$What is one body signal you have noticed before?
Maybe:
- a rumbling tummy
- hot cheeks
- a fast heart
- tired eyes
- wiggly legs
- feeling warm or cold
- or something else
You can say a word, point, show us with your hands, or pass.$w1sync$,
  teaching_points = $w1sync$- Bodies give us information. Hungry, thirsty, tired, warm, cold, fast heart, tight tummy and wiggly legs are all examples of body signals.
- A body signal is information, not an instruction. A fast heart could happen because you are excited, scared, running, surprised or something else. We do not have to guess perfectly.
- People can use different words for feelings. If a grown-up guesses what you are feeling and you say "no", you are allowed to correct them.
- We do not need to make a feeling disappear before we notice it. First we notice. Then we decide what we might need.
- Nobody has to explain a private feeling or thought to the group. Drawing privately, watching and passing all count as taking part.$w1sync$,
  experiential_exercise = $w1sync$Before handing out the colouring page, do a very short body-noticing experiment.
Say:
Let's become Body Detectives.
Rub your hands together for about 15 seconds.
Ask:
What changed?
Possible words:
- warm
- tingly
- sweaty
- buzzy
- something else
Then, if movement is comfortable, do ten gentle jumps or marches.
Children who do not want to jump can squeeze and release their hands instead.
Ask:
What do you notice now?
Do not interpret the answer for them.

WHILE THEY COLOUR
Ask quietly, table by table:
What is one signal your body gives when it wants your attention?
Children may:
- answer with one word
- point to their picture
- show with their body
- say "I don't know"
- pass$w1sync$,
  guided_reflection = $w1sync$If a child wants to share, the facilitator may ask:
What did you notice?
Was it easy or hard to notice?
What could you do if your body wanted your attention?$w1sync$,
  journaling_prompt = $w1sync$If a child wants to share, the facilitator may ask:
What did you notice?
Was it easy or hard to notice?
What could you do if your body wanted your attention?$w1sync$,
  private_write_prompt = $w1sync$You can:
- write it
- draw it
- tell a trusted grown-up
- or keep it on your page
You only need to choose one small thing.

Examples the facilitator may offer:
- notice when my tummy is hungry
- notice when my legs need to move
- ask for quiet when things feel too loud
- get a drink when I notice I am thirsty
- tell a trusted grown-up when I need help
- take a little pause when I need one$w1sync$,
  intention_prompt = $w1sync$One thing I want to work on this week is...
You can:
- write it
- draw it
- tell a trusted grown-up
- or keep it on your page
You only need to choose one small thing.

Examples the facilitator may offer:
- notice when my tummy is hungry
- notice when my legs need to move
- ask for quiet when things feel too loud
- get a drink when I notice I am thirsty
- tell a trusted grown-up when I need help
- take a little pause when I need one$w1sync$,
  core_affirmation = $w1sync$I can notice my body's signals without having to know exactly what they mean.$w1sync$,
  weekly_practice_mon = '',
  weekly_practice_wed = $w1sync$Notice your body again. If it wants your attention, try one small thing: a stretch, a drink of water, some movement, a quiet space, a pause or asking a trusted grown-up for help. See if anything changes. It is okay if nothing changes.$w1sync$,
  weekly_practice_fri = $w1sync$Think back over your week. What was one body signal you noticed? You can draw it or tell a trusted grown-up. You do not have to know exactly what it meant.$w1sync$,
  weekly_practice_sun = $w1sync$Be a Body Detective. Notice one body signal today — hungry, wiggly, warm, tired, tight, loose or something else. You can name it, draw it or show a trusted grown-up.$w1sync$,
  facilitator_notes = $w1sync$## Aim
Build a simple noticing vocabulary through movement, drawing and concrete body signals.
The goal is:
observation
not:
- emotional disclosure
- diagnosis
- interpreting children's bodies for them
- making every feeling disappear
- making every child calm

## Run the Room
Keep reflective moments short, particularly for younger children.
Offer words as guesses rather than labels.
Use:
Could that be frustrated?
Not:
You are frustrated.
Accept correction immediately.
Never ask a child to:
- explain a private thought
- identify who "caused" a feeling
- disclose personal information to the group
- explain why their body feels a certain way
Watching, drawing privately and passing are all valid participation.

## Safeguarding
If a child says something that suggests they may be unsafe, do not investigate or ask follow-up questions in front of the group.
Follow MC-SAF-001.
Nothing in this lesson requires a child to share a private feeling, thought or experience.

## Why This Week Exists — The Evidence
The curriculum uses body noticing as the child-track translation of Week 1 because body sensations are concrete and observable.
This is a teaching design choice, not a claim that every child can accurately identify the cause of a sensation or regulate an emotion simply by noticing it.
Lieberman and colleagues' affect-labelling research supports the narrower principle that putting emotional experience into words can alter measurable responses to emotional stimuli.
We do not turn that laboratory finding into a promise that naming a feeling will calm every child.
The practical principle used in the child room is deliberately modest:
notice what is observable before building a story about what it means.

## Real-World Anchor
The "21 days to build a habit" story is useful for facilitators even though it is not taught to the children.
Maxwell Maltz described observations about post-surgical adjustment. The claim was later repeated as though it were established habit science.
Lally and colleagues later measured habit formation directly and found substantial variation, with a median of 66 days in their sample.
The facilitator lesson is the same principle we are teaching children in simpler language:
notice what is actually there before repeating a story about it.

## Evidence Quality
Moderate overall.
Affect-labelling has experimental support, but the cited study is not a child-specific treatment trial.
The use of body signals, drawing, stories and movement is an age-matched teaching method rather than a clinical intervention.
The lighthouse metaphor is illustrative only.

## We Deliberately Do Not Claim
- We do not claim that body sensations always reveal their correct cause.
- We do not claim that a body signal tells a child what they must do.
- We do not claim that every big feeling should be calmed down.
- We do not claim that naming a feeling works every time.
- We do not tell children that a private feeling must be shared.
- We do not diagnose anxiety, trauma, sensory conditions or any other clinical issue from a child's behaviour or body signals.
- We do not tell children that there is a hidden "real you" underneath the noise.
- We do not teach the 21-day habit rule, learning styles, left/right-brain personality types, power posing, ego depletion or decision fatigue.

## Source Trail
- Lieberman, M. D., et al. (2007). Putting Feelings Into Words: Affect Labeling Disrupts Amygdala Activity in Response to Affective Stimuli. Psychological Science, 18(5), 421–428.
- Lally, P., van Jaarsveld, C. H. M., Potts, H. W. W., & Wardle, J. (2010). How are habits formed: Modelling habit formation in the real world. European Journal of Social Psychology, 40(6), 998–1009.
- Maltz, M. (1960). Psycho-Cybernetics. Included only as the documented origin of the popular 21-day claim, not as habit research.$w1sync$,
  updated_at = now()
WHERE week_number = 1 AND audience = 'Child';

UPDATE public.mindcast_live_sessions SET previous_week_callback = $w1sync$one thing I want to work on this week is…$w1sync$, updated_at = now() WHERE week_number = 2 AND audience = 'Child';

UPDATE public.mindcast_live_sessions SET previous_week_callback = $w1sync$when I notice [a specific pressure, trend, opinion, label or cue], I will [take one small action that gives me a moment to choose]$w1sync$, updated_at = now() WHERE week_number = 2 AND audience = 'Teen';
